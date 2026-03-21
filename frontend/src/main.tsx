import 'katex/dist/katex.min.css';
import React from "react"; // Nên có React để tránh lỗi build
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Sử dụng StrictMode để bắt lỗi tốt hơn trong quá trình code
createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);