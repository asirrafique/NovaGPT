import mongoose from "mongoose";

const documentChunkSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        fileName: {
            type: String,
            required: true
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

export default mongoose.model(
    "DocumentChunk",
    documentChunkSchema
);