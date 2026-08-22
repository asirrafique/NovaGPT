import "dotenv/config";

import mongoose from "mongoose";

import { hybridRetrieve } from "./hybridRetriever.js";
import { rerankResults } from "./reranker.js";
import { compressContext } from "./contextCompressor.js";


const MONGODB_URI =
    process.env.MONGODB_URI;

const TEST_USER_ID =
    "6a639b291f5b184f3eefa272";

const query =
    "How does NovaGPT communicate with tools?";


try {

    await mongoose.connect(
        MONGODB_URI
    );

    console.log(
        "✅ MongoDB connected"
    );


    // ============================================================
    // 1. HYBRID RETRIEVAL
    // ============================================================

    const candidates =
        await hybridRetrieve({

            userId:
                TEST_USER_ID,

            query,

            topK: 10
        });


    console.log(
        `\n📦 Candidates: ${candidates.length}`
    );


    // ============================================================
    // 2. RERANKING
    // ============================================================

    const reranked =
        rerankResults({

            results:
                candidates,

            query,

            topK: 5
        });


    console.log(
        `🏆 Reranked: ${reranked.length}`
    );


    // ============================================================
    // 3. LOCAL CONTEXT COMPRESSION
    // ============================================================

    const compressed =
        compressContext({

            query,

            results:
                reranked,

            maxResults: 4,

            maxSentencesPerChunk: 3
        });


    console.log(
        `🧠 Compressed: ${compressed.length}`
    );


    // ============================================================
    // 4. DISPLAY
    // ============================================================

    compressed.forEach(
        (result, index) => {

            console.log(
                `\n--- Context ${index + 1} ---`
            );

            console.log(
                "File:",
                result.fileName
            );

            console.log(
                "Chunk:",
                result.chunkIndex
            );

            console.log(
                "\nCompressed:"
            );

            console.log(
                result.text
            );

            console.log(
                "\nOriginal:"
            );

            console.log(
                result.originalText
            );

            console.log(
                "\nCompression Score:",
                result.compressionScore
            );
        }
    );


} catch (error) {

    console.error(
        "❌ Compression failed:",
        error
    );

} finally {

    await mongoose.disconnect();

    console.log(
        "\n🔌 MongoDB disconnected"
    );
}