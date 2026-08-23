import Thread from "../models/Thread.js";
import { runNovaAgent } from "../services/agents/novaAgent.js";

export async function agentChat(req, res) {
  try {
    // ============================================================
    // 1. GET USER ID
    // ============================================================

    const userId = req.user?._id || req.user?.id || req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "AUTH_REQUIRED",
        message: "User authentication required",
      });
    }

    // ============================================================
    // 2. GET REQUEST DATA
    // ============================================================

    const { message, threadId } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        success: false,
        error: "MESSAGE_REQUIRED",
        message: "Message is required",
      });
    }

    if (!threadId || typeof threadId !== "string") {
      return res.status(400).json({
        success: false,
        error: "THREAD_ID_REQUIRED",
        message: "Thread ID is required",
      });
    }

    // ============================================================
    // 3. CLEAN MESSAGE
    // ============================================================

    const cleanMessage = message.trim();

    if (!cleanMessage) {
      return res.status(400).json({
        success: false,
        error: "MESSAGE_REQUIRED",
        message: "Message cannot be empty",
      });
    }

    // ============================================================
    // 4. MESSAGE LENGTH LIMIT
    // ============================================================

    if (cleanMessage.length > 5000) {
      return res.status(400).json({
        success: false,
        error: "MESSAGE_TOO_LONG",
        message: "Message must be 5000 characters or less",
      });
    }

    // ============================================================
    // 5. FIND / CREATE THREAD
    // ============================================================

    let thread = await Thread.findOne({
      threadId,
      user: userId,
    });

    if (!thread) {
      thread = new Thread({
        user: userId,
        threadId,
        title: cleanMessage,
        messages: [],
      });
    }

    // ============================================================
    // 6. SAVE USER MESSAGE
    // ============================================================

    thread.messages.push({
      role: "user",
      content: cleanMessage,
      prompt: cleanMessage,
    });

    // ============================================================
    // 7. RUN NOVAGPT AGENT
    // ============================================================

    const result = await runNovaAgent({
      message: cleanMessage,
      userId,
    });

    const assistantReply = result?.reply || "";

    const normalizedSources = Array.isArray(result?.sources)
      ? result.sources.map((source, index) => ({
          id: source.id ?? index + 1,

          fileName:
            source.fileName ||
            source.filename ||
            "Unknown document",

          chunkIndex:
            source.chunkIndex ??
            source.chunk ??
            0,

          score:
            source.score ??
            source.rerankScore ??
            source.semanticScore ??
            0,

          semanticScore:
            source.semanticScore ?? 0,

          keywordScore:
            source.keywordScore ?? 0,

          compressionScore:
            source.compressionScore ?? 0,
        }))
      : [];

    // ============================================================
    // 8. SAVE ASSISTANT MESSAGE
    // ============================================================

    thread.messages.push({
      role: "assistant",
      content: assistantReply,
      prompt: cleanMessage,
      sources: normalizedSources,
    });

    // ============================================================
    // 9. SAVE THREAD
    // ============================================================

    await thread.save();

    // ============================================================
    // 10. SUCCESS RESPONSE
    // ============================================================

    return res.status(200).json({
      success: true,

      threadId,

      reply: assistantReply,

      mode: result?.mode || "normal",

      sources: normalizedSources,

      metadata: result?.metadata || {},

      agent: {
        toolCalls: Array.isArray(result?.toolTrace)
          ? result.toolTrace
          : [],

        durationMs: result?.durationMs || 0,
      },
    });
  } catch (error) {
    console.error("AGENT ERROR:", error);

    // ============================================================
    // GEMINI QUOTA / RATE LIMIT
    // ============================================================

    const errorText = String(
      error?.message || error || ""
    ).toLowerCase();

    if (
      error?.status === 429 ||
      error?.response?.status === 429 ||
      error?.code === "RATE_LIMIT_EXCEEDED" ||
      errorText.includes("quota") ||
      errorText.includes("resource exhausted") ||
      errorText.includes("rate limit")
    ) {
      return res.status(429).json({
        success: false,

        error: "RATE_LIMIT_EXCEEDED",

        message:
          "⚠️ Gemini API quota exceeded. Your Gemini API request limit has been reached. Please try again later or check your Gemini API plan and billing.",
      });
    }

    // ============================================================
    // GEMINI SERVICE UNAVAILABLE
    // ============================================================

    if (
      error?.status === 503 ||
      error?.response?.status === 503 ||
      error?.code === "GEMINI_UNAVAILABLE" ||
      errorText.includes("unavailable")
    ) {
      return res.status(503).json({
        success: false,

        error: "GEMINI_UNAVAILABLE",

        message:
          "⚠️ Gemini is temporarily unavailable. Please try again in a moment.",
      });
    }

    // ============================================================
    // MCP ERROR
    // ============================================================

    if (errorText.includes("mcp")) {
      return res.status(500).json({
        success: false,

        error: "MCP_ERROR",

        message:
          "An MCP tool could not be executed. Please try again.",
      });
    }

    // ============================================================
    // DEFAULT AGENT ERROR
    // ============================================================

    return res.status(500).json({
      success: false,

      error: "AGENT_ERROR",

      message:
        error?.message ||
        "NovaGPT agent failed. Please try again.",
    });
  }
}