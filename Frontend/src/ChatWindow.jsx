import "./ChatWindow.css";
import Chat from "./Chat.jsx";
import { MyContext } from "./MyContext.jsx";
import { useContext, useState, useRef } from "react";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import MicRoundedIcon from "@mui/icons-material/MicRounded";
import StopRoundedIcon from "@mui/icons-material/StopRounded";
import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded";
import CircularProgress from "@mui/material/CircularProgress";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import HistoryToggleOffRoundedIcon from "@mui/icons-material/HistoryToggleOffRounded";
import toast from "react-hot-toast";


function ChatWindow() {
    
    const {
    prompt,
    setPrompt,

    lastPrompt,
    setLastPrompt,

    reply,
    setReply,

    currThreadId,

    setPrevChats,
    setNewChat,

    temporaryChat,
    setTemporaryChat,

    token,

    setShowAuthModal,
    setAuthMode,
} = useContext(MyContext);

    const [loading, setLoading] = useState(false);
    const [regenerating, setRegenerating] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);

const toggleTemporaryChat = () => {
    setTemporaryChat((prev) => !prev);
};

    const recognitionRef = useRef(null);
    const abortControllerRef = useRef(null);
    const fileInputRef = useRef(null);

const [isListening, setIsListening] = useState(false);

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

            for (
                let i = event.resultIndex;
                i < event.results.length;
                i++
            ) {
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

const stopGeneration = () => {
    if (abortControllerRef.current) {
        abortControllerRef.current.abort();
    }

    setLoading(false);
};

const openFilePicker = () => {
    fileInputRef.current.click();
};

const handleFileSelect = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setSelectedFile(file);

    toast.success(`${file.name} attached.`);
};

const removeSelectedFile = () => {
    setSelectedFile(null);

    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }

    toast.success("File removed.");
};

const streamReply = async (message) => {
    setReply("");
    setLoading(true);
    setNewChat(false);

    try {
        abortControllerRef.current = new AbortController();

       const formData = new FormData();

formData.append("message", message);
formData.append("threadId", currThreadId);
formData.append("temporaryChat", temporaryChat);

if (selectedFile) {
    formData.append("file", selectedFile);
}

const response = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/api/chat/stream`,
    {
        method: "POST",

        headers: {
            Authorization: `Bearer ${token}`,
        },

        signal: abortControllerRef.current.signal,

        body: formData,
    }
);

        if (!response.ok) {
            throw new Error("Failed to get response");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        let assistantReply = "";

        while (true) {
            const { done, value } = await reader.read();

            if (done) break;

            const chunk = decoder.decode(value, {
                stream: true,
            });

            assistantReply += chunk;

            setReply(assistantReply);
        }

        setPrevChats((prev) => [
            ...prev,
            {
                role: "assistant",
                content: assistantReply,
                prompt: message,
                file: null,
            },
        ]);

        setReply("");
    } catch (err) {
        if (err.name === "AbortError") {
            console.log("Generation stopped.");
        } else {
            console.error(err);
        }
    } finally {
        setLoading(false);
    }
};

   const getReply = async () => {

    if (!token) {
        setAuthMode("login");
        setShowAuthModal(true);
        return;
    }

    if (!prompt.trim()) return;

    const userPrompt = prompt;

    setLastPrompt(userPrompt);

    setPrevChats((prev) => [
    ...prev,
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
    }
]);

    setPrompt("");

    await streamReply(userPrompt);

    setSelectedFile(null);

if (fileInputRef.current) {
    fileInputRef.current.value = "";
}
};

const regenerateReply = async (promptToRegenerate) => {
    if (!promptToRegenerate) return;

    setPrevChats((prev) => {
        const chats = [...prev];

        const index = chats.findLastIndex(
            (chat) =>
                chat.role === "assistant" &&
                chat.prompt === promptToRegenerate
        );

        if (index !== -1) {
            chats.splice(index, 1);
        }

        return chats;
    });

    await streamReply(promptToRegenerate);
};

    return (
        <main className="chatWindow">

            {/* Navbar */}

            <header className="navbar">

    <div className="navLeft">
        <h2>NovaGPT</h2>
    </div>

    <div className="navRight">
        <Tooltip
            title={
                temporaryChat
                    ? "Turn off Temporary Chat"
                    : "Turn on Temporary Chat"
            }
            arrow
        >
           <IconButton
    className={`tempChatBtn ${
        temporaryChat ? "tempChatActive" : ""
    }`}
    onClick={toggleTemporaryChat}
>
    <HistoryToggleOffRoundedIcon />
</IconButton>
        </Tooltip>
    </div>

</header>

            {/* Chat */}

            <section className="chatBody">
    <Chat
    regenerateReply={regenerateReply}
    regenerating={regenerating}
/>
</section>

            {/* Input */}

            <footer className="chatFooter">

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
                📄
            </div>
        )}

        <div className="fileDetails">
            <p>{selectedFile.name}</p>
            <span>
                {(selectedFile.size / 1024).toFixed(1)} KB
            </span>
        </div>

        <button
            className="removeFileBtn"
            onClick={removeSelectedFile}
        >
            ✕
        </button>

    </div>
)}

                <div className="inputBox">

                <Tooltip
    title="Add photos & files"
    placement="top"
    arrow
>
    <button
        className="iconBtn"
        onClick={openFilePicker}
    >
        <AddRoundedIcon fontSize="small" />
    </button>
</Tooltip>

<input
    type="file"
    ref={fileInputRef}
    style={{ display: "none" }}
    accept="image/*,.pdf,.doc,.docx,.txt"
    onChange={handleFileSelect}
/>

                    <textarea
                        rows="1"
                        placeholder="Message NovaGPT..."
                        value={prompt}
                        onChange={(e) => {
                            setPrompt(e.target.value);

                            e.target.style.height = "24px";
                            e.target.style.height =
                                e.target.scrollHeight + "px";
                        }}

                       onKeyDown={(e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        getReply();
        e.target.style.height = "24px";
    }
}}
                    />
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

<Tooltip
    title={loading ? "Stop generating" : "Send message"}
    arrow
    placement="top"
>
    <span>
        <button
            className="sendBtn"
            onClick={loading ? stopGeneration : getReply}
            disabled={!loading && !prompt.trim()}
        >
            {loading ? (
                <CircularProgress size={18} color="inherit" />
            ) : (
                <ArrowUpwardRoundedIcon fontSize="small" />
            )}
        </button>
    </span>
</Tooltip>

                </div>

                <p className="info">
                    NovaGPT can make mistakes. Check important information before relying on its responses.
                </p>

            </footer>

        </main>
    );
}

export default ChatWindow;