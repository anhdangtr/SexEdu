import { useRef, useEffect, useState, useCallback } from "react";
import { useMode } from "@/contexts/ModeContext";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { WelcomeScreen } from "./WelcomeScreen";
import { ModeSwitch } from "./ModeSwitch";
import { AppSidebar } from "./AppSidebar";
import { MathSidebar } from "./MathSidebar";
import { Menu, PanelRightOpen, PanelRightClose } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { Skeleton } from "@/components/ui/skeleton";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");
const CHAT_ENDPOINT = `${API_BASE_URL}/api/chat`;

export const ChatView = () => {
  const { mode, isTransitioning, currentMessages, addMessage, toggleMode } = useMode();
  const [isTyping, setIsTyping] = useState(false);
  const [showRightSidebar, setShowRightSidebar] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, 50);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages.length, scrollToBottom]);

  useEffect(() => {
    if (isTransitioning) {
      setShowSkeleton(true);
    } else {
      const t = setTimeout(() => setShowSkeleton(false), 300);
      return () => clearTimeout(t);
    }
  }, [isTransitioning]);

  const handleSend = async (text: string) => {
    addMessage({ role: "user", content: text });
    setIsTyping(true);

    try {
      const response = await fetch(CHAT_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: text,
          mode,
        }),
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data: { reply?: string } = await response.json();

      addMessage({
        role: "assistant",
        content: data.reply?.trim() || "Mình chưa nhận được phản hồi hợp lệ từ hệ thống.",
      });
    } catch (error) {
      console.error("Failed to fetch chat reply:", error);
      addMessage({
        role: "assistant",
        content: "Mình chưa kết nối được tới backend. Hãy kiểm tra server và thử lại.",
      });
    } finally {
      setIsTyping(false);
    }
  };

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

  const isMathMode = mode === "disguise";

  const chatContent = (
    <div className="flex flex-1 flex-col min-w-0 min-h-0">
      <header className="flex items-center justify-between border-b border-border px-4 py-2.5 mode-transition bg-card/80 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-2">
          {isMobile && (
            <Sheet>
              <SheetTrigger asChild>
                <button className="p-1.5 rounded-lg hover:bg-accent transition-colors text-muted-foreground">
                  <Menu className="h-5 w-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-[280px]">
                <SheetTitle className="sr-only">Menu</SheetTitle>
                <AppSidebar />
              </SheetContent>
            </Sheet>
          )}
          <span className="text-sm font-medium text-muted-foreground">
            {isMathMode ? "Math Solver" : "Health & Wellness"}
          </span>
        </div>
        <ModeSwitch />
      </header>

      <div className={`flex flex-1 overflow-hidden min-h-0 ${isTransitioning ? "blur-switch" : ""}`}>
        <div className="flex flex-1 flex-col min-w-0 min-h-0">
          <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin px-4 py-6">
            {showSkeleton ? (
              <div className="mx-auto max-w-[800px] space-y-6 py-8">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="h-7 w-7 rounded-lg shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : currentMessages.length === 0 ? (
              <WelcomeScreen onPromptClick={handleSend} />
            ) : (
              <div className="mx-auto max-w-[800px] space-y-5">
                {currentMessages.map((msg, i) => (
                  <ChatMessage key={msg.id} role={msg.role} content={msg.content} index={i} />
                ))}
                {isTyping && (
                  <div className="flex gap-3 animate-fade-in-up">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <div className="h-3.5 w-3.5 rounded-full bg-primary/30 animate-pulse" />
                    </div>
                    <div className="flex items-center gap-1 pt-2">
                      <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-pulse" />
                      <span
                        className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-pulse"
                        style={{ animationDelay: "150ms" }}
                      />
                      <span
                        className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-pulse"
                        style={{ animationDelay: "300ms" }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="px-4 py-3 shrink-0">
            <div className="mx-auto max-w-[800px]">
              <ChatInput onSend={handleSend} disabled={isTyping} />
            </div>
          </div>
        </div>

        {isMathMode && showRightSidebar && !isMobile && (
          <div className="w-72 border-l border-border bg-card/50 overflow-y-auto mode-transition animate-slide-in shrink-0">
            <MathSidebar />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className={`flex h-screen w-full mode-transition ${isMathMode ? "disguise-mode" : ""} bg-background`}>
      {!isMobile && <AppSidebar />}

      {chatContent}

      {isMathMode && !isMobile && (
        <button
          onClick={() => setShowRightSidebar((v) => !v)}
          className="fixed bottom-20 right-4 z-30 flex h-9 w-9 items-center justify-center rounded-xl bg-card border border-border shadow-md text-muted-foreground hover:text-foreground hover:shadow-lg active:scale-95 transition-all"
          title="Toggle Math Tools"
        >
          {showRightSidebar ? (
            <PanelRightClose className="h-4 w-4" />
          ) : (
            <PanelRightOpen className="h-4 w-4" />
          )}
        </button>
      )}
    </div>
  );
};
