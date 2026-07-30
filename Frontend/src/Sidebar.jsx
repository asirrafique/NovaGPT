import "./Sidebar.css";
import { useContext, useEffect, useState } from "react";
import { MyContext } from "./MyContext.jsx";
import { v1 as uuidv1 } from "uuid";
import darkLogo from "./assets/logo-dark.png";
import lightLogo from "./assets/logo-light.png";

import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline";
import PushPinOutlinedIcon from "@mui/icons-material/PushPinOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import Tooltip from "@mui/material/Tooltip";
import ProfileMenu from "./components/ProfileMenu";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import ProfileDialog from "./components/ProfileDialog";
import toast from "react-hot-toast";
import SettingsDialog from "./components/SettingsDialog";
import { ThemeContext } from "./context/ThemeContext";


function Sidebar() {

const [profileAnchor, setProfileAnchor] = useState(null);

const openProfileMenu = (event) => {
    setProfileAnchor(event.currentTarget);
};

const closeProfileMenu = () => {
    setProfileAnchor(null);
};

const [profileOpen, setProfileOpen] = useState(false);

const [editingThreadId, setEditingThreadId] = useState(null);
const [editedTitle, setEditedTitle] = useState("");


const [anchorEl, setAnchorEl] = useState(null);
const [selectedThread, setSelectedThread] = useState(null);

const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
const [threadToDelete, setThreadToDelete] = useState(null);

const [settingsOpen, setSettingsOpen] = useState(false);

const { currentTheme } = useContext(ThemeContext);

const open = Boolean(anchorEl);

const handleMenuOpen = (event, thread) => {
    event.stopPropagation();

     // Cancel any active rename
    setEditingThreadId(null);
    setEditedTitle("");

    setAnchorEl(event.currentTarget);
    setSelectedThread(thread);
};

const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedThread(null);
};


    const {
    allThreads,
    setAllThreads,

    currThreadId,

    setNewChat,
    setPrompt,
    setReply,
    setCurrThreadId,
    setPrevChats,

    user,
    setUser,

    token,
    setToken,

    setShowAuthModal,
    setAuthMode,
} = useContext(MyContext);

    const getAllThreads = async () => {
        try {
            const response = await fetch(
    "http://localhost:8080/api/thread",
    {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }
);
            const res = await response.json();

            const filteredData = res.map((thread) => ({
    threadId: thread.threadId,
    title: thread.title,
    pinned: thread.pinned,
}));

            setAllThreads(filteredData);
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
    if (token) {
        getAllThreads();
    } else {
        setAllThreads([]);
    }
}, [currThreadId, token]);

    const createNewChat = () => {
        setEditingThreadId(null);
        setEditedTitle("");
        setNewChat(true);
        setPrompt("");
        setReply(null);
        setCurrThreadId(uuidv1());
        setPrevChats([]);
    };

    const changeThread = async (threadId) => {

         // Cancel any active rename
    setEditingThreadId(null);
    setEditedTitle("");

        setCurrThreadId(threadId);

        try {
            const response = await fetch(
    `http://localhost:8080/api/thread/${threadId}`,
    {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }
);

            const res = await response.json();

            const chatsWithPrompt = [];
let lastUserPrompt = "";

for (const chat of res) {
    if (chat.role === "user") {
        lastUserPrompt = chat.content;
        chatsWithPrompt.push(chat);
    } else {
        chatsWithPrompt.push({
            ...chat,
            prompt: chat.prompt || lastUserPrompt,
        });
    }
}

setPrevChats(chatsWithPrompt);


            setNewChat(false);
            setReply(null);
        } catch (err) {
            console.log(err);
        }
    };

    const deleteThread = async (threadId) => {
        try {
            await fetch(`http://localhost:8080/api/thread/${threadId}`, {
    method: "DELETE",
    headers: {
        Authorization: `Bearer ${token}`,
    },
});

            setAllThreads((prev) =>
                prev.filter((thread) => thread.threadId !== threadId)
            );

            toast.success("Chat deleted.");

            if (threadId === currThreadId) {
                createNewChat();
            }
        } catch (err) {
            console.log(err);
        }
    };


    const renameThread = async () => {
    if (!editedTitle.trim()) {
        setEditingThreadId(null);
        return;
    }

    try {
        await fetch(
    `http://localhost:8080/api/thread/${editingThreadId}/rename`,
    {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            title: editedTitle.trim(),
        }),
    }
);

        setAllThreads((prev) =>
            prev.map((thread) =>
                thread.threadId === editingThreadId
                    ? {
                          ...thread,
                          title: editedTitle.trim(),
                      }
                    : thread
            )
        );

        setEditingThreadId(null);
        setEditedTitle("");
    } catch (err) {
        console.log(err);
    }
};

