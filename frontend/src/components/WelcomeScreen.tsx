import { useMode } from "@/contexts/ModeContext";
import { cn } from "@/lib/utils";
import React from "react";

// --- Hệ thống Icons Inline (Đảm bảo hiển thị 100% không lỗi) ---
const Svg = ({ children, className, ...props }: any) => (
    <svg className={className} width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
        {children}
    </svg>
);
const Shield = (p: any) => <Svg {...p}><path d="M12 2l7 4v6c0 5-3 9-7 11-4-2-7-6-7-11V6l7-4z" /></Svg>;
const Lock = (p: any) => <Svg {...p}><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V8a5 5 0 0 1 10 0v3" /></Svg>;
const Heart = (p: any) => <Svg {...p}><path d="M20.8 4.6a5 5 0 0 0-7.1 0L12 6.3l-1.7-1.7a5 5 0 0 0-7.1 7.1L12 21l8.8-9.3a5 5 0 0 0 0-7.1z" /></Svg>;
const Sigma = (p: any) => <Svg {...p}><path d="M18 3H6l6 9-6 9h12" /></Svg>;
const Brain = (p: any) => <Svg {...p}><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.54zM14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.54z" /></Svg>;
const TrendingUp = (p: any) => <Svg {...p}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></Svg>;
const Sparkles = (p: any) => <Svg {...p}><path d="M12 3l1.91 5.81L21 10.75l-5.12 3.83L17.79 21 12 17.25 6.21 21l1.91-6.42L3 10.75l7.09-1.94L12 3z" /></Svg>;
const Zap = (p: any) => <Svg {...p}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></Svg>;
const Info = (p: any) => <Svg {...p}><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></Svg>;

interface WelcomeScreenProps {
    onPromptClick: (text: string) => void;
}

const SAFE_PROMPTS = [
    { icon: Heart, text: "Sức khỏe tâm thần", desc: "Cách cân bằng cảm xúc và giảm áp lực?", color: "text-rose-500", bg: "bg-rose-50" },
    { icon: Lock, text: "Trao đổi nhạy cảm", desc: "Cách mở lời với người thân về vấn đề khó nói.", color: "text-pink-500", bg: "bg-pink-50" },
    { icon: Shield, text: "Mối quan hệ", desc: "Dấu hiệu của một mối quan hệ lành mạnh.", color: "text-fuchsia-500", bg: "bg-fuchsia-50" },
    { icon: Sparkles, text: "Lời khuyên cá nhân", desc: "Làm sao để tự tin hơn vào bản thân?", color: "text-rose-400", bg: "bg-rose-50/50" },
];

const MATH_PROMPTS = [
    { icon: Brain, text: "Giải phương trình", desc: "Giải nhanh phương trình: x² - 5x + 6 = 0", color: "text-rose-500", bg: "bg-rose-50" },
    { icon: TrendingUp, text: "Đạo hàm & Tích phân", desc: "Tính đạo hàm hàm số phức hợp f(x)", color: "text-pink-500", bg: "bg-pink-50" },
    { icon: Sigma, text: "Định lý toán học", desc: "Giải thích định lý Pythagoras và ứng dụng.", color: "text-fuchsia-500", bg: "bg-fuchsia-50" },
    { icon: Zap, text: "Mẹo giải nhanh", desc: "Các hằng đẳng thức đáng nhớ thường dùng.", color: "text-rose-400", bg: "bg-rose-50/50" },
];

export const WelcomeScreen = ({ onPromptClick }: WelcomeScreenProps) => {
    const { mode } = useMode();
    const isSafe = mode === "safe";
    const prompts = isSafe ? SAFE_PROMPTS : MATH_PROMPTS;

    return (
        /* Giảm mt-32 xuống mt-12 để các element gần nhau hơn */
        <div className="flex flex-col items-center w-full max-w-5xl mx-auto animate-in fade-in duration-700 mt-12 px-6">

            {/* 1. Badge: Giảm mb-16 xuống mb-6 */}
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-50/80 border border-rose-100 mb-6 shadow-sm shrink-0 w-fit">
                <Sparkles className="h-3.5 w-3.5 text-rose-500 animate-pulse" />
                <span className="text-[10px] font-chakra font-bold uppercase tracking-[0.25em] text-rose-500 whitespace-nowrap">
                    Sase AI Pro v2.0
                </span>
            </div>

            {/* 2. Hero Section: Giảm mb-20 xuống mb-8 và min-h xuống 120px */}
            <div className="text-center mb-8 font-chakra w-full min-h-[120px] flex flex-col items-center justify-center">
                <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-foreground mb-4 leading-tight whitespace-nowrap transition-all duration-500 uppercase">
                    {isSafe ? (
                        <span>Chào bạn! Tôi có thể <span className="bg-gradient-to-r from-rose-500 to-pink-600 bg-clip-text text-transparent font-black">giúp</span> gì?</span>
                    ) : (
                        <span>Hệ thống <span className="bg-gradient-to-r from-rose-500 to-pink-600 bg-clip-text text-transparent font-black">Giải toán</span> chuyên sâu</span>
                    )}
                </h1>
                <p className="text-muted-foreground text-[10px] md:text-xs font-medium opacity-60 font-sans whitespace-nowrap tracking-widest uppercase">
                    {isSafe
                        ? "Không gian riêng tư để bạn khám phá và nhận lời khuyên khoa học nhất."
                        : "Sẵn sàng hỗ trợ bạn chinh phục mọi bài toán khó từ đại số đến hình học."}
                </p>
            </div>

            {/* 3. Grid Prompts: Giảm mb-24 xuống mb-10 */}
            <div className="grid w-full gap-4 sm:grid-cols-2 px-2 mb-10">
                {prompts.map((p, i) => (
                    <button
                        key={i}
                        onClick={() => onPromptClick(p.desc)}
                        className="group relative flex items-center p-4 rounded-2xl border border-rose-100/30 bg-white/40 hover:border-rose-300 hover:bg-white hover:shadow-lg transition-all duration-300 text-left h-[75px]"
                    >
                        <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl mr-4 shadow-sm transition-transform group-hover:scale-110", p.bg, p.color)}>
                            <p.icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                            <h3 className="font-chakra font-bold text-foreground text-[13px] leading-tight mb-0.5 uppercase tracking-wide truncate">{p.text}</h3>
                            <p className="text-[10px] text-muted-foreground line-clamp-1 opacity-60 font-sans italic">{p.desc}</p>
                        </div>
                    </button>
                ))}
            </div>

            {/* 4. Footer Features: Giảm padding và gap */}
            <div className="flex items-center gap-8 py-6 border-t border-rose-100/20 w-full justify-center">
                <div className="flex items-center gap-2 text-rose-500/30 hover:text-rose-500/60 transition-colors cursor-default">
                    <Shield className="h-4 w-4" />
                    <span className="text-[9px] font-chakra font-bold uppercase tracking-[0.2em]">Bảo mật</span>
                </div>
                <div className="flex items-center gap-2 text-rose-500/30 hover:text-rose-500/60 transition-colors cursor-default">
                    <Zap className="h-4 w-4" />
                    <span className="text-[9px] font-chakra font-bold uppercase tracking-[0.2em]">Xử lý nhanh</span>
                </div>
                <div className="flex items-center gap-2 text-rose-500/30 hover:text-rose-500/60 transition-colors cursor-default">
                    <Info className="h-4 w-4" />
                    <span className="text-[9px] font-chakra font-bold uppercase tracking-[0.2em]">Chính xác</span>
                </div>
            </div>
        </div>
    );
};
