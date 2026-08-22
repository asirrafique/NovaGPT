import express from "express";
import { agentChat } from "../controllers/agentController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/chat", authMiddleware, agentChat);

export default router;