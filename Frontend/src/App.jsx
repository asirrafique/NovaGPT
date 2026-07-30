import "./App.css";
import Sidebar from "./Sidebar";
import ChatWindow from "./ChatWindow";
import { MyContext } from "./MyContext";
import { useState, useEffect } from "react";
import { v1 as uuidv1 } from "uuid";
import AuthModal from "./components/AuthModal";
import { getUser } from "./services/authService";

function App() {
    const [prompt, setPrompt] = useState("");
    const [lastPrompt, setLastPrompt] = useState("");
    const [reply, setReply] = useState(null);

    const [currThreadId, setCurrThreadId] = useState(uuidv1());

    const [prevChats, setPrevChats] = useState([]);

    const [newChat, setNewChat] = useState(true);

    const [allThreads, setAllThreads] = useState([]);

    const [temporaryChat, setTemporaryChat] = useState(false);

    // Authentication
    const [user, setUser] = useState(null);

    const [token, setToken] = useState(
        localStorage.getItem("token") || ""
    );

    const [showAuthModal, setShowAuthModal] = useState(false);

    const [authMode, setAuthMode] = useState("login");

    // Auto-login on refresh
    useEffect(() => {
        const loadUser = async () => {
            if (!token) return;

            try {
                const res = await getUser(token);

                setUser(res.data.user);
            } catch (err) {
                console.log(err);

                localStorage.removeItem("token");

                setToken("");

                setUser(null);
            }
        };

        loadUser();
    }, [token]);

    return (
        <MyContext.Provider
            value={{
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

                // Auth
                user,
                setUser,

                token,
                setToken,

                showAuthModal,
                setShowAuthModal,

                authMode,
                setAuthMode,
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