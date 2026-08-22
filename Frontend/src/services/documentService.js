import axios from "axios";

const API = axios.create({
    baseURL: `${import.meta.env.VITE_BACKEND_URL}/api/documents`,
});

export const indexDocument = (file, token) => {

    const formData = new FormData();

    formData.append("file", file);

    return API.post(
        "/index",
        formData,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
};