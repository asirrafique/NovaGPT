import { useEffect, useMemo, useState } from "react";

import {
    ThemeProvider as MuiThemeProvider,
    createTheme,
    CssBaseline,
} from "@mui/material";

import { ThemeContext } from "./ThemeContext.js";

export default function ThemeProvider({ children }) {
    const getInitialTheme = () => {
        const saved = localStorage.getItem("theme");

        if (saved) return saved;

        return "system";
    };

    const [themeMode, setThemeMode] = useState(getInitialTheme);

    const getSystemTheme = () =>
        window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light";

    const currentTheme =
        themeMode === "system" ? getSystemTheme() : themeMode;

    useEffect(() => {
        localStorage.setItem("theme", themeMode);

        document.documentElement.setAttribute(
            "data-theme",
            currentTheme
        );
    }, [themeMode, currentTheme]);

    useEffect(() => {
        const media = window.matchMedia("(prefers-color-scheme: dark)");

        const handler = () => {
            if (themeMode === "system") {
                document.documentElement.setAttribute(
                    "data-theme",
                    getSystemTheme()
                );
            }
        };

        media.addEventListener("change", handler);

        return () => media.removeEventListener("change", handler);
    }, [themeMode]);

    const muiTheme = useMemo(
        () =>
            createTheme({
                palette: {
                    mode: currentTheme,
                },
            }),
        [currentTheme]
    );

    return (
        <ThemeContext.Provider
            value={{
                themeMode,
                setThemeMode,
                currentTheme,
            }}
        >
            <MuiThemeProvider theme={muiTheme}>
                <CssBaseline />
                {children}
            </MuiThemeProvider>
        </ThemeContext.Provider>
    );
}