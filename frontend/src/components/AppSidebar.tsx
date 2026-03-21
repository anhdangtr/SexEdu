import React, { useState, useCallback } from "react";
import { useMode } from "../contexts/ModeContext";

// --- Hệ thống Icons SVG (Gọn nhẹ & Chuyên nghiệp) ---
const Svg = ({ children, className, ...props }: any) => (
    <svg className={className} width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
        {children}
    </svg>
);
const Plus = (p: any) => <Svg {...p}><path d="M12 5v14M5 12h14" /></Svg>;
const MessageSquare = (p: any) => <Svg {...p}><rect x="3" y="3" width="18" height="14" rx="2" /><path d="M8 21v-4" /></Svg>;
const Pencil = (p: any) => <Svg {...p}><path d="M3 21l3-1 11-11 1-3-3 1L4 20z" /></Svg>;
const Trash2 = (p: any) => <Svg {...p}><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /></Svg>;
const Settings = (p: any) => <Svg {...p}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09" /></Svg>;
const Shield = (p: any) => <Svg {...p}><path d="M12 2l7 4v6c0 5-3 9-7 11-4-2-7-6-7-11V6l7-4z" /></Svg>;
const Sigma = (p: any) => <Svg {...p}><path d="M18 3H6l6 9-6 9h12" /></Svg>;
const Ghost = (p: any) => <Svg {...p}><path d="M4 21v-7a8 8 0 1 1 16 0v7l-2-1-2 1-2-1-2 1-2-1-2 1z" /></Svg>;
const ChevronRight = (p: any) => <Svg {...p}><path d="M9 6l6 6-6 6" /></Svg>;

