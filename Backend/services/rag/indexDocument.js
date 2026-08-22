import crypto from "crypto";

import { extractText } from "./documentLoader.js";

import { chunkText } from "./chunker.js";

import { generateEmbeddings } from "./embeddings.js";

import {
    storeDocumentChunks
} from "./vectorStore.js";


export async function indexDocument({
    file,
    userId
}) {

    if (!file) {

        throw new Error(
            "No document file provided"
        );
    }


    if (!userId) {

        throw new Error(
            "userId is required"
        );
    }


    // ============================================================
    // 1. GENERATE DOCUMENT ID
    // ============================================================

    const documentId =
        crypto.randomUUID();


    // ============================================================
    // 2. EXTRACT TEXT
    // ============================================================

    const text =
        await extractText(
            file
        );


    if (
        !text ||
        typeof text !== "string" ||
        text.trim().length === 0
    ) {

        throw new Error(
            "No readable text found in the document"
        );
    }


    // ============================================================
    // 3. CHUNK DOCUMENT
    // ============================================================

    const chunks =
        chunkText(
            text,
            1000,
            180
        );


    if (
        chunks.length === 0
    ) {

        throw new Error(
            "Document did not produce any chunks"
        );
    }


    console.log(
        `📄 Indexing: ${file.originalname}`
    );


    console.log(
        `📦 Generated ${chunks.length} chunks`
    );


    // ============================================================
    // 4. EMBEDDINGS
    // ============================================================

    const embeddings =
        await generateEmbeddings(
            chunks
        );


    if (
        !Array.isArray(embeddings) ||
        embeddings.length !== chunks.length
    ) {

        throw new Error(
            "Embedding count does not match chunk count"
        );
    }


    // ============================================================
    // 5. STORE
    // ============================================================

    const storedChunks =
        await storeDocumentChunks({

            userId,

            documentId,

            fileName:
                file.originalname,

            fileType:
                file.mimetype,

            chunks,

            embeddings
        });


    // ============================================================
    // 6. RETURN
    // ============================================================

    return {

        documentId,

        fileName:
            file.originalname,

        fileType:
            file.mimetype,

        characters:
            text.length,

        chunks:
            chunks.length,

        storedChunks:
            storedChunks.length
    };
}