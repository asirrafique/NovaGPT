import "./App.css";

import Sidebar from "./Sidebar";
import ChatWindow from "./ChatWindow";

import { MyContext } from "./MyContext";

import {
    useState,
    useEffect
} from "react";

import {
    v1 as uuidv1
} from "uuid";

import AuthModal from "./components/AuthModal";

import { getUser } from "./services/authService";
import { askAgent } from "./services/agentService";


function App() {

    // ============================================================
    // CHAT STATE
    // ============================================================

    const [prompt, setPrompt] =
        useState("");

    const [lastPrompt, setLastPrompt] =
        useState("");

    const [reply, setReply] =
        useState(null);

    const [currThreadId, setCurrThreadId] =
        useState(uuidv1());

    const [prevChats, setPrevChats] =
        useState([]);

    const [newChat, setNewChat] =
        useState(true);

    const [allThreads, setAllThreads] =
        useState([]);

    const [temporaryChat, setTemporaryChat] =
        useState(false);


    // ============================================================
    // AUTHENTICATION
    // ============================================================

    const [user, setUser] =
        useState(null);

    const [token, setToken] =
        useState(
            localStorage.getItem("token") || ""
        );

    const [showAuthModal, setShowAuthModal] =
        useState(false);

    const [authMode, setAuthMode] =
        useState("login");


    // ============================================================
    // AGENT STATE
    // ============================================================

    const [agentLoading, setAgentLoading] =
        useState(false);

    const [agentStatus, setAgentStatus] =
        useState("");

    const [agentMode, setAgentMode] =
        useState("");

    const [agentToolCalls, setAgentToolCalls] =
        useState([]);

    const [agentDuration, setAgentDuration] =
        useState(null);


    // ============================================================
    // RAG STATE
    // ============================================================

    const [ragLoading, setRagLoading] =
        useState(false);

    const [ragSources, setRagSources] =
        useState([]);


    // ============================================================
    // AUTO LOGIN
    // ============================================================

    useEffect(() => {

        const loadUser = async () => {

            if (!token) {
                setUser(null);
                return;
            }

            try {

                const res =
                    await getUser(token);

                setUser(
                    res.data.user
                );

            } catch (error) {

                console.error(
                    "❌ Failed to restore user:",
                    error
                );

                localStorage.removeItem(
                    "token"
                );

                setToken("");

                setUser(null);
            }
        };


        loadUser();

    }, [token]);


    // ============================================================
    // AGENT STATUS HELPERS
    // ============================================================

    const getModeStatus = (mode, toolCalls = []) => {

        if (mode === "rag") {

            return "📄 Searching your documents...";
        }

        if (mode === "mcp") {

            const tool =
                toolCalls?.[0]?.tool;

            if (tool) {

                const toolName =
                    tool
                        .replace(/_/g, " ")
                        .replace(
                            /\b\w/g,
                            (letter) =>
                                letter.toUpperCase()
                        );

                return `🔧 Running ${toolName}...`;
            }

            return "🔧 Running tool...";
        }

        if (mode === "normal") {

            return "✨ Generating answer...";
        }

        return "🤖 Processing...";
    };


    // ============================================================
    // UNIFIED AGENT CHAT
    // ============================================================

    const askAgentMessage = async (message) => {

        // --------------------------------------------------------
        // Authentication
        // --------------------------------------------------------

        if (!token) {

            setShowAuthModal(true);

            setAuthMode("login");

            return null;
        }


        // --------------------------------------------------------
        // Validate message
        // --------------------------------------------------------

        if (
            !message ||
            typeof message !== "string" ||
            !message.trim()
        ) {
            return null;
        }


        const cleanMessage =
            message.trim();


        try {

            // ----------------------------------------------------
            // INITIAL STATUS
            // ----------------------------------------------------

            setAgentLoading(true);

            setRagLoading(false);

            setAgentMode("");

            setAgentToolCalls([]);

            setAgentDuration(null);

            setRagSources([]);

            setReply("");

            setAgentStatus(
                "🧠 Analyzing your question..."
            );


            // ----------------------------------------------------
            // CALL AGENT
            // ----------------------------------------------------

            const response =
                await askAgent(
                    cleanMessage,
                    token
                );


            const data =
                response?.data;


            if (!data?.success) {

                throw new Error(
                    data?.message ||
                    "Agent request failed"
                );
            }


            // ----------------------------------------------------
            // EXTRACT AGENT DATA
            // ----------------------------------------------------

            const mode =
                data.mode ||
                "normal";

            const sources =
                Array.isArray(data.sources)
                    ? data.sources.map(
                        (source, index) => ({

                            id:
                                source.id ??
                                index + 1,

                            fileName:
                                source.fileName ||
                                source.filename ||
                                "Unknown document",

                            chunkIndex:
                                source.chunkIndex ??
                                source.chunk ??
                                null,

                            score:
                                source.score ??
                                source.rerankScore ??
                                source.semanticScore ??
                                null,

                            semanticScore:
                                source.semanticScore ??
                                null,

                            keywordScore:
                                source.keywordScore ??
                                null,

                            compressionScore:
                                source.compressionScore ??
                                null,

                        })
                    )
                    : [];


            const toolCalls =
                Array.isArray(
                    data.agent?.toolCalls
                )
                    ? data.agent.toolCalls
                    : [];


            const duration =
                data.agent?.durationMs ??
                null;


            // ----------------------------------------------------
            // STORE AGENT STATE
            // ----------------------------------------------------

            setAgentMode(mode);

            setAgentToolCalls(
                toolCalls
            );

            setAgentDuration(
                duration
            );

            setRagSources(
                sources
            );


            // ----------------------------------------------------
            // SHOW ROUTE STATUS
            // ----------------------------------------------------

            setAgentStatus(
                getModeStatus(
                    mode,
                    toolCalls
                )
            );


            // ----------------------------------------------------
            // ANSWER
            // ----------------------------------------------------

            const finalAnswer =
                data.reply ||
                data.answer ||
                "";


            setReply(
                finalAnswer
            );


            // ----------------------------------------------------
            // STORE CHAT
            // ----------------------------------------------------

            setPrevChats(
                (currentChats) => [

                    ...currentChats,

                    {
                        role: "user",

                        content:
                            cleanMessage,

                        prompt:
                            cleanMessage,
                    },

                    {
                        role: "assistant",

                        content:
                            finalAnswer,

                        prompt:
                            cleanMessage,

                        mode,

                        sources,

                        toolCalls,

                        durationMs:
                            duration,

                        metadata:
                            data.metadata ||
                            {},
                    },
                ]
            );


            setLastPrompt(
                cleanMessage
            );

            setNewChat(false);


            // ----------------------------------------------------
            // CLEAR STATUS AFTER ANSWER
            // ----------------------------------------------------

            setTimeout(() => {

                setAgentStatus("");

            }, 500);


            return {

                answer:
                    finalAnswer,

                reply:
                    finalAnswer,

                mode,

                sources,

                toolCalls,

                durationMs:
                    duration,

                metadata:
                    data.metadata ||
                    {},
            };


        } catch (error) {

            console.error(
                "❌ Agent request failed:",
                error
            );


            const errorMessage =
                error?.response?.data?.message ||
                error?.message ||
                "Failed to get a response from NovaGPT.";


            setReply(
                errorMessage
            );

            setRagSources([]);

            setAgentMode("");

            setAgentToolCalls([]);

            setAgentStatus("");

            return null;


        } finally {

            setAgentLoading(false);

            setRagLoading(false);

        }
    };


    // ============================================================
    // BACKWARD COMPATIBILITY
    // ============================================================
    //
    // If ChatWindow currently calls askDocument(),
    // it will still work.
    //
    // We route it through the Agent now.
    // ============================================================

    const askDocument = async (message) => {

        return await askAgentMessage(
            message
        );
    };


    // ============================================================
    // NORMAL CHAT BACKWARD COMPATIBILITY
    // ============================================================
    //
    // If your ChatWindow currently calls askNormal(),
    // this also routes through the Agent.
    //
    // Therefore:
    //
    // askNormal()
    //       ↓
    //    Agent
    //       ↓
    // RAG / MCP / Gemini
    //
    // ============================================================

    const askNormal = async (message) => {

        return await askAgentMessage(
            message
        );
    };


    // ============================================================
    // CLEAR AGENT / RAG STATE
    // ============================================================

    const clearRAG = () => {

        setRagLoading(false);

        setRagSources([]);

        setAgentLoading(false);

        setAgentStatus("");

        setAgentMode("");

        setAgentToolCalls([]);

        setAgentDuration(null);
    };


    // ============================================================
    // NEW CHAT
    // ============================================================

    const createNewChat = () => {

        setCurrThreadId(
            uuidv1()
        );

        setPrevChats([]);

        setPrompt("");

        setLastPrompt("");

        setReply(null);

        setNewChat(true);

        setRagSources([]);

        setAgentLoading(false);

        setAgentStatus("");

        setAgentMode("");

        setAgentToolCalls([]);

        setAgentDuration(null);
    };


    // ============================================================
    // PROVIDER
    // ============================================================

    return (

        <MyContext.Provider
            value={{

                // ==================================================
                // CHAT
                // ==================================================

                prompt,
                setPrompt,

                lastPrompt,
                setLastPrompt,

                reply,
                setReply,

                currThreadId,
                setCurrThreadId,

                prevChats,
                setPrevChats,

                newChat,
                setNewChat,

                allThreads,
                setAllThreads,

                temporaryChat,
                setTemporaryChat,

                createNewChat,


                // ==================================================
                // AUTHENTICATION
                // ==================================================

                user,
                setUser,

                token,
                setToken,

                showAuthModal,
                setShowAuthModal,

                authMode,
                setAuthMode,


                // ==================================================
                // UNIFIED AGENT
                // ==================================================

                askAgent:
                    askAgentMessage,

                askAgentMessage,

                agentLoading,
                setAgentLoading,

                agentStatus,
                setAgentStatus,

                agentMode,
                setAgentMode,

                agentToolCalls,
                setAgentToolCalls,

                agentDuration,
                setAgentDuration,


                // ==================================================
                // BACKWARD COMPATIBILITY
                // ==================================================

                askNormal,

                askDocument,


                // ==================================================
                // RAG
                // ==================================================

                ragLoading,
                setRagLoading,

                ragSources,
                setRagSources,

                clearRAG,

            }}
        >

            <div className="app">

                <Sidebar />

                <ChatWindow />

            </div>


            <AuthModal />

        </MyContext.Provider>
    );
}


export default App;