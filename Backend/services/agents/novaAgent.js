import { generateResponse } from "../ai/geminiClient.js";

import {
    listMCPTools,
    callMCPTool
} from "../mcp/mcpClient.js";

import { answerWithRAG } from "../rag/ragService.js";



function detectRoute(message, mcpTools) {

    const text =
        message
            .toLowerCase()
            .trim();


    // ============================================================
    // RAG DETECTION
    // ============================================================

    const ragKeywords = [

        "my resume",
        "my cv",
        "my projects",
        "my project",
        "my skills",
        "my experience",
        "my education",
        "my certifications",
        "my certificate",
        "my achievements",

        "what technologies did i use",
        "what tech stack did i use",
        "what did i use in my project",

        "wanderlust",
        "novagpt project",
        "meetlify",

        "uploaded document",
        "uploaded file",
        "uploaded files",
        "my document",
        "my documents"

    ];


    if (
        ragKeywords.some(
            keyword =>
                text.includes(keyword)
        )
    ) {

        return {
            mode: "rag"
        };
    }


    // ============================================================
    // CALCULATOR
    // ============================================================

    const calculatorTool =
        mcpTools.find(
            tool =>
                tool.name ===
                "calculator"
        );


    const looksLikeCalculation =
        calculatorTool &&
        (
            /\d+\s*[\+\-\*\/\%]\s*\d+/.test(text) ||
            text.includes("calculate") ||
            text.includes("compute") ||
            text.includes("multiply") ||
            text.includes("divide") ||
            text.includes("subtract") ||
            text.includes("add")
        );


    if (looksLikeCalculation) {

        return {

            mode: "mcp",

            tool:
                calculatorTool.name,

            arguments: {

                expression:
                    message
                        .replace(
                            /^calculate\s*/i,
                            ""
                        )
                        .trim()

            }

        };
    }


    // ============================================================
    // CURRENT TIME
    // ============================================================

    const timeTool =
        mcpTools.find(
            tool =>
                tool.name ===
                "current_time"
        );


    const asksTime =
        timeTool &&
        (
            text.includes("what time") ||
            text.includes("current time") ||
            text.includes("time is it")
        );


    if (asksTime) {

        return {

            mode: "mcp",

            tool:
                timeTool.name,

            arguments: {

                timeZone:
                    "Asia/Kolkata"

            }

        };
    }


    // ============================================================
    // NORMAL
    // ============================================================

    return {

        mode: "normal"

    };
}


