import express from "express";

import {
    signup,
    login,
    getProfile,
    updateProfile,
    getCurrentUser,
} from "../controllers/authController.js";

import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/signup", signup);

router.post("/login", login);

router.get("/me", authMiddleware, getCurrentUser);

router.get("/profile", authMiddleware, getProfile);

router.patch("/profile", authMiddleware, updateProfile);

export default router;