import { useMode } from "@/contexts/ModeContext";
import { Shield, Sigma, User, Star, ChevronRight } from "lucide-react"; // Thêm icon cho đầu dòng
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
            .replace(/\\\[([\s\S]*?)\\\]/g, (_, eq) => `\n$$\n${eq.trim()}\n$$\n`)
            .replace(/\\\(([\s\S]*?)\\\)/g, (_, eq) => `$${eq.trim()}$`)
            .replace(/\$\s+/g, "$")
            .replace(/\s+\$/g, "$");
    };

    const theme = {
        primary: "bg-rose-500",
        userBubble: "bg-gradient-to-br from-rose-500 to-fuchsia-600 shadow-rose-200",
        aiBubble: "bg-white border-rose-100 shadow-sm",
        textAi: "text-rose-600",
        label: "text-rose-500/40",
    };

    return (
        <div
            className={`flex w-full mb-8 gap-3 animate-in fade-in slide-in-from-bottom-3 duration-500 ${isAssistant ? "justify-start" : "justify-end"
                }`}
            style={{ animationDelay: `${Math.min(index * 50, 300)}ms` }}
        >
            <div className={`flex max-w-[88%] sm:max-w-[82%] gap-3 ${isAssistant ? "flex-row" : "flex-row-reverse"}`}>

                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl shadow-md
                    ${isAssistant ? "bg-white border border-rose-100" : theme.primary}`}>
                    {isAssistant ? (
                        isSafe ? <Shield className="h-5 w-5 text-rose-500" /> : <Sigma className="h-5 w-5 text-rose-500" />
                    ) : (
                        <User className="h-5 w-5 text-white" />
                    )}
                </div>

                <div className={`flex flex-col ${isAssistant ? "items-start" : "items-end"}`}>
                    <div className="flex items-center gap-1.5 mb-1.5 px-2">
                        <span className={`text-[9px] font-bold uppercase tracking-[0.25em] ${theme.label}`}>
                            {isAssistant ? (isSafe ? "Sase Wellness Intelligence" : "Sase Academic Engine") : "Authorized User"}
                        </span>
                    </div>

                    <div className={`relative px-6 py-4 rounded-[1.8rem] border transition-all duration-300
                        ${isAssistant
                            ? `${theme.aiBubble} text-slate-800 rounded-tl-none`
                            : `${theme.userBubble} text-white border-transparent rounded-tr-none shadow-lg`
                        }`}>

                        <div className={`prose prose-sm max-w-none break-words leading-relaxed font-sans
                            ${isAssistant ? "prose-rose text-slate-800" : "prose-invert text-white"}`}>

                            <ReactMarkdown
                                remarkPlugins={[remarkMath]}
                                rehypePlugins={[rehypeKatex]}
                                components={{
                                    p: ({ children }) => <p className="mb-4 last:mb-0 leading-relaxed">{children}</p>,

                                    // --- CUSTOM LISTS FOR PROFESSIONAL LOOK ---
                                    ul: ({ children }) => <ul className="space-y-3 mb-4 list-none p-0">{children}</ul>,
                                    ol: ({ children }) => <ol className="space-y-3 mb-4 list-none p-0 [counter-reset:section]">{children}</ol>,

                                    li: ({ children, ...props }) => {
                                        const isOrdered = (props as any).ordered;
                                        return (
                                            <li className="flex items-start gap-3 group">
                                                {isOrdered ? (
                                                    <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[10px] font-black border transition-colors
                                                        ${isAssistant ? "bg-rose-50 border-rose-100 text-rose-500" : "bg-white/20 border-white/30 text-white"}`}>
                                                        {(props as any).index + 1 || "•"}
                                                    </span>
                                                ) : (
                                                    <ChevronRight className={`h-3 w-3 mt-1.5 shrink-0 transition-transform group-hover:translate-x-0.5 
                                                        ${isAssistant ? "text-rose-400" : "text-rose-200"}`}
                                                    />
                                                )}
                                                <span className="flex-1">{children}</span>
                                            </li>
                                        );
                                    },

                                    // --- MATH STYLING ---
                                    div: ({ node, className, children, ...props }) => {
                                        if (className?.includes('math-display')) {
                                            return (
                                                <div className="my-5 py-5 px-3 overflow-x-auto bg-rose-50/20 rounded-2xl border border-rose-100/50 text-center shadow-inner select-all" {...props}>
                                                    {children}
                                                </div>
                                            );
                                        }
                                        return <div className={className} {...props}>{children}</div>;
                                    },

                                    strong: ({ children }) => <strong className={`font-black ${isAssistant ? "text-rose-600" : "text-white"}`}>{children}</strong>,

                                    code: ({ children }) => (
                                        <code className="bg-rose-100/40 text-rose-600 px-1.5 py-0.5 rounded text-[11px] font-mono font-bold border border-rose-200/30">
                                            {children}
                                        </code>
                                    )
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