export const AppSidebar = () => {
    const {
        mode, currentSessionId, newChat, selectSession,
        deleteSession, renameSession, toggleMode,
        safeSessions, disguiseSessions
    } = useMode();

    const isSafe = mode === "safe";
    const sessions = isSafe ? safeSessions : disguiseSessions;

    // --- HỆ THỐNG MÀU ROSE ĐỒNG BỘ CHO CẢ 2 MODE ---
    // Chỉ thay đổi Text và Icon để phân biệt, còn màu sắc giữ nguyên tông Hồng Rose
    const theme = {
        primary: "bg-rose-500 shadow-rose-200",
        text: "text-rose-600",
        border: "border-rose-100/60",
        bg: "bg-rose-50/50",
        card: "bg-rose-100/40 border-rose-200/50",
        iconBox: "bg-rose-100 text-rose-600",
        indicator: "bg-rose-400"
    };

    const [hoveredId, setHoveredId] = useState<string | null>(null);

    return (
        <div className={`flex h-full w-[280px] flex-col transition-all duration-500 select-none border-r shadow-2xl backdrop-blur-xl ${theme.bg} ${theme.border}`}>

            {/* 1. HEADER: LOGO & MODE SWITCH */}
            <div className="group/logo flex items-center gap-3 px-6 pt-8 pb-6 cursor-pointer" onDoubleClick={toggleMode}>
                {/* Logo Box: Luôn là màu hồng Rose thương hiệu */}
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl shadow-lg transition-all duration-500 group-active:scale-90 ${theme.primary}`}>
                    {isSafe ? (
                        <Shield className="h-5 w-5 text-white animate-in zoom-in" />
                    ) : (
                        <Sigma className="h-5 w-5 text-white animate-in spin-in-90" />
                    )}
                </div>

                <div className="flex flex-col overflow-hidden">
                    <span className="text-sm font-black tracking-tighter uppercase text-foreground/90 leading-none mb-1">EduSolve AI</span>
                    <div className="flex items-center gap-1.5">
                        <span className={`text-[9px] font-black tracking-widest transition-colors duration-500 ${theme.text}`}>
                            {isSafe ? "PRIVATE MODE" : "ACADEMIC MODE"}
                        </span>
                        <div className={`h-1 w-1 rounded-full animate-pulse ${theme.indicator}`} />
                    </div>
                </div>
            </div>

            {/* 2. ACTION BUTTON */}
            <div className="px-4 py-2">
                <button onClick={newChat} className={`group flex w-full items-center justify-between rounded-2xl px-4 py-3.5 text-sm font-bold text-white transition-all active:scale-95 shadow-xl ${theme.primary} hover:opacity-95`}>
                    <div className="flex items-center gap-2.5">
                        <Plus className="h-4 w-4 stroke-[3px]" />
                        <span>Trò chuyện mới</span>
                    </div>
                    <ChevronRight className="h-4 w-4 opacity-50 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>

            {/* 3. SECTION LABEL */}
            <div className="mt-6 px-6 mb-3 flex items-center justify-between opacity-30 text-[10px] font-black uppercase tracking-[0.2em]">
                <span>{isSafe ? "Dữ liệu ẩn danh" : "Lịch sử học tập"}</span>
                {isSafe && <Ghost className="h-3.5 w-3.5 animate-bounce" />}
            </div>

            {/* 4. CHAT SESSIONS LIST */}
            <div className="flex-1 overflow-y-auto px-3 space-y-1.5 scrollbar-none">
                {sessions.length === 0 ? (
                    <div className="mx-3 mt-4 flex flex-col items-center py-10 border-2 border-dashed border-rose-100 rounded-3xl opacity-20">
                        <MessageSquare className="h-8 w-8 mb-2" />
                        <p className="text-[10px] font-bold uppercase tracking-widest text-rose-500">Trống</p>
                    </div>
                ) : (
                    sessions.map((session) => {
                        const isActive = session.id === currentSessionId;
                        return (
                            <div key={session.id} onMouseEnter={() => setHoveredId(session.id)} onMouseLeave={() => setHoveredId(null)}
                                className={`group flex items-center gap-3 rounded-2xl px-4 py-3 text-[13px] cursor-pointer transition-all duration-300
                                ${isActive ? "bg-white shadow-md text-foreground font-bold" : "hover:bg-white/60 text-foreground/60"}`}
                                onClick={() => selectSession(session.id)}>

                                <MessageSquare className={`h-4 w-4 shrink-0 transition-colors duration-500 ${isActive ? theme.text : 'opacity-20'}`} />
                                <span className="flex-1 truncate tracking-tight">{session.title}</span>

                                {(hoveredId === session.id || isActive) && (
                                    <div className="flex gap-2 animate-in fade-in zoom-in">
                                        <Pencil onClick={(e) => e.stopPropagation()} className={`h-3.5 w-3.5 opacity-30 hover:opacity-100 ${theme.text}`} />
                                        <Trash2 onClick={(e) => { e.stopPropagation(); deleteSession(session.id); }} className="h-3.5 w-3.5 opacity-30 hover:text-destructive hover:opacity-100" />
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {/* 5. BOTTOM INFO CARD (SYNCED) */}
            <div className="px-4 py-4 mt-auto">
                <div className={`rounded-3xl p-5 border shadow-sm transition-all duration-500 ${theme.card}`}>
                    <div className="flex items-center gap-2.5 mb-2.5">
                        <div className={`p-1.5 rounded-lg transition-colors duration-500 ${theme.iconBox}`}>
                            {isSafe ? <Shield className="h-3.5 w-3.5" /> : <Sigma className="h-3.5 w-3.5" />}
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-80">
                            {isSafe ? "Privacy First" : "Academic Base"}
                        </span>
                    </div>
                    <p className="text-[10px] leading-relaxed text-muted-foreground font-bold tracking-tight">
                        {isSafe
                            ? "Dữ liệu ẩn danh, mã hóa tuyệt đối để bảo vệ thông tin cá nhân của bạn."
                            : "Hệ thống đang hỗ trợ các thuật toán và dữ liệu toán học chuẩn xác nhất."}
                    </p>
                </div>
            </div>

            {/* 6. SETTINGS FOOTER */}
            <div className="px-3 pb-8 pt-2">
                <button className="flex w-full items-center gap-3 rounded-xl px-5 py-3 text-[10px] font-black text-foreground/30 hover:bg-white hover:text-rose-500 transition-all uppercase tracking-widest group">
                    <Settings className="h-4 w-4 opacity-40 group-hover:rotate-90 transition-transform duration-500" />
                    <span>Cài đặt hệ thống</span>
                </button>
            </div>
        </div>
    );
};