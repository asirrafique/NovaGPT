import mongoose from "mongoose";

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