import "./Chat.css";

import { useContext, useRef } from "react";

import { MyContext } from "./MyContext";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

import "katex/dist/katex.min.css";

import MessageActions from "./components/MessageActions";

import PictureAsPdfRoundedIcon from "@mui/icons-material/PictureAsPdfRounded";
import ImageRoundedIcon from "@mui/icons-material/ImageRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import InsertDriveFileRoundedIcon from "@mui/icons-material/InsertDriveFileRounded";

import CodeBlock from "./components/CodeBlock";

function Chat({ regenerateReply, regenerating }) {
  const { newChat, prevChats, reply, ragSources, ragLoading } =
    useContext(MyContext);

  const chatEndRef = useRef(null);

  // ============================================================
  // FILE ICON
  // ============================================================

  const getFileIcon = (type = "") => {
    if (type.startsWith("image/")) {
      return <ImageRoundedIcon />;
    }

    if (type === "application/pdf") {
      return <PictureAsPdfRoundedIcon />;
    }

    if (
      type.includes("word") ||
      type.includes("document") ||
      type.includes("text")
    ) {
      return <DescriptionRoundedIcon />;
    }

    return <InsertDriveFileRoundedIcon />;
  };

  const getAgentBadge = (chat) => {
    if (!chat?.mode) {
      return null;
    }

    if (chat.mode === "rag") {
      return (
        <span
          className="
                    agentModeBadge
                    ragBadge
                "
        >
          📄 Document Search
        </span>
      );
    }

    if (chat.mode === "mcp") {
      const tool = chat.toolCalls?.[0]?.tool;

      const toolName = tool
        ? tool
            .replace(/_/g, " ")
            .replace(/\b\w/g, (letter) => letter.toUpperCase())
        : "Tool";

      return (
        <span
          className="
                    agentModeBadge
                    mcpBadge
                "
        >
          🔧 {toolName}
        </span>
      );
    }

    if (chat.mode === "normal") {
      return (
        <span
          className="
                    agentModeBadge
                    normalBadge
                "
        >
          ✨ Normal AI
        </span>
      );
    }

    return null;
  };

  // ============================================================
  // RAG SOURCES
  // ============================================================

  const renderSources = (sources) => {
    if (!Array.isArray(sources) || sources.length === 0) {
      return null;
    }

    return (
      <div className="ragSources">
        <div className="ragSourcesTitle">📚 Sources</div>

        {sources.map((source, index) => {
          const sourceNumber = source.id ?? index + 1;

          const fileName =
            source.fileName || source.filename || "Unknown document";

          const chunkIndex = source.chunkIndex ?? source.chunk ?? "—";

          const relevance =
            source.score ??
            source.rerankScore ??
            source.semanticScore ??
            source.combinedScore ??
            null;

          return (
            <div
              key={`${fileName}-${chunkIndex}-${index}`}
              className="ragSource"
            >
              <div className="ragSourceNumber">[{sourceNumber}]</div>

              <div className="ragSourceInfo">
                <div className="ragSourceFile">{fileName}</div>

                <div className="ragSourceMeta">
                  <span>Chunk {chunkIndex}</span>

                  {relevance !== null && (
                    <>
                      <span className="ragSourceSeparator">•</span>

                      <span>Relevance: {Number(relevance).toFixed(3)}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="chatContainer">
      {/* ====================================================
                WELCOME SCREEN
            ==================================================== */}

      {newChat && prevChats.length === 0 && !reply && (
        <div className="welcomeScreen">
          <div className="welcomeLogo">✨</div>

          <h1>NovaGPT</h1>

          <p>How can I help today?</p>
        </div>
      )}

      <div className="chats">
        {/* ==================================================
                    PREVIOUS CHAT MESSAGES
                ================================================== */}

        {prevChats.map((chat, index) => (
          <div
            key={index}
            className={
              chat.role === "user" ? "messageRow user" : "messageRow assistant"
            }
          >
            {/* ======================================
                                USER MESSAGE
                            ====================================== */}

            {chat.role === "user" ? (
              <div className="userBubble">
                {/* FILE ATTACHMENT */}

                {chat.file &&
                  (chat.file.type.startsWith("image/") ? (
                    <img
                      src={chat.file.preview}
                      alt={chat.file.name}
                      className="chatImagePreview"
                    />
                  ) : (
                    <div className="chatFileCard">
                      <div className="chatFileIcon">
                        {getFileIcon(chat.file.type)}
                      </div>

                      <div className="chatFileInfo">
                        <div className="chatFileName">{chat.file.name}</div>

                        <div className="chatFileSize">
                          {(chat.file.size / 1024).toFixed(1)} KB
                        </div>
                      </div>
                    </div>
                  ))}

                {/* USER TEXT */}

                <div>{chat.content}</div>
              </div>
            ) : (
              /* ==================================
                                   ASSISTANT MESSAGE
                                ================================== */

              <div className="assistantBubble">
                <div className="assistantHeader">
                  <span>✨ NovaGPT</span>

                  {getAgentBadge(chat)}
                </div>

                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                  components={{
                    code: CodeBlock,
                  }}
                >
                  {chat.content}
                </ReactMarkdown>

                {/* ==================================
                                        SAVED RAG SOURCES
                                    ================================== */}

                {Array.isArray(chat.sources) &&
                  chat.sources.length > 0 &&
                  renderSources(chat.sources)}

                <MessageActions
                  text={chat.content}
                  prompt={chat.prompt}
                  regenerateReply={regenerateReply}
                  regenerating={regenerating}
                />
              </div>
            )}
          </div>
        ))}

        {/* ==================================================
            CURRENT ASSISTANT RESPONSE
        ================================================== */}

        {(reply || ragLoading) && (
          <div className="messageRow assistant">
            <div className="assistantBubble">
              <div className="assistantHeader">
                <span>✨ NovaGPT</span>
              </div>

              {/* RAG LOADING */}

              {ragLoading && !reply && (
                <div className="ragLoading">Searching your documents...</div>
              )}

              {/* RESPONSE */}

              {reply &&
                !(
                  prevChats.length > 0 &&
                  prevChats[prevChats.length - 1]?.role === "assistant" &&
                  prevChats[prevChats.length - 1]?.content === reply
                ) && (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                    components={{
                      code: CodeBlock,
                    }}
                  >
                    {reply}
                  </ReactMarkdown>
                )}

              {/* CURRENT RAG SOURCES */}

              {!ragLoading &&
                !(
                  prevChats.length > 0 &&
                  prevChats[prevChats.length - 1]?.role === "assistant" &&
                  prevChats[prevChats.length - 1]?.content === reply
                ) &&
                renderSources(ragSources)}

              {/* MESSAGE ACTIONS */}

              {!ragLoading &&
                reply &&
                !(
                  prevChats.length > 0 &&
                  prevChats[prevChats.length - 1]?.role === "assistant" &&
                  prevChats[prevChats.length - 1]?.content === reply
                ) && (
                  <MessageActions
                    text={reply}
                    regenerateReply={regenerateReply}
                    regenerating={regenerating}
                  />
                )}
            </div>
          </div>
        )}

        {/* ==================================================
                    SCROLL ANCHOR
                ================================================== */}

        <div ref={chatEndRef} />
      </div>
    </div>
  );
}

export default Chat;
