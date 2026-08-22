import "dotenv/config";

import mongoose from "mongoose";

import { answerWithRAG } from "./ragService.js";


const MONGODB_URI = process.env.MONGODB_URI;


/*
 * Use the same User ID you used
 * in testRetrieval.js.
 */
const TEST_USER_ID = "6a639b291f5b184f3eefa272";


const query =
    "How does NovaGPT communicate with tools?";


try {

    // ------------------------------------------------------------
    // Connect MongoDB
    // ------------------------------------------------------------

    await mongoose.connect(MONGODB_URI);

    console.log("✅ MongoDB connected");


    // ------------------------------------------------------------
    // Ask RAG
    // ------------------------------------------------------------

    console.log("\n🧠 RAG QUESTION:");
    console.log(query);


    const result = await answerWithRAG({

        userId: TEST_USER_ID,

        query,

        topK: 3
    });


    // ------------------------------------------------------------
    // Display answer
    // ------------------------------------------------------------

    console.log("\n🤖 RAG ANSWER:");
    console.log(result.answer);


    // ------------------------------------------------------------
    // Display sources
    // ------------------------------------------------------------

    console.log("\n📚 SOURCES:");

    result.sources.forEach((source, index) => {

        console.log(
            `\n--- Source ${index + 1} ---`
        );

        console.log(
            "File:",
            source.fileName
        );

        console.log(
            "Chunk:",
            source.chunkIndex
        );

        console.log(
            "Score:",
            source.score
        );
    });


} catch (error) {

    console.error(
        "❌ RAG test failed:",
        error
    );

} finally {

    await mongoose.disconnect();

    console.log("\n🔌 MongoDB disconnected");
}