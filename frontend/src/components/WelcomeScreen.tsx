import { useMode } from "@/contexts/ModeContext";
import {
    Shield, Lock, Heart, Sigma, Brain, TrendingUp,
    Sparkles, Zap, MessageCircle, Info
} from "lucide-react";
import { cn } from "@/lib/utils";

const SAFE_PROMPTS = [
    {
        icon: Heart,
        text: "Sức khỏe tâm thần",
        desc: "Cách cân bằng cảm xúc và giảm áp lực học tập?",
        color: "text-rose-500",
        bg: "bg-rose-500/10"
    },
    {
        icon: Lock,
        text: "Trao đổi nhạy cảm",
        desc: "Cách mở lời với người thân về vấn đề khó nói.",
        color: "text-blue-500",
        bg: "bg-blue-500/10"
    },
    {
        icon: Shield,
        text: "Mối quan hệ",
        desc: "Dấu hiệu của một mối quan hệ lành mạnh.",
        color: "text-emerald-500",
        bg: "bg-emerald-500/10"
    },
    {
        icon: Sparkles,
        text: "Lời khuyên cá nhân",
        desc: "Làm sao để tự tin hơn vào bản thân?",
        color: "text-amber-500",
        bg: "bg-amber-500/10"
    },
];

const MATH_PROMPTS = [
    {
        icon: Brain,
        text: "Giải phương trình",
        desc: "Giải nhanh phương trình: $x^2 - 5x + 6 = 0$",
        color: "text-indigo-500",
        bg: "bg-indigo-500/10"
    },
    {
        icon: TrendingUp,
        text: "Đạo hàm & Tích phân",
        desc: "Tính đạo hàm hàm số phức hợp $f(x)$",
        color: "text-violet-500",
        bg: "bg-violet-500/10"
    },
    {
        icon: Sigma,
        text: "Định lý toán học",
        desc: "Giải thích định lý Pythagoras và ứng dụng.",
        color: "text-sky-500",
        bg: "bg-sky-500/10"
    },
    {
        icon: Zap,
        text: "Mẹo giải nhanh",
        desc: "Các hằng đẳng thức đáng nhớ.",
        color: "text-orange-500",
        bg: "bg-orange-500/10"
    },
];

interface WelcomeScreenProps {
    onPromptClick: (text: string) => void;
}

export const WelcomeScreen = ({ onPromptClick }: WelcomeScreenProps) => {
    const { mode } = useMode();
    const isSafe = mode === "safe";
    const prompts = isSafe ? SAFE_PROMPTS : MATH_PROMPTS;

    return (
        <div className="flex flex-col items-center w-full max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000">

            {/* Badge */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-6 shadow-sm">
                <Sparkles className="h-3 w-3 text-primary animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-[0.15em] text-primary">
                    EduSolve AI Pro v2.0
                </span>
            </div>

            {/* Hero Section */}
            <div className="text-center mb-10">
                <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-foreground mb-4 leading-[1.1]">
                    {isSafe ? (
                        <span>Chào bạn! Tôi có thể <span className="text-primary italic">giúp</span> gì?</span>
                    ) : (
                        <span>Hệ thống <span className="text-primary italic">Giải toán</span> chuyên sâu</span>
                    )}
                </h1>
                <p className="text-muted-foreground text-xs md:text-sm max-w-md mx-auto font-medium opacity-70">
                    {isSafe
                        ? "Một không gian hoàn toàn riêng tư để bạn khám phá và nhận những lời khuyên khoa học nhất."
                        : "Sẵn sàng hỗ trợ bạn chinh phục mọi bài toán khó từ đại số đến hình học."}
                </p>
            </div>

            {/* Grid Gợi ý (2 cột trên desktop) */}
            <div className="grid w-full gap-3 sm:grid-cols-2 px-4">
                {prompts.map((p, i) => (
                    <button
                        key={i}
                        onClick={() => onPromptClick(p.desc)}
                        className={cn(
                            "group relative flex items-center p-4 rounded-2xl border border-border bg-card/40",
                            "hover:border-primary/40 hover:bg-card hover:shadow-xl hover:-translate-y-0.5",
                            "transition-all duration-300 text-left"
                        )}
                    >
                        <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl mr-4 shadow-sm transition-transform group-hover:scale-110", p.bg, p.color)}>
                            <p.icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                            <h3 className="font-bold text-foreground text-[13px] leading-tight mb-0.5">{p.text}</h3>
                            <p className="text-muted-foreground text-[11px] line-clamp-1 opacity-70">{p.desc}</p>
                        </div>
                    </button>
                ))}
            </div>

            {/* Footer */}
            <div className="mt-10 flex items-center gap-8 text-muted-foreground/30">
                <div className="flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Bảo mật</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Xử lý nhanh</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <Info className="h-3.5 w-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Chính xác</span>
                </div>
            </div>
        </div>
    );
};