import "dotenv/config";

import { transformQuery } from "./queryTransformer.js";


const queries = [
    "how does it work with tools?",
    "what did I use for the backend?",
    "tell me about the AI stuff",
    "how does NovaGPT communicate with tools?"
];


for (const query of queries) {

    console.log("\n--------------------------------");
    console.log("Original:");
    console.log(query);

    try {

        const transformed =
            await transformQuery(query);

        console.log("\nTransformed:");
        console.log(transformed);

    } catch (error) {

        console.error(
            "❌ Transformation failed:",
            error
        );
    }
}