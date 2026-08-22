import {
    connectMCP,
    listMCPTools,
    callMCPTool
} from "../services/mcp/mcpClient.js";

try {

    await connectMCP();

    const tools = await listMCPTools();

    console.log("\n📦 MCP TOOLS:");
    console.log(tools);

    const result = await callMCPTool(
        "calculator",
        {
            expression: "25 / 100 * 840"
        }
    );

    console.log("\n🧮 CALCULATOR RESULT:");
    console.log(result);

    process.exit(0);

} catch (error) {

    console.error("❌ MCP test failed:", error);

    process.exit(1);
}