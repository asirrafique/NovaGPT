import "dotenv/config";

import mongoose from "mongoose";

import { transformQuery } from "./queryTransformer.js";
import { hybridRetrieve } from "./hybridRetriever.js";
import { rerankResults } from "./reranker.js";
import { compressContext } from "./contextCompressor.js";

const MONGODB_URI = process.env.MONGODB_URI;

const TEST_USER_ID = "6a639b291f5b184f3eefa272";

const query =
    "What technologies did I use in my Wanderlust project?";


try {

    await mongoose.connect(MONGODB_URI);

    console.log("✅ MongoDB connected");

    console.log("\n🧠 ORIGINAL QUERY:");
    console.log(query);


    // ============================================================
    // 1. QUERY TRANSFORMATION
    // ============================================================

    const transformedQuery =
        await transformQuery(query);

    console.log("\n🔄 TRANSFORMED QUERY:");
    console.log(transformedQuery);


    // ============================================================
    // 2. HYBRID RETRIEVAL
    // ============================================================

    const candidates =
        await hybridRetrieve({

            userId: TEST_USER_ID,

            query: transformedQuery,

            topK: 10
        });

    console.log(
        `\n📦 RETRIEVED CANDIDATES: ${candidates.length}`
    );


    // ============================================================
    // 3. RERANKING
    // ============================================================

    const reranked =
        rerankResults({

            results: candidates,

            query: transformedQuery,

            topK: 5
        });

    console.log(
        `🏆 RERANKED RESULTS: ${reranked.length}`
    );


    // ============================================================
    // 4. CONTEXT COMPRESSION
    // ============================================================

    const compressed =
        compressContext({

            query,

            results: reranked,

            maxResults: 5,

            maxSentencesPerChunk: 3
        });

    console.log(
        `🧠 COMPRESSED CONTEXTS: ${compressed.length}`
    );


    // ============================================================
    // 5. CITATION BUILDING
    // ============================================================

    const sources =
        compressed.map(
            (result, index) => ({

                id: index + 1,

                fileName:
                    result.fileName,

                chunkIndex:
                    result.chunkIndex,

                score:
                    result.rerankScore,

                semanticScore:
                    result.semanticScore,

                keywordScore:
                    result.keywordScore,

                compressionScore:
                    result.compressionScore
            })
        );


    // ============================================================
    // 6. BUILD FINAL CONTEXT
    // ============================================================

    const context =
        compressed
            .map(
                (result, index) => {

                    return `
[SOURCE ${index + 1}]
File: ${result.fileName}
Chunk: ${result.chunkIndex}

${result.text}
`;
                }
            )
            .join(
                "\n-----------------------------\n"
            );


    // ============================================================
    // 7. DEVELOPMENT ANSWER
    // ============================================================

    const developmentAnswer =
        compressed.length > 0
            ? "Development mode: Gemini generation skipped because the API quota is currently exhausted."
            : "No relevant document context was found.";


    // ============================================================
    // 8. DISPLAY FINAL PIPELINE
    // ============================================================

    console.log("\n==============================");
    console.log("🚀 NOVAGPT RAG PIPELINE");
    console.log("==============================");

    console.log("\nOriginal Query:");
    console.log(query);

    console.log("\nTransformed Query:");
    console.log(transformedQuery);

    console.log("\nCandidates:");
    console.log(candidates.length);

    console.log("\nReranked:");
    console.log(reranked.length);

    console.log("\nCompressed:");
    console.log(compressed.length);

    console.log("\n📚 SOURCES:");

    console.log(
        JSON.stringify(
            sources,
            null,
            2
        )
    );

    console.log("\n📖 FINAL CONTEXT:");

    console.log(context);

    console.log("\n🤖 DEVELOPMENT ANSWER:");

    console.log(
        developmentAnswer
    );


} catch (error) {

    console.error(
        "\n❌ Pipeline test failed:",
        error
    );

} finally {

    await mongoose.disconnect();

    console.log(
        "\n🔌 MongoDB disconnected"
    );
}