import axios from "axios";

const API = axios.create({
    baseURL: `${import.meta.env.VITE_BACKEND_URL}/api/agent`,
});

export const askAgent = (message, token, threadId) =>
    API.post(
        "/chat",
        {
            message,
            threadId,
        },
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );