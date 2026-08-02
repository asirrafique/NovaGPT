import axios from "axios";

const API = axios.create({
    baseURL: `${import.meta.env.VITE_BACKEND_URL}/api/auth`,
});

export const signup = (data) => API.post("/signup", data);

export const login = (data) => API.post("/login", data);

export const getUser = (token) =>
    API.get("/me", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });