import { useState } from "react";
import {
    Calculator, Sigma, Variable, FunctionSquare,
    Divide, Equal, Delete, Sparkles, Binary, Copy
} from "lucide-react";
import { cn } from "@/lib/utils";

// Hằng số Toán học
const MATH_CONSTANTS = [
    { name: "Số Pi", symbol: "π", value: "3.14159..." },
    { name: "Số Euler", symbol: "e", value: "2.71828..." },
    { name: "Tỷ lệ vàng", symbol: "φ", value: "1.61803..." },
];

// Các phím máy tính nâng cao
const ADVANCED_BUTTONS = [
    "sin", "cos", "tan", "√",
    "x²", "log", "π", "e",
    "7", "8", "9", "÷",
    "4", "5", "6", "×",
    "1", "2", "3", "−",
    "0", ".", "=", "+"
];

// Ký hiệu toán học chuyên sâu để tham khảo
const MATH_SYMBOLS = ["∞", "∫", "∑", "∆", "≈", "≠", "≤", "≥", "∂", "∇"];

export const MathSidebar = () => {
    const [display, setDisplay] = useState("0");
    const [prevVal, setPrevVal] = useState<number | null>(null);
    const [op, setOp] = useState<string | null>(null);

    const handleCalc = (btn: string) => {
        if (!isNaN(Number(btn)) || btn === ".") {
            setDisplay((d) => (d === "0" ? btn : d + btn));
        } else if (btn === "π") {
            setDisplay(Math.PI.toFixed(6));
        } else if (btn === "e") {
            setDisplay(Math.E.toFixed(6));
        } else if (["÷", "×", "−", "+"].includes(btn)) {
            setPrevVal(parseFloat(display));
            setOp(btn);
            setDisplay("0");
        } else if (btn === "=" && prevVal !== null && op) {
            const cur = parseFloat(display);
            let result = 0;
            if (op === "+") result = prevVal + cur;
            if (op === "−") result = prevVal - cur;
            if (op === "×") result = prevVal * cur;
            if (op === "÷") result = cur !== 0 ? prevVal / cur : 0;
            setDisplay(String(parseFloat(result.toFixed(6))));
            setPrevVal(null);
            setOp(null);
        } else if (["sin", "cos", "tan", "√", "x²", "log"].includes(btn)) {
            const val = parseFloat(display);
            let res = 0;
            if (btn === "sin") res = Math.sin(val);
            if (btn === "cos") res = Math.cos(val);
            if (btn === "tan") res = Math.tan(val);
            if (btn === "√") res = Math.sqrt(val);
            if (btn === "x²") res = Math.pow(val, 2);
            if (btn === "log") res = Math.log10(val);
            setDisplay(String(parseFloat(res.toFixed(6))));
        }
    };

    const clearCalc = () => {
        setDisplay("0");
        setPrevVal(null);
        setOp(null);
    };

    return (
        <div className="flex flex-col gap-6 p-5 animate-in slide-in-from-right duration-700 h-full font-chakra">

            {/* 1. ACADEMIC CALCULATOR */}
            <div className="rounded-3xl border border-rose-100 bg-white/60 p-4 shadow-xl shadow-rose-100/20 backdrop-blur-md">
                <div className="flex items-center justify-between mb-4 px-1">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-rose-500 rounded-lg shadow-lg shadow-rose-200">
                            <Calculator className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-[11px] font-bold text-rose-600 uppercase tracking-widest">Academic Calc</span>
                    </div>
                    <button onClick={clearCalc} className="text-[10px] font-black text-rose-400 hover:text-rose-600 transition-colors uppercase">
                        AC
                    </button>
                </div>

                <div className="rounded-2xl bg-slate-900/5 px-4 py-3 mb-4 text-right font-chakra text-xl font-bold text-slate-800 truncate border border-slate-100 shadow-inner">
                    {display}
                </div>

                <div className="grid grid-cols-4 gap-1.5">
                    {ADVANCED_BUTTONS.map((btn) => (
                        <button
                            key={btn}
                            onClick={() => handleCalc(btn)}
                            className={cn(
                                "h-10 rounded-xl text-[12px] font-bold transition-all active:scale-90 flex items-center justify-center",
                                "÷×−+=".includes(btn)
                                    ? "bg-rose-500 text-white shadow-lg shadow-rose-200"
                                    : "sin cos tan √ x² log π e".includes(btn)
                                        ? "bg-rose-50 text-rose-600 border border-rose-100/50 hover:bg-rose-100"
                                        : "bg-white text-slate-600 border border-slate-100 hover:border-rose-200 hover:text-rose-500 shadow-sm"
                            )}
                        >
                            {btn}
                        </button>
                    ))}
                </div>
            </div>

            {/* 2. MATHEMATICAL CONSTANTS */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                    <Binary className="h-4 w-4 text-rose-400" />
                    <span className="text-[11px] font-black text-rose-500/60 uppercase tracking-widest">Key Constants</span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                    {MATH_CONSTANTS.map((c) => (
                        <div key={c.symbol} className="flex items-center justify-between p-3 rounded-2xl bg-white/40 border border-rose-100/30 group hover:bg-white transition-all cursor-default">
                            <div className="flex items-center gap-3">
                                <span className="text-lg font-black text-rose-500 bg-rose-50 h-8 w-8 flex items-center justify-center rounded-xl">{c.symbol}</span>
                                <div>
                                    <p className="text-[11px] font-bold text-slate-700 leading-none">{c.name}</p>
                                    <p className="text-[9px] text-slate-400 font-medium mt-1">{c.value}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 3. SYMBOL PALETTE */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                    <Sigma className="h-4 w-4 text-rose-400" />
                    <span className="text-[11px] font-black text-rose-500/60 uppercase tracking-widest">Special Symbols</span>
                </div>
                <div className="flex flex-wrap gap-2">
                    {MATH_SYMBOLS.map((sym) => (
                        <button key={sym} className="h-9 w-9 flex items-center justify-center rounded-xl bg-white/60 border border-rose-50 text-slate-600 font-bold hover:border-rose-400 hover:text-rose-500 hover:bg-white hover:shadow-lg hover:shadow-rose-100 transition-all active:scale-90">
                            {sym}
                        </button>
                    ))}
                </div>
            </div>

            {/* 4. ACADEMIC BADGE FOOTER */}
            <div className="mt-auto pt-6 border-t border-rose-100/20">
                <div className="p-4 rounded-[2rem] bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-xl shadow-rose-200 relative overflow-hidden group">
                    <Sparkles className="absolute -top-1 -right-1 h-12 w-12 text-white/10 group-hover:scale-150 transition-transform duration-1000" />
                    <div className="relative z-10">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-1">Xaxi Academic</p>
                        <p className="text-[11px] font-medium leading-relaxed italic opacity-95">"Toán học là ngôn ngữ của vũ trụ."</p>
                    </div>
                </div>
            </div>
        </div>
    );
};