export async function runNovaAgent({
    message,
    userId
}) {

    const startTime = Date.now();

    if (!message || typeof message !== "string") {
        throw new Error("Message is required");
    }

    if (!userId) {
        throw new Error("userId is required");
    }


    // ============================================================
    // 1. DISCOVER MCP TOOLS
    // ============================================================

    const mcpTools =
        await listMCPTools();


    if (
        !mcpTools ||
        mcpTools.length === 0
    ) {
        throw new Error(
            "No MCP tools available"
        );
    }


    // ============================================================
    // 2. BUILD MCP TOOL DESCRIPTIONS
    // ============================================================

    const toolDescriptions =
        mcpTools
            .map((tool) => {

                return `
Tool name:
${tool.name}

Description:
${tool.description || "No description available"}

Input schema:
${JSON.stringify(
    tool.inputSchema || {}
)}
`;

            })
            .join(
                "\n----------------------\n"
            );


    // ============================================================
    // 3. DECIDE ROUTE
    // ============================================================

    const decisionPrompt = `
You are NovaGPT's routing system.

The user can be answered using one of these modes:

1. RAG
   Use RAG when the user asks about their uploaded
   documents, resume, projects, files, personal
   documents, or information that must come from
   uploaded documents.

2. MCP
   Use MCP when one of the available MCP tools is
   clearly required.

3. NORMAL
   Use normal Gemini conversation when the question
   does not require uploaded documents or tools.

AVAILABLE MCP TOOLS:

${toolDescriptions}

USER MESSAGE:
"${message}"

IMPORTANT RULES:

- Return ONLY valid JSON.
- Do not use markdown.
- Do not explain your decision.
- Preserve the user's original meaning.
- Choose RAG for questions about uploaded documents.
- Choose MCP only when a tool is actually required.
- Otherwise choose NORMAL.

If RAG is required:

{
    "mode": "rag"
}

If an MCP tool is required:

{
    "mode": "mcp",
    "tool": "tool_name",
    "arguments": {}
}

If normal conversation is sufficient:

{
    "mode": "normal"
}

Examples:

User:
"What technologies did I use in my Wanderlust project?"

Response:
{
    "mode": "rag"
}

User:
"Calculate 25 / 100 * 840"

Response:
{
    "mode": "mcp",
    "tool": "calculator",
    "arguments": {
        "expression": "25 / 100 * 840"
    }
}

User:
"What time is it in India?"

Response:
{
    "mode": "mcp",
    "tool": "current_time",
    "arguments": {
        "timeZone": "Asia/Kolkata"
    }
}

User:
"What is REST API?"

Response:
{
    "mode": "normal"
}
`;


    const decisionText =
        await generateResponse(
            decisionPrompt
        );


    let decision;


    try {

        const cleaned =
            decisionText
                .replace(/```json/gi, "")
                .replace(/```/g, "")
                .trim();


        decision =
            JSON.parse(cleaned);

    } catch (error) {

        console.error(
            "Failed to parse agent decision:",
            decisionText
        );


        decision = {
            mode: "normal"
        };
    }


    // ============================================================
    // 4. RAG
    // ============================================================

    if (
        decision.mode === "rag"
    ) {

        const ragResult =
            await answerWithRAG({

                userId,

                query:
                    message.trim(),

                topK: 5,

                filters: {}
            });


        return {

            reply:
                ragResult.answer,

            mode:
                "rag",

            sources:
                ragResult.sources || [],

            metadata:
                ragResult.metadata || {},

            toolTrace: [],

            durationMs:
                Date.now() - startTime
        };
    }


    // ============================================================
    // 5. MCP
    // ============================================================

    let toolResult = null;

    const toolTrace = [];


    if (
        decision.mode === "mcp"
    ) {

        const selectedTool =
            mcpTools.find(
                (tool) =>
                    tool.name ===
                    decision.tool
            );


        if (!selectedTool) {

            throw new Error(
                `MCP tool not found: ${decision.tool}`
            );
        }


        const toolStart =
            Date.now();


        try {

            toolResult =
                await callMCPTool(
                    decision.tool,
                    decision.arguments || {}
                );


            toolTrace.push({

                tool:
                    decision.tool,

                arguments:
                    decision.arguments || {},

                success:
                    !toolResult?.isError,

                durationMs:
                    Date.now() -
                    toolStart,

                source:
                    "MCP"
            });


        } catch (error) {

            toolTrace.push({

                tool:
                    decision.tool,

                arguments:
                    decision.arguments || {},

                success:
                    false,

                durationMs:
                    Date.now() -
                    toolStart,

                source:
                    "MCP",

                error:
                    error.message
            });


            throw error;
        }
    }


    // ============================================================
    // 6. NORMAL / MCP FINAL RESPONSE
    // ============================================================

    let finalPrompt;


    if (toolResult) {

        finalPrompt = `
You are NovaGPT.

The user asked:

"${message}"

An MCP tool was used:

${decision.tool}

The MCP tool returned:

${JSON.stringify(toolResult)}

Provide the final answer to the user.

Rules:

- Use the tool result.
- Do not invent information.
- Be concise and natural.
- Do not mention internal JSON.
- Do not mention MCP unless the user asks.
- Do not mention the routing system.
`;

    } else {

        finalPrompt = `
You are NovaGPT.

The user asked:

"${message}"

Answer naturally and helpfully.

Rules:

- Be concise.
- Answer directly.
- Do not mention routing.
- Do not mention MCP.
- Do not mention internal architecture.
`;
    }


    // ============================================================
    // 7. FINAL GEMINI RESPONSE
    // ============================================================

    const reply =
        await generateResponse(
            finalPrompt
        );


    // ============================================================
    // 8. RETURN
    // ============================================================

    return {

        reply,

        mode:
            toolResult
                ? "mcp"
                : "normal",

        sources: [],

        metadata: {},

        toolTrace,

        durationMs:
            Date.now() - startTime
    };
}