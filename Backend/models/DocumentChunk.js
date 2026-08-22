import mongoose from "mongoose";

const documentChunkSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        documentId: {
            type: String,
            required: true,
            index: true
        },

        fileName: {
            type: String,
            required: true,
            index: true
        },

        fileType: {
            type: String,
            required: true
        },

        chunkIndex: {
            type: Number,
            required: true
        },

        text: {
            type: String,
            required: true
        },

        embedding: {
            type: [Number],
            required: true
        }
    },
    {
        timestamps: true
    }
);

documentChunkSchema.index({
    userId: 1,
    documentId: 1
});

documentChunkSchema.index({
    userId: 1,
    fileName: 1
});

const DocumentChunk =
    mongoose.models.DocumentChunk ||
    mongoose.model(
        "DocumentChunk",
        documentChunkSchema
    );

export default DocumentChunk;