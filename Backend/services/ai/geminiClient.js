import "dotenv/config";

import { ChatGoogle } from "@langchain/google";

// ============================================================
// LANGCHAIN GEMINI CLIENT
// ============================================================

const MODEL =
    process.env.GEMINI_MODEL ||
    "gemini-3.6-flash";

const model = new ChatGoogle({
    model: MODEL,
    apiKey: process.env.GEMINI_API_KEY,
});


// ============================================================
// RETRY CONFIGURATION
// ============================================================

const MAX_RETRIES = 2;

const BASE_RETRY_DELAY = 1000;

const MAX_RETRY_DELAY = 8000;


// ============================================================
// HELPERS
// ============================================================

function sleep(ms) {
    return new Promise(
        resolve => setTimeout(resolve, ms)
    );
}


function getErrorStatus(error) {

    return (
        error?.status ||
        error?.code ||
        error?.response?.status ||
        error?.response?.statusCode ||
        null
    );
}


function isQuotaError(error) {

    const status =
        getErrorStatus(error);

    const message =
        String(
            error?.message || ""
        ).toLowerCase();

    return (
        status === 429 ||
        message.includes("resource_exhausted") ||
        message.includes("quota exceeded") ||
        message.includes("exceeded your current quota")
    );
}


function isRetryableError(error) {

    const status =
        getErrorStatus(error);

    return (
        status === 429 ||
        status === 500 ||
        status === 502 ||
        status === 503 ||
        status === 504
    );
}


function getRetryDelay(error, attempt) {

    const message =
        String(
            error?.message || ""
        );

    const retryMatch =
        message.match(
            /retryDelay["']?\s*[:=]\s*["']?(\d+(?:\.\d+)?)s/i
        );

    if (retryMatch) {

        const seconds =
            Number(
                retryMatch[1]
            );

        if (Number.isFinite(seconds)) {

            return Math.min(
                seconds * 1000,
                MAX_RETRY_DELAY
            );
        }
    }


    const exponentialDelay =
        Math.min(
            BASE_RETRY_DELAY *
                Math.pow(2, attempt),
            MAX_RETRY_DELAY
        );


    const jitter =
        Math.floor(
            Math.random() * 300
        );


    return exponentialDelay + jitter;
}


// ============================================================
// RESPONSE NORMALIZER
// ============================================================

function extractText(response) {

    if (!response) {
        return "";
    }


    // Normal LangChain AIMessage content

    if (typeof response.content === "string") {

        return response.content.trim();
    }


    // Some Gemini responses may contain
    // structured content blocks.

    if (Array.isArray(response.content)) {

        return response.content
            .map(block => {

                if (
                    typeof block === "string"
                ) {
                    return block;
                }

                if (
                    block?.type === "text" &&
                    typeof block.text === "string"
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
// MAIN LANGCHAIN GEMINI FUNCTION
// ============================================================

export async function generateResponse(
    prompt
) {

    if (
        !prompt ||
        typeof prompt !== "string"
    ) {

        throw new Error(
            "Prompt is required"
        );
    }


    let lastError = null;


    for (
        let attempt = 0;
        attempt <= MAX_RETRIES;
        attempt++
    ) {

        try {

            // ====================================================
            // LANGCHAIN → GEMINI
            // ====================================================

            const response =
                await model.invoke([
                    [
                        "human",
                        prompt
                    ]
                ]);


            const text =
                extractText(response);


            if (!text) {

                throw new Error(
                    "Gemini returned an empty response"
                );
            }


            return text;


        } catch (error) {

            lastError =
                error;


            const status =
                getErrorStatus(error);


            console.error(
                `❌ LangChain Gemini request failed ` +
                `(attempt ${attempt + 1}/${MAX_RETRIES + 1})`,
                {
                    status,
                    model: MODEL,
                    message:
                        error?.message
                }
            );


            // ====================================================
            // QUOTA ERROR
            // ====================================================

            if (isQuotaError(error)) {

                const quotaError =
                    new Error(
                        "Gemini API quota exhausted. Please try again later or check your Gemini API plan and billing."
                    );


                quotaError.code =
                    "GEMINI_QUOTA_EXCEEDED";


                quotaError.status =
                    429;


                quotaError.originalError =
                    error;


                throw quotaError;
            }


            // ====================================================
            // NON-RETRYABLE ERROR
            // ====================================================

            if (
                !isRetryableError(error) ||
                attempt >= MAX_RETRIES
            ) {

                throw error;
            }


            // ====================================================
            // RETRY
            // ====================================================

            const delay =
                getRetryDelay(
                    error,
                    attempt
                );


            console.log(
                `⏳ Retrying LangChain Gemini request in ${delay}ms...`
            );


            await sleep(delay);
        }
    }


    throw (
        lastError ||
        new Error(
            "LangChain Gemini request failed"
        )
    );
}