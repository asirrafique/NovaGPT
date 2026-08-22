import "dotenv/config";

import mongoose from "mongoose";

import {
    getUserDocumentChunks
} from "./vectorStore.js";


const MONGODB_URI =
    process.env.MONGODB_URI;

const TEST_USER_ID =
    "6a639b291f5b184f3eefa272";


try {

    await mongoose.connect(
        MONGODB_URI
    );

    console.log(
        "✅ MongoDB connected"
    );


    // ============================================================
    // ALL DOCUMENTS
    // ============================================================

    const allDocuments =
        await getUserDocumentChunks(
            TEST_USER_ID
        );


    console.log(
        "\n📚 ALL CHUNKS:",
        allDocuments.length
    );


    // ============================================================
    // RESUME
    // ============================================================

    const resumeChunks =
        await getUserDocumentChunks(
            TEST_USER_ID,
            {
                fileName: "MY-RESUME.pdf"
            }
        );


    console.log(
        "\n📄 RESUME CHUNKS:",
        resumeChunks.length
    );


    // ============================================================
    // PRINT EVERY RESUME CHUNK
    // ============================================================

    resumeChunks
        .sort(
            (a, b) =>
                a.chunkIndex -
                b.chunkIndex
        )
        .forEach(
            (chunk) => {

                console.log(
                    "\n" +
                    "=".repeat(80)
                );

                console.log(
                    `📦 CHUNK ${chunk.chunkIndex}`
                );

                console.log(
                    "=".repeat(80)
                );

                console.log(
                    "Document ID:",
                    chunk.documentId
                );

                console.log(
                    "File:",
                    chunk.fileName
                );

                console.log(
                    "Type:",
                    chunk.fileType
                );

                console.log(
                    "\nTEXT:\n"
                );

                console.log(
                    chunk.text
                );

                console.log(
                    "\nEmbedding dimensions:",
                    Array.isArray(
                        chunk.embedding
                    )
                        ? chunk.embedding.length
                        : "N/A"
                );
            }
        );


} catch (error) {

    console.error(
        "❌ Metadata test failed:",
        error
    );

} finally {

    await mongoose.disconnect();

    console.log(
        "\n🔌 MongoDB disconnected"
    );
}