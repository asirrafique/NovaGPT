# 🚀 NovaGPT

> **NovaGPT** is a production-ready, ChatGPT-inspired AI assistant built with the **MERN Stack and Google Gemini API**, featuring **AI agent workflows, tool/MCP execution, Retrieval-Augmented Generation (RAG), vector search, document intelligence, persistent conversations, secure authentication, rich AI responses, Dockerized deployment, and automated CI/CD**.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react\&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-24-339933?logo=node.js\&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-Backend-000000?logo=express\&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?logo=mongodb\&logoColor=white)
![Gemini](https://img.shields.io/badge/Google-Gemini_API-4285F4?logo=google\&logoColor=white)
![RAG](https://img.shields.io/badge/RAG-Vector_Search-8A2BE2)
![MCP](https://img.shields.io/badge/MCP-Tool_Execution-FF6B35)
![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?logo=docker\&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-CI%2FCD-2088FF?logo=githubactions\&logoColor=white)

---

## 🌐 Live Demo

🔗 **https://novagpt-frontend-4fht.onrender.com**

---

## 📖 Overview

NovaGPT is a full-stack AI assistant inspired by ChatGPT and powered by the **Google Gemini API**.

The application combines a modern **React 19 frontend**, **Node.js/Express backend**, and **MongoDB persistence** to provide authenticated conversations, persistent chat threads, document-based question answering, and intelligent AI agent workflows.

Unlike a conventional chatbot that simply sends prompts to an LLM, NovaGPT includes an **agent layer capable of coordinating tools, retrieving relevant information, processing context, and generating grounded responses**.

For document-based queries, NovaGPT implements a **Retrieval-Augmented Generation (RAG) pipeline** using **document indexing, embeddings, and vector similarity search** to retrieve relevant information before generating an answer.

The application is also **Dockerized** and supported by a **GitHub Actions CI/CD pipeline** that performs frontend linting, production builds, Docker image validation, and Trivy security scanning before deployment.

---

# ✨ Features

## 🤖 AI Assistant & Agentic Workflows

* AI-powered conversations using **Google Gemini API**
* Context-aware conversational responses
* **AI agent workflow** for intelligent task execution
* **Tool/function calling**
* **MCP-based tool execution**
* Multi-step agent execution
* Tool selection and orchestration
* Agent execution metadata and tool traces
* AI response modes
* Source and tool information
* Retry/error handling for agent execution

---

## 🧠 RAG & Vector Search

NovaGPT includes a document-grounded AI pipeline for answering questions using user-provided or indexed knowledge.

### RAG Pipeline

```text
Document
   │
   ▼
Document Processing
   │
   ▼
Chunking / Indexing
   │
   ▼
Embeddings
   │
   ▼
Vector Store
   │
   ▼
Semantic Vector Search
   │
   ▼
Relevant Context
   │
   ▼
Google Gemini
   │
   ▼
Grounded AI Response
```

### Capabilities

* Document indexing
* Document chunking and processing
* Embedding generation
* **Vector similarity search**
* Semantic retrieval
* Retrieval-Augmented Generation (**RAG**)
* Document-aware question answering
* Retrieved source information
* Context injection into LLM prompts
* Grounded AI responses based on retrieved content

---

## 🛠️ AI Tools & MCP

NovaGPT uses an agent architecture where the model can interact with external capabilities through tools.

```text
User Request
     │
     ▼
NovaGPT Agent
     │
     ├── Analyze Request
     │
     ├── Select Tool
     │
     ├── Execute Tool / MCP
     │
     ├── Process Tool Result
     │
     └── Continue Workflow
     │
     ▼
Final AI Response
```

This allows NovaGPT to move beyond simple prompt → response interactions and support **tool-driven agent execution**.

### Agent capabilities

* Tool/function calling
* MCP-based execution
* Tool selection
* Multi-step execution
* Tool result processing
* Execution metadata
* Source tracking
* Error handling and retry logic

---

# 💬 Chat & Conversation Management

* Persistent chat history
* Unique conversation/thread IDs
* Create new conversations
* Switch between previous conversations
* Rename conversations
* Delete conversations
* Pin conversations
* Persistent conversation state
* Recent Chats management

---

# 📚 Document Intelligence

Users can work with documents and ask questions about their content.

### Supported workflow

```text
Upload / Index Document
          │
          ▼
   Process Document
          │
          ▼
 Generate Embeddings
          │
          ▼
   Vector Retrieval
          │
          ▼
 Retrieve Relevant Context
          │
          ▼
      Gemini LLM
          │
          ▼
 Context-Aware Answer
```

This enables NovaGPT to answer questions using information from the indexed document instead of relying exclusively on the LLM's pretrained knowledge.

---

# 🔐 Authentication & Security

* Secure user signup and login
* JWT-based authentication
* Password hashing with `bcryptjs`
* Protected API routes
* Authenticated user-specific conversations
* Secure API architecture
* Docker container security validation
* Trivy vulnerability scanning in CI/CD

---

# 📝 Rich AI Responses

* Markdown rendering
* Syntax-highlighted code blocks
* Mathematical / LaTeX rendering
* Dynamic response handling
* Copy responses
* Regenerate responses
* Like / dislike interactions
* Source information
* Tool execution metadata

---

# 🎨 User Experience

* ChatGPT-inspired interface
* Responsive React UI
* Light / Dark / System theme support
* Loading states
* Voice input support
* File/document interaction
* Modern sidebar
* Conversation management
* Responsive chat experience

---

# 🏗️ System Architecture

```text
                         ┌─────────────────────┐
                         │      User           │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │   React Frontend    │
                         │      React 19       │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │    Express API      │
                         │     Node.js 24      │
                         └──────────┬──────────┘
                                    │
              ┌─────────────────────┼──────────────────────┐
              │                     │                      │
              ▼                     ▼                      ▼
      ┌───────────────┐    ┌────────────────┐    ┌─────────────────┐
      │ Authentication│    │ Conversations  │    │ Document / RAG  │
      │ JWT + bcrypt  │    │ & Threads      │    │ Services        │
      └───────────────┘    └────────────────┘    └────────┬────────┘
                                                           │
                                                           ▼
                                                   ┌───────────────┐
                                                   │ Vector Search │
                                                   │ + Embeddings  │
                                                   └───────┬───────┘
                                                           │
                                                           ▼
                         ┌─────────────────────────────────────────┐
                         │             NovaGPT Agent               │
                         │                                         │
                         │  ┌─────────────┐  ┌─────────────────┐ │
                         │  │ Gemini API  │  │ MCP / Tools     │ │
                         │  └─────────────┘  └─────────────────┘ │
                         │                                         │
                         │  Context Processing                     │
                         │  Tool Orchestration                     │
                         │  Multi-Step Execution                   │
                         │  Source / Tool Metadata                 │
                         └────────────────────┬────────────────────┘
                                              │
                                              ▼
                                    ┌─────────────────┐
                                    │   AI Response   │
                                    └────────┬────────┘
                                             │
                                             ▼
                                    ┌─────────────────┐
                                    │    MongoDB      │
                                    │ Persistence     │
                                    └─────────────────┘
```

---

# 🔄 Agentic RAG Workflow

For knowledge-intensive requests, NovaGPT can combine **agentic execution with RAG**.

```text
User Query
    │
    ▼
Agent
    │
    ├── Determine Intent
    │
    ├── Decide Whether Retrieval Is Needed
    │
    ▼
Vector Search
    │
    ▼
Relevant Documents / Chunks
    │
    ▼
Context Assembly
    │
    ▼
Gemini
    │
    ├── Generate Answer
    │
    └── Include Source Information
    │
    ▼
Final Response
```

This architecture combines **agentic decision-making** with **retrieval-based grounding**, allowing the assistant to use external knowledge while still leveraging Gemini for reasoning and response generation.

---

# 🗄️ Data & Persistence

MongoDB is used for persistent application data, including:

* User accounts
* Authentication-related data
* Conversation threads
* Chat messages
* Conversation metadata
* Document-related information
* Agent execution metadata

---

# 🐳 Docker & Deployment

NovaGPT is containerized using Docker for consistent development and production environments.

### Deployment stack

```text
GitHub Repository
       │
       ▼
GitHub Actions
       │
       ├── Frontend Lint
       │
       ├── Production Build
       │
       ├── Docker Build Validation
       │
       └── Trivy Security Scan
       │
       ▼
Production Deployment
```

---

# ⚙️ CI/CD Pipeline

NovaGPT includes an automated GitHub Actions pipeline.

### Pipeline checks

* Frontend linting
* Production build validation
* Docker image validation
* Container security scanning
* Trivy vulnerability scanning
* Automated deployment workflow

This ensures that changes are validated before reaching the production environment.

---

# 🛠️ Tech Stack

## Frontend

* React 19
* JavaScript
* HTML5
* CSS3
* Markdown rendering
* LaTeX / KaTeX
* React Router

## Backend

* Node.js 24
* Express.js
* REST APIs
* JWT Authentication
* bcryptjs

## AI / GenAI

* Google Gemini API
* AI Agent Workflows
* Tool / Function Calling
* MCP
* Multi-step Agent Execution
* Retrieval-Augmented Generation (RAG)
* Embeddings
* Vector Search
* Semantic Retrieval

## Database

* MongoDB

## DevOps

* Docker
* GitHub Actions
* CI/CD
* Trivy
* Render

## Development

* Git
* GitHub
* Environment Variables
* API-based architecture

---

# 🧠 Agentic AI Concepts Implemented

NovaGPT demonstrates practical implementation of several modern Agentic AI concepts:

| Concept                  | Implementation in NovaGPT                              |
| ------------------------ | ------------------------------------------------------ |
| **Agentic Workflow**     | Agent layer coordinates reasoning and execution        |
| **Tool Calling**         | Agent can invoke available tools/functions             |
| **MCP**                  | Tool-based agent execution through MCP                 |
| **Multi-Step Execution** | Agent can perform sequential operations                |
| **RAG**                  | Retrieves external document context before generation  |
| **Vector Search**        | Semantic similarity retrieval from indexed knowledge   |
| **Embeddings**           | Documents/query represented as vectors for retrieval   |
| **Context Augmentation** | Retrieved information is supplied to Gemini            |
| **Source Tracking**      | Retrieved sources/tool metadata exposed with responses |
| **Retry Handling**       | Failed operations can be retried for reliability       |

---

# 🎯 Key Engineering Highlights

NovaGPT demonstrates practical experience in:

* Full-stack MERN application development
* Generative AI application development
* Agentic AI architecture
* LLM integration
* Tool/function calling
* MCP-based tool execution
* RAG pipelines
* Vector search and semantic retrieval
* Embedding-based knowledge retrieval
* Secure authentication
* Persistent conversational systems
* REST API development
* Docker containerization
* CI/CD automation
* Container security scanning
* Production deployment

---

# 🚀 Future Improvements

Potential future enhancements include:

* Streaming agent responses
* More specialized AI tools
* Advanced agent planning
* Long-term conversational memory
* Improved document retrieval and reranking
* Hybrid keyword + vector retrieval
* Evaluation and observability with dedicated LLM evaluation tooling
* More autonomous multi-agent workflows

---

# 👨‍💻 Author

**Asir Rafique**

B.Tech Computer Science & Engineering
Full-Stack Developer | AI & GenAI Developer

* GitHub: **https://github.com/**
* LinkedIn: **https://www.linkedin.com/in/asir-rafique07/**