const togglePinThread = async (threadId) => {
    try {
        const response = await fetch(
    `http://localhost:8080/api/thread/${threadId}/pin`,
    {
        method: "PATCH",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }
);

        const updatedThread = await response.json();

        setAllThreads((prev) =>
            prev
                .map((thread) =>
                    thread.threadId === threadId
                        ? {
                              ...thread,
                              pinned: updatedThread.pinned,
                          }
                        : thread
                )
                .sort((a, b) => {
                    if (a.pinned === b.pinned) return 0;
                    return a.pinned ? -1 : 1;
                })
        );

         // Update selected thread (for menu text)
        setSelectedThread((prev) =>
            prev
                ? {
                      ...prev,
                      pinned: updatedThread.pinned,
                  }
                : null
        );

        toast.success(
    updatedThread.pinned
        ? "Chat pinned."
        : "Chat unpinned."
);

    } catch (err) {
        console.log(err);
    }
};



    return (
        <aside className="sidebar">
            <div className="sidebarTop">

                <div className="logoContainer">
                    <img
    src={currentTheme === "dark" ? darkLogo : lightLogo}
    alt="NovaGPT"
    className="logo"
/>
                </div>

                <div className="topActions">
                <Tooltip title="New Chat" arrow placement="right">
    <button
        className="newChatIconBtn"
        onClick={createNewChat}
    >
        <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M12.75 4.75H7.5C5.84315 4.75 4.5 6.09315 4.5 7.75V16.25C4.5 17.9069 5.84315 19.25 7.5 19.25H16C17.6569 19.25 19 17.9069 19 16.25V11"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M18.5 5.5L11.5 12.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
            />
            <path
                d="M15.5 4.5H19.5V8.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    </button>
</Tooltip>
</div>
            </div>

            <div className="historySection">

                <p className="historyTitle">Recent Chats</p>

                <ul className="history">

                    {allThreads.length === 0 ? (
                        <p className="emptyHistory">
                            No conversations yet
                        </p>
                    ) : (
                        [...allThreads]
    .sort((a, b) => {
        if (a.pinned === b.pinned) return 0;
        return a.pinned ? -1 : 1;
    })
    .map((thread) => (
                            <li
    key={thread.threadId}
    className={
        thread.threadId === currThreadId
            ? "historyItem active"
            : "historyItem"
    }
    onClick={() => changeThread(thread.threadId)}
>
    {editingThreadId === thread.threadId ? (
       <input
    className="renameInput"
    value={editedTitle}
    autoFocus
    onClick={(e) => e.stopPropagation()}
    onChange={(e) => setEditedTitle(e.target.value)}
    onKeyDown={(e) => {
        if (e.key === "Enter") {
            renameThread();
        }

        if (e.key === "Escape") {
            setEditingThreadId(null);
            setEditedTitle("");
            
        }
    }}
/>
    ) : (
        <span className="threadTitle">
    {thread.pinned && "📌 "}
    {thread.title}
</span>
    )}

    <button
        className="menuBtn"
        onClick={(e) => handleMenuOpen(e, thread)}
    >
        <MoreHorizIcon fontSize="small" />
    </button>
</li>
                        ))
                    )}

                </ul>

                <Menu
    anchorEl={anchorEl}
    open={open}
    onClose={handleMenuClose}

    slotProps={{
        paper: {
            sx: {
         bgcolor: "var(--card)",
        color: "var(--text)",
        border: "1px solid var(--border)",
                borderRadius: "14px",
                p: 0.5,
        },
    },
}}
>

    <MenuItem
    onClick={() => {
        console.log("Rename clicked");
        console.log(selectedThread);

        if (!selectedThread) return;

        setEditingThreadId(selectedThread.threadId);
        setEditedTitle(selectedThread.title);

        handleMenuClose();
    }}
>
    <DriveFileRenameOutlineIcon
        fontSize="small"
        sx={{ mr: 1.5 }}
    />
    Rename
</MenuItem>

    <MenuItem
    onClick={() => {
        togglePinThread(selectedThread.threadId);
        handleMenuClose();
    }}
>
    <PushPinOutlinedIcon
        fontSize="small"
        sx={{ mr: 1.5 }}
    />

    {selectedThread?.pinned ? "Unpin Chat" : "Pin Chat"}
</MenuItem>

    <MenuItem
    onClick={() => {
        setThreadToDelete(selectedThread);
        setDeleteDialogOpen(true);
        handleMenuClose();
    }}
    sx={{
        color: "#ff5b5b",
    }}
>
    <DeleteOutlineOutlinedIcon
        fontSize="small"
        sx={{ mr: 1.5 }}
    />
    Delete
</MenuItem>

</Menu>

            </div>

            <div className="sidebarBottom">

    {user ? (

        <div className="profile">

    <div className="profileLeft">

        <div className="profileIcon">
            {user.name?.charAt(0).toUpperCase()}
        </div>

        <div className="profileInfo">
            <h4>{user.name}</h4>
            <span>{user.plan} Plan</span>
        </div>

    </div>

    <button
        className="profileMenuBtn"
        onClick={openProfileMenu}
    >
        <MoreVertRoundedIcon />
    </button>

    <ProfileMenu
        anchorEl={profileAnchor}
        open={Boolean(profileAnchor)}
        onClose={closeProfileMenu}
        onProfile={() => setProfileOpen(true)}
        onSettings={() => setSettingsOpen(true)}
        onLogout={() => {
            localStorage.removeItem("token");
            setToken("");
            setUser(null);
            createNewChat();
            toast.success("Logged out successfully.");
        }}
    />

</div>

    ) : (

        <div className="guestCard">

            

            <div className="guestInfo">
                <h4>Welcome</h4>
                <p>Sign in to start chatting with NovaGPT.</p>
            </div>

            <div className="guestButtons">

                <button
                    className="loginBtn"
                    onClick={() => {
                        setAuthMode("login");
                        setShowAuthModal(true);
                    }}
                >
                    Log In
                </button>

                <button
                    className="signupBtn"
                    onClick={() => {
                        setAuthMode("signup");
                        setShowAuthModal(true);
                    }}
                >
                    Create Account
                </button>

            </div>

        </div>

    )}

</div>


<Dialog
    open={deleteDialogOpen}
    onClose={() => setDeleteDialogOpen(false)}
    slotProps={{
        paper: {
            sx: {
            backgroundColor: "#323131",
            color: "#f2e7e7",
            borderRadius: "16px",
            minWidth: "380px",
            },
        },
    }}
>
    <DialogTitle
    sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        fontSize: "22px",
        fontWeight: 600,
        pb: 1,
    }}
