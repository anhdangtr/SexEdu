import React, { useState } from "react";
import { useMode } from "../contexts/ModeContext";

// 1. IMPORT LOGO CỦA BẠN (Đảm bảo đúng đường dẫn)
import logoUrl from "@/assets/logo.svg";

// --- Icons Mini ---
const Svg = ({ children, className, ...props }: any) => (
    <svg className={className} width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
        {children}
    </svg>
);
const Plus = (p: any) => <Svg {...p}><path d="M12 5v14M5 12h14" /></Svg>;
const MessageSquare = (p: any) => <Svg {...p}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></Svg>;
const Pencil = (p: any) => <Svg {...p}><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" /></Svg>;
const Trash2 = (p: any) => <Svg {...p}><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /></Svg>;
const ChevronRight = (p: any) => <Svg {...p}><path d="M9 6l6 6-6 6" /></Svg>;

export const AppSidebar = () => {
    const { mode, currentSessionId, newChat, selectSession, deleteSession, toggleMode, safeSessions, disguiseSessions } = useMode();
    const isSafe = mode === "safe";
    const sessions = isSafe ? safeSessions : disguiseSessions;

    // --- Elegant Rose Theme ---
    const theme = {
        primary: "bg-rose-500 shadow-xl shadow-rose-200",
        text: "text-rose-600",
        bg: "bg-[#fffcfc]",
        glass: "bg-white/70 backdrop-blur-xl border-rose-100/40",
        active: "bg-white shadow-sm ring-1 ring-rose-100/50"
    };

    const [hoveredId, setHoveredId] = useState<string | null>(null);

    return (
        <div className={`flex h-full w-[290px] flex-col transition-all duration-700 ease-in-out border-r shadow-[20px_0_40px_rgba(0,0,0,0.02)] ${theme.bg}`}>

            {/* 1. HEADER & LOGO: Đã phóng to lên 72px và bo tròn hoàn thiện */}
            <div className="group px-8 pt-10 pb-8 flex items-center gap-5 cursor-pointer" onDoubleClick={toggleMode}>
                <div className="relative shrink-0 transition-transform duration-500 group-hover:scale-105 group-active:scale-95">
                    {/* KHUNG TRÒN: Nâng kích thước lên 72px để logo to rõ hơn */}
                    <div className="h-[72px] w-[72px] rounded-full border-2 border-rose-100 bg-white shadow-md flex items-center justify-center overflow-hidden">
                        <img
                            src={logoUrl}
                            alt="Sase Logo"
                            className="h-full w-full object-cover" // Giúp logo lấp đầy khung tròn mà không bị méo
                        />
                    </div>
                </div>
                <div className="flex flex-col">
                    <span className="font-outfit text-[24px] font-black tracking-tighter text-slate-800 leading-none uppercase">Sase</span>
                    <span className={`text-[8px] font-black tracking-[0.25em] mt-2 uppercase opacity-60 ${theme.text}`}>
                        {isSafe ? "Security Engine" : "Academic AI Base"}
                    </span>
                </div>
            </div>

            {/* 2. ACTION BUTTON - Floating Modern Style */}
            <div className="px-6 mb-8">
                <button onClick={newChat} className={`group flex w-full items-center justify-between rounded-[1.25rem] px-5 py-4 text-[13px] font-bold text-white transition-all hover:brightness-105 hover:-translate-y-0.5 active:scale-95 ${theme.primary}`}>
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-1 rounded-lg">
                            <Plus className="h-4 w-4 stroke-[3.5px]" />
                        </div>
                        <span className="tracking-wide">Trò chuyện mới</span>
                    </div>
                    <ChevronRight className="h-4 w-4 opacity-40 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>

            {/* 3. SECTION LABEL */}
            <div className="px-8 mb-4 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Hội thoại gần đây</span>
                <div className="h-[1px] flex-1 ml-4 bg-gradient-to-r from-rose-100/50 to-transparent" />
            </div>

            {/* 4. SESSIONS LIST - Clean & Smooth */}
            <div className="flex-1 overflow-y-auto px-4 space-y-2 scrollbar-none">
                {sessions.length === 0 ? (
                    <div className="mt-10 flex flex-col items-center py-12 border border-dashed border-rose-100 rounded-[2rem] opacity-20 mx-4">
                        <MessageSquare className="h-6 w-6 mb-2" />
                        <p className="text-[9px] font-black uppercase tracking-widest">Trống lịch sử</p>
                    </div>
                ) : (
                    sessions.map((session) => {
                        const isActive = session.id === currentSessionId;
                        return (
                            <div key={session.id}
                                onMouseEnter={() => setHoveredId(session.id)}
                                onMouseLeave={() => setHoveredId(null)}
                                onClick={() => selectSession(session.id)}
                                className={`group relative flex items-center gap-3 rounded-2xl px-4 py-3.5 text-[13px] transition-all duration-300 cursor-pointer
                                ${isActive ? theme.active + " text-slate-900" : "text-slate-500 hover:bg-white/60 hover:text-slate-800"}`}>

                                <div className={`p-2 rounded-xl transition-colors ${isActive ? "bg-rose-50 text-rose-500" : "bg-transparent opacity-30 group-hover:opacity-100"}`}>
                                    <MessageSquare className="h-3.5 w-3.5" />
                                </div>

                                <span className={`flex-1 truncate tracking-tight ${isActive ? "font-bold" : "font-medium"}`}>
                                    {session.title}
                                </span>

                                {(hoveredId === session.id || isActive) && (
                                    <div className="flex gap-2 animate-in fade-in slide-in-from-right-2">
                                        <button className="p-1 hover:text-rose-500 transition-colors"><Pencil className="h-3.5 w-3.5 opacity-50 hover:opacity-100" /></button>
                                        <button onClick={(e) => { e.stopPropagation(); deleteSession(session.id); }} className="p-1 hover:text-rose-600 transition-colors">
                                            <Trash2 className="h-3.5 w-3.5 opacity-50 hover:opacity-100" />
                                        </button>
                                    </div>
                                )}
                                {isActive && <div className="absolute left-0 w-1 h-5 bg-rose-500 rounded-r-full shadow-[2px_0_8px_rgba(244,63,94,0.4)]" />}
                            </div>
                        );
                    })
                )}
            </div>

            {/* 5. FOOTER CARD - Premium Glassmorphism */}
            <div className="px-6 py-8">
                <div className={`rounded-[2.5rem] p-6 border transition-all duration-500 ${theme.glass} shadow-sm`}>
                    <div className="flex items-center gap-3 mb-4">
                        {/* KHUNG TRÒN MINI: Tăng nhẹ lên h-11 w-11 */}
                        <div className="p-1.5 h-11 w-11 bg-rose-50 rounded-full border border-rose-100 shadow-inner flex items-center justify-center overflow-hidden">
                            <img
                                src={logoUrl}
                                alt="Mini Logo"
                                className="h-full w-full object-cover rounded-full"
                            />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-800 font-outfit">Hệ thống Sase</span>
                            <div className="h-0.5 w-4 bg-rose-400 mt-0.5 rounded-full" />
                        </div>
                    </div>
                    <p className="text-[10px] leading-[1.6] text-slate-500 font-bold tracking-tight opacity-70">
                        {isSafe
                            ? "Dữ liệu được mã hóa đa lớp và bảo vệ bởi nhân thuật toán Sase Secure."
                            : "Đang truy xuất cơ sở dữ liệu học thuật Academic AI để tối ưu bài toán."}
                    </p>
                </div>
            </div>
        </div>
    );
};