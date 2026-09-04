# 🚀 NovaGPT

> A full-stack AI assistant built with the MERN stack, Google Gemini, LangChain, RAG, MCP, and agentic AI workflows.

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-24-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express.js-5-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Gemini](https://img.shields.io/badge/Google-Gemini-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)
[![LangChain](https://img.shields.io/badge/LangChain-Agent-1C3C3C?logo=chainlink&logoColor=white)](https://www.langchain.com/)
[![RAG](https://img.shields.io/badge/AI-RAG-purple)]()
[![MCP](https://img.shields.io/badge/AI-MCP-orange)]()
[![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-Orchestration-326CE5?logo=kubernetes&logoColor=white)](https://kubernetes.io/)
[![GitHub Actions](https://img.shields.io/badge/GitHub-Actions-2088FF?logo=github-actions&logoColor=white)](https://github.com/features/actions)

---

## 🌐 Live Demo

**[🚀 Try NovaGPT](https://novagpt-frontend-4fht.onrender.com)**

> The live application is deployed on **Render**.  
> Kubernetes was also configured and tested locally with **Minikube** for orchestration, scaling, health checks, and deployment management.

---

## 📌 Overview

NovaGPT is a ChatGPT-inspired full-stack AI assistant designed to explore modern LLM application architecture.

It combines:

- **React.js** frontend
- **Node.js + Express.js** backend
- **MongoDB Atlas** for persistent data
- **Google Gemini API** for LLM capabilities
- **LangChain** for agent orchestration
- **RAG** for document-based question answering
- **MCP** for external tool integration
- **Docker** for containerization
- **GitHub Actions** for CI and security validation
- **Kubernetes** for local orchestration and scaling experiments

The project focuses on building an AI system where the model can reason, use tools, retrieve relevant information, and maintain conversations.

---

# ✨ Features

## 🤖 AI Assistant

- Google Gemini-powered conversations
- Context-aware responses
- Markdown rendering
- LaTeX/math rendering
- Syntax highlighting
- Retry failed responses
- Conversation history
- Thread-based chat organization

---

## 🧠 LangChain Agent Architecture

NovaGPT uses **LangChain** to orchestrate the AI agent and its tools.

The agent can:

- Decide when tools are required
- Call external tools
- Perform document retrieval
- Combine retrieved information with the LLM
- Execute multi-step tool workflows
- Track tool execution
- Return structured execution information

### Agent flow

```text
User Message
     │
     ▼
┌───────────────┐
│ LangChain     │
│ Agent         │
└───────┬───────┘
        │
        ├──────────────► Gemini
        │
        ├──────────────► RAG Tool
        │                    │
        │                    ▼
        │              Vector Search
        │
        └──────────────► MCP Tools
                             │
                    ┌────────┴────────┐
                    ▼                 ▼
               Calculator        Current Time
```

---

# 📚 Retrieval-Augmented Generation (RAG)

NovaGPT includes a document intelligence pipeline that allows users to ask questions about uploaded documents.

### RAG pipeline

```text
Document
   │
   ▼
Text Extraction
   │
   ▼
Chunking
   │
   ▼
Embeddings
   │
   ▼
Vector Database
   │
   ▼
Similarity Search
   │
   ▼
Relevant Context
   │
   ▼
LLM
   │
   ▼
Answer + Sources
```

### RAG capabilities

- Document ingestion
- Text chunking
- Embedding generation
- Vector search
- Context retrieval
- Source tracking
- Document-grounded answers
- User-specific document isolation

---

# 🔌 MCP — Model Context Protocol

NovaGPT includes a custom MCP architecture for exposing tools to the AI agent.

### Current MCP tools

- 🧮 Calculator
- 🕐 Current time

### MCP architecture

```text
                ┌─────────────────┐
                │ LangChain Agent │
                └────────┬────────┘
                         │
                         ▼
                ┌─────────────────┐
                │ MCP Client      │
                └────────┬────────┘
                         │
                    Stdio Transport
                         │
                         ▼
                ┌─────────────────┐
                │ Custom MCP      │
                │ Server          │
                └────────┬────────┘
                         │
                 ┌───────┴────────┐
                 ▼                ▼
            Calculator       Current Time
```

The MCP client dynamically discovers available tools from the MCP server instead of hardcoding every tool into the agent.

---

# 💬 Chat & Conversations

NovaGPT supports persistent conversations using MongoDB.

### Features

- JWT authentication
- User-specific conversations
- Thread-based chats
- Persistent chat history
- Conversation retrieval
- Chat deletion
- Multiple conversation threads

---

# 🔐 Authentication

NovaGPT uses JWT-based authentication.

### Authentication flow

```text
User
 │
 ▼
Login / Register
 │
 ▼
Express API
 │
 ▼
JWT Token
 │
 ▼
Authenticated Requests
 │
 ▼
Protected Resources
```

Passwords are securely hashed using bcrypt before storage.

---

# 📄 Document Intelligence

Users can upload documents and interact with them through the AI assistant.

The system:

1. Accepts the document
2. Extracts the text
3. Splits the content into chunks
4. Generates embeddings
5. Stores searchable representations
6. Retrieves relevant chunks
7. Sends context to the AI agent
8. Generates a grounded response

---

# 🐳 Docker

NovaGPT is containerized using Docker.

### Services

```text
┌───────────────────────┐
│      Frontend         │
│     React + Nginx     │
│       Port 80         │
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│       Backend         │
│  Node.js + Express    │
│      Port 8080        │
└───────────┬───────────┘
            │
            ▼
      MongoDB Atlas
```

### Docker Compose

The application can be run locally using Docker Compose.

```bash
docker compose up --build
```

---

# ☸️ Kubernetes

NovaGPT was also configured and tested on a local Kubernetes cluster using **Minikube**.

The Kubernetes setup demonstrates practical container orchestration concepts.

### Implemented Kubernetes resources

- Namespace
- Deployments
- Pods
- ClusterIP Services
- Ingress
- ConfigMaps
- Secrets
- Startup probes
- Readiness probes
- Liveness probes
- CPU/memory requests and limits
- Horizontal Pod Autoscaling
- Rolling updates
- Rollbacks
- PersistentVolumeClaims

### Kubernetes architecture

```text
                    ┌─────────────────────┐
                    │       Ingress       │
                    │      NGINX          │
                    └──────────┬──────────┘
                               │
                    ┌──────────┴──────────┐
                    │                     │
                    ▼                     ▼
          ┌─────────────────┐   ┌─────────────────┐
          │ Frontend Service│   │ Backend Service │
          └────────┬────────┘   └────────┬────────┘
                   │                     │
                   ▼                     ▼
          ┌─────────────────┐   ┌─────────────────┐
          │ Frontend Pods   │   │ Backend Pods    │
          │                 │   │                 │
          │ React + Nginx   │   │ Node + Express  │
          └─────────────────┘   └────────┬────────┘
                                         │
                                         ▼
                                  ┌──────────────┐
                                  │ MongoDB Atlas │
                                  └──────────────┘

                           ┌────────────────────┐
                           │       HPA          │
                           │  CPU-based scaling │
                           └────────────────────┘
```

### Kubernetes capabilities tested

#### Self-healing

Deleting a running Pod causes the Deployment to automatically create a replacement.

#### Rolling updates

New application versions can be deployed without stopping all replicas simultaneously.

#### Rollback

A previous Deployment revision can be restored when a deployment causes problems.

#### Health checks

The backend uses:

- `startupProbe`
- `readinessProbe`
- `livenessProbe`

#### Horizontal scaling

The backend uses an HPA configured to scale between multiple replicas based on CPU utilization.

> **Note:** Kubernetes was used for local learning, testing, orchestration, scaling, and deployment management. The publicly accessible NovaGPT application remains deployed on Render.

---

# ⚙️ Configuration

Environment variables are used for sensitive configuration such as:

```text
GEMINI_API_KEY
MONGODB_URI
JWT_SECRET
```

Sensitive values are stored using environment variables and Kubernetes Secrets rather than being committed to the repository.

---

# 🔄 CI Pipeline

NovaGPT uses GitHub Actions for continuous integration.

The CI workflow performs:

```text
Push / Pull Request
        │
        ▼
  Checkout Code
        │
        ├───────────────┐
        ▼               ▼
    Backend         Frontend
    npm ci           npm ci
       │                │
       ▼                ▼
 Docker Build      Lint + Build
       │                │
       └───────┬────────┘
               ▼
        Docker Images
               │
               ▼
        Trivy Security Scan
```

### CI checks

- Dependency installation
- Frontend linting
- Frontend production build
- Docker image builds
- Trivy vulnerability scanning

> Render is used for the live deployment. The GitHub Actions workflow performs CI and security validation.

---

# 🏗️ System Architecture

```text
                         User
                           │
                           ▼
                    ┌─────────────┐
                    │   React UI  │
                    └──────┬──────┘
                           │
                           ▼
                    ┌─────────────┐
                    │ Express API │
                    └──────┬──────┘
                           │
                           ▼
                ┌──────────────────────┐
                │   LangChain Agent    │
                └──────────┬───────────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
          ▼                ▼                ▼
       Gemini             RAG              MCP
        LLM              Tool             Tools
          │                │                │
          │                ▼                ▼
          │          Vector Search     MCP Server
          │                │                │
          └────────────────┼────────────────┘
                           │
                           ▼
                     Final Response
                           │
                           ▼
                    React Interface

                           │
                           ▼
                    MongoDB Atlas
```

---

# 🧠 Agentic AI Concepts Demonstrated

NovaGPT explores several modern AI engineering concepts:

### Tool Calling

The AI can decide when external tools are required and invoke them.

### Retrieval-Augmented Generation

The AI retrieves relevant information before generating document-grounded responses.

### Agent Orchestration

LangChain manages the interaction between the LLM, tools, and retrieval systems.

### MCP

Tools can be exposed through a standardized protocol and dynamically discovered by the client.

### Execution Tracing

Tool calls and agent execution can be tracked to understand how a response was produced.

---

# 🚀 Getting Started

## 1. Clone the repository

```bash
git clone https://github.com/asirrafique/NovaGPT.git
cd NovaGPT
```

## 2. Install backend dependencies

```bash
cd Backend
npm install
```

## 3. Install frontend dependencies

```bash
cd ../Frontend
npm install
```

## 4. Configure environment variables

Create the required `.env` files and provide your:

```text
MongoDB credentials
Gemini API key
JWT secret
```

## 5. Run the backend

```bash
cd Backend
npm run dev
```

## 6. Run the frontend

```bash
cd Frontend
npm run dev
```

---

# 🐳 Run with Docker

From the project root:

```bash
docker compose up --build
```

Then open the frontend in your browser.

---

# ☸️ Kubernetes Deployment

Make sure Minikube is running:

```bash
minikube start --driver=docker
```

Apply the namespace:

```bash
kubectl apply -f k8s/novagpt/namespace.yaml
```

Apply the Kubernetes resources:

```bash
kubectl apply -f k8s/novagpt/
```

Check the resources:

```bash
kubectl get pods -n novagpt
kubectl get deployments -n novagpt
kubectl get services -n novagpt
kubectl get ingress -n novagpt
```

Check HPA:

```bash
kubectl get hpa -n novagpt
```

---

# 📈 Engineering Highlights

NovaGPT demonstrates practical experience with:

- Full-stack MERN development
- REST API development
- JWT authentication
- MongoDB data persistence
- LLM integration
- LangChain agent orchestration
- RAG pipelines
- Vector search
- MCP architecture
- Tool calling
- AI agent workflows
- Docker containerization
- Docker Compose
- Kubernetes deployments
- Kubernetes Services and Ingress
- ConfigMaps and Secrets
- Health probes
- Resource management
- Horizontal Pod Autoscaling
- Rolling updates and rollback
- GitHub Actions CI
- Docker security scanning with Trivy

---

# 🔮 Future Improvements

Potential improvements include:

- Streaming agent responses
- More MCP tools
- Advanced document processing
- Improved RAG evaluation
- Reranking models
- LLM evaluation and observability
- More sophisticated agent workflows
- Production Kubernetes deployment
- Cloud infrastructure
- Automated deployment pipelines

---

# 👨‍💻 Author

**Asir Rafique**

B.Tech Computer Science & Engineering — AI/ML

- GitHub: [asirrafique](https://github.com/asirrafique)
- LinkedIn: [Asir Rafique](https://www.linkedin.com/in/asir-rafique07/)
