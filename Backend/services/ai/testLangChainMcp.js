import { getLangChainMCPTools } from "./langchainMcpTools.js";

const tools1 =
    await getLangChainMCPTools();

console.log(
    "First call:",
    tools1.map(tool => tool.name)
);

const tools2 =
    await getLangChainMCPTools();

console.log(
    "Second call:",
    tools2.map(tool => tool.name)
);

console.log(
    "Same cached array:",
    tools1 === tools2
);