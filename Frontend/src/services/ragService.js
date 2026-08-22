import axios from "axios";

const API = axios.create({
    baseURL: `${import.meta.env.VITE_BACKEND_URL}/api/chat`,
});


export const askRAG = (
    message,
    threadId,
    token
) =>
    API.post(
        "/rag",
        {
            message,
            threadId,
        },
        {
            headers: {
                Authorization:
                    `Bearer ${token}`,
            },
        }
    );