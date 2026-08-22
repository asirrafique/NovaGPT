import "dotenv/config";

import mongoose from "mongoose";

import { hybridRetrieve } from "./hybridRetriever.js";
import { rerankResults } from "./reranker.js";

const MONGODB_URI = process.env.MONGODB_URI;

const TEST_USER_ID = "6a639b291f5b184f3eefa272";

const query =
    "How does NovaGPT communicate with tools?";

try {

    await mongoose.connect(MONGODB_URI);

    console.log("✅ MongoDB connected");

    console.log("\n🔎 Query:");
    console.log(query);

    // Get a larger candidate pool first
    const candidates = await hybridRetrieve({
        userId: TEST_USER_ID,
        query,
        topK: 10
    });

    console.log(
        `\n📦 Candidates: ${candidates.length}`
    );

    // Rerank candidates
    const results = rerankResults({
        results: candidates,
        query,
        topK: 3
    });

    console.log("\n🏆 RERANKED RESULTS:");

    results.forEach((result, index) => {

        console.log(
            `\n--- Result ${index + 1} ---`
        );

        console.log(
            "Rerank:",
            result.rerankScore
        );

        console.log(
            "Combined:",
            result.combinedScore
        );

        console.log(
            "Term coverage:",
            result.termCoverage
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
            "Text:",
            result.text
        );
    });

} catch (error) {

    console.error(
        "❌ Reranking failed:",
        error
    );

} finally {

    await mongoose.disconnect();

    console.log(
        "\n🔌 MongoDB disconnected"
    );
}