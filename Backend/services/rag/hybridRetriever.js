import { generateEmbedding } from "./embeddings.js";
import { getUserDocumentChunks } from "./vectorStore.js";


/**
 * ============================================================
 * COSINE SIMILARITY
 * ============================================================
 */

function cosineSimilarity(
    vectorA,
    vectorB
) {

    if (
        !Array.isArray(vectorA) ||
        !Array.isArray(vectorB) ||
        vectorA.length !== vectorB.length
    ) {
        return 0;
    }


    let dotProduct = 0;

    let magnitudeA = 0;

    let magnitudeB = 0;


    for (
        let i = 0;
        i < vectorA.length;
        i++
    ) {

        dotProduct +=
            vectorA[i] *
            vectorB[i];


        magnitudeA +=
            vectorA[i] *
            vectorA[i];


        magnitudeB +=
            vectorB[i] *
            vectorB[i];
    }


    if (
        magnitudeA === 0 ||
        magnitudeB === 0
    ) {

        return 0;
    }


    return (
        dotProduct /
        (
            Math.sqrt(magnitudeA) *
            Math.sqrt(magnitudeB)
        )
    );
}


/**
 * ============================================================
 * TOKENIZATION
 * ============================================================
 */

function tokenize(text) {

    return (
        text
            .toLowerCase()
            .match(
                /[a-z0-9+#.-]+/g
            ) || []
    );
}


/**
 * ============================================================
 * IMPORTANT TERMS
 *
 * These are words that should have stronger retrieval
 * importance for technical/document questions.
 * ============================================================
 */

const GENERIC_TERMS =
    new Set([

        "what",
        "which",
        "how",
        "why",
        "when",
        "where",

        "did",
        "does",
        "do",
        "is",
        "are",
        "was",
        "were",

        "i",
        "my",
        "me",
        "we",
        "our",

        "use",
        "used",
        "using",

        "the",
        "a",
        "an",

        "in",
        "on",
        "for",
        "with",
        "of",

        "project",
        "projects",

        "technology",
        "technologies",

        "tech",
        "stack",

        "framework",
        "frameworks",

        "library",
        "libraries",

        "tool",
        "tools"
    ]);


/**
 * ============================================================
 * KEYWORD SCORE
 * ============================================================
 */

function calculateKeywordScore(
    query,
    text
) {

    const queryTokens =
        tokenize(query);


    const textTokens =
        new Set(
            tokenize(text)
        );


    if (
        queryTokens.length === 0
    ) {

        return 0;
    }


    let matchedWeight = 0;

    let totalWeight = 0;


    for (
        const token
        of queryTokens
    ) {

        const weight =
            GENERIC_TERMS.has(
                token
            )
                ? 0.20
                : 1.0;


        totalWeight +=
            weight;


        if (
            textTokens.has(
                token
            )
        ) {

            matchedWeight +=
                weight;
        }
    }


    if (
        totalWeight === 0
    ) {

        return 0;
    }


    return Math.min(
        matchedWeight /
        totalWeight,
        1
    );
}


/**
 * ============================================================
 * ENTITY / PROJECT MATCH
 *
 * Detects important capitalized entities from the ORIGINAL
 * query.
 *
 * Example:
 *
 * "What technologies did I use in my Wanderlust project?"
 *
 * → Wanderlust
 * ============================================================
 */

function extractEntities(query) {

    return (
        query.match(
            /\b[A-Z][A-Za-z0-9+#.-]{2,}\b/g
        ) || []
    );
}


function calculateEntityScore(
    query,
    text
) {

    const entities =
        extractEntities(
            query
        );


    if (
        entities.length === 0
    ) {

        return 0;
    }


    const lowerText =
        text.toLowerCase();


    let matches = 0;


    for (
        const entity
        of entities
    ) {

        if (
            lowerText.includes(
                entity.toLowerCase()
            )
        ) {

            matches++;
        }
    }


    return (
        matches /
        entities.length
    );
}


/**
 * ============================================================
 * PROJECT CONTEXT BOOST
 *
 * If a chunk contains a project name such as Wanderlust,
 * give it a strong boost.
 * ============================================================
 */

function calculateProjectBoost(
    query,
    text
) {

    const entities =
        extractEntities(
            query
        );


    if (
        entities.length === 0
    ) {

        return 0;
    }


    const lowerText =
        text.toLowerCase();


    let boost = 0;


    for (
        const entity
        of entities
    ) {

        const normalized =
            entity.toLowerCase();


        if (
            lowerText.includes(
                normalized
            )
        ) {

            // Strong project/entity match
            boost += 0.30;
        }
    }


    return Math.min(
        boost,
        0.30
    );
}


/**
 * ============================================================
 * HYBRID RETRIEVER
 * ============================================================
 */

export async function hybridRetrieve({

    userId,

    query,

    originalQuery = query,

    topK = 10,

    filters = {}

}) {

    if (!userId) {

        throw new Error(
            "userId is required"
        );
    }


    if (
        !query ||
        typeof query !== "string"
    ) {

        throw new Error(
            "Query is required"
        );
    }


    // ========================================================
    // 1. QUERY EMBEDDING
    // ========================================================

    const queryEmbedding =
        await generateEmbedding(
            query
        );


    // ========================================================
    // 2. GET DOCUMENTS
    // ========================================================

    const documents =
        await getUserDocumentChunks(
            userId,
            filters
        );


    if (
        documents.length === 0
    ) {

        return [];
    }


    // ========================================================
    // 3. SCORE
    // ========================================================

    const scored =
        documents.map(
            (document) => {

                const semanticScore =
                    cosineSimilarity(
                        queryEmbedding,
                        document.embedding
                    );


                const keywordScore =
                    calculateKeywordScore(
                        query,
                        document.text
                    );


                const entityScore =
                    calculateEntityScore(
                        originalQuery,
                        document.text
                    );


                const projectBoost =
                    calculateProjectBoost(
                        originalQuery,
                        document.text
                    );


                /*
                 * Main scoring:
                 *
                 * semantic      55%
                 * keyword       25%
                 * entity        20%
                 *
                 * plus project boost
                 */

                const combinedScore =
                    (
                        semanticScore *
                        0.55
                    ) +
                    (
                        keywordScore *
                        0.25
                    ) +
                    (
                        entityScore *
                        0.20
                    ) +
                    projectBoost;


                return {

                    id:
                        document._id,

                    fileName:
                        document.fileName,

                    fileType:
                        document.fileType,

                    chunkIndex:
                        document.chunkIndex,

                    text:
                        document.text,

                    semanticScore,

                    keywordScore,

                    entityScore,

                    projectBoost,

                    combinedScore
                };
            }
        );


    // ========================================================
    // 4. SORT
    // ========================================================

    scored.sort(
        (a, b) =>
            b.combinedScore -
            a.combinedScore
    );


    // ========================================================
    // 5. RETURN
    // ========================================================

    return scored.slice(
        0,
        topK
    );
}