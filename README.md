# 🚀 NovaGPT

> **NovaGPT** is a production-ready, ChatGPT-inspired AI assistant built with the **MERN Stack and Google Gemini API**, featuring persistent conversations, AI agent workflows, document-based RAG, secure authentication, Markdown/code rendering, Dockerized deployment, and an automated CI/CD pipeline.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-24-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-Backend-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?logo=mongodb&logoColor=white)
![Gemini](https://img.shields.io/badge/Google-Gemini_API-4285F4?logo=google&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?logo=docker&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-CI%2FCD-2088FF?logo=githubactions&logoColor=white)

---

## 🌐 Live Demo

🔗 **https://novagpt-frontend-4fht.onrender.com**

---

## 📖 Overview

NovaGPT is a full-stack AI assistant inspired by ChatGPT and powered by Google's Gemini API.

The application combines a modern React frontend with a Node.js/Express backend and MongoDB persistence to provide authenticated conversations, persistent chat threads, document-based question answering, and AI agent workflows.

NovaGPT is also containerized with Docker and supported by a GitHub Actions CI/CD pipeline that performs frontend linting, production builds, Docker image validation, and Trivy security scanning before production deployment.

---

## ✨ Features

### 🤖 AI Assistant

- AI-powered conversations using Google Gemini API
- Context-aware conversational responses
- AI agent workflow for intelligent task execution
- Tool/MCP-based agent execution
- Agent execution metadata and tool traces
- AI response modes and source information

### 💬 Chat & Conversation Management

- Persistent chat history
- Unique conversation/thread IDs
- Create new conversations
- Switch between previous conversations
- Rename conversations
- Delete conversations
- Pin conversations
- Persistent conversation state
- Recent Chats management

### 📚 Document & RAG

- Document indexing
- Retrieval-Augmented Generation (RAG)
- Ask questions about uploaded/indexed documents
- Retrieved source information
- Document-aware AI responses

### 🔐 Authentication

- Secure user signup and login
- JWT-based authentication
- Password hashing with bcryptjs
- Protected API routes
- Authenticated user-specific conversations

### 📝 Rich AI Responses

- Markdown rendering
- Syntax-highlighted code blocks
- Mathematical/LaTeX rendering
- Dynamic response handling
- Copy, regenerate, like, and dislike interactions

### 🎨 User Experience

- ChatGPT-inspired interface
- Responsive React UI
- Light/Dark/System theme support
- Loading states
- Voice input support
- File/document interaction
- Modern sidebar and conversation management

---

## 🧠 AI Architecture

NovaGPT uses a dedicated AI agent layer to process user requests.

```text
User
 │
 ▼
React Frontend
 │
 ▼
Express API
 │
 ├── Authentication
 │
 ├── Conversation / Thread Management
 │
 ├── Document / RAG Services
 │
 ▼
NovaGPT Agent
 │
 ├── Google Gemini API
 ├── MCP / Tool Execution
 ├── Context Processing
 └── Source / Tool Metadata
 │
 ▼
AI Response
 │
 ▼
MongoDB
