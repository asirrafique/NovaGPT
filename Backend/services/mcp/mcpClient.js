import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

let client = null;
let transport = null;

export async function connectMCP() {
    if (client) {
        return client;
    }

    client = new Client({
        name: "NovaGPT",
        version: "1.0.0"
    });

    transport = new StdioClientTransport({
        command: process.execPath,
        args: ["mcp/server.js"]
    });

    await client.connect(transport);

    console.log("🔌 Connected to NovaGPT MCP Server");

    return client;
}

export async function listMCPTools() {
    const mcp = await connectMCP();

    const result = await mcp.listTools();

    return result.tools;
}

export async function callMCPTool(name, arguments_) {
    const mcp = await connectMCP();

    return await mcp.callTool({
        name,
        arguments: arguments_
    });
}