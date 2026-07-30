import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Toaster } from "react-hot-toast";
import ThemeProvider from "./context/ThemeContext";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
    <App />
    </ThemeProvider>
    <Toaster
        position="top-right"
        toastOptions={{
            duration: 2500,
            style: {
                background: "#202123",
                color: "#fff",
                border: "1px solid #444",
                borderRadius: "12px",
            },
            success: {
                iconTheme: {
                    primary: "#10b981",
                    secondary: "#fff",
                },
            },
            error: {
                iconTheme: {
                    primary: "#ef4444",
                    secondary: "#fff",
                },
            },
        }}
    />
</StrictMode>
)
