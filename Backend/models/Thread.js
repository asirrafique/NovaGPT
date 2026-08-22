import mongoose from "mongoose";

const SourceSchema = new mongoose.Schema(
    {
        id: {
            type: Number,
        },

        fileName: {
            type: String,
            default: "",
        },

        chunkIndex: {
            type: Number,
            default: 0,
        },

        score: {
            type: Number,
            default: 0,
        },

        semanticScore: {
            type: Number,
            default: 0,
        },

        keywordScore: {
            type: Number,
            default: 0,
        },

        compressionScore: {
            type: Number,
            default: 0,
        },
    },
    {
        _id: false,
    }
);

const MessageSchema = new mongoose.Schema({
    role: {
        type: String,
        enum: ["user", "assistant"],
        required: true,
    },

    content: {
        type: String,
        required: true,
    },

    // Store original prompt for Regenerate
    prompt: {
        type: String,
        default: "",
    },

    // Uploaded file information
    file: {
        name: {
            type: String,
            default: "",
        },

        type: {
            type: String,
            default: "",
        },

        size: {
            type: Number,
            default: 0,
        },
    },

    // RAG sources used to generate this answer
    sources: {
        type: [SourceSchema],
        default: [],
    },

    timestamp: {
        type: Date,
        default: Date.now,
    },
});

const ThreadSchema = new mongoose.Schema(
    {
        // Owner of this thread
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        threadId: {
            type: String,
            required: true,
            unique: true,
        },

        title: {
            type: String,
            default: "New Chat",
        },

        pinned: {
            type: Boolean,
            default: false,
        },

        messages: [MessageSchema],
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("Thread", ThreadSchema);