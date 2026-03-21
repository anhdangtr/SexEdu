import React, { useState } from "react";
import { useMode } from "../contexts/ModeContext";
import {
    Plus,
    MessageSquare,
    Pencil,
    Trash2,
    Settings,
    Shield,
    Sigma,
    Check,
    Compass,
    BookOpen,
    Sparkles,
    Ghost, // Icon tượng trưng cho sự ẩn danh
    Info
} from "lucide-react";

export const AppSidebar = () => {
    const {
        mode,
        currentSessionId,
        newChat,
        selectSession,
        deleteSession,
        renameSession,
        toggleMode,
        safeSessions,
        disguiseSessions
    } = useMode();

    const isSafe = mode === "safe";
    const sessions = isSafe ? safeSessions : disguiseSessions;

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editText, setEditText] = useState("");
    const [hoveredId, setHoveredId] = useState<string | null>(null);

    const startEdit = (id: string, title: string) => {
        setEditingId(id);
        setEditText(title);
    };

    const confirmEdit = () => {
        if (editingId && editText.trim()) {
            renameSession(editingId, editText.trim());
        }
        setEditingId(null);
    };

    return (
        <div className={`flex h-full w-[280px] flex-col mode-transition border-r transition-all duration-500 select-none bg-sidebar-background border-sidebar-border text-sidebar-foreground`}>

            {/* Header: Logo & Chuyển Mode bí mật */}
            <div
                className="group/logo flex items-center justify-between px-5 pt-7 pb-4 cursor-pointer"
                onDoubleClick={toggleMode}
                title="Double click để chuyển đổi chế độ riêng tư"
            >
                <div className="flex items-center gap-3">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-xl shadow-lg transition-all duration-500 group-active/logo:scale-90 bg-sidebar-primary`}>
                        <Shield className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-black tracking-tight text-foreground/80 uppercase">
                            EduSolve AI
                        </span>
                        <span className={`text-[10px] font-bold text-sidebar-primary`}>
                            PRIVATE MODE
                        </span>
                    </div>
                </div>
            </div>

            {/* Action Buttons: Nổi bật và chuyên nghiệp */}
            <div className="px-4 py-4">
                <button
                    onClick={newChat}
                    className={`flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold text-white transition-all active:scale-95 shadow-md bg-sidebar-primary hover:opacity-95`}
                >
                    <Plus className="h-4 w-4 stroke-[3px]" />
                    <span>Bắt đầu trò chuyện</span>
                </button>
            </div>

            {/* History Section: Danh sách lịch sử cuộn mượt */}
            <div className="px-4 mb-2 flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-widest text-foreground/30">
                    Lịch sử gần đây
                </span>
                {isSafe && (
                    <span title="Dữ liệu ẩn danh">
                        <Ghost className="h-3 w-3 text-rose-300" />
                    </span>
                )}
            </div>

            <div className="flex-1 overflow-y-auto px-3 space-y-1 scrollbar-none">
                {sessions.length === 0 ? (
                    <div className="px-4 py-8 text-center border-2 border-dashed border-muted/20 rounded-2xl">
                        <p className="text-xs text-muted-foreground/60 italic">Chưa có cuộc hội thoại nào</p>
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
                                className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-sm cursor-pointer transition-all duration-300
                                    ${isActive
                                        ? "bg-white shadow-sm ring-1 ring-black/5 text-foreground font-semibold"
                                        : "hover:bg-white/50 text-foreground/60 hover:text-foreground"
                                    }`}
                                onClick={() => !isEditing && selectSession(session.id)}
                            >
                                <MessageSquare className={`h-4 w-4 shrink-0 ${isActive ? 'text-sidebar-primary' : 'opacity-30'}`} />
                                {isEditing ? (
                                    <input
                                        value={editText}
                                        onChange={(e) => setEditText(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && confirmEdit()}
                                        className="flex-1 bg-transparent outline-none border-b border-primary/50"
                                        autoFocus
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                ) : (
                                    <span className="flex-1 truncate">{session.title}</span>
                                )}
                                {(hoveredId === session.id || isActive) && !isEditing && (
                                    <div className="flex gap-1 animate-in fade-in zoom-in duration-200">
                                        <Pencil onClick={(e) => { e.stopPropagation(); startEdit(session.id, session.title); }} className="h-3.5 w-3.5 opacity-40 hover:text-sidebar-primary hover:opacity-100" />
                                        <Trash2 onClick={(e) => { e.stopPropagation(); deleteSession(session.id); }} className="h-3.5 w-3.5 opacity-40 hover:text-destructive hover:opacity-100" />
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {/* Privacy Section: Thay thế hoàn toàn phần Profile */}
            <div className="mt-auto p-4">
                <div className={`rounded-2xl p-4 border transition-colors duration-500 bg-sidebar-accent/40 border-sidebar-border`}>
                    <div className="flex items-center gap-2 mb-2">
                        <Shield className={`h-4 w-4 ${isSafe ? "text-rose-500" : "text-indigo-600"}`} />
                        <span className="text-xs font-black uppercase tracking-tighter opacity-70">Privacy First</span>
                    </div>
                    <p className="text-[10px] leading-relaxed text-muted-foreground font-medium">
                        Chúng tôi không lưu trữ thông tin cá nhân. Các cuộc trò chuyện được mã hóa và ẩn danh hoàn toàn để bảo vệ bạn.
                    </p>
                </div>
            </div>

            {/* Footer Menu */}
            <div className="px-3 pb-6 space-y-1">
                <button className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-[13px] font-bold text-foreground/60 hover:bg-white hover:text-foreground transition-all">
                    <Settings className="h-4 w-4 opacity-50" />
                    <span>Cài đặt hệ thống</span>
                </button>
                <div className="flex items-center justify-center pt-2 opacity-20 group-hover:opacity-40 transition-opacity">
                    <span className="text-[9px] font-black tracking-widest uppercase italic">V 1.0.2 • Secure Session</span>
                </div>
            </div>
        </div>
    );
};  