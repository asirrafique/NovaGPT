import express from "express";
import Thread from "../models/Thread.js";
import getGeminiAPIResponse from "../utils/genai.js";
import getGeminiAPIStreamResponse from "../utils/genaiStream.js";
import upload from "../middlewares/upload.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// Test Route
router.post("/test", async (req, res) => {
    try {
        const thread = new Thread({
            threadId: "abc",
            title: "Testing New Thread2",
        });

        const response = await thread.save();
        res.send(response);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Failed to save in DB" });
    }
});

// Get all threads
router.get("/thread", authMiddleware, async (req, res) => {
    try {
        const threads = await Thread.find({
    user: req.user.id,
}).sort({
    updatedAt: -1,
});

        res.json(threads);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Failed to fetch threads" });
    }
});

// Get messages of a particular thread
router.get("/thread/:threadId", authMiddleware, async (req, res) => {
    const { threadId } = req.params;

    try {
        const thread = await Thread.findOne({
    threadId,
    user: req.user.id,
});

        if (!thread) {
            return res.status(404).json({ error: "Thread not found" });
        }

        res.json(thread.messages);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Failed to fetch chat" });
    }
});

// Delete a thread
router.delete("/thread/:threadId", authMiddleware, async (req, res) => {
    const { threadId } = req.params;

    try {
        const deletedThread = await Thread.findOneAndDelete({
    threadId,
    user: req.user.id,
});

        if (!deletedThread) {
            return res.status(404).json({ error: "Thread not found" });
        }

        res.status(200).json({
            success: "Thread deleted successfully",
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            error: "Failed to delete thread",
        });
    }
});

// Rename a thread
router.patch("/thread/:threadId/rename", authMiddleware, async (req, res) => {
    const { threadId } = req.params;
    const { title } = req.body;

    if (!title?.trim()) {
        return res.status(400).json({
            error: "Title is required",
        });
    }

    try {
        const updatedThread = await Thread.findOneAndUpdate(
            {
                threadId,
                user: req.user.id,
            },
            {
                title: title.trim(),
            },
            {
                returnDocument: "after",
            }
        );

        if (!updatedThread) {
            return res.status(404).json({
                error: "Thread not found",
            });
        }

        res.status(200).json(updatedThread);

    } catch (err) {
        console.log(err);

        res.status(500).json({
            error: "Failed to rename thread",
        });
    }
});

router.patch("/thread/:threadId/pin", authMiddleware, async (req, res) => {
    const { threadId } = req.params;

    try {
        const thread = await Thread.findOne({
    threadId,
    user: req.user.id,
});

        if (!thread) {
            return res.status(404).json({
                error: "Thread not found",
            });
        }

        thread.pinned = !thread.pinned;

        await thread.save();

        res.json(thread);

    } catch (err) {
        console.log(err);

        res.status(500).json({
            error: "Failed to pin thread",
        });
    }
});

// Chat Route
router.post("/chat", authMiddleware, async (req, res) => {
    const { threadId, message } = req.body;

    if (!threadId || !message) {
        return res.status(400).json({
            error: "Missing required fields",
        });
    }

    try {
        let thread = await Thread.findOne({
    threadId,
    user: req.user.id,
});
        if (!thread) {
            thread = new Thread({
                user: req.user.id,
                threadId,
                title: message,
                messages: [
                    {
                        role: "user",
                        content: message,
                    },
                ],
            });
        } else {
            thread.messages.push({
                role: "user",
                content: message,
            });
        }

       // Prompt for better chat formatting
const prompt = `
You are NovaGPT, a helpful AI assistant.

Answer the user's question in clean Markdown.

Rules:
- Use headings (##) and bullet points (-) where appropriate.
- Do NOT use Markdown tables.
- Do NOT use LaTeX or $$...$$ math notation.
- Write equations using plain text (e.g. F = m × a).
- Keep responses concise, readable, and suitable for a chat interface.
- Use fenced code blocks (\`\`\`) only when showing code.
- Do not make the response unnecessarily wide.
- Answer the user's request immediately.
- Never start responses with introductions such as "Hello!", "Hi!", "Hello! I am NovaGPT.", "I'm NovaGPT", "Certainly!", "Sure!", or similar filler unless the user greets you first.
- If the user greets you, respond with a brief greeting and then help them.
- Do not mention that you are an AI unless the user explicitly asks.
- Do not add unnecessary introductions or conclusions. Focus on the user's request.

User Question:
${message}
`;

const assistantReply = await getGeminiAPIResponse(prompt);

        // Save AI Reply
        thread.messages.push({
            role: "assistant",
            content: assistantReply,
        });


        await thread.save();

        res.json({
            reply: assistantReply,
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            error: "Something went wrong",
        });
    }
});

// Streaming Chat Route
router.post(
    "/chat/stream",
    authMiddleware,
    upload.single("file"),
    async (req, res) => {
    const {
    threadId,
    message,
    temporaryChat,
} = req.body;

const isTemporaryChat = temporaryChat === "true";
    const uploadedFile = req.file;
    console.log(uploadedFile);

    if (!threadId || !message) {
        return res.status(400).json({
            error: "Missing required fields",
        });
    }

    try {
        let thread = null;

if (!isTemporaryChat) {
    thread = await Thread.findOne({
    threadId,
    user: req.user.id,
});

    if (!thread) {
        thread = new Thread({
            user: req.user.id,
            threadId,
            title: message,
            messages: [
                {
                    role: "user",
                    content: message,

                    file: uploadedFile
                        ? {
                              name: uploadedFile.originalname,
                              type: uploadedFile.mimetype,
                              size: uploadedFile.size,
                          }
                        : null,
                },
            ],
        });
    } else {
        thread.messages.push({
            role: "user",
            content: message,

            file: uploadedFile
                ? {
                      name: uploadedFile.originalname,
                      type: uploadedFile.mimetype,
                      size: uploadedFile.size,
                  }
                : null,
        });
    }
}

        const prompt = `
You are NovaGPT, a helpful AI assistant.

Answer the user's question in clean Markdown.

Rules:
- Use headings (##) and bullet points (-).
- Do NOT use Markdown tables.
- Do NOT use LaTeX or $$...$$ math notation.
- Write equations using plain text.
- Use fenced code blocks only when necessary.

User Question:
${message}
`;

        const stream = await getGeminiAPIStreamResponse(
    prompt,
    uploadedFile
);

res.setHeader("Content-Type", "text/plain; charset=utf-8");
res.setHeader("Transfer-Encoding", "chunked");
res.setHeader("Cache-Control", "no-cache");
res.setHeader("Connection", "keep-alive");

let fullReply = "";

for await (const chunk of stream) {

    const text =
        chunk.candidates?.[0]?.content?.parts
            ?.map((part) => part.text || "")
            .join("") || "";

    if (!text) continue;

    fullReply += text;

    console.log("Chunk:", text);

    res.write(text);
}

if (!isTemporaryChat) {
    thread.messages.push({
        role: "assistant",
        content: fullReply,
        prompt: message,
    });

    await thread.save();
}

res.end();

    } catch (err) {
        console.error("STREAM ERROR:", err);

        if (!res.headersSent) {
            res.status(500).json({
                error: err.message,
            });
        } else {
            res.end();
        }
    }
});

export default router;