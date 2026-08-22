import { generateEmbedding } from "./embeddings.js";
import { getUserDocumentChunks } from "./vectorStore.js";


/**
 * Calculate cosine similarity between two vectors.
 */
function cosineSimilarity(vectorA, vectorB) {

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

    for (let i = 0; i < vectorA.length; i++) {

        dotProduct += vectorA[i] * vectorB[i];

        magnitudeA += vectorA[i] * vectorA[i];

        magnitudeB += vectorB[i] * vectorB[i];
    }

    if (magnitudeA === 0 || magnitudeB === 0) {
        return 0;
    }

    return (
        dotProduct /
        (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB))
    );
}


/**
 * Retrieve the most relevant document chunks.
 */
export async function retrieveRelevantChunks({
    userId,
    query,
    topK = 5
}) {

    if (!userId) {
        throw new Error("userId is required");
    }

    if (!query || typeof query !== "string") {
        throw new Error("Query is required");
    }


    // ------------------------------------------------------------
    // 1. Convert the user's query into an embedding
    // ------------------------------------------------------------

    const queryEmbedding =
        await generateEmbedding(query);


    // ------------------------------------------------------------
    // 2. Get the user's stored document chunks
    // ------------------------------------------------------------

    const documents =
        await getUserDocumentChunks(userId);


    if (documents.length === 0) {
        return [];
    }


    // ------------------------------------------------------------
    // 3. Calculate semantic similarity
    // ------------------------------------------------------------

    const scoredDocuments = documents.map((document) => {

        const score = cosineSimilarity(
            queryEmbedding,
            document.embedding
        );

        return {
            ...document,
            score
        };
    });


    // ------------------------------------------------------------
    // 4. Sort by relevance
    // ------------------------------------------------------------

    scoredDocuments.sort(
        (a, b) => b.score - a.score
    );


    // ------------------------------------------------------------
    // 5. Return top results
    // ------------------------------------------------------------

    return scoredDocuments
        .slice(0, topK)
        .map((document) => ({
            id: document._id,

            fileName: document.fileName,

            fileType: document.fileType,

            chunkIndex: document.chunkIndex,

            text: document.text,

            score: document.score
        }));
}