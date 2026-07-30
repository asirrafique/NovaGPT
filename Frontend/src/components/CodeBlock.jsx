import { Highlight, themes } from "prism-react-renderer";
import { useContext, useState } from "react";
import { ThemeContext } from "../context/ThemeContext";

import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import "./CodeBlock.css";

function CodeBlock({
    inline,
    className,
    children,
    ...props
}) {
    const { currentTheme } = useContext(ThemeContext);

    const [copied, setCopied] = useState(false);

    const match = /language-(\w+)/.exec(className || "");

    if (inline || !match) {
        return (
            <code className={className} {...props}>
                {children}
            </code>
        );
    }

    const code = String(children).replace(/\n$/, "");

    return (
    <div className="codeBlockContainer">
        <div className="codeBlockHeader">
            <span className="codeLanguage">
                {match[1]}
            </span>

            <button
                className="copyCodeBtn"
                onClick={() => {
                    navigator.clipboard.writeText(code);

                    setCopied(true);

                    setTimeout(() => {
                        setCopied(false);
                    }, 1500);
                }}
            >
                {copied ? (
                    <>
                        <CheckRoundedIcon fontSize="small" />
                        Copied
                    </>
                ) : (
                    <>
                        <ContentCopyRoundedIcon fontSize="small" />
                        Copy code
                    </>
                )}
            </button>
        </div>

        <Highlight
            theme={
                currentTheme === "dark"
                    ? themes.vsDark
                    : themes.github
            }
            code={code}
            language={match[1]}
        >
            {({
                className,
                style,
                tokens,
                getLineProps,
                getTokenProps,
            }) => (
                <pre
                    className={className}
                    style={{
                        ...style,
                        margin: 0,
                        padding: "18px",
                        overflowX: "auto",
                        borderRadius: "0 0 14px 14px",
                    }}
                >
                    {tokens.map((line, i) => (
                        <div
                            key={i}
                            {...getLineProps({ line })}
                        >
                            {line.map((token, key) => (
                                <span
                                    key={key}
                                    {...getTokenProps({
                                        token,
                                    })}
                                />
                            ))}
                        </div>
                    ))}
                </pre>
            )}
        </Highlight>
    </div>
  );
}

export default CodeBlock;