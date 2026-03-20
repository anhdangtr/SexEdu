import { useState } from "react";
import { useMode } from "@/contexts/ModeContext";
import {
  Plus,
  MessageSquare,
  Pencil,
  Trash2,
  Settings,
  Shield,
  Sigma,
  Check,
  X,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export const AppSidebar = () => {
  const {
    mode,
    currentSessionId,
    newChat,
    selectSession,
    deleteSession,
    renameSession,
  } = useMode();

  const isSafe = mode === "safe";
  const { safeSessions, disguiseSessions } = useMode();
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
    // Add a clean sans-serif base and slightly larger base text for readability
    <div className="flex h-full w-[260px] flex-col bg-sidebar mode-transition border-r border-sidebar-border font-sans text-sm">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 pt-5 pb-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary/15">
          {isSafe ? (
            <Shield className="h-4 w-4 text-sidebar-primary" />
          ) : (
            <Sigma className="h-4 w-4 text-sidebar-primary" />
          )}
        </div>
        <span className="text-base font-semibold text-sidebar-foreground tracking-tight">
          {isSafe ? "SafeSpace" : "EduSolve"}
        </span>
      </div>

      {/* New Chat */}
      <div className="px-3 py-3">
        <button
          onClick={newChat}
          className="flex w-full items-center gap-2.5 rounded-xl border border-transparent bg-sidebar-accent/80 px-3 py-2.5 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent/100 active:scale-[0.97] transition-all"
        >
          <Plus className="h-4 w-4" />
          <span className="font-medium text-sm">{isSafe ? "Cuộc trò chuyện mới" : "Phiên học mới"}</span>
        </button>
      </div>

      {/* History Label */}
      <div className="px-4 mb-1">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40">
          {isSafe ? "Lịch sử riêng tư" : "Lịch sử học tập"}
        </span>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-2 space-y-0.5">
        {sessions.map((session) => {
          const isActive = session.id === currentSessionId;
          const isEditing = editingId === session.id;
          const isHovered = hoveredId === session.id;

          return (
            <div
              key={session.id}
              onMouseEnter={() => setHoveredId(session.id)}
              onMouseLeave={() => setHoveredId(null)}
              className={`group flex items-center gap-2 rounded-lg px-3 py-2 text-sm cursor-pointer transition-colors min-w-0 ${
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-inner ring-1 ring-sidebar-accent/40"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              }`}
              onClick={() => !isEditing && selectSession(session.id)}
            >
              <MessageSquare className="h-4 w-4 shrink-0 opacity-60" />
              {isEditing ? (
                <div className="flex flex-1 items-center gap-2 min-w-0">
                  <input
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && confirmEdit()}
                    className="flex-1 min-w-0 bg-transparent text-sm text-sidebar-foreground outline-none border-b border-sidebar-primary/40 py-1"
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                  <button onClick={(e) => { e.stopPropagation(); confirmEdit(); }} className="p-1 hover:text-sidebar-primary rounded">
                    <Check className="h-4 w-4" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); setEditingId(null); }} className="p-1 hover:text-destructive rounded">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <>
                  <span className={`flex-1 truncate text-[13px] ${isActive ? 'font-medium text-sidebar-foreground' : ''}`}>{session.title}</span>
                  {(isHovered || isActive) && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={(e) => { e.stopPropagation(); startEdit(session.id, session.title); }}
                        className="p-1 rounded hover:bg-sidebar-border/50 transition-colors"
                        aria-label="Edit session"
                      >
                        <Pencil className="h-4 w-4 opacity-80" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteSession(session.id); }}
                        className="p-1 rounded hover:bg-destructive/20 hover:text-destructive transition-colors"
                        aria-label="Delete session"
                      >
                        <Trash2 className="h-4 w-4 opacity-80" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* User Profile */}
      <div className="border-t border-sidebar-border px-3 py-3">
        <div className="flex items-center gap-2.5">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-sidebar-primary/15 text-sidebar-primary text-xs font-semibold">
              A
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">Alex</p>
            <p className="text-[11px] text-sidebar-foreground/60">
              {isSafe ? "Chế độ riêng tư" : "Chế độ học tập"}
            </p>
          </div>
          <button className="p-1.5 rounded-lg hover:bg-sidebar-accent/30 transition-colors text-sidebar-foreground/50 hover:text-sidebar-foreground" aria-label="Settings">
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
