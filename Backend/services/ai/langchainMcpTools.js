import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";

import {
    listMCPTools,
    callMCPTool
} from "../mcp/mcpClient.js";


// ============================================================
// CACHE
// ============================================================

let cachedLangChainTools = null;

let toolsInitializationPromise = null;


// ============================================================
// JSON SCHEMA → ZOD
// ============================================================

function jsonSchemaToZod(schema = {}) {

    const properties =
        schema.properties || {};

    const shape = {};

    for (
        const [name, definition]
        of Object.entries(properties)
    ) {

        let field;


        switch (definition.type) {

            case "string":
                field = z.string();
                break;

            case "number":
                field = z.number();
                break;

            case "integer":
                field = z.number().int();
                break;

            case "boolean":
                field = z.boolean();
                break;

            case "array":
                field = z.array(z.any());
                break;

            case "object":
                field =
                    z.record(
                        z.string(),
                        z.any()
                    );
                break;

            default:
                field = z.any();
        }


        if (definition.description) {

            field =
                field.describe(
                    definition.description
                );
        }


        if (
            !schema.required?.includes(name)
        ) {

            field =
                field.optional();
        }


        shape[name] =
            field;
    }


    return z.object(shape);
}


// ============================================================
// MCP RESULT NORMALIZER
// ============================================================

function normalizeMCPResult(result) {

    if (!result) {
        return "";
    }


    if (
        Array.isArray(result.content)
    ) {

        return result.content
            .map(item => {

                if (
                    item?.type === "text"
                ) {

                    return item.text;
                }

                return "";

            })
            .filter(Boolean)
            .join("\n");
    }


    if (
        typeof result === "string"
    ) {

        return result;
    }


    return JSON.stringify(result);
}


// ============================================================
// BUILD LANGCHAIN TOOLS
// ============================================================

async function initializeLangChainMCPTools() {

    console.log(
        "🔧 Discovering MCP tools..."
    );


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


    const langChainTools =
        mcpTools.map(
            mcpTool => {

                const schema =
                    jsonSchemaToZod(
                        mcpTool.inputSchema || {}
                    );


                return new DynamicStructuredTool({

                    name:
                        mcpTool.name,

                    description:
                        mcpTool.description ||
                        `MCP tool: ${mcpTool.name}`,

                    schema,


                    func:
                        async arguments_ => {

                            console.log(
                                `🔧 LangChain → MCP: ${mcpTool.name}`,
                                arguments_
                            );


                            const result =
                                await callMCPTool(
                                    mcpTool.name,
                                    arguments_
                                );


                            const normalized =
                                normalizeMCPResult(
                                    result
                                );


                            console.log(
                                `✅ MCP result: ${mcpTool.name}`,
                                normalized
                            );


                            return normalized;
                        }

                });
            }
        );


    cachedLangChainTools =
        langChainTools;


    console.log(
        "✅ MCP tools initialized:",
        cachedLangChainTools.map(
            tool => tool.name
        )
    );


    return cachedLangChainTools;
}


// ============================================================
// GET CACHED LANGCHAIN MCP TOOLS
// ============================================================

export async function getLangChainMCPTools() {

    // Already initialized
    if (cachedLangChainTools) {

        return cachedLangChainTools;
    }


    // Another request is already initializing
    if (toolsInitializationPromise) {

        return toolsInitializationPromise;
    }


    // Initialize exactly once
    toolsInitializationPromise =
        initializeLangChainMCPTools();


    try {

        return await toolsInitializationPromise;

    } finally {

        toolsInitializationPromise =
            null;
    }
}


// ============================================================
// OPTIONAL CACHE RESET
// ============================================================

export function resetLangChainMCPToolsCache() {

    cachedLangChainTools =
        null;

    toolsInitializationPromise =
        null;

    console.log(
        "♻️ LangChain MCP tool cache reset"
    );
}