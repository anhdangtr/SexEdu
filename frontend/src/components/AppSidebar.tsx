import React, { useState, useRef, useEffect } from "react";
import { useMode } from "../contexts/ModeContext";
import logoUrl from "@/assets/logo-badge.png";

const Svg = ({ children, className, ...props }: any) => (
    <svg className={className} width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
        {children}
    </svg>
);
const Plus = (p: any) => <Svg {...p}><path d="M12 5v14M5 12h14" /></Svg>;
const MessageSquare = (p: any) => <Svg {...p}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></Svg>;
const Pencil = (p: any) => <Svg {...p}><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" /></Svg>;
const Trash2 = (p: any) => <Svg {...p}><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /></Svg>;
const Check = (p: any) => <Svg {...p}><polyline points="20 6 9 17 4 12" /></Svg>;
const ChevronRight = (p: any) => <Svg {...p}><path d="M9 6l6 6-6 6" /></Svg>;

export const AppSidebar = () => {
    const {
        mode,
        currentSessionId,
        newChat,
        selectSession,
        deleteSession,
        toggleMode,
        safeSessions,
        disguiseSessions,
        renameSession
    } = useMode();

    const isSafe = mode === "safe";
    const sessions = isSafe ? safeSessions : disguiseSessions;

    const theme = {
        primary: "bg-rose-500 shadow-xl shadow-rose-200",
        text: "text-rose-600",
        active: "bg-white shadow-sm ring-1 ring-rose-100/50",
    };

    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (editingId && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [editingId]);

    const handleStartEdit = (e: React.MouseEvent, id: string, title: string) => {
        e.stopPropagation();
        setEditingId(id);
        setEditValue(title);
    };

    const handleSaveEdit = (e?: React.FormEvent | React.FocusEvent) => {
        if (e) e.stopPropagation();
        if (editingId && editValue.trim()) {
            if (renameSession) renameSession(editingId, editValue.trim());
        }
        setEditingId(null);
    };

    return (
        <div className="flex h-full w-[290px] flex-col border-r bg-[#fffcfc] shadow-[20px_0_40px_rgba(0,0,0,0.02)]">

            {/* Header Area */}
            <div className="group px-8 pt-10 pb-8 cursor-pointer select-none" onDoubleClick={toggleMode}>
                <div className="flex justify-center">
                    <img
                        src={logoUrl}
                        alt="SafeSpace logo"
                        className="h-auto w-full max-w-[96px] object-contain transition-transform duration-500 group-hover:scale-[1.02] group-active:scale-[0.98]"
                    />
                </div>
                <span className={`mt-3 block text-center text-[8px] font-black tracking-[0.28em] uppercase opacity-60 ${theme.text}`}>
                    {isSafe ? "Private Health AI" : "Study Assistant AI"}
                </span>
            </div>

            {/* New Chat Button */}
            <div className="px-6 mb-8">
                <button onClick={newChat} className={`group flex w-full items-center justify-between rounded-[1.25rem] px-5 py-4 text-[13px] font-bold text-white transition-all hover:brightness-105 hover:-translate-y-0.5 active:scale-95 ${theme.primary}`}>
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-1 rounded-lg">
                            <Plus className="h-4 w-4 stroke-[3.5px]" />
                        </div>
                        <span className="tracking-wide">New Chat</span>
                    </div>
                    <ChevronRight className="h-4 w-4 opacity-40 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>

            {/* Label History */}
            <div className="px-8 mb-4 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Recent Chats</span>
                <div className="h-[1px] flex-1 ml-4 bg-gradient-to-r from-rose-100/50 to-transparent" />
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto px-4 space-y-2 scrollbar-none">
                {sessions.length === 0 ? (
                    <div className="mt-10 flex flex-col items-center py-12 border border-dashed border-rose-100 rounded-[2rem] opacity-20 mx-4">
                        <MessageSquare className="h-6 w-6 mb-2" />
                        <p className="text-[9px] font-black uppercase tracking-widest">No Chats Yet</p>
                    </div>
                ) : (
                    sessions.map((session) => {
                        const isActive = session.id === currentSessionId;
                        const isEditing = editingId === session.id;

                        return (
                            <div
                                key={session.id}
                                onMouseEnter={() => setHoveredId(session.id)}
                                onMouseLeave={() => setHoveredId(null)}
                                onClick={() => !isEditing && selectSession(session.id)}
                                className={`group relative flex items-center gap-3 rounded-2xl px-4 py-3.5 text-[13px] transition-all duration-300 cursor-pointer ${isActive ? `${theme.active} text-slate-900` : "text-slate-500 hover:bg-white/60 hover:text-slate-800"
                                    }`}
                            >
                                <div className={`p-2 rounded-xl transition-colors ${isActive ? "bg-rose-50 text-rose-500" : "bg-transparent opacity-30 group-hover:opacity-100"}`}>
                                    <MessageSquare className="h-3.5 w-3.5" />
                                </div>

                                {isEditing ? (
                                    <input
                                        ref={inputRef}
                                        value={editValue}
                                        onChange={(e) => setEditValue(e.target.value)}
                                        onBlur={handleSaveEdit}
                                        onKeyDown={(e) => e.key === "Enter" && handleSaveEdit()}
                                        onClick={(e) => e.stopPropagation()}
                                        className="flex-1 bg-transparent border-b border-rose-400 outline-none font-bold text-slate-900"
                                    />
                                ) : (
                                    <span className={`flex-1 truncate tracking-tight ${isActive ? "font-bold" : "font-medium"}`}>
                                        {session.title}
                                    </span>
                                )}

                                {(hoveredId === session.id || isActive) && (
                                    <div className="flex gap-2 animate-in fade-in slide-in-from-right-2">
                                        {isEditing ? (
                                            <button onClick={handleSaveEdit} className="p-1 text-green-500"><Check className="h-3.5 w-3.5" /></button>
                                        ) : (
                                            <button onClick={(e) => handleStartEdit(e, session.id, session.title)} className="p-1 hover:text-rose-500 transition-colors">
                                                <Pencil className="h-3.5 w-3.5 opacity-50 hover:opacity-100" />
                                            </button>
                                        )}
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

            {/* Bottom Footer Box - Căn lề đều và 2 hàng cố định */}
            <div className="px-6 pb-8">
                <div className="rounded-[2.2rem] border border-rose-100/70 bg-white/80 p-5 shadow-[0_10px_30px_rgba(244,63,94,0.06)] backdrop-blur-xl">
                    <div className="flex flex-col items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50">
                            <img src={logoUrl} alt="Sidebar logo" className="h-7 w-7 object-contain" />
                        </div>
                        <div className="w-full">
                            <p className="text-[10px] leading-[1.6] text-center text-slate-500 font-bold tracking-tight opacity-80 px-1">
                                {isSafe
                                    ? <>Private support for health, puberty,<br />consent and your relationships.</>
                                    : <>Discreet math assistant for equations,<br />homework and guided solutions.</>}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
