import "./Chat.css";
import { useContext, useEffect, useRef } from "react";
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
    const { newChat, prevChats, reply } = useContext(MyContext);

    const chatEndRef = useRef(null);

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

    return (
        <div className="chatContainer">

            {newChat && prevChats.length === 0 && (
                <div className="welcomeScreen">

                    <div className="welcomeLogo">✨</div>

                    <h1>NovaGPT</h1>

                    <p>How can I help today?</p>

                    

                </div>
            )}

            <div className="chats">

                {prevChats.map((chat, index) => (

                    <div
                        key={index}
                        className={
                            chat.role === "user"
                                ? "messageRow user"
                                : "messageRow assistant"
                        }
                    >

                        {chat.role === "user" ? (

                            <div className="userBubble">

    {chat.file && (

    chat.file.type.startsWith("image/") ? (

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

                <div className="chatFileName">
                    {chat.file.name}
                </div>

                <div className="chatFileSize">
                    {(chat.file.size / 1024).toFixed(1)} KB
                </div>

            </div>

        </div>

    )

)}

    <div>{chat.content}</div>

</div>

                        ) : (

                            <div className="assistantBubble">

    <div className="assistantHeader">
        ✨ NovaGPT
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

                {reply && (

                    <div className="messageRow assistant">

                        <div className="assistantBubble">

    <div className="assistantHeader">
        ✨ NovaGPT
    </div>

    <ReactMarkdown
        remarkPlugins={[
            remarkGfm,
            remarkMath,
        ]}
        rehypePlugins={[
            rehypeKatex,
        ]}
    >
        {reply}
    </ReactMarkdown>

    <MessageActions
    text={reply}
    regenerateReply={regenerateReply}
    regenerating={regenerating}
/>

</div>

                    </div>

                )}

                <div ref={chatEndRef}></div>

            </div>

        </div>
    );
}

export default Chat;