>
    <WarningAmberRoundedIcon color="error" />
    Delete chat?
</DialogTitle>

    <DialogContent sx={{ pt: 0 }}>
    <DialogContentText
        sx={{
            color: "#fffdfd",
            fontSize: "15px",
            lineHeight: 1.6,
        }}
    >
        This conversation will be permanently deleted and cannot be recovered.
    </DialogContentText>
</DialogContent>

    <DialogActions
    sx={{
        px: 3,
        pb: 2,
        gap: 1,
    }}
>
    <Button
        onClick={() => {
            setDeleteDialogOpen(false);
            setThreadToDelete(null);
        }}
        sx={{
            color: "#d4c8c8",
            textTransform: "none",
            borderRadius: "10px",
            px: 3,
        }}
    >
        Cancel
    </Button>

    <Button
        variant="contained"
        color="error"
        onClick={() => {
            deleteThread(threadToDelete.threadId);
            setDeleteDialogOpen(false);
            setThreadToDelete(null);
        }}
        sx={{
            textTransform: "none",
            borderRadius: "10px",
            px: 3,
        }}
    >
        Delete
    </Button>
</DialogActions>
</Dialog>

<ProfileDialog
    open={profileOpen}
    onClose={() => setProfileOpen(false)}
/>

<SettingsDialog
    open={settingsOpen}
    onClose={() => setSettingsOpen(false)}
/>


        </aside>
    );
}

export default Sidebar;