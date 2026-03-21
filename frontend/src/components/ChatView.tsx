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

export const ChatView = () => {
    const { mode, isTransitioning, currentMessages, addMessage, toggleMode } = useMode();
    const [isTyping, setIsTyping] = useState(false);
    const [showRightSidebar, setShowRightSidebar] = useState(false);
    const [showSkeleton, setShowSkeleton] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const isMobile = useIsMobile();

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

    useEffect(() => {
        if (isTransitioning) {
            setShowSkeleton(true);
        } else {
            const t = setTimeout(() => setShowSkeleton(false), 300);
            return () => clearTimeout(t);
        }
    }, [isTransitioning]);

    const handleSend = (text: string) => {
        addMessage({ role: "user", content: text });
        setIsTyping(true);
        setTimeout(() => {
            const resp = mode === "safe"
                ? "Cảm ơn bạn đã tin tưởng chia sẻ. EduSolve luôn đồng hành và bảo mật mọi thông tin của bạn. Hãy cùng tìm hiểu sâu hơn nhé."
                : "Dựa trên các bước giải thuật, kết quả cuối cùng cho bài toán này là: $x = 42$.";
            addMessage({ role: "assistant", content: resp });
            setIsTyping(false);
        }, 1500);
    };

    const isMathMode = mode === "disguise";

    return (
        <div className={`flex h-screen w-full mode-transition ${isMathMode ? "disguise-mode" : ""} bg-background overflow-hidden font-sans`}>
            {/* Sidebar bên trái cho Desktop */}
            {!isMobile && <AppSidebar />}

            <div className="flex flex-1 flex-col min-w-0 relative h-full">

                {/* 1. HEADER - Luôn hiển thị ở trên cùng */}
                <header className="flex items-center justify-between border-b border-border px-6 py-3 bg-card/95 backdrop-blur-md z-30 shrink-0">
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
                        <span className="text-[11px] font-black tracking-[0.25em] text-muted-foreground/60 uppercase select-none">
                            EduSolve System
                        </span>
                    </div>
                    <ModeSwitch />
                </header>

                {/* 2. CHAT CONTENT AREA */}
                <div className="flex-1 relative flex flex-col min-h-0 overflow-hidden">
                    <div
                        ref={scrollRef}
                        className={`flex-1 overflow-y-auto scrollbar-none transition-all duration-500 ${isTransitioning ? "blur-md opacity-40 scale-[0.99]" : "blur-0 opacity-100 scale-100"
                            }`}
                    >
                        <div className="mx-auto max-w-[800px] w-full px-4">
                            {showSkeleton ? (
                                <div className="space-y-8 py-10">
                                    <Skeleton className="h-20 w-full rounded-2xl" />
                                    <Skeleton className="h-32 w-3/4 rounded-2xl" />
                                    <Skeleton className="h-24 w-1/2 rounded-2xl" />
                                </div>
                            ) : currentMessages.length === 0 ? (
                                /* Căn giữa Welcome Screen và chừa khoảng trống cho Input */
                                <div className="min-h-[85vh] flex items-center justify-center pb-40">
                                    <WelcomeScreen onPromptClick={handleSend} />
                                </div>
                            ) : (
                                /* Danh sách tin nhắn với padding bottom cực lớn */
                                <div className="space-y-6 py-10 pb-44">
                                    {currentMessages.map((msg, i) => (
                                        <ChatMessage key={msg.id} role={msg.role} content={msg.content} index={i} />
                                    ))}
                                    {isTyping && (
                                        <div className="flex gap-2 p-4 bg-muted/20 rounded-2xl w-fit animate-pulse text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                                            AI đang phân tích...
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 3. FLOATING INPUT AREA - Nằm đè lên trên vùng chat nhưng không bị cuộn */}
                    <div className="absolute bottom-0 left-0 right-0 z-20 px-4 py-8 bg-gradient-to-t from-background via-background/95 to-transparent">
                        <div className="mx-auto max-w-[800px]">
                            <ChatInput onSend={handleSend} disabled={isTyping} />

                            {/* Dòng Info GỘP DUY NHẤT: Chuyên nghiệp & Tinh tế */}
                            <div className="mt-4 flex items-center justify-center gap-2 text-muted-foreground/40 select-none">
                                <Info className="h-3.5 w-3.5" />
                                <p className="text-[10px] font-bold tracking-widest uppercase text-center">
                                    EduSolve AI v2.0 • Phản hồi có thể nhầm lẫn • Hãy kiểm tra kỹ thông tin quan trọng
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Nút bật/tắt Sidebar Toán học (Chỉ hiện ở mode Disguise) */}
                {isMathMode && !isMobile && (
                    <button
                        onClick={() => setShowRightSidebar((v) => !v)}
                        className="fixed bottom-28 right-8 z-40 flex h-11 w-11 items-center justify-center rounded-2xl bg-card border border-border shadow-2xl text-muted-foreground hover:text-primary hover:border-primary/30 transition-all active:scale-90"
                    >
                        {showRightSidebar ? <PanelRightClose className="h-5 w-5" /> : <PanelRightOpen className="h-5 w-5" />}
                    </button>
                )}
            </div>

            {/* Sidebar Toán học bên phải */}
            {isMathMode && showRightSidebar && !isMobile && (
                <div className="w-[320px] border-l border-border bg-card/30 backdrop-blur-md overflow-y-auto animate-slide-in shrink-0">
                    <MathSidebar />
                </div>
            )}
        </div>
    );
};