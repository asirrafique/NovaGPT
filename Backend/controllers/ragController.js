import { answerWithRAG } from "../services/rag/ragService.js";
import Thread from "../models/Thread.js";


export async function ragChat(req, res) {

    try {

        // ============================================================
        // 1. AUTHENTICATED USER
        // ============================================================

        const userId =
            req.user?._id ||
            req.user?.id ||
            req.user?.userId;


        if (!userId) {

            return res.status(401).json({

                success: false,

                message:
                    "User authentication required"
            });
        }


        // ============================================================
        // 2. REQUEST DATA
        // ============================================================

        const {
            message,
            query,
            threadId,
            topK,
            filters
        } = req.body;


        const userQuery =
            message || query;


        if (
            !userQuery ||
            typeof userQuery !== "string" ||
            !userQuery.trim()
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "message is required"
            });
        }


        if (!threadId) {

            return res.status(400).json({

                success: false,

                message:
                    "threadId is required for RAG chat"
            });
        }


        // ============================================================
        // 3. FIND THREAD
        // ============================================================

        let thread =
            await Thread.findOne({

                threadId,

                user: userId
            });


        // ============================================================
        // 4. CREATE THREAD IF IT DOESN'T EXIST
        // ============================================================

        if (!thread) {

            thread =
                new Thread({

                    user: userId,

                    threadId,

                    title:
                        userQuery.substring(
                            0,
                            80
                        ),

                    messages: []
                });
        }


        // ============================================================
        // 5. SAVE USER MESSAGE
        // ============================================================

        thread.messages.push({

            role: "user",

            content:
                userQuery,

            prompt:
                userQuery
        });


        // ============================================================
        // 6. RUN RAG
        // ============================================================

        const result =
            await answerWithRAG({

                userId,

                query:
                    userQuery,

                topK:
                    Number(topK) || 5,

                filters:
                    filters || {}
            });


        // ============================================================
        // 7. SAVE ASSISTANT MESSAGE + RAG SOURCES
        // ============================================================

        thread.messages.push({

            role: "assistant",

            content:
                result.answer,

            prompt:
                userQuery,

            sources:
                Array.isArray(result.sources)
                    ? result.sources
                    : []
        });


        // ============================================================
        // 8. SAVE THREAD
        // ============================================================

        await thread.save();


        // ============================================================
        // 9. RETURN RESPONSE
        // ============================================================

        return res.status(200).json({

            success: true,

            answer:
                result.answer,

            sources:
                result.sources,

            metadata:
                result.metadata,

            threadId:
                thread.threadId
        });


    } catch (error) {

        console.error(
            "❌ RAG controller error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "RAG request failed",

            error:
                error.message
        });
    }
}