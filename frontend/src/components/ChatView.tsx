import { useRef, useEffect, useState, useCallback } from "react";
import { useMode } from "@/contexts/ModeContext";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { WelcomeScreen } from "./WelcomeScreen";
import { AppSidebar } from "./AppSidebar";
import { MathSidebar } from "./MathSidebar";
import { Menu, PanelRightOpen, PanelRightClose, Sparkles, Ghost } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

const normalizeApiBaseUrl = (value?: string) => {
    if (!value) {
        return value ?? "";
    }

    const trimmed = value.trim();

    if (trimmed.startsWith("ttps://")) {
        return `h${trimmed}`.replace(/\/$/, "");
    }

    if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("/")) {
        return trimmed.replace(/\/$/, "");
    }

    return `https://${trimmed}`.replace(/\/$/, "");
};

const API_BASE_URL = normalizeApiBaseUrl(
    import.meta.env.VITE_API_BASE_URL ??
    (import.meta.env.DEV ? "" : "https://sase-90am.onrender.com")
);

const CHAT_ENDPOINT = `${API_BASE_URL}/api/chat`;

export const ChatView = () => {
    const { mode, isTransitioning, currentMessages, addMessage, toggleMode } = useMode();
    const [isTyping, setIsTyping] = useState(false);
    const [showRightSidebar, setShowRightSidebar] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const isMobile = useIsMobile();
    const isMathMode = mode === "disguise";

    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const handleGlobalDoubleClick = () => toggleMode();
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "h") {
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
        window.addEventListener("keydown", handleKeyDown);
        const interactionEvents = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"];
        interactionEvents.forEach((event) => window.addEventListener(event, resetInactivityTimer));
        resetInactivityTimer();
        return () => {
            window.removeEventListener("dblclick", handleGlobalDoubleClick);
            window.removeEventListener("keydown", handleKeyDown);
            if (timerRef.current) clearTimeout(timerRef.current);
            interactionEvents.forEach((event) => window.removeEventListener(event, resetInactivityTimer));
        };
    }, [mode, toggleMode]);

    const scrollToBottom = useCallback(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
        }
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [currentMessages.length, isTyping, scrollToBottom]);

    const handleSend = async (text: string) => {
        addMessage({ role: "user", content: text });
        setIsTyping(true);
        try {
            const response = await fetch(CHAT_ENDPOINT, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: text, mode }),
            });
            if (!response.ok) throw new Error("Server error");
            const data = await response.json();
            addMessage({ role: "assistant", content: data.reply?.trim() || "Sase dang hoi 'do', thu lai nhe!" });
        } catch (error) {
            addMessage({ role: "assistant", content: isMathMode ? "Sase dang ban tinh toan vu tru." : "Song yeu qua, Sase chua nghe ro." });
        } finally {
            setIsTyping(false);
        }
    };

    const handleStop = () => setIsTyping(false);

    return (
        <div className={`flex h-screen w-full transition-colors duration-1000 overflow-hidden font-sans ${isMathMode ? "bg-rose-50/20" : "bg-rose-50/10"}`}>
            {!isMobile && <AppSidebar />}
            <div className="flex flex-1 flex-col min-w-0 relative h-full">
                <header className="flex h-16 items-center justify-between border-b border-rose-100/50 px-6 bg-white/70 backdrop-blur-xl z-30 shrink-0">
                    <div className="flex items-center gap-3">
                        {isMobile && (
                            <Sheet>
                                <SheetTrigger asChild>
                                    <button className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-500 transition-all active:scale-90">
                                        <Menu className="h-5 w-5" />
                                    </button>
                                </SheetTrigger>
                                <SheetContent side="left" className="p-0 w-[280px]"><AppSidebar /></SheetContent>
                            </Sheet>
                        )}
                        <div className="flex flex-col min-w-[150px] h-10 justify-center">
                            <span className="text-2xl font-outfit font-black tracking-widest bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent uppercase select-none leading-none">Sase</span>
                            <div className="relative h-3 mt-1 overflow-hidden">
                                <span className={`absolute inset-0 text-[8px] font-bold text-rose-400/60 uppercase tracking-[0.25em] transition-all duration-700 ${isMathMode ? "-translate-y-full opacity-0" : "translate-y-0 opacity-100"}`}>Privacy Secure Chat</span>
                                <span className={`absolute inset-0 text-[8px] font-bold text-rose-400/60 uppercase tracking-[0.25em] transition-all duration-700 ${isMathMode ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"}`}>Academic AI System</span>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="flex-1 relative flex flex-col min-h-0 overflow-hidden">
                    <div ref={scrollRef} className={`flex-1 overflow-y-auto scrollbar-none transition-all duration-700 font-chakra ${isTransitioning ? "opacity-30 blur-sm" : "opacity-100 blur-0"}`}>
                        <div className="mx-auto max-w-[850px] w-full px-6">
                            {currentMessages.length === 0 ? (
                                <div className="min-h-[80vh] flex items-center justify-center pb-20"><WelcomeScreen onPromptClick={handleSend} /></div>
                            ) : (
                                <div className="space-y-6 py-10 pb-52">
                                    {currentMessages.map((msg, i) => <ChatMessage key={msg.id || i} role={msg.role} content={msg.content} index={i} />)}
                                    {isTyping && (
                                        <div className="flex items-center gap-3 p-5 bg-white/60 border border-rose-100 rounded-[2rem] w-fit animate-pulse mb-10 shadow-sm">
                                            <div className="flex gap-1.5"><div className="h-2 w-2 bg-rose-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div><div className="h-2 w-2 bg-rose-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div><div className="h-2 w-2 bg-rose-400 rounded-full animate-bounce"></div></div>
                                            <span className="text-[11px] font-chakra font-bold text-rose-500/80 uppercase tracking-widest">Sase dang 'vat oc' suy nghi...</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 z-20 px-4 py-8 bg-gradient-to-t from-rose-50/90 via-rose-50/40 to-transparent backdrop-blur-[2px]">
                        <div className="mx-auto max-w-[800px]">
                            <ChatInput onSend={handleSend} disabled={isTyping} isGenerating={isTyping} onStop={handleStop} />

                            <div className="mt-6 flex items-center justify-center gap-2 text-rose-500/40 select-none">
                                <Sparkles className={`h-3.5 w-3.5 transition-transform duration-1000 ${isTransitioning ? "rotate-180 scale-125" : "rotate-0 scale-100"}`} />
                                <p className="text-[9px] font-chakra font-bold tracking-[0.05em] uppercase text-center italic max-w-[600px] leading-relaxed">
                                    Sase la mot AI "da he", vua gioi giai toan vua thao go roi to long. <br />
                                    Nhung thinh thoang Sase cung biet "ao thuat" bien dung thanh sai de thu long ban, nho check lai nha!
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {isMathMode && !isMobile && (
                    <button onClick={() => setShowRightSidebar((v) => !v)} className="fixed bottom-36 right-8 z-40 flex h-12 w-12 items-center justify-center rounded-2xl bg-white border border-rose-200 shadow-2xl text-rose-500 hover:bg-rose-500 hover:text-white transition-all active:scale-90">
                        {showRightSidebar ? <PanelRightClose className="h-5 w-5" /> : <PanelRightOpen className="h-5 w-5" />}
                    </button>
                )}
            </div>
            {isMathMode && showRightSidebar && !isMobile && <div className="w-[340px] border-l border-rose-100 bg-white/40 backdrop-blur-2xl overflow-y-auto animate-in slide-in-from-right shrink-0"><MathSidebar /></div>}
        </div>
    );
};
