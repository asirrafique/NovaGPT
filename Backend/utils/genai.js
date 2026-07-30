import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const MODEL = "gemini-flash-latest";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getGeminiAPIResponse = async (message) => {
    let lastError;

    for (let attempt = 1; attempt <= 3; attempt++) {
        try {
            const response = await ai.models.generateContent({
                model: MODEL,
                contents: message,
            });

            return response.text;
        } catch (err) {
            lastError = err;

            console.log(
                `Gemini attempt ${attempt} failed: ${err.status}`
            );

            if (err.status === 503 && attempt < 3) {
                await sleep(2000);
                continue;
            }

            throw err;
        }
    }

    throw lastError;
};

export default getGeminiAPIResponse;