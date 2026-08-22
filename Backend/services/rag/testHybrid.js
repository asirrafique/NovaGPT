import "dotenv/config";

import mongoose from "mongoose";

import { hybridRetrieve } from "./hybridRetriever.js";


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


    console.log(
        "\n🔎 Query:"
    );

    console.log(query);


    const results =
        await hybridRetrieve({

            userId:
                TEST_USER_ID,

            query,

            topK: 3
        });


    console.log(
        "\n🎯 Hybrid retrieval results:"
    );


    results.forEach(
        (result, index) => {

            console.log(
                `\n--- Result ${index + 1} ---`
            );

            console.log(
                "Combined:",
                result.combinedScore
            );

            console.log(
                "Semantic:",
                result.semanticScore
            );

            console.log(
                "Keyword:",
                result.keywordScore
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
        }
    );


} catch (error) {

    console.error(
        "❌ Hybrid retrieval failed:",
        error
    );

} finally {

    await mongoose.disconnect();

    console.log(
        "\n🔌 MongoDB disconnected"
    );
}