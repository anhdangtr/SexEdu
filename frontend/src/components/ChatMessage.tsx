import { useMode } from "@/contexts/ModeContext";
import { Shield, Sigma, User, ChevronRight, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
    role: "user" | "assistant";
    content: string;
    index: number;
}

const SECTION_LABELS = [
    "Solution",
    "Answer",
    "Note",
    "Example",
    "Rewrite",
    "Final Answer",
    "Key Idea",
    "Quick Take",
    "Why It Matters",
    "Identify coefficients",
    "Try factoring",
    "Set each factor",
    "Solve for x",
];

const formatContent = (text: string) => {
    if (!text) return "";

    const labelPattern = SECTION_LABELS.join("|");
    const inlineStepPattern = /(Step\s*\d+|Solution|Answer|Note|Example|Rewrite|Final\s*Answer|Key\s*Idea|Quick\s*Take|Why\s*It\s*Matters|Identify coefficients|Try factoring|Set each factor|Solve for x)\s*:/gi;
    const normalizeMathLines = (value: string) =>
        value
            .replace(/[−–]/g, "-")
            .replace(/\n-\n(?=\d)/g, "\n-")
            .replace(/\n-\n(?=\()/g, "\n-")
            .replace(/([=+*/x×])\s*\n-\n(?=\d)/g, "$1 -")
            .replace(/(^|\n)-\s*(?=-?\d|-?\(|x|[A-Za-z]\s*=)/g, "$1\\- ")
            .replace(/(^|\n)-\s*(?=-\d|-x|-\()/g, "$1\\- ")
            .replace(/(^|\n)(-?\d+\s*[x×*/+=]\s*-?\d+\s*=\s*-?\d+)\s*$/gm, "$1$2")
            .replace(/(^|\n)(-?\d+\s*[+]\s*-?\d+\s*=\s*-?\d+)\s*$/gm, "$1$2");
    const normalizeTheorySections = (value: string) =>
        value
            .replace(/(^|\n)(Key points?|Main ideas?|Important points?|What this means|Why it matters|Takeaway|Quick takeaway):/gim, "$1### $2\n")
            .replace(/(^|\n)(Example|Examples|Summary|In short|Bottom line):/gim, "$1### $2\n");

    return normalizeTheorySections(normalizeMathLines(text))
        // Add spacing around math so formulas never stick to nearby words.
        .replace(/([A-Za-z0-9,.;:])(?=(\\\(|\\\[))/g, "$1 ")
        .replace(/([A-Za-z0-9]):(?=(\\\(|\\\[|\$))/g, "$1: ")
        .replace(/([A-Za-z])(?=(\\\(|\\\[|\$))/g, "$1 ")
        .replace(/(?<=(\\\)|\\\]|\$))(?:\s*)([A-Za-z])/g, " $2")
        .replace(/(?<=(\\\)|\\\]))(?=[A-Za-z0-9])/g, " ")
        .replace(/([A-Za-z0-9])(?=\$[A-Za-z\\])/g, "$1 ")
        .replace(/([A-Za-z0-9])(?=([a-z])\s*=\s*\$)/g, "$1 ")
        .replace(/\\\[([\s\S]*?)\\\]/g, (_, eq) => `\n\n$$\n${eq.trim()}\n$$\n\n`)
        .replace(/\\\(([\s\S]*?)\\\)/g, (_, eq) => ` $${eq.trim()}$ `)
        .replace(/\$\s+/g, "$")
        .replace(/\s+\$/g, "$")
        .replace(/(?<=\$)(-)\s*(?=\d)/g, "$1")
        .replace(/([A-Za-z])(?=\$[^$\n]+\$)/g, "$1 ")
        .replace(/(\$[^$\n]+\$)(?=[A-Za-z])/g, "$1 ")
        .replace(/([A-Za-z])(?=\$\$)/g, "$1 ")
        .replace(/(\$\$[\s\S]*?\$\$)(?=[A-Za-z])/g, "$1 ")
        .replace(/(\$[^$\n]+\$)\s*(if|and|or|where|when|because|so|thus|therefore|approaches|is|are|holds)\b/gi, "$1 $2")
        .replace(/\b([A-Za-z])(?=(if|and|or|where|when|because|so|thus|therefore|approaches|is|are|holds)\b)/gi, "$1 ")
        .replace(/([0-9A-Za-z])(?=([a-z])\s*=\s*[0-9A-Za-z])/g, "$1 ")
        .replace(/([A-Za-z0-9])(?=\\frac|\\int|\\sum|\\prod|\\sqrt|\\ln|\\sin|\\cos|\\tan)/g, "$1 ")
        .replace(/(\$[^$\n]+\$)\s*([,.;:])/g, "$1$2")
        .replace(/([,.;:])(?=\$)/g, "$1 ")
        .replace(/\*\*(\s*Step\s*\d+\s*:?\s*|\s*Solution\s*:?\s*|\s*Answer\s*:?\s*|\s*Note\s*:?\s*|\s*Example\s*:?\s*|\s*Rewrite\s*:?\s*|\s*Final\s*Answer\s*:?\s*|\s*Key\s*Idea\s*:?\s*|\s*Quick\s*Take\s*:?\s*|\s*Why\s*It\s*Matters\s*:?\s*)\*\*/gi, (_, label) => `\n\n${label.trim()}\n\n`)
        .replace(/([A-Za-z0-9).])/g, "$1")
        .replace(/(\S)(Step\s*\d+\s*:)/gi, "$1\n\n$2")
        .replace(/(\S)(Final\s*Answer\s*:|Answer\s*:|Solution\s*:|Note\s*:|Example\s*:|Rewrite\s*:|Key\s*Idea\s*:|Quick\s*Take\s*:|Why\s*It\s*Matters\s*:)/gi, "$1\n\n$2")
        .replace(/(\$\$[\s\S]*?\$\$|\$[^$\n]+\$)\s*(Step\s*\d+\s*:|Final\s*Answer\s*:|Answer\s*:|Solution\s*:|Note\s*:|Example\s*:|Rewrite\s*:|Key\s*Idea\s*:|Quick\s*Take\s*:|Why\s*It\s*Matters\s*:)/gi, "$1\n\n$2")
        .replace(inlineStepPattern, (match) => `\n\n${match.trim()}\n\n`)
        .replace(
            new RegExp(
                `(^|\\n+)(\\*\\*)?(Step\\s*\\d+|${labelPattern})(\\*\\*)?:`,
                "gim"
            ),
            (_, prefix, __, label) => `${prefix}\n### ${label}\n\n`
        )
        .replace(/\*\*/g, "")
        .replace(/([^\n])\s*>/g, "$1\n\n>")
        .replace(/\\-\s+(-?\d|\()/g, "-$1")
        .replace(/\\-\s+([A-Za-z])/g, "- $1")
        .replace(/(^|\n)(\s*)([-*])\s+\*\*([^*]+)\*\*:/gm, "$1$2- **$4:**")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
};

export const ChatMessage = ({ role, content, index }: ChatMessageProps) => {
    const { mode } = useMode();
    const isAssistant = role === "assistant";
    const isSafe = mode === "safe";
    const isTheoryCardStyle = isAssistant && isSafe;

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
            className={cn(
                "mb-8 flex w-full gap-3 animate-in fade-in slide-in-from-bottom-3 duration-500",
                isAssistant ? "justify-start" : "justify-end"
            )}
            style={{ animationDelay: `${Math.min(index * 50, 300)}ms` }}
        >
            <div className={cn("flex max-w-[88%] gap-3 sm:max-w-[82%]", isAssistant ? "flex-row" : "flex-row-reverse")}>
                <div
                    className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl shadow-md transition-transform hover:scale-105",
                        isAssistant ? "border border-rose-100 bg-white" : theme.primary
                    )}
                >
                    {isAssistant ? (
                        isSafe ? <Shield className="h-5 w-5 text-rose-500" /> : <Sigma className="h-5 w-5 text-rose-500" />
                    ) : (
                        <User className="h-5 w-5 text-white" />
                    )}
                </div>

                <div className={cn("flex flex-col", isAssistant ? "items-start" : "items-end")}>
                    <div className="mb-1.5 flex items-center gap-1.5 px-2">
                        <span className={cn("text-[9px] font-black uppercase tracking-[0.25em]", theme.label)}>
                            {isAssistant ? (isSafe ? "Sase Wellness Intelligence" : "Sase Academic Engine") : "YOU"}
                        </span>
                    </div>

                    <div
                        className={cn(
                            "relative rounded-[1.8rem] border px-6 py-4 transition-all duration-300",
                            isAssistant
                                ? `${theme.aiBubble} rounded-tl-none text-slate-800`
                                : `${theme.userBubble} rounded-tr-none border-transparent text-white shadow-lg`
                        )}
                    >
                        {isTheoryCardStyle && (
                            <div className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-rose-200 to-transparent" />
                        )}
                        <div
                            className={cn(
                                "prose prose-sm max-w-none break-words font-sans",
                                isAssistant ? "prose-rose text-slate-700" : "prose-invert text-white",
                                isTheoryCardStyle && "prose-p:leading-8 prose-p:text-[15.5px]"
                            )}
                        >
                            <ReactMarkdown
                                remarkPlugins={[remarkMath]}
                                rehypePlugins={[rehypeKatex]}
                                components={{
                                    p: ({ children }) => (
                                        <p
                                            className={cn(
                                                "mb-4 text-[15px] leading-[1.8] last:mb-0",
                                                isTheoryCardStyle && "text-[15.5px] leading-8 text-slate-700"
                                            )}
                                        >
                                            {children}
                                        </p>
                                    ),
                                    h1: ({ children }) => (
                                        <h1 className={cn(
                                            "mb-4 mt-6 text-[1.1rem] font-black tracking-tight first:mt-0",
                                            isAssistant ? "text-slate-900" : "text-white",
                                            isTheoryCardStyle && "text-[1.2rem] leading-tight"
                                        )}>
                                            {children}
                                        </h1>
                                    ),
                                    h2: ({ children }) => (
                                        <h2 className={cn(
                                            "mb-3 mt-6 border-l-4 pl-3 text-[1rem] font-black tracking-tight first:mt-0",
                                            isAssistant ? "border-rose-300 text-slate-900" : "border-white/50 text-white"
                                        )}>
                                            {children}
                                        </h2>
                                    ),
                                    h3: ({ children }) => (
                                        <h3
                                            className={cn(
                                                "mb-3 mt-5 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[12px] font-black uppercase tracking-[0.16em] first:mt-0",
                                                isAssistant
                                                    ? "bg-rose-50 text-rose-700 ring-1 ring-rose-100"
                                                    : "bg-white/15 text-white ring-1 ring-white/20",
                                                isTheoryCardStyle && "bg-gradient-to-r from-rose-50 to-orange-50 text-rose-700"
                                            )}
                                        >
                                            {isAssistant && <Sparkles className="h-3.5 w-3.5" />}
                                            {children}
                                        </h3>
                                    ),
                                    blockquote: ({ children }) => (
                                        <div
                                            className={cn(
                                                "my-5 rounded-[1.4rem] border px-4 py-3",
                                                isAssistant
                                                    ? "border-rose-200 bg-gradient-to-r from-rose-50 to-orange-50"
                                                    : "border-white/20 bg-white/10"
                                            )}
                                        >
                                            <div className={cn("flex items-start gap-3", isAssistant ? "text-rose-700" : "text-white")}>
                                                <span
                                                    className={cn(
                                                        "mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                                                        isAssistant ? "bg-white text-rose-500" : "bg-white/15 text-white"
                                                    )}
                                                >
                                                    <ChevronRight className="h-3.5 w-3.5" />
                                                </span>
                                                <div className="min-w-0 flex-1 [&>p]:m-0 [&>p]:leading-7 [&_strong]:font-black">{children}</div>
                                            </div>
                                        </div>
                                    ),
                                    ul: ({ children }) => (
                                        <ul className={cn("mb-4 list-none space-y-3 p-0", isTheoryCardStyle && "space-y-4")}>{children}</ul>
                                    ),
                                    ol: ({ children }) => (
                                        <ol className={cn("mb-4 space-y-3 pl-0", isTheoryCardStyle && "space-y-4")}>{children}</ol>
                                    ),
                                    li: ({ children }) => (
                                        <li
                                            className={cn(
                                                "flex items-start gap-2.5",
                                                isTheoryCardStyle && "rounded-[1.2rem] border border-rose-100 bg-gradient-to-r from-white to-rose-50/60 px-4 py-3 shadow-[0_8px_30px_rgba(244,63,94,0.06)]"
                                            )}
                                        >
                                            <span
                                                className={cn(
                                                    "mt-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                                                    isTheoryCardStyle
                                                        ? "bg-rose-100 text-rose-600 shadow-sm"
                                                        : isAssistant
                                                            ? "text-rose-400"
                                                            : "text-rose-100"
                                                )}
                                            >
                                                <ChevronRight className={cn("h-4 w-4", !isTheoryCardStyle && "opacity-50")} />
                                            </span>
                                            <span className={cn("flex-1 leading-relaxed", isTheoryCardStyle && "text-[15px] leading-7 text-slate-700")}>
                                                {children}
                                            </span>
                                        </li>
                                    ),
                                    div: ({ className, children, ...props }: any) => {
                                        if (className?.includes("math-display")) {
                                            return (
                                                <div
                                                    className="my-6 overflow-x-auto rounded-2xl border border-rose-100/30 bg-slate-50/50 px-4 py-6 text-center shadow-inner"
                                                    {...props}
                                                >
                                                    {children}
                                                </div>
                                            );
                                        }

                                        return (
                                            <div className={className} {...props}>
                                                {children}
                                            </div>
                                        );
                                    },
                                    strong: ({ children }) => (
                                        <strong
                                            className={cn(
                                                "rounded-md px-1.5 py-0.5 font-black",
                                                isAssistant
                                                    ? "bg-rose-100/80 text-slate-950"
                                                    : "bg-white/15 text-white"
                                            )}
                                        >
                                            {children}
                                        </strong>
                                    ),
                                    code: ({ className, children }) => (
                                        <code
                                            className={cn(
                                                "rounded border px-1.5 py-0.5 font-mono text-[11px] font-bold",
                                                className?.includes("language-") && "block overflow-x-auto px-4 py-3 text-left",
                                                isAssistant ? "border-rose-100 bg-rose-50 text-rose-600" : "border-white/20 bg-white/20 text-white"
                                            )}
                                        >
                                            {children}
                                        </code>
                                    ),
                                }}
                            >
                                {formatContent(content)}
                            </ReactMarkdown>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
