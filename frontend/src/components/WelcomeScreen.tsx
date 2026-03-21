import { useMode } from "@/contexts/ModeContext";
import { cn } from "@/lib/utils";
import React from "react";

const Svg = ({ children, className, ...props }: any) => (
    <svg
        className={className}
        width="1em"
        height="1em"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
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
    { icon: Heart, text: "Mental Well-Being", desc: "How to balance emotions and manage stress?", color: "text-rose-500", bg: "bg-rose-50" },
    { icon: Lock, text: "Sensitive Dialogue", desc: "Approaching difficult conversations with loved ones.", color: "text-pink-500", bg: "bg-pink-50" },
    { icon: Shield, text: "Healthy Dynamics", desc: "Identifying green flags in modern relationships.", color: "text-fuchsia-500", bg: "bg-fuchsia-50" },
    { icon: Sparkles, text: "Personal Empowerment", desc: "Strategies to build long-term self-confidence.", color: "text-rose-400", bg: "bg-rose-50/50" },
];

const MATH_PROMPTS = [
    { icon: Brain, text: "Equation Solver", desc: "Solve: x^2 - 5x + 6 = 0 with step-by-step logic.", color: "text-rose-500", bg: "bg-rose-50" },
    { icon: TrendingUp, text: "Calculus & Analysis", desc: "Compute the derivative of complex functions.", color: "text-pink-500", bg: "bg-pink-50" },
    { icon: Sigma, text: "Theoretical Principles", desc: "Explain Pythagorean theorem and its applications.", color: "text-fuchsia-500", bg: "bg-fuchsia-50" },
    { icon: Zap, text: "Rapid Optimization", desc: "Quick methods for solving algebraic identities.", color: "text-rose-400", bg: "bg-rose-50/50" },
];

export const WelcomeScreen = ({ onPromptClick }: WelcomeScreenProps) => {
    const { mode } = useMode();
    const isSafe = mode === "safe";
    const prompts = isSafe ? SAFE_PROMPTS : MATH_PROMPTS;

    return (
        <div className="flex w-full max-w-[780px] flex-col items-center px-3 py-1 animate-in fade-in duration-700 sm:px-4 sm:py-2">
            <div className="mb-3 flex w-fit shrink-0 items-center gap-1.5 rounded-full border border-rose-200 bg-gradient-to-r from-rose-50 to-orange-50 px-3 py-1 shadow-[0_10px_30px_rgba(244,63,94,0.08)] sm:mb-4">
                <Sparkles className="h-2.5 w-2.5 animate-pulse text-rose-500" />
                <span className="whitespace-nowrap text-[8px] font-bold uppercase tracking-[0.2em] text-rose-500 font-chakra sm:text-[8.5px]">
                    Sase AI Intelligence v2.0
                </span>
            </div>

            <div className="mb-6 flex w-full max-w-4xl flex-col items-center justify-center text-center font-chakra sm:mb-7">
                <h1 className="mb-3 max-w-4xl text-balance text-[1.34rem] font-bold uppercase leading-[0.98] tracking-tight text-[#1f2f2f] transition-all duration-500 sm:text-[1.75rem] md:text-[2.1rem]">
                    {isSafe ? (
                        <span>Hello! How can I <span className="bg-gradient-to-r from-rose-500 to-pink-600 bg-clip-text font-black text-transparent">assist</span> you?</span>
                    ) : (
                        <span>Advanced <span className="bg-gradient-to-r from-rose-500 to-pink-600 bg-clip-text font-black text-transparent">Academic</span> Intelligence</span>
                    )}
                </h1>
                <p className="max-w-2xl text-balance font-sans text-[8px] font-medium uppercase tracking-[0.15em] text-slate-400 sm:text-[9px] md:text-[10px]">
                    {isSafe
                        ? "A secure space for evidence-based insights and personal growth."
                        : "Empowering your academic journey with high-precision problem solving."}
                </p>
            </div>

            <div className="mb-6 grid w-full gap-3 sm:mb-7 sm:grid-cols-2">
                {prompts.map((p, i) => (
                    <button
                        key={i}
                        onClick={() => onPromptClick(p.desc)}
                        className="group relative flex min-h-[78px] items-center rounded-[1.2rem] border border-rose-100/60 bg-white/80 px-3 py-3 text-left shadow-[0_12px_34px_rgba(15,23,42,0.03)] transition-all duration-300 hover:-translate-y-0.5 hover:border-rose-200 hover:bg-white hover:shadow-[0_18px_40px_rgba(244,63,94,0.08)]"
                    >
                        <div className={cn("mr-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-[0.85rem] shadow-sm transition-transform group-hover:scale-110", p.bg, p.color)}>
                            <p.icon className="h-3.5 w-3.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h3 className="mb-0.5 text-[0.76rem] font-bold uppercase leading-tight tracking-tight text-[#223030] font-chakra sm:text-[0.8rem]">
                                {p.text}
                            </h3>
                            <p className="line-clamp-2 font-sans text-[0.7rem] italic leading-relaxed text-slate-400 sm:text-[0.74rem]">
                                {p.desc}
                            </p>
                        </div>
                    </button>
                ))}
            </div>

            <div className="flex w-full flex-wrap items-center justify-center gap-x-4 gap-y-2 py-1">
                <div className="flex cursor-default items-center gap-2 text-rose-500 transition-colors hover:text-rose-600">
                    <Shield className="h-2.5 w-2.5 shrink-0" />
                    <span className="text-[7.5px] font-bold uppercase tracking-[0.14em] font-chakra sm:text-[8px]">End-to-End Encryption</span>
                </div>
                <div className="flex cursor-default items-center gap-2 text-rose-500 transition-colors hover:text-rose-600">
                    <Zap className="h-2.5 w-2.5 shrink-0" />
                    <span className="text-[7.5px] font-bold uppercase tracking-[0.14em] font-chakra sm:text-[8px]">Instant Intelligence</span>
                </div>
                <div className="flex cursor-default items-center gap-2 text-rose-500 transition-colors hover:text-rose-600">
                    <Info className="h-2.5 w-2.5 shrink-0" />
                    <span className="text-[7.5px] font-bold uppercase tracking-[0.14em] font-chakra sm:text-[8px]">High-Precision Logic</span>
                </div>
            </div>
        </div>
    );
};
