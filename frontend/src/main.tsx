import "katex/dist/katex.min.css";
import React from "react"; // Keep React imported to avoid build issues
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Use StrictMode to catch issues more reliably during development
createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
