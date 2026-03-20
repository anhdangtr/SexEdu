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

const SAFE_RESPONSES: Record<string, string> = {
  default: `### 1. Explanation
Cảm ơn bạn đã hỏi! Đây là một câu hỏi rất tốt. Mình sẽ giải đáp một cách khoa học và dễ hiểu nhất.

### 2. Why It Matters
Việc hiểu rõ về cơ thể và sức khỏe giúp bạn tự tin hơn, biết cách bảo vệ bản thân và đưa ra những quyết định đúng đắn.

### 3. Guidance & Advice
- Hãy tìm một người lớn mà bạn tin tưởng để trao đổi thêm
- Nhớ rằng mọi câu hỏi đều đáng được giải đáp
- Bạn có thể quay lại đây bất cứ lúc nào`,
};

const MATH_RESPONSES: Record<string, string> = {
  default: `### 1. Mathematical Breakdown
Đây là một bài toán thú vị. Hãy cùng giải từng bước:

$\\text{Bước 1: Xác định dữ kiện}$
$\\text{Bước 2: Áp dụng công thức}$
$\\text{Bước 3: Tính toán kết quả}$

### 2. Real-world Application
Khái niệm toán học này được ứng dụng rộng rãi trong kỹ thuật, vật lý và khoa học dữ liệu.

### 3. Practice Tip
Thử giải thêm các bài tương tự để nắm vững kiến thức. Hãy thay đổi các hệ số để luyện tập.`,
};

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

  // Show skeleton during transition
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
      const responses = mode === "safe" ? SAFE_RESPONSES : MATH_RESPONSES;
      addMessage({ role: "assistant", content: responses.default });
      setIsTyping(false);
    }, 1200);
  };

  // Keyboard shortcut
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
      {/* Top bar */}
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

      {/* Chat area */}
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
                      <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-pulse" style={{ animationDelay: "150ms" }} />
                      <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-pulse" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Floating input */}
          <div className="px-4 py-3 shrink-0">
            <div className="mx-auto max-w-[800px]">
              <ChatInput onSend={handleSend} disabled={isTyping} />
            </div>
          </div>
        </div>

        {/* Right sidebar — math tools, desktop only, toggleable */}
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
      {/* Left sidebar — desktop */}
      {!isMobile && <AppSidebar />}

      {chatContent}

      {/* Right sidebar toggle — math mode only */}
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
