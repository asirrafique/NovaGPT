import "dotenv/config";

import { GoogleGenAI } from "@google/genai";


const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});


const MODEL =
    process.env.GEMINI_MODEL ||
    "gemini-3.6-flash";


const MAX_RETRIES = 2;

const BASE_RETRY_DELAY = 1000;

const MAX_RETRY_DELAY = 8000;


// ============================================================
// HELPERS
// ============================================================

function sleep(ms) {

    return new Promise(
        resolve =>
            setTimeout(resolve, ms)
    );
}


function getErrorStatus(error) {

    return (
        error?.status ||
        error?.code ||
        error?.response?.status ||
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
        message.includes(
            "resource_exhausted"
        ) ||
        message.includes(
            "quota exceeded"
        ) ||
        message.includes(
            "exceeded your current quota"
        )
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


    // Google sometimes provides:
    //
    // retryDelay: "13s"
    //
    // Extract it when available.

    const retryMatch =
        message.match(
            /retryDelay["']?\s*[:=]\s*["']?(\d+(?:\.\d+)?)s/i
        );


    if (retryMatch) {

        const seconds =
            Number(
                retryMatch[1]
            );


        if (
            Number.isFinite(seconds)
        ) {

            return Math.min(
                seconds * 1000,
                MAX_RETRY_DELAY
            );
        }
    }


    // Exponential backoff

    const exponentialDelay =
        Math.min(
            BASE_RETRY_DELAY *
                Math.pow(
                    2,
                    attempt
                ),
            MAX_RETRY_DELAY
        );


    // Small random jitter

    const jitter =
        Math.floor(
            Math.random() * 300
        );


    return (
        exponentialDelay +
        jitter
    );
}


// ============================================================
// MAIN GEMINI FUNCTION
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

            const response =
                await ai.models.generateContent({

                    model:
                        MODEL,

                    contents:
                        prompt
                });


            const text =
                response?.text?.trim();


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
                `❌ Gemini request failed ` +
                `(attempt ${attempt + 1}/${MAX_RETRIES + 1})`,
                {
                    status,
                    model: MODEL,
                    message:
                        error?.message
                }
            );


            // ====================================================
            // DAILY QUOTA
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


console.error(
    `❌ Gemini request failed (attempt ${attempt + 1}/${MAX_RETRIES + 1})`,
    {
        status,
        model: MODEL,
        message: error?.message
    }
);


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
                `⏳ Retrying Gemini request in ${delay}ms...`
            );


            await sleep(
                delay
            );
        }
    }


    throw (
        lastError ||
        new Error(
            "Gemini request failed"
        )
    );
}