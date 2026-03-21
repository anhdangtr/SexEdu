import { useEffect, useRef } from "react";
import { useMode } from "@/contexts/ModeContext";
import { Accessibility, Shield, Sigma } from "lucide-react";

export const ModeSwitch = () => {
    const { mode, toggleMode } = useMode();
    const isSafe = mode === "safe";

    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const handleGlobalDoubleClick = () => toggleMode();
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'h') {
                e.preventDefault();
                toggleMode();
            }
        };

        const resetInactivityTimer = () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            if (mode === "safe") {
                timerRef.current = setTimeout(() => toggleMode(), 30000);
            }
        };

        window.addEventListener("dblclick", handleGlobalDoubleClick);
        const interactionEvents = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"];
        interactionEvents.forEach(event => window.addEventListener(event, resetInactivityTimer));
        window.addEventListener("keydown", handleKeyDown);

        resetInactivityTimer();

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
            className="group flex items-center gap-2 rounded-full bg-rose-50/80 border border-rose-100/50 px-3 py-1.5 text-xs text-rose-500 hover:bg-white hover:shadow-lg hover:shadow-rose-100 transition-all active:scale-95 shadow-sm"
            title="Switch Mode (DblClick / Ctrl+Shift+H)"
        >
            {isSafe ? <Shield className="h-3.5 w-3.5" /> : <Sigma className="h-3.5 w-3.5" />}
            <div className={`h-4 w-8 rounded-full relative transition-colors duration-500 ${isSafe ? "bg-rose-200" : "bg-rose-500"}`}>
                <div
                    className={`absolute top-0.5 h-3 w-3 rounded-full bg-white shadow-md transition-all duration-500 ease-in-out ${isSafe ? "left-0.5" : "left-4.5"}`}
                />
            </div>
        </button>
    );
};