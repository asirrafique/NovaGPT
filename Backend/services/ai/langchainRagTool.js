import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";

import { answerWithRAG } from "../rag/ragService.js";


// ============================================================
// NOVAGPT RAG TOOL
// ============================================================

export function createLangChainRAGTool(userId) {

    if (!userId) {
        throw new Error(
            "userId is required to create the RAG tool"
        );
    }


    return new DynamicStructuredTool({

        name: "document_search",

        description: `
Search the user's uploaded documents and answer questions
using information found in those documents.

Use this tool when the user asks about:
- their uploaded documents
- their resume
- their projects
- information contained in uploaded files
- facts that should be retrieved from their documents

Do NOT use this tool for general knowledge questions.
Do NOT invent information that is not found in the documents.
`,

        schema: z.object({

            query:
                z.string()
                    .min(1)
                    .describe(
                        "The user's question to search in their uploaded documents."
                    ),

            topK:
                z.number()
                    .int()
                    .min(3)
                    .max(5)
                    .optional()
                    .describe(
                        "Number of relevant document chunks to use."
                    )

        }),


        func:
            async ({
                query,
                topK = 5
            }) => {

                console.log(
                    "📚 LangChain → NovaGPT RAG:",
                    query
                );


                const result =
                    await answerWithRAG({

                        userId,

                        query,

                        topK,

                        filters: {}

                    });


                console.log(
                    "✅ RAG completed:",
                    {
                        sources:
                            result?.sources?.length || 0
                    }
                );


                return JSON.stringify({

                    answer:
                        result?.answer || "",

                    sources:
                        Array.isArray(
                            result?.sources
                        )
                            ? result.sources
                            : [],

                    metadata:
                        result?.metadata || {}

                });
            }

    });
}