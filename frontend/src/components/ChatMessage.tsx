import { useMode } from "@/contexts/ModeContext";
import { Shield, Sigma, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

interface ChatMessageProps {
    role: "user" | "assistant";
    content: string;
    index: number;
}

export const ChatMessage = ({ role, content, index }: ChatMessageProps) => {
    const { mode } = useMode();
    const isAssistant = role === "assistant";
    const isSafe = mode === "safe";

    const formatMathContent = (text: string) => {
        if (!text) return "";

        return text
            .replace(/\\\[/g, "$$$")
            .replace(/\\\]/g, "$$$")
            .replace(/\\\(/g, "$")
            .replace(/\\\)/g, "$")
            .replace(/^\s*\[/gm, "$$$")
            .replace(/\]\s*$/gm, "$$$")
            .replace(/^\s*\(/gm, "$")
            .replace(/\)\s*$/gm, "$");
    };

    const theme = {
        primary: "bg-rose-500",
        userBubble: "bg-gradient-to-br from-rose-500 to-fuchsia-500 shadow-rose-200",
        aiBubble: "bg-white border-rose-100/50 shadow-sm",
        textAi: "text-rose-600",
        label: "text-rose-500/40",
    };

    return (
        <div
            className={`flex w-full mb-10 gap-3 animate-in fade-in slide-in-from-bottom-5 duration-700 ${isAssistant ? "justify-start" : "justify-end"}`}
            style={{ animationDelay: `${Math.min(index * 50, 300)}ms` }}
        >
            <div className={`flex max-w-[85%] sm:max-w-[80%] gap-3 ${isAssistant ? "flex-row" : "flex-row-reverse"}`}>
                <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl shadow-lg transition-all duration-500 ${isAssistant ? "bg-white border border-rose-100/50" : theme.primary
                        }`}
                >
                    {isAssistant ? (
                        isSafe ? <Shield className="h-5 w-5 text-rose-500" /> : <Sigma className="h-5 w-5 text-rose-500" />
                    ) : (
                        <User className="h-5 w-5 text-white" />
                    )}
                </div>

                <div className={`flex flex-col ${isAssistant ? "items-start" : "items-end"}`}>
                    <div className="flex items-center gap-1.5 mb-2 px-1">
                        <span className={`text-[10px] font-outfit font-black uppercase tracking-[0.2em] ${theme.label}`}>
                            {isAssistant ? (isSafe ? "Sase Health AI" : "Sase Academic AI") : "You"}
                        </span>
                    </div>

                    <div
                        className={`relative px-6 py-4 rounded-[2rem] border transition-all duration-500 ${isAssistant
                            ? `${theme.aiBubble} text-foreground/90 rounded-tl-none`
                            : `${theme.userBubble} text-white border-transparent rounded-tr-none shadow-xl`
                            }`}
                    >
                        <div
                            className={`prose prose-sm max-w-none break-words leading-relaxed font-chakra ${isAssistant ? "prose-rose text-foreground/90" : "prose-invert text-white"
                                }`}
                        >
                            <ReactMarkdown
                                remarkPlugins={[remarkMath]}
                                rehypePlugins={[rehypeKatex]}
                                components={{
                                    p: ({ children }) => <p className="mb-3 last:mb-0 tracking-tight">{children}</p>,
                                    h2: ({ children }) => (
                                        <h2 className={`text-base font-black mt-5 mb-2 tracking-tight ${isAssistant ? theme.textAi : "text-white"}`}>
                                            {children}
                                        </h2>
                                    ),
                                    h3: ({ children }) => (
                                        <h3 className={`text-sm font-bold uppercase mt-4 mb-2 tracking-widest ${isAssistant ? theme.textAi : "text-white"}`}>
                                            {children}
                                        </h3>
                                    ),
                                    ul: ({ children }) => (
                                        <ul className="my-3 space-y-1.5 pl-5 list-disc marker:text-rose-400">
                                            {children}
                                        </ul>
                                    ),
                                    ol: ({ children }) => (
                                        <ol className="my-3 space-y-1.5 pl-5 list-decimal marker:text-rose-400">
                                            {children}
                                        </ol>
                                    ),
                                    li: ({ children }) => <li className="pl-1">{children}</li>,
                                    div: ({ node, ...props }) => {
                                        if (node?.tagName === "div" && (props as { className?: string }).className?.includes("math-display")) {
                                            return <div className="overflow-x-auto py-3 my-4 bg-rose-50/50 rounded-2xl border border-rose-100/30" {...props} />;
                                        }

                                        return <div {...props} />;
                                    },
                                    strong: ({ children }) => (
                                        <strong className={`font-black ${isAssistant ? theme.textAi : "text-white"}`}>{children}</strong>
                                    ),
                                    code: ({ children }) => (
                                        <code className="bg-rose-50 text-rose-600 px-1.5 py-0.5 rounded-md text-xs font-mono">{children}</code>
                                    ),
                                }}
                            >
                                {formatMathContent(content)}
                            </ReactMarkdown>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
