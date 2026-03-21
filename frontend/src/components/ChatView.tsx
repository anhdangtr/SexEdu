import { useRef, useEffect, useState, useCallback } from "react";
import { useMode } from "@/contexts/ModeContext";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { WelcomeScreen } from "./WelcomeScreen";
import { ModeSwitch } from "./ModeSwitch";
import { AppSidebar } from "./AppSidebar";
import { MathSidebar } from "./MathSidebar";
import { Menu, PanelRightOpen, PanelRightClose, Info } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { Skeleton } from "@/components/ui/skeleton";

// Cấu hình API Endpoint
const API_BASE_URL = (
    import.meta.env.VITE_API_BASE_URL ??
    (import.meta.env.DEV ? "" : "https://sase-90am.onrender.com")
).replace(/\/$/, "");
const CHAT_ENDPOINT = `${API_BASE_URL}/api/chat`;

export const ChatView = () => {
    const { mode, isTransitioning, currentMessages, addMessage, toggleMode } = useMode();
    const [isTyping, setIsTyping] = useState(false);
    const [showRightSidebar, setShowRightSidebar] = useState(false);
    const [showSkeleton, setShowSkeleton] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const isMobile = useIsMobile();

    const isMathMode = mode === "disguise";

    // Tự động cuộn xuống cuối đoạn chat
    const scrollToBottom = useCallback(() => {
        setTimeout(() => {
            if (scrollRef.current) {
                scrollRef.current.scrollTo({
                    top: scrollRef.current.scrollHeight,
                    behavior: "smooth"
                });
            }
        }, 100);
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [currentMessages.length, isTyping, scrollToBottom]);

    // Hiệu ứng Skeleton khi chuyển Mode
    useEffect(() => {
        if (isTransitioning) {
            setShowSkeleton(true);
        } else {
            const t = setTimeout(() => setShowSkeleton(false), 300);
            return () => clearTimeout(t);
        }
    }, [isTransitioning]);

    // Phím tắt Ctrl + M để chuyển mode bí mật
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "m") {
                e.preventDefault();
                toggleMode();
            }
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [toggleMode]);

    // Xử lý gửi tin nhắn (Kết nối API Backend)
    const handleSend = async (text: string) => {
        addMessage({ role: "user", content: text });
        setIsTyping(true);

        try {
            const response = await fetch(CHAT_ENDPOINT, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: text, mode }),
            });

            if (!response.ok) throw new Error("Kết nối server thất bại");

            const data: { reply?: string } = await response.json();
            addMessage({
                role: "assistant",
                content: data.reply?.trim() || "Xin lỗi, mình không nhận được phản hồi.",
            });
        } catch (error) {
            console.error("Lỗi:", error);
            // Fallback nếu chưa có backend (để bạn demo)
            const fallbackMsg = mode === "safe"
                ? "Kết nối của bạn được bảo mật. EduSolve đang lắng nghe..."
                : "Hệ thống đang tính toán kết quả bài toán này.";
            addMessage({ role: "assistant", content: fallbackMsg });
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className={`flex h-screen w-full mode-transition ${isMathMode ? "disguise-mode bg-slate-50" : "bg-background"} overflow-hidden font-sans`}>
            {/* Sidebar bên trái (Desktop) */}
            {!isMobile && <AppSidebar />}

            <div className="flex flex-1 flex-col min-w-0 relative h-full">
                {/* 1. HEADER CHUYÊN NGHIỆP */}
                <header className="flex items-center justify-between border-b px-4 py-3 bg-card/95 backdrop-blur-md z-30 shrink-0">
                    <div className="flex items-center gap-2">
                        {isMobile && (
                            <Sheet>
                                <SheetTrigger asChild>
                                    <button className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground transition-colors">
                                        <Menu className="h-5 w-5" />
                                    </button>
                                </SheetTrigger>
                                <SheetContent side="left" className="p-0 w-[280px]">
                                    <SheetTitle className="sr-only">Menu</SheetTitle>
                                    <AppSidebar />
                                </SheetContent>
                            </Sheet>
                        )}
                        <span className="text-[10px] font-black tracking-[0.2em] text-muted-foreground/50 uppercase select-none">
                            {isMathMode ? "Academic AI System" : "Privacy Secure Chat"}
                        </span>
                    </div>
                    <ModeSwitch />
                </header>

                {/* 2. KHU VỰC NỘI DUNG CHAT */}
                <div className="flex-1 relative flex flex-col min-h-0 overflow-hidden">
                    <div
                        ref={scrollRef}
                        className={`flex-1 overflow-y-auto scrollbar-none transition-all duration-500 
                            ${isTransitioning ? "blur-md opacity-40 scale-[0.99]" : "blur-0 opacity-100 scale-100"}`}
                    >
                        <div className="mx-auto max-w-[800px] w-full px-4">
                            {showSkeleton ? (
                                <div className="space-y-8 py-10">
                                    <Skeleton className="h-20 w-full rounded-2xl" />
                                    <Skeleton className="h-32 w-3/4 rounded-2xl" />
                                    <Skeleton className="h-24 w-1/2 rounded-2xl" />
                                </div>
                            ) : currentMessages.length === 0 ? (
                                <div className="min-h-[80vh] flex items-center justify-center pb-20">
                                    <WelcomeScreen onPromptClick={handleSend} />
                                </div>
                            ) : (
                                <div className="space-y-6 py-10 pb-44">
                                    {currentMessages.map((msg, i) => (
                                        <ChatMessage key={msg.id || i} role={msg.role} content={msg.content} index={i} />
                                    ))}
                                    {isTyping && (
                                        <div className="flex gap-2 p-4 bg-muted/20 rounded-2xl w-fit animate-pulse text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                            AI đang phân tích dữ liệu...
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 3. VÙNG NHẬP LIỆU (FLOATING) */}
                    <div className="absolute bottom-0 left-0 right-0 z-20 px-4 py-8 bg-gradient-to-t from-background via-background/90 to-transparent">
                        <div className="mx-auto max-w-[800px]">
                            <ChatInput onSend={handleSend} disabled={isTyping} />

                            <div className="mt-4 flex items-center justify-center gap-2 text-muted-foreground/30 select-none">
                                <Info className="h-3 w-3" />
                                <p className="text-[9px] font-black tracking-widest uppercase text-center italic">
                                    EduSolve AI v2.0 • Ẩn danh & Bảo mật tuyệt đối • Phản hồi có thể nhầm lẫn
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Nút bật/tắt Sidebar Toán học (Bên phải) */}
                {isMathMode && !isMobile && (
                    <button
                        onClick={() => setShowRightSidebar((v) => !v)}
                        className="fixed bottom-32 right-8 z-40 flex h-10 w-10 items-center justify-center rounded-xl bg-card border shadow-xl text-muted-foreground hover:text-primary transition-all active:scale-90"
                    >
                        {showRightSidebar ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
                    </button>
                )}
            </div>

            {/* Sidebar Toán học (Chỉ hiện ở mode Disguise) */}
            {isMathMode && showRightSidebar && !isMobile && (
                <div className="w-[320px] border-l bg-card/50 backdrop-blur-md overflow-y-auto animate-slide-in shrink-0">
                    <MathSidebar />
                </div>
            )}
        </div>
    );
};
