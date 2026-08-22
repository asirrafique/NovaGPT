import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
    name: "NovaGPT MCP Server",
    version: "1.0.0"
});

// Calculator tool
server.tool(
    "calculator",
    "Performs basic mathematical calculations.",
    {
        expression: z
            .string()
            .describe("Mathematical expression such as 25 / 100 * 840")
    },
    async ({ expression }) => {

        try {

            if (!/^[0-9+\-*/().%\s]+$/.test(expression)) {
                throw new Error("Invalid mathematical expression");
            }

            const normalized = expression.replace(/%/g, "/100");

            const result = Function(
                `"use strict"; return (${normalized})`
            )();

            if (!Number.isFinite(result)) {
                throw new Error("Invalid calculation");
            }

            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify({
                            success: true,
                            result
                        })
                    }
                ]
            };

        } catch (error) {

            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify({
                            success: false,
                            error: error.message
                        })
                    }
                ],
                isError: true
            };
        }
    }
);

// Current time tool
server.tool(
    "current_time",
    "Returns the current date and time for a timezone.",
    {
        timeZone: z
            .string()
            .default("UTC")
            .describe("IANA timezone such as Asia/Kolkata")
    },
    async ({ timeZone }) => {

        try {

            const time = new Intl.DateTimeFormat("en-US", {
                timeZone,
                dateStyle: "full",
                timeStyle: "long"
            }).format(new Date());

            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify({
                            success: true,
                            timeZone,
                            time
                        })
                    }
                ]
            };

        } catch (error) {

            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify({
                            success: false,
                            error: "Invalid timezone"
                        })
                    }
                ],
                isError: true
            };
        }
    }
);

// Start MCP server
const transport = new StdioServerTransport();

await server.connect(transport);