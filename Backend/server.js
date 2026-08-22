import dns from "node:dns";

dns.setDefaultResultOrder("ipv4first");

try {
    dns.setServers([
        "1.1.1.1",
        "8.8.8.8",
        "208.67.222.222",
    ]);
} catch (err) {
    console.log("DNS Error:", err);
}

import express from "express";
import "dotenv/config";
import cors from "cors";
import mongoose from "mongoose";

import chatRoutes from "./routes/chat.js";
import authRoutes from "./routes/auth.js";
import agentRoutes from "./routes/agent.js";
import ragRoutes from "./routes/rag.js";
import documentRoutes from "./routes/documents.js";

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://novagpt-frontend-4fht.onrender.com",
    ],
    credentials: true,
  })
);

// Routes
app.use("/api", chatRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/agent", agentRoutes);
app.use("/api/chat", ragRoutes);
app.use("/api/documents", documentRoutes);

const connectDB = async () => {
    try {
        const connectionDb = await mongoose.connect(
            process.env.MONGODB_URI,
            {
                serverSelectionTimeoutMS: 10000,
            }
        );

        console.log(
            `✅ MongoDB Connected: ${connectionDb.connection.host}`
        );

        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });

    } catch (err) {
        console.error("❌ Failed to connect with DB");
        console.error(err);
    }
};

connectDB();