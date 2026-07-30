import { useState } from "react";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import ThumbUpOffAltRoundedIcon from "@mui/icons-material/ThumbUpOffAltRounded";
import ThumbDownOffAltRoundedIcon from "@mui/icons-material/ThumbDownOffAltRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import CircularProgress from "@mui/material/CircularProgress";
import toast from "react-hot-toast";

function MessageActions({
    text,
    prompt,
    regenerateReply,
    regenerating,
}) {
    const [copied, setCopied] = useState(false);
    const [liked, setLiked] = useState(false);
    const [disliked, setDisliked] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(text);

            setCopied(true);
            toast.success("Copied!");

            setTimeout(() => {
                setCopied(false);
            }, 1500);
        } catch (err) {
            console.error(err);
        }
    };

    return (
    <div className="messageActions">

        {/* Copy */}

        <button
            className="actionBtn"
            onClick={handleCopy}
            title={copied ? "Copied" : "Copy response"}
        >
            {copied ? (
                <CheckRoundedIcon fontSize="small" />
            ) : (
                <ContentCopyRoundedIcon fontSize="small" />
            )}
        </button>

        {/* Like */}

        <button
            className={`actionBtn ${liked ? "active" : ""}`}
            onClick={() => {
                setLiked(!liked);
                setDisliked(false);

                toast.success("Thanks for your feedback!");
            }}
            title="Good response"
        >
            <ThumbUpOffAltRoundedIcon fontSize="small" />
        </button>

        {/* Dislike */}

        <button
            className={`actionBtn ${disliked ? "active" : ""}`}
            onClick={() => {
                setDisliked(!disliked);
                setLiked(false);

                toast.success("Thanks for your feedback!");
            }}
            title="Bad response"
        >
            <ThumbDownOffAltRoundedIcon fontSize="small" />
        </button>

        {/* Regenerate */}

       <button
    className="actionBtn"
    onClick={() => regenerateReply(prompt)}
    disabled={regenerating}
    title="Regenerate"
>
    {regenerating ? (
        <CircularProgress size={16} color="inherit" />
    ) : (
        <RefreshRoundedIcon fontSize="small" />
    )}
</button>

    </div>
);
}

export default MessageActions;