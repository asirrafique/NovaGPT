import express from "express";

import { ragChat } from "../controllers/ragController.js";

import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post(
    "/rag",
    authMiddleware,
    ragChat
);

export default router;