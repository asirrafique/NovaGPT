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
    // 2. GET MESSAGE
    // ============================================================

    const { message } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        success: false,

        error: "MESSAGE_REQUIRED",

        message: "Message is required",
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
    // 5. RUN NOVAGPT AGENT
    // ============================================================

    const result = await runNovaAgent({
      message: cleanMessage,

      userId,
    });

    // ============================================================
    // 6. SUCCESS RESPONSE
    // ============================================================

    return res.status(200).json({
      success: true,

      reply: result?.reply || "",

      mode: result?.mode || "normal",

      sources: Array.isArray(result?.sources) ? result.sources : [],

      metadata: result?.metadata || {},

      agent: {
        toolCalls: Array.isArray(result?.toolTrace) ? result.toolTrace : [],

        durationMs: result?.durationMs || 0,
      },
    });
  } catch (error) {
    // ============================================================
    // GLOBAL AGENT ERROR HANDLER
    // ============================================================

    console.error("❌ Agent error:", error);

    // ============================================================
    // GEMINI QUOTA EXCEEDED
    // ============================================================

    if (
      error?.code === "GEMINI_QUOTA_EXCEEDED" ||
      error?.status === 429 ||
      error?.response?.status === 429 ||
      error?.message?.includes("RESOURCE_EXHAUSTED") ||
      error?.message?.includes("quota") ||
      error?.message?.includes("Quota exceeded")
    ) {
      return res.status(429).json({
        success: false,

        error: "GEMINI_QUOTA_EXCEEDED",

        message:
          "⚠️ Gemini API quota exceeded. " +
          "Your Gemini API request limit has been reached. " +
          "Please try again later or check your Gemini API plan and billing.",
      });
    }

    // ============================================================
    // GEMINI SERVICE UNAVAILABLE
    // ============================================================

    if (
      error?.status === 503 ||
      error?.response?.status === 503 ||
      error?.code === "GEMINI_UNAVAILABLE" ||
      error?.message?.includes("UNAVAILABLE")
    ) {
      return res.status(503).json({
        success: false,

        error: "GEMINI_UNAVAILABLE",

        message:
          "⚠️ Gemini is temporarily unavailable. " +
          "Please try again in a moment.",
      });
    }

    // ============================================================
    // GEMINI RATE LIMIT
    // ============================================================

    if (error?.code === "RATE_LIMIT_EXCEEDED") {
      return res.status(429).json({
        success: false,

        error: "RATE_LIMIT_EXCEEDED",

        message: "⚠️ Too many requests. Please try again later.",
      });
    }

    // ============================================================
    // MCP ERROR
    // ============================================================

    if (error?.message?.includes("MCP")) {
      return res.status(500).json({
        success: false,

        error: "MCP_ERROR",

        message: "An MCP tool could not be executed. Please try again.",
      });
    }

    // ============================================================
    // DEFAULT AGENT ERROR
    // ============================================================

    return res.status(500).json({
      success: false,

      error: "AGENT_ERROR",

      message: error?.message || "NovaGPT agent failed. Please try again.",
    });
  }
}
