import { generateResponse } from "../ai/geminiClient.js";

import { transformQuery } from "./queryTransformer.js";

import { hybridRetrieve } from "./hybridRetriever.js";

import { rerankResults } from "./reranker.js";

import { compressContext } from "./contextCompressor.js";


export async function answerWithRAG({
    userId,
    query,
    topK = 5,
    filters = {}
}) {

    if (!userId) {
        throw new Error("userId is required");
    }

    if (
        !query ||
        typeof query !== "string"
    ) {
        throw new Error("Query is required");
    }


    // ============================================================
    // 1. QUERY TRANSFORMATION
    // ============================================================

    const transformedQuery =
        await transformQuery(query);


    // ============================================================
    // 2. HYBRID RETRIEVAL
    // ============================================================

    const candidates =
        await hybridRetrieve({

            userId,

            query:
                transformedQuery,

            originalQuery:
                query,

            topK:
                10,

            filters
        });


    if (
        candidates.length === 0
    ) {

        return {

            answer:
                "I couldn't find any relevant information in your uploaded documents.",

            sources: [],

            metadata: {

                originalQuery:
                    query,

                transformedQuery,

                candidatesRetrieved:
                    0,

                resultsAfterReranking:
                    0,

                contextChunksUsed:
                    0
            }
        };
    }


    // ============================================================
    // 3. RERANK
    // ============================================================

    const rerankedResults =
        rerankResults({

            results:
                candidates,

            query:
                transformedQuery,

            originalQuery:
                query,

            topK:
                Math.min(
                    Math.max(
                        topK,
                        3
                    ),
                    5
                )
        });


    // ============================================================
    // 4. PROJECT / ENTITY CONTEXT EXPANSION
    //
    // If Chunk 2 contains "Wanderlust", also include the
    // immediately following chunk when it belongs to the
    // same document.
    // ============================================================

    const expandedResults = [];


    for (
        const result
        of rerankedResults
    ) {

        expandedResults.push(
            result
        );


        const entityMatch =
            /\b[A-Z][A-Za-z0-9+#.-]{2,}\b/g
                .exec(query);


        if (
            !entityMatch
        ) {
            continue;
        }


        const entity =
            entityMatch[0]
                .toLowerCase();


        const resultContainsEntity =
            result.text
                .toLowerCase()
                .includes(entity);


        if (
            !resultContainsEntity
        ) {
            continue;
        }


        /*
         * Look for the next retrieved candidate from the same
         * document.
         *
         * Because your resume has adjacent chunks, this lets
         * Wanderlust Chunk 2 bring in Chunk 3.
         */

        const nextChunk =
            candidates.find(
                candidate =>

                    candidate.fileName ===
                        result.fileName &&

                    candidate.chunkIndex ===
                        result.chunkIndex + 1
            );


        if (
            nextChunk
        ) {

            const alreadyAdded =
                expandedResults.some(
                    item =>
                        item.fileName ===
                            nextChunk.fileName &&
                        item.chunkIndex ===
                            nextChunk.chunkIndex
                );


            if (
                !alreadyAdded
            ) {

                expandedResults.push({

                    ...nextChunk,

                    rerankScore:
                        result.rerankScore *
                        0.90,

                    entityCoverage:
                        result.entityCoverage,

                    termCoverage:
                        result.termCoverage
                });
            }
        }
    }


    // ============================================================
    // 5. REMOVE WEAK / IRRELEVANT RESULTS
    // ============================================================

    const relevantResults =
        expandedResults.filter(
            result => {

                const strongEntity =
                    (
                        result.entityCoverage ??
                        0
                    ) >= 1;


                const strongScore =
                    (
                        result.rerankScore ??
                        0
                    ) >= 0.20;


                const goodSemantic =
                    (
                        result.semanticScore ??
                        0
                    ) >= 0.55;


                return (
                    strongEntity ||
                    strongScore ||
                    goodSemantic
                );
            }
        );


    // ============================================================
    // 6. FINAL RESULT LIMIT
    // ============================================================

    const finalResults =
        relevantResults
            .sort(
                (a, b) =>
                    (
                        b.rerankScore ??
                        b.combinedScore ??
                        0
                    ) -
                    (
                        a.rerankScore ??
                        a.combinedScore ??
                        0
                    )
            )
            .slice(
                0,
                Math.min(
                    topK,
                    3
                )
            );


    // ============================================================
    // 7. CONTEXT COMPRESSION
    // ============================================================

    const compressedResults =
        compressContext({

            query,

            results:
                finalResults,

            maxResults:
                Math.min(
                    topK,
                    3
                ),

            /*
             * Allow enough information from each chunk.
             */
            maxSentencesPerChunk:
                4
        });


    if (
        compressedResults.length === 0
    ) {

        return {

            answer:
                "I couldn't find any relevant information in your uploaded documents.",

            sources: [],

            metadata: {

                originalQuery:
                    query,

                transformedQuery,

                candidatesRetrieved:
                    candidates.length,

                resultsAfterReranking:
                    rerankedResults.length,

                contextChunksUsed:
                    0
            }
        };
    }


    // ============================================================
    // 8. BUILD FINAL CONTEXT
    // ============================================================

    const context =
        compressedResults
            .map(
                (
                    result,
                    index
                ) => {

                    return `
[SOURCE ${index + 1}]

File:
${result.fileName}

Chunk:
${result.chunkIndex}

Content:
${result.text}
`;
                }
            )
            .join(
                "\n----------------------------\n"
            );


    // ============================================================
    // 9. GENERATION PROMPT
    // ============================================================

    const prompt = `
You are NovaGPT's document question-answering system.

Answer the user's ORIGINAL question using ONLY the
retrieved document context.

ORIGINAL USER QUESTION:
${query}

SEARCH-OPTIMIZED QUERY:
${transformedQuery}

RETRIEVED CONTEXT:
${context}

IMPORTANT RULES:

1. Answer the ORIGINAL question directly.

2. Use ONLY information supported by the retrieved context.

3. Never invent or assume information.

4. If the answer cannot be found in the context, say:
"I couldn't find that information in the uploaded documents."

5. Keep the answer concise and useful.

6. When a statement is supported by a source, add its
citation in this format:
[1], [2], [3]

7. Only cite sources that actually support the statement.

8. Do not create citations that do not exist.

9. Do not include a separate Sources section.
The API will provide the source metadata separately.
`;


    // ============================================================
    // 10. GENERATE ANSWER
    // ============================================================

    let answer;

    try {

        answer =
            await generateResponse(
                prompt
            );

    } catch (error) {

        /*
         * Development fallback.
         *
         * This allows the RAG pipeline to be tested even
         * when Gemini quota is exhausted.
         */

        if (
            error?.status === 429 ||
            error?.status === 503
        ) {

            answer =
                "Development mode: Gemini generation is currently unavailable. The retrieved document context is valid.";
        } else {

            throw error;
        }
    }


    // ============================================================
    // 11. SOURCE METADATA
    // ============================================================

    const sources =
        compressedResults.map(
            (
                result,
                index
            ) => ({

                id:
                    index + 1,

                fileName:
                    result.fileName,

                chunkIndex:
                    result.chunkIndex,

                score:
                    result.rerankScore ??
                    result.combinedScore ??
                    0,

                semanticScore:
                    result.semanticScore ??
                    null,

                keywordScore:
                    result.keywordScore ??
                    null,

                compressionScore:
                    result.compressionScore ??
                    null
            })
        );


    // ============================================================
    // 12. RETURN
    // ============================================================

    return {

        answer,

        sources,

        metadata: {

            originalQuery:
                query,

            transformedQuery,

            candidatesRetrieved:
                candidates.length,

            resultsAfterReranking:
                rerankedResults.length,

            contextChunksUsed:
                compressedResults.length,

            filters
        }
    };
}