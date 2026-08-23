import "./ChatWindow.css";

import Chat from "./Chat.jsx";

import { MyContext } from "./MyContext.jsx";
import { indexDocument } from "./services/documentService";
import { askAgent } from "./services/agentService";

import { useContext, useState, useRef } from "react";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import MicRoundedIcon from "@mui/icons-material/MicRounded";
import StopRoundedIcon from "@mui/icons-material/StopRounded";
import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded";
import CircularProgress from "@mui/material/CircularProgress";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import HistoryToggleOffRoundedIcon from "@mui/icons-material/HistoryToggleOffRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";

import toast from "react-hot-toast";

function ChatWindow() {
  const {
    prompt,
    setPrompt,

    setLastPrompt,

    setReply,

    currThreadId,

    setPrevChats,
    setNewChat,

    temporaryChat,
    setTemporaryChat,

    token,

    setShowAuthModal,
    setAuthMode,

    askDocument,

    ragLoading,

    setRagSources,
  } = useContext(MyContext);

  // ============================================================
  // LOCAL STATE
  // ============================================================

  const [loading, setLoading] = useState(false);

  const [regenerating] = useState(false);

  const [selectedFile, setSelectedFile] = useState(null);

  const [ragMode, setRagMode] = useState(false);

  const recognitionRef = useRef(null);

  const abortControllerRef = useRef(null);

  const fileInputRef = useRef(null);

  const [isListening, setIsListening] = useState(false);


  // ============================================================
  // RAG MODE
  // ============================================================

  const toggleRAGMode = () => {
    if (loading || ragLoading) {
      return;
    }

    setRagMode((previous) => !previous);

    setReply(null);

    setRagSources([]);
  };

  // ============================================================
  // VOICE INPUT
  // ============================================================

  const handleVoiceTyping = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition is not supported.");

      return;
    }

    if (!recognitionRef.current) {
      recognitionRef.current = new SpeechRecognition();

      recognitionRef.current.continuous = true;

      recognitionRef.current.interimResults = true;

      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = (event) => {
        let transcript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }

        setPrompt(transcript);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    if (isListening) {
      recognitionRef.current.stop();

      setIsListening(false);
    } else {
      recognitionRef.current.start();

      setIsListening(true);
    }
  };

  // ============================================================
  // STOP NORMAL GENERATION
  // ============================================================

  const stopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setLoading(false);
  };

  // ============================================================
  // FILE PICKER
  // ============================================================

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  // ============================================================
  // FILE SELECT
  // ============================================================

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    // ============================================================
    // DOCUMENT / RAG MODE
    // ============================================================

    if (ragMode) {
      const allowedTypes = [
        "application/pdf",

        "text/plain",

        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];

      if (!allowedTypes.includes(file.type)) {
        toast.error("Only PDF, DOCX, and TXT files are supported for RAG.");

        e.target.value = "";

        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be 10 MB or less.");

        e.target.value = "";

        return;
      }

      setSelectedFile(file);

      await handleDocumentUpload(file);

      return;
    }

    // ============================================================
    // NORMAL CHAT MODE
    // ============================================================

    setSelectedFile(file);

    toast.success(`${file.name} attached.`);
  };

  // ============================================================
  // REMOVE FILE
  // ============================================================

  const removeSelectedFile = () => {
    setSelectedFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    toast.success("File removed.");
  };


  // ============================================================
  // RAG / DOCUMENT CHAT
  // ============================================================

  const handleRAGQuestion = async (message) => {
    if (!token) {
      setAuthMode("login");
      setShowAuthModal(true);

      return;
    }

    if (!message?.trim()) {
      return;
    }

    try {
      setNewChat(false);

      setReply("");

      setRagSources([]);

      // Ask the RAG service
      await askDocument(message.trim());
    } catch (error) {
      console.error("❌ RAG request failed:", error);

      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to search your documents.";

      setReply(errorMessage);

      setRagSources([]);

      toast.error(errorMessage);
    }
  };

  // ============================================================
  // NOVAGPT AGENT
  // ============================================================

  const handleAgentQuestion = async (message) => {
    if (!token) {
      setAuthMode("login");
      setShowAuthModal(true);

      return;
    }

    if (!message?.trim()) {
      return;
    }

    try {
      setLoading(true);

      setNewChat(false);

      setReply("");

      setRagSources([]);

      const response = await askAgent(
  message.trim(),
  token,
  currThreadId
);

      const data = response?.data || response;

      if (!data?.success) {
        setReply(data?.message || "NovaGPT could not process your request.");

        setRagSources([]);

        return;
      }

      const assistantReply = data.reply || "";

      const normalizedSources = Array.isArray(data.sources)
        ? data.sources.map((source, index) => ({
            id: source.id ?? index + 1,

            fileName: source.fileName || source.filename || "Unknown document",

            chunkIndex: source.chunkIndex ?? source.chunk ?? null,

            score:
              source.score ??
              source.rerankScore ??
              source.semanticScore ??
              null,

            semanticScore: source.semanticScore ?? null,

            keywordScore: source.keywordScore ?? null,

            compressionScore: source.compressionScore ?? null,
          }))
        : [];

      setReply(assistantReply);

      if (data.mode === "rag") {
        setRagSources(normalizedSources);
      } else {
        setRagSources([]);
      }

      setPrevChats((previous) => [
        ...previous,

        {
          role: "assistant",

          content: assistantReply,

          prompt: message.trim(),

          file: null,

          mode: data.mode || "normal",

          sources: normalizedSources,

          toolCalls: data.agent?.toolCalls || [],
        },
      ]);
      setReply("");
    } catch (error) {
      console.error("❌ Agent request failed:", error);

      let errorMessage = "Something went wrong while contacting NovaGPT.";

      if (error?.response?.status === 429) {
        errorMessage =
          "⚠️ Gemini API quota exceeded.\n\n" +
          "Your Gemini API request limit has been reached.\n" +
          "Please try again later or check your Gemini API plan and billing.";
      } else if (error?.response?.status === 503) {
        errorMessage =
          "⚠️ Gemini is temporarily unavailable.\n\n" +
          "Please try again in a moment.";
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      // Keep the page alive and show the error
      setReply(errorMessage);

      setRagSources([]);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // GET REPLY
  // ============================================================

  const getReply = async () => {
    if (!token) {
      setAuthMode("login");

      setShowAuthModal(true);

      return;
    }

    if (!prompt.trim()) {
      return;
    }

    const userPrompt = prompt.trim();

    setLastPrompt(userPrompt);

    // ========================================================
    // DOCUMENT / RAG MODE
    // ========================================================

    if (ragMode) {
      setPrevChats((previous) => [
        ...previous,

        {
          role: "user",

          content: userPrompt,

          file: null,
        },
      ]);

      setPrompt("");

      await handleRAGQuestion(userPrompt);

      return;
    }

    // ========================================================
    // NORMAL CHAT
    // ========================================================

    setPrevChats((previous) => [
      ...previous,

      {
        role: "user",

        content: userPrompt,

        file: selectedFile
          ? {
              name: selectedFile.name,

              type: selectedFile.type,

              size: selectedFile.size,

              preview: selectedFile.type.startsWith("image/")
                ? URL.createObjectURL(selectedFile)
                : null,
            }
          : null,
      },
    ]);

    setPrompt("");

    await handleAgentQuestion(userPrompt);

    setSelectedFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ============================================================
  // REGENERATE
  // ============================================================

  const regenerateReply = async (promptToRegenerate) => {
    if (!promptToRegenerate) {
      return;
    }

    setPrevChats((previous) => {
      const chats = [...previous];

      const index = chats.findLastIndex(
        (chat) =>
          chat.role === "assistant" && chat.prompt === promptToRegenerate,
      );

      if (index !== -1) {
        chats.splice(index, 1);
      }

      return chats;
    });

    if (ragMode) {
      await handleRAGQuestion(promptToRegenerate);
    } else {
      await handleAgentQuestion(promptToRegenerate);
    }
  };

  const handleDocumentUpload = async (file) => {
    if (!token) {
      setAuthMode("login");
      setShowAuthModal(true);

      return;
    }

    if (!file) {
      return;
    }

    try {
      toast.loading("Indexing document...", {
        id: "rag-upload",
      });

      const response = await indexDocument(file, token);

      const data = response.data;

      if (!data.success) {
        throw new Error(data.message || "Document indexing failed");
      }

      toast.success("Document indexed successfully!", {
        id: "rag-upload",
      });

      setSelectedFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("❌ Document indexing failed:", error);

      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to index document.",
        {
          id: "rag-upload",
        },
      );
    }
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <main className="chatWindow">
      {/* ====================================================
                NAVBAR
            ==================================================== */}

      <header className="navbar">
        <div className="navLeft">
          <h2>NovaGPT</h2>
        </div>

        <div className="navRight">
          {/* DOCUMENT MODE */}

          <Tooltip
            title={ragMode ? "Switch to Normal Chat" : "Ask your documents"}
            arrow
          >
            <IconButton
              className={`ragModeBtn ${ragMode ? "ragModeActive" : ""}`}
              onClick={toggleRAGMode}
            >
              <SearchRoundedIcon />
            </IconButton>
          </Tooltip>

          {/* TEMPORARY CHAT */}

          <Tooltip
            title={
              temporaryChat
                ? "Turn off Temporary Chat"
                : "Turn on Temporary Chat"
            }
            arrow
          >
            <IconButton
              className={`tempChatBtn ${temporaryChat ? "tempChatActive" : ""}`}
              onClick={() => setTemporaryChat((previous) => !previous)}
            >
              <HistoryToggleOffRoundedIcon />
            </IconButton>
          </Tooltip>
        </div>
      </header>

      {/* ====================================================
                CHAT
            ==================================================== */}

      <section className="chatBody">
        <Chat regenerateReply={regenerateReply} regenerating={regenerating} />
      </section>

      {/* ====================================================
                INPUT
            ==================================================== */}

      <footer className="chatFooter">
        {/* SELECTED FILE */}

        {selectedFile && (
          <div className="selectedFilePreview">
            {selectedFile.type.startsWith("image/") ? (
              <img
                src={URL.createObjectURL(selectedFile)}
                alt="preview"
                className="previewImage"
              />
            ) : (
              <div className="fileIcon">
                <DescriptionRoundedIcon />
              </div>
            )}

            <div className="fileDetails">
              <p>{selectedFile.name}</p>

              <span>{(selectedFile.size / 1024).toFixed(1)} KB</span>
            </div>

            <button className="removeFileBtn" onClick={removeSelectedFile}>
              ✕
            </button>
          </div>
        )}

        {loading && !ragLoading && (
          <div className="agentActivity">
            <span className="agentActivityDot"></span>
            <span> 🧠 Analyzing your question...</span>
          </div>
        )}

        <div className="inputBox">
          {/* FILE BUTTON */}

          <Tooltip
            title={ragMode ? "Document mode" : "Add photos & files"}
            placement="top"
            arrow
          >
            <button
              className={`iconBtn ${ragMode ? "ragFileBtn" : ""}`}
              onClick={openFilePicker}
            >
              {ragMode ? (
                <DescriptionRoundedIcon fontSize="small" />
              ) : (
                <AddRoundedIcon fontSize="small" />
              )}
            </button>
          </Tooltip>

          <input
            type="file"
            ref={fileInputRef}
            style={{
              display: "none",
            }}
            accept={
              ragMode ? ".pdf,.docx,.txt" : "image/*,.pdf,.doc,.docx,.txt"
            }
            onChange={handleFileSelect}
          />

          {/* TEXTAREA */}

          <textarea
            rows="1"
            placeholder={
              ragMode
                ? "Ask about your documents..."
                : "Ask NovaGPT anything..."
            }
            value={prompt}
            onChange={(e) => {
              setPrompt(e.target.value);

              e.target.style.height = "24px";

              e.target.style.height = e.target.scrollHeight + "px";
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();

                getReply();

                e.target.style.height = "24px";
              }
            }}
          />

          {/* VOICE */}

          <Tooltip title="Voice input" arrow placement="top">
            <button
              className={`voiceBtn ${isListening ? "listening" : ""}`}
              onClick={handleVoiceTyping}
            >
              {isListening ? (
                <StopRoundedIcon fontSize="small" />
              ) : (
                <MicRoundedIcon fontSize="small" />
              )}
            </button>
          </Tooltip>

          {/* SEND */}

          <Tooltip
            title={
              loading
                ? "Stop generating"
                : ragLoading
                  ? "Searching documents"
                  : ragMode
                    ? "Ask document"
                    : "Send message"
            }
            arrow
            placement="top"
          >
            <span>
              <button
                className="sendBtn"
                onClick={loading ? stopGeneration : getReply}
                disabled={!loading && !ragLoading && !prompt.trim()}
              >
                {loading || ragLoading ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  <ArrowUpwardRoundedIcon fontSize="small" />
                )}
              </button>
            </span>
          </Tooltip>
        </div>

        <p className="info">
          {ragMode
            ? "Document Mode searches your indexed documents to answer your question."
            : "NovaGPT can use AI, documents, and tools to answer your questions."}
        </p>
      </footer>
    </main>
  );
}

export default ChatWindow;
