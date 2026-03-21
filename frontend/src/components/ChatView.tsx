import { useRef, useEffect, useState, useCallback } from "react";
import { useMode } from "@/contexts/ModeContext";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { WelcomeScreen } from "./WelcomeScreen";
import { AppSidebar } from "./AppSidebar";
import { MathSidebar } from "./MathSidebar";
import { Menu, PanelRightOpen, PanelRightClose, Sparkles } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

const API_BASE_URL = (
    import.meta.env.VITE_API_BASE_URL ??
    (import.meta.env.DEV ? "" : "https://sase-90am.onrender.com")
).replace(/\/$/, "");

const CHAT_ENDPOINT = `${API_BASE_URL}/api/chat`;

export const ChatView = () => {
    const {
        mode,
        isTransitioning,
        currentMessages,
        addMessage,
        toggleMode,
    } = useMode();

    const [isTyping, setIsTyping] = useState(false);
    const [showRightSidebar, setShowRightSidebar] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const skipAutoScrollRef = useRef(false);
    const lastInteractionRef = useRef(Date.now());
    const isMobile = useIsMobile();
    const isMathMode = mode === "disguise";

    const timerRef = useRef<number | null>(null);

    useEffect(() => {
        const handleGlobalDoubleClick = () => toggleMode();
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'h') {
                e.preventDefault();
                toggleMode();
            }
        };
        const markInteraction = () => {
            lastInteractionRef.current = Date.now();
        };
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                lastInteractionRef.current = Date.now();
            }
        };

        window.addEventListener("dblclick", handleGlobalDoubleClick);
        window.addEventListener("keydown", handleKeyDown);
        document.addEventListener("visibilitychange", handleVisibilityChange);
        const interactionEvents = ["mousedown", "keydown", "wheel", "touchstart", "pointerdown"];
        interactionEvents.forEach(event => window.addEventListener(event, markInteraction));

        lastInteractionRef.current = Date.now();
        if (timerRef.current) window.clearInterval(timerRef.current);
        timerRef.current = window.setInterval(() => {
            if (document.hidden || mode !== "safe") return;

            const idleFor = Date.now() - lastInteractionRef.current;
            if (idleFor >= 30000) {
                lastInteractionRef.current = Date.now();
                toggleMode();
            }
        }, 1000);

        return () => {
            window.removeEventListener("dblclick", handleGlobalDoubleClick);
            window.removeEventListener("keydown", handleKeyDown);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            if (timerRef.current) window.clearInterval(timerRef.current);
            interactionEvents.forEach(event => window.removeEventListener(event, markInteraction));
        };
    }, [mode, toggleMode]);

    const scrollToBottom = useCallback(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: isTransitioning ? "auto" : "smooth"
            });
        }
    }, [isTransitioning]);

    const scrollToTop = useCallback(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: 0,
                behavior: "auto",
            });
        }
    }, []);

    useEffect(() => {
        if (skipAutoScrollRef.current || isTransitioning) {
            return;
        }
        scrollToBottom();
    }, [currentMessages.length, isTyping, scrollToBottom, isTransitioning]);

    useEffect(() => {
        if (isTransitioning) {
            skipAutoScrollRef.current = true;
            scrollToTop();
        }
    }, [isTransitioning, scrollToTop]);

    useEffect(() => {
        skipAutoScrollRef.current = true;
        scrollToTop();

        const timer = window.setTimeout(() => {
            skipAutoScrollRef.current = false;
        }, 120);

        return () => window.clearTimeout(timer);
    }, [mode, scrollToTop]);

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
            addMessage({
                role: "assistant",
                content: data.reply?.trim() || "Sase is having a slight delay. Please try again."
            });
        } catch (error) {
            addMessage({
                role: "assistant",
                content: isMathMode
                    ? "Sase is currently processing complex calculations. Please hold on."
                    : "Connection issue detected. Sase couldn't hear you clearly."
            });
        } finally { setIsTyping(false); }
    };

    const handleStop = () => setIsTyping(false);

    return (
        <div className={`flex h-screen w-full overflow-hidden font-sans transition-colors duration-50 ${isMathMode ? "bg-slate-50/50" : "bg-rose-50/10"}`}>
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
                            <div className="relative mt-1 h-3 overflow-hidden">
                                <span className={`absolute inset-0 text-[8px] font-bold text-rose-400/60 uppercase tracking-[0.25em] transition-opacity duration-75 ${isMathMode ? "opacity-0" : "opacity-100"}`}>Privacy Secure Chat</span>
                                <span className={`absolute inset-0 text-[8px] font-bold text-slate-400/60 uppercase tracking-[0.25em] transition-opacity duration-75 ${isMathMode ? "opacity-100" : "opacity-0"}`}>Academic AI System</span>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="flex-1 relative flex flex-col min-h-0 overflow-hidden">
                    <div
                        ref={scrollRef}
                        className={`flex-1 overflow-y-auto scrollbar-none font-chakra transition-opacity duration-50 ${isTransitioning ? "opacity-[0.995]" : "opacity-100"}`}
                    >
                        <div className={currentMessages && currentMessages.length > 0 ? "mx-auto max-w-[850px] w-full px-6" : "mx-auto max-w-[1240px] w-full px-6"}>
                            {currentMessages && currentMessages.length > 0 ? (
                                <div className="space-y-6 py-10 pb-52">
                                    {currentMessages.map((msg, i) => (
                                        <ChatMessage
                                            key={msg.id || i}
                                            role={msg.role}
                                            content={msg.content}
                                            index={i}
                                        />
                                    ))}

                                    {isTyping && (
                                        <div className="flex w-full mb-8 gap-4 animate-pulse">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white border border-rose-100 shadow-sm">
                                                <Sparkles className="h-5 w-5 text-rose-400 animate-spin-slow" />
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-400/60 px-2">
                                                    Sase is thinking...
                                                </span>
                                                <div className="bg-white border border-rose-100 px-5 py-3 rounded-[1.5rem] rounded-tl-none shadow-sm">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-medium text-slate-400 italic">
                                                            {mode === 'safe'
                                                                ? "Wait a heart-beat, I'm preparing a safe answer for you... ✨"
                                                                : "Solving the mystery of this equation, just a second... ✍️"}
                                                        </span>
                                                        <div className="flex gap-1">
                                                            <span className="w-1.5 h-1.5 bg-rose-300 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                                            <span className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                                            <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-bounce"></span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex min-h-full items-start justify-center px-2 pb-38 pt-14 sm:px-4 sm:pb-42 sm:pt-16">
                                    <WelcomeScreen onPromptClick={handleSend} />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 z-20 px-4 py-8 bg-gradient-to-t from-rose-50/95 via-rose-50/70 to-transparent backdrop-blur-[4px]">
                        <div className="mx-auto max-w-[800px]">
                            <ChatInput onSend={handleSend} disabled={isTyping} isGenerating={isTyping} onStop={handleStop} />

                            <div className="mt-6 flex items-center justify-center gap-2 text-rose-500/40 select-none">
                                <Sparkles className="h-3.5 w-3.5" />
                                <p className="text-[9px] font-chakra font-bold tracking-[0.05em] uppercase text-center italic max-w-[600px] leading-relaxed">
                                    {isMathMode
                                        ? "Sase Academic AI — Verified for mathematical accuracy and step-by-step guidance."
                                        : "Sase Personal AI — Private support for well-being. Please verify important health information."}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {isMathMode && !isMobile && (
                    <button
                        onClick={() => setShowRightSidebar((v) => !v)}
                        className="fixed bottom-36 right-8 z-40 flex h-12 w-12 items-center justify-center rounded-2xl bg-white border border-rose-200 shadow-2xl text-rose-500 hover:bg-rose-500 hover:text-white transition-all active:scale-90"
                    >
                        {showRightSidebar ? <PanelRightClose className="h-5 w-5" /> : <PanelRightOpen className="h-5 w-5" />}
                    </button>
                )}
            </div>

            {isMathMode && showRightSidebar && !isMobile && (
                <div className="w-[340px] border-l border-rose-100 bg-white/40 backdrop-blur-2xl overflow-y-auto animate-in slide-in-from-right shrink-0">
                    <MathSidebar />
                </div>
            )}
        </div>
    );
};
