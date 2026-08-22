import { generateEmbedding } from "./embeddings.js";

const text = `
NovaGPT is an AI-powered application
with agentic AI and MCP support.
`;

try {

    console.log("🧠 Generating embedding...");

    const embedding = await generateEmbedding(text);

    console.log("✅ Embedding generated");

    console.log("Dimensions:", embedding.length);

    console.log(
        "First 10 values:",
        embedding.slice(0, 10)
    );

} catch (error) {

    console.error("❌ Embedding failed:");

    console.error(error);
}