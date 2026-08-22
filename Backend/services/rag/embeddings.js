import "dotenv/config";

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

const EMBEDDING_MODEL = "gemini-embedding-001";


/**
 * Generate an embedding for a single piece of text.
 */
export async function generateEmbedding(text) {

    if (!text || typeof text !== "string") {
        throw new Error("Text is required for embedding");
    }

    const response = await ai.models.embedContent({
        model: EMBEDDING_MODEL,
        contents: text
    });

    return response.embeddings[0].values;
}


/**
 * Generate embeddings for multiple chunks.
 */
export async function generateEmbeddings(chunks) {

    if (!Array.isArray(chunks) || chunks.length === 0) {
        return [];
    }

    const embeddings = [];

    for (const chunk of chunks) {

        const embedding = await generateEmbedding(chunk);

        embeddings.push(embedding);
    }

    return embeddings;
}