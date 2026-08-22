import DocumentChunk from "../../models/DocumentChunk.js";


export async function storeDocumentChunks({
    userId,
    documentId,
    fileName,
    fileType,
    chunks,
    embeddings
}) {

    if (!userId) {
        throw new Error("userId is required");
    }

    if (!documentId) {
        throw new Error("documentId is required");
    }

    if (!fileName) {
        throw new Error("fileName is required");
    }

    if (!Array.isArray(chunks)) {
        throw new Error("chunks must be an array");
    }

    if (!Array.isArray(embeddings)) {
        throw new Error("embeddings must be an array");
    }

    if (chunks.length !== embeddings.length) {
        throw new Error(
            "Chunks and embeddings length mismatch"
        );
    }


    const documents = chunks.map(
        (text, index) => ({
            userId,

            documentId,

            fileName,

            fileType,

            chunkIndex: index,

            text,

            embedding: embeddings[index]
        })
    );


    return await DocumentChunk.insertMany(
        documents
    );
}


export async function getUserDocumentChunks(
    userId,
    filters = {}
) {

    const query = {
        userId
    };


    if (filters.documentId) {
        query.documentId =
            filters.documentId;
    }


    if (filters.fileName) {
        query.fileName =
            filters.fileName;
    }


    if (filters.fileType) {
        query.fileType =
            filters.fileType;
    }


    return await DocumentChunk
        .find(query)
        .lean();
}


export async function deleteDocumentChunks(
    userId,
    documentId
) {

    return await DocumentChunk.deleteMany({
        userId,
        documentId
    });
}