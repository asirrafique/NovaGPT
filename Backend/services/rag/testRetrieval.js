import "dotenv/config";

import mongoose from "mongoose";

import { chunkText } from "./chunker.js";
import { generateEmbeddings } from "./embeddings.js";
import {
    storeDocumentChunks
} from "./vectorStore.js";
import {
    retrieveRelevantChunks
} from "./retriever.js";


const MONGODB_URI = process.env.MONGODB_URI;


/*
 * IMPORTANT:
 * Replace this with the ObjectId of your
 * existing NovaGPT user.
 */
const TEST_USER_ID = "6a639b291f5b184f3eefa272";


const testDocument = `
NovaGPT is an AI-powered conversational application.

NovaGPT supports authentication, chat history,
streaming responses, document uploads, and
multimodal AI capabilities.

NovaGPT also includes an agentic AI architecture.

The AI agent can decide when a tool is required
and can execute tools through the Model Context Protocol.

NovaGPT currently has MCP tools for mathematical
calculations and retrieving the current time.

The MCP architecture allows NovaGPT to discover
available tools dynamically from an MCP server.

The application is built using JavaScript,
Node.js, Express, MongoDB, React, and Gemini.
`;


try {

    // ------------------------------------------------------------
    // 1. Connect MongoDB
    // ------------------------------------------------------------

    await mongoose.connect(MONGODB_URI);

    console.log("✅ MongoDB connected");


    // ------------------------------------------------------------
    // 2. Chunk document
    // ------------------------------------------------------------

    const chunks = chunkText(
        testDocument,
        500,
        100
    );

    console.log(
        `📚 Created ${chunks.length} chunks`
    );


    // ------------------------------------------------------------
    // 3. Generate embeddings
    // ------------------------------------------------------------

    console.log("🧠 Generating embeddings...");

    const embeddings =
        await generateEmbeddings(chunks);

    console.log("✅ Embeddings generated");


    // ------------------------------------------------------------
    // 4. Store document
    // ------------------------------------------------------------

    await storeDocumentChunks({

        userId: TEST_USER_ID,

        fileName: "novagpt-test.txt",

        fileType: "text/plain",

        chunks,

        embeddings
    });

    console.log("💾 Document chunks stored");


    // ------------------------------------------------------------
    // 5. Test semantic retrieval
    // ------------------------------------------------------------

    const query =
        "How does NovaGPT communicate with tools?";


    console.log("\n🔎 Query:");
    console.log(query);


    const results =
        await retrieveRelevantChunks({

            userId: TEST_USER_ID,

            query,

            topK: 3
        });


    console.log("\n🎯 Retrieved chunks:");

    results.forEach((result, index) => {

        console.log(
            `\n--- Result ${index + 1} ---`
        );

        console.log(
            "Score:",
            result.score
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
        "❌ Retrieval test failed:",
        error
    );

} finally {

    await mongoose.disconnect();

    console.log("\n🔌 MongoDB disconnected");
}