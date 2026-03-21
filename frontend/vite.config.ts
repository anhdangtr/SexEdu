import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), "");
    // Backend mặc định chạy ở port 5000 hoặc lấy từ file .env
    const apiProxyTarget = env.VITE_API_PROXY_TARGET || "http://localhost:5000";

    return {
        server: {
            host: "::",
            port: 8080,
            hmr: {
                overlay: false,
            },
            proxy: {
                // Cấu hình để gọi API từ frontend mượt mà hơn
                "/api": {
                    target: apiProxyTarget,
                    changeOrigin: true,
                    secure: false,
                },
            },
        },
        plugins: [
            react(),
            mode === "development" && componentTagger()
        ].filter(Boolean),
        resolve: {
            alias: {
                // Cấu hình Alias để Vite hiểu được ký hiệu @/
                "@": path.resolve(__dirname, "./src"),
            },
        },
    };
});