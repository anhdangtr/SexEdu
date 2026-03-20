import { useState, useRef, useEffect } from "react";
import { Send, Paperclip } from "lucide-react";
import { useMode } from "@/contexts/ModeContext";

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export const ChatInput = ({ onSend, disabled }: ChatInputProps) => {
  const [text, setText] = useState("");
  const { mode } = useMode();
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const placeholder =
    mode === "safe"
      ? "Hỏi bất cứ điều gì về sức khỏe, cơ thể, hoặc các mối quan hệ..."
      : "Nhập bài toán hoặc câu hỏi toán học...";

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, [mode]);

  return (
    <div className="flex items-end gap-3 rounded-2xl border border-border bg-card px-3 py-3 mode-transition shadow-lg shadow-background/50">
      <button
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent transition-colors active:scale-95"
        title="Attach file"
      >
        <Paperclip className="h-4 w-4" />
      </button>
      <textarea
        ref={inputRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        rows={1}
        className="flex-1 resize-none bg-transparent px-2 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50"
        style={{ maxHeight: 160 }}
      />
      <button
        onClick={handleSubmit}
        disabled={!text.trim() || disabled}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-all hover:opacity-90 active:scale-95 disabled:opacity-30"
      >
        <Send className="h-4 w-4" />
      </button>
    </div>
  );
};
