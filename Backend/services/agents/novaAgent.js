import { ChatGoogle } from "@langchain/google";
import { createAgent } from "langchain";

import {
    getLangChainMCPTools
} from "../ai/langchainMcpTools.js";

import {
    createLangChainRAGTool
} from "../ai/langchainRagTool.js";


// ============================================================
// CONFIGURATION
// ============================================================

const MODEL =
    process.env.GEMINI_MODEL ||
    "gemini-3.6-flash";


// ============================================================
// GEMINI MODEL
// ============================================================

const model =
    new ChatGoogle({

        model: MODEL,

        apiKey:
            process.env.GEMINI_API_KEY

    });


// ============================================================
// SYSTEM PROMPT
// ============================================================

const systemPrompt = `
You are NovaGPT, an intelligent AI assistant.

You have access to two categories of tools:

1. MCP tools
2. Document search / RAG

============================================================
GENERAL RULES
============================================================

Answer normal general-knowledge questions directly.

Do not use tools unnecessarily.

Never invent tool results.

============================================================
DOCUMENT SEARCH / RAG
============================================================

Use the document_search tool when the user asks about
information that may exist in their uploaded documents.

Examples:

- "What technologies did I use in my NovaGPT project?"
- "What is mentioned in my resume?"
- "According to my uploaded document, what is..."
- "Which projects are listed in my resume?"
- "What did I write about RAG?"

When the answer depends on the user's uploaded documents,
use document_search rather than relying on your general
knowledge.

When document_search returns sources, use those sources
to answer the user.

============================================================
MCP TOOLS
============================================================

Use MCP tools when the user's request requires them.

Examples:

- Mathematical calculations → calculator
- Current date/time → current_time

Do not use an MCP tool when normal conversation is sufficient.

============================================================
FINAL RESPONSE
============================================================

After using a tool, provide a natural-language answer.

Do not mention internal routing decisions unless useful.

Do not fabricate information.
`;


// ============================================================
// EXTRACT TEXT FROM AI MESSAGE
// ============================================================

function extractMessageText(message) {

    if (!message) {
        return "";
    }


    if (
        typeof message.content ===
        "string"
    ) {

        return message.content.trim();
    }


    if (
        Array.isArray(message.content)
    ) {

        return message.content
            .map(block => {

                if (
                    typeof block ===
                    "string"
                ) {

                    return block;
                }


                if (
                    block?.type ===
                        "text" &&
                    typeof block.text ===
                        "string"
                ) {

                    return block.text;
                }


                return "";

            })
            .join("")
            .trim();
    }


    return "";
}


// ============================================================
// EXTRACT RAG SOURCES
// ============================================================

function extractRAGSources(messages) {

    for (
        let i = messages.length - 1;
        i >= 0;
        i--
    ) {

        const message =
            messages[i];


        if (
            message?.name !==
            "document_search"
        ) {
            continue;
        }


        const content =
            message.content;


        if (
            typeof content !==
            "string"
        ) {
            continue;
        }


        try {

            const parsed =
                JSON.parse(content);


            return Array.isArray(
                parsed.sources
            )
                ? parsed.sources
                : [];

        } catch {

            return [];
        }
    }


    return [];
}


// ============================================================
// MAIN NOVAGPT AGENT
// ============================================================

export async function runNovaAgent({

    message,

    userId

}) {

    const startTime =
        Date.now();


    if (
        !message ||
        typeof message !== "string"
    ) {

        throw new Error(
            "Message is required"
        );
    }


    if (!userId) {

        throw new Error(
            "userId is required"
        );
    }


    // ========================================================
    // 1. MCP TOOLS
    // ========================================================

    const mcpTools =
        await getLangChainMCPTools();


    // ========================================================
    // 2. RAG TOOL
    // ========================================================

    const ragTool =
        createLangChainRAGTool(
            userId
        );


    // ========================================================
    // 3. COMBINE ALL TOOLS
    // ========================================================

    const tools = [

        ...mcpTools,

        ragTool

    ];


    console.log(
        "🧠 NovaGPT LangChain tools:",
        tools.map(
            tool => tool.name
        )
    );


    // ========================================================
    // 4. CREATE AGENT
    // ========================================================

    const agent =
        createAgent({

            model,

            tools,

            systemPrompt

        });


    // ========================================================
    // 5. RUN AGENT
    // ========================================================

    const result =
        await agent.invoke({

            messages: [

                {
                    role: "user",

                    content:
                        message.trim()

                }

            ]

        });


    // ========================================================
    // 6. GET MESSAGES
    // ========================================================

    const messages =
        result?.messages || [];


    // ========================================================
    // 7. FINAL RESPONSE
    // ========================================================

    const lastMessage =
        messages[
            messages.length - 1
        ];


    const reply =
        extractMessageText(
            lastMessage
        );


    if (!reply) {

        throw new Error(
            "LangChain agent returned an empty response"
        );
    }


    // ========================================================
    // 8. TOOL TRACE
    // ========================================================

    const toolTrace = [];


    for (
        const messageItem
        of messages
    ) {

        if (
            !Array.isArray(
                messageItem?.tool_calls
            )
        ) {
            continue;
        }


        for (
            const toolCall
            of messageItem.tool_calls
        ) {

            toolTrace.push({

                tool:
                    toolCall.name,

                arguments:
                    toolCall.args || {}

            });
        }
    }


    // ========================================================
    // 9. RAG SOURCES
    // ========================================================

    const sources =
        extractRAGSources(
            messages
        );


    // ========================================================
    // 10. DETERMINE MODE
    // ========================================================

    const usedRAG =
        toolTrace.some(
            call =>
                call.tool ===
                "document_search"
        );


    const mode =
        usedRAG
            ? "rag"
            : toolTrace.length > 0
                ? "agent"
                : "normal";


    // ========================================================
    // 11. RETURN
    // ========================================================

    return {

        reply,

        mode,

        sources,

        toolTrace,

        durationMs:
            Date.now() - startTime

    };
}