import { useState, useRef, useEffect, ChangeEvent } from "react";
import { Send, Paperclip, Mic, Square, Smile, Sparkles } from "lucide-react";
import { useMode } from "@/contexts/ModeContext";
import { cn } from "@/lib/utils";

interface ChatInputProps {
    onSend: (text: string) => void;
    disabled?: boolean;
    isGenerating?: boolean; // Prop mới để xử lý trạng thái AI đang trả lời
    onStop?: () => void;    // Hàm để dừng AI nếu cần
}

export const ChatInput = ({ onSend, disabled, isGenerating, onStop }: ChatInputProps) => {
    const [text, setText] = useState("");
    const { mode } = useMode();
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const isSafe = mode === "safe";

    // Placeholder thay đổi theo ngữ cảnh chuyên nghiệp hơn
    const placeholder = isSafe
        ? "Chia sẻ tâm tư hoặc câu hỏi sức khỏe với EduSolve..."
        : "Nhập bài toán, phương trình hoặc yêu cầu giải thuật...";

    const handleSubmit = () => {
        const trimmed = text.trim();
        if (!trimmed || disabled || isGenerating) return;
        onSend(trimmed);
        setText("");

        // Reset height sau khi gửi
        if (inputRef.current) {
            inputRef.current.style.height = "auto";
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        setText(e.target.value);

        // Logic tự động tăng chiều cao ô nhập liệu
        const textarea = e.target;
        textarea.style.height = "auto";
        textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    };

    useEffect(() => {
        inputRef.current?.focus();
    }, [mode, isGenerating]);

    return (
        <div className="relative w-full max-w-4xl mx-auto transition-all duration-300">
            {/* Container chính với hiệu ứng Glassmorphism nhẹ */}
            <div className={cn(
                "group relative flex flex-col w-full rounded-2xl border bg-card/80 backdrop-blur-sm transition-all duration-200 shadow-sm",
                "focus-within:shadow-md focus-within:border-primary/40 focus-within:ring-1 focus-within:ring-primary/20",
                disabled && "opacity-60 bg-muted"
            )}>

                {/* Khu vực nhập liệu */}
                <div className="flex items-end gap-2 px-3 py-3">

                    {/* Nút Đính kèm */}
                    <button
                        type="button"
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all active:scale-90"
                        title="Tải lên tài liệu hoặc hình ảnh"
                    >
                        <Paperclip className="h-5 w-5" />
                    </button>

                    {/* Ô văn bản (Textarea) */}
                    <textarea
                        ref={inputRef}
                        value={text}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        disabled={disabled}
                        rows={1}
                        className="flex-1 min-h-[40px] max-h-[200px] resize-none bg-transparent px-2 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none disabled:cursor-not-allowed leading-relaxed font-sans"
                    />

                    {/* Nhóm nút chức năng bên phải */}
                    <div className="flex items-center gap-1.5 pb-0.5">
                        {/* Nút Emoji/Library (Chỉ hiện khi chưa nhập chữ) */}
                        {!text && (
                            <button
                                type="button"
                                className="hidden sm:flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <Smile className="h-5 w-5" />
                            </button>
                        )}

                        {/* Nút Voice/Microphone */}
                        {!text && !isGenerating && (
                            <button
                                type="button"
                                className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                                title="Nhập liệu bằng giọng nói"
                            >
                                <Mic className="h-5 w-5" />
                            </button>
                        )}

                        {/* Nút Gửi hoặc Nút Dừng (Stop) */}
                        {isGenerating ? (
                            <button
                                onClick={onStop}
                                className="flex h-9 w-9 items-center justify-center rounded-xl bg-foreground text-background hover:opacity-90 transition-all animate-in zoom-in"
                                title="Dừng phản hồi"
                            >
                                <Square className="h-4 w-4 fill-current" />
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={!text.trim() || disabled}
                                className={cn(
                                    "flex h-9 w-9 items-center justify-center rounded-xl transition-all active:scale-90 shadow-sm",
                                    text.trim()
                                        ? "bg-primary text-primary-foreground hover:shadow-primary/20 hover:shadow-lg"
                                        : "bg-muted text-muted-foreground opacity-50"
                                )}
                                title="Gửi tin nhắn"
                            >
                                <Send className={cn("h-4 w-4 transition-transform", text.trim() && "-rotate-12 translate-x-0.5")} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Chân trang mini bên trong input (Shortcut hint) */}
                <div className="flex items-center justify-between px-4 pb-2 text-[10px] text-muted-foreground/50 font-medium select-none">
                    <div className="flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        <span>EduSolve AI Pro</span>
                    </div>
                    <div className="hidden sm:block">
                        Sử dụng <span className="px-1 py-0.5 rounded border border-border bg-muted/50">Shift + Enter</span> để xuống dòng
                    </div>
                </div>
            </div>
        </div>
    );
};