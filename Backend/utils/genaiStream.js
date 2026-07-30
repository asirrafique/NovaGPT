import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const MODEL = "gemini-flash-latest";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

const getGeminiAPIStreamResponse = async (message, file = null) => {

    // Normal text chat
    if (!file) {
        return await ai.models.generateContentStream({
            model: MODEL,
            contents: message,
        });
    }

    // ---------- IMAGE ----------
    if (file.mimetype.startsWith("image/")) {

        return await ai.models.generateContentStream({
            model: MODEL,
            contents: [
                {
                    text: message,
                },
                {
                    inlineData: {
                        mimeType: file.mimetype,
                        data: file.buffer.toString("base64"),
                    },
                },
            ],
        });
    }

    // ---------- PDF / DOC / TXT ----------
    const uploaded = await ai.files.upload({
        file: new Blob([file.buffer], {
            type: file.mimetype,
        }),
        config: {
            mimeType: file.mimetype,
            displayName: file.originalname,
        },
    });

    return await ai.models.generateContentStream({
        model: MODEL,
        contents: [
            {
                fileData: {
                    fileUri: uploaded.uri,
                    mimeType: file.mimetype,
                },
            },
            {
                text: message,
            },
        ],
    });
};

export default getGeminiAPIStreamResponse;