import { useEffect, useRef } from "react";
import { useMode } from "@/contexts/ModeContext";
import { Accessibility } from "lucide-react";

export const ModeSwitch = () => {
    const { mode, toggleMode } = useMode();
    const isSafe = mode === "safe";

    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // --- TRIGGER 1: GLOBAL DOUBLE CLICK (BẤT KỲ ĐÂU TRÊN WEB) ---
        const handleGlobalDoubleClick = () => {
            console.log("Global double-click detected. Switching mode...");
            toggleMode();
        };

        // --- TRIGGER 2: SHORTCUT BẢO MẬT (Ctrl + Shift + H) ---
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'h') {
                e.preventDefault();
                toggleMode();
            }
        };

        // --- TRIGGER 3: TỰ ĐỘNG CHUYỂN KHI TREO MÁY (30 GIÂY) ---
        const resetInactivityTimer = () => {
            if (timerRef.current) clearTimeout(timerRef.current);

            // Chỉ tự động switch nếu đang ở chế độ "Safe" để ngụy trang
            if (mode === "safe") {
                timerRef.current = setTimeout(() => {
                    toggleMode();
                }, 30000);
            }
        };

        // Lắng nghe sự kiện Double Click toàn cục trên đối tượng window
        window.addEventListener("dblclick", handleGlobalDoubleClick);

        // Lắng nghe các sự kiện để reset bộ đếm thời gian chờ
        const interactionEvents = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"];
        interactionEvents.forEach(event => window.addEventListener(event, resetInactivityTimer));
        window.addEventListener("keydown", handleKeyDown);

        // Khởi tạo timer lần đầu
        resetInactivityTimer();

        // Dọn dẹp (Cleanup) khi component bị hủy
        return () => {
            window.removeEventListener("dblclick", handleGlobalDoubleClick);
            if (timerRef.current) clearTimeout(timerRef.current);
            interactionEvents.forEach(event => window.removeEventListener(event, resetInactivityTimer));
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [mode, toggleMode]);

    return (
        <button
            onClick={toggleMode}
            className="group flex items-center gap-1.5 rounded-full bg-secondary/60 px-2.5 py-1.5 text-xs text-muted-foreground mode-transition hover:bg-secondary hover:text-foreground active:scale-[0.97] transition-all"
            title="Switch Mode (DblClick anywhere / Ctrl+Shift+H)"
        >
            <Accessibility className="h-3.5 w-3.5" />
            <div className="h-4 w-7 rounded-full bg-switch-track relative mode-transition">
                <div
                    className={`absolute top-0.5 h-3 w-3 rounded-full bg-primary-foreground shadow-sm transition-transform duration-300 ${isSafe ? "left-0.5" : "left-3.5"
                        }`}
                />
            </div>
        </button>
    );
};