import axios from "axios";

const API = axios.create({
    baseURL: `${import.meta.env.VITE_BACKEND_URL}/api/auth`,
});

export const updateProfile = (token, data) =>
    API.patch("/profile", data, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

export const getProfile = (token) =>
    API.get("/profile", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });