import React, { createContext, useContext, useState, useCallback } from "react";

export type AppMode = "safe" | "disguise";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  mode: AppMode;
}

interface ModeContextType {
  mode: AppMode;
  toggleMode: () => void;
  isTransitioning: boolean;
  currentMessages: Message[];
  addMessage: (msg: Omit<Message, "id" | "timestamp">) => void;
  // Chat history
  safeSessions: ChatSession[];
  disguiseSessions: ChatSession[];
  currentSessionId: string | null;
  newChat: () => void;
  selectSession: (id: string) => void;
  deleteSession: (id: string) => void;
  renameSession: (id: string, title: string) => void;
}

const ModeContext = createContext<ModeContextType | null>(null);

export const useMode = () => {
  const ctx = useContext(ModeContext);
  if (!ctx) throw new Error("useMode must be inside ModeProvider");
  return ctx;
};

function createSession(mode: AppMode): ChatSession {
  return {
    id: crypto.randomUUID(),
    title: mode === "safe" ? "Cuộc trò chuyện mới" : "Phiên học mới",
    messages: [],
    createdAt: new Date(),
    mode,
  };
}

export const ModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<AppMode>("safe");
  const [isTransitioning, setIsTransitioning] = useState(false);

  const [safeSessions, setSafeSessions] = useState<ChatSession[]>([createSession("safe")]);
  const [disguiseSessions, setDisguiseSessions] = useState<ChatSession[]>([createSession("disguise")]);
  const [safeCurrentId, setSafeCurrentId] = useState<string>(safeSessions[0].id);
  const [disguiseCurrentId, setDisguiseCurrentId] = useState<string>(disguiseSessions[0].id);

  const currentSessionId = mode === "safe" ? safeCurrentId : disguiseCurrentId;
  const sessions = mode === "safe" ? safeSessions : disguiseSessions;
  const setSessions = mode === "safe" ? setSafeSessions : setDisguiseSessions;
  const setCurrentId = mode === "safe" ? setSafeCurrentId : setDisguiseCurrentId;

  const currentSession = sessions.find((s) => s.id === currentSessionId);
  const currentMessages = currentSession?.messages ?? [];

  const toggleMode = useCallback(() => {
    setIsTransitioning(true);
    setTimeout(() => {
      setMode((m) => (m === "safe" ? "disguise" : "safe"));
      setTimeout(() => setIsTransitioning(false), 200);
    }, 200);
  }, []);

  const addMessage = useCallback(
    (msg: Omit<Message, "id" | "timestamp">) => {
      const newMsg: Message = {
        ...msg,
        id: crypto.randomUUID(),
        timestamp: new Date(),
      };
      const updateSessions = mode === "safe" ? setSafeSessions : setDisguiseSessions;
      const curId = mode === "safe" ? safeCurrentId : disguiseCurrentId;
      updateSessions((prev) =>
        prev.map((s) => {
          if (s.id !== curId) return s;
          const updated = { ...s, messages: [...s.messages, newMsg] };
          // Auto-title from first user message
          if (msg.role === "user" && s.messages.length === 0) {
            updated.title = msg.content.slice(0, 40) + (msg.content.length > 40 ? "..." : "");
          }
          return updated;
        })
      );
    },
    [mode, safeCurrentId, disguiseCurrentId]
  );

  const newChat = useCallback(() => {
    const session = createSession(mode);
    if (mode === "safe") {
      setSafeSessions((p) => [session, ...p]);
      setSafeCurrentId(session.id);
    } else {
      setDisguiseSessions((p) => [session, ...p]);
      setDisguiseCurrentId(session.id);
    }
  }, [mode]);

  const selectSession = useCallback(
    (id: string) => {
      if (mode === "safe") setSafeCurrentId(id);
      else setDisguiseCurrentId(id);
    },
    [mode]
  );

  const deleteSession = useCallback(
    (id: string) => {
      const updateSessions = mode === "safe" ? setSafeSessions : setDisguiseSessions;
      const setCurId = mode === "safe" ? setSafeCurrentId : setDisguiseCurrentId;
      updateSessions((prev) => {
        const filtered = prev.filter((s) => s.id !== id);
        if (filtered.length === 0) {
          const fresh = createSession(mode);
          setCurId(fresh.id);
          return [fresh];
        }
        const curId = mode === "safe" ? safeCurrentId : disguiseCurrentId;
        if (curId === id) setCurId(filtered[0].id);
        return filtered;
      });
    },
    [mode, safeCurrentId, disguiseCurrentId]
  );

  const renameSession = useCallback(
    (id: string, title: string) => {
      const updateSessions = mode === "safe" ? setSafeSessions : setDisguiseSessions;
      updateSessions((prev) => prev.map((s) => (s.id === id ? { ...s, title } : s)));
    },
    [mode]
  );

  return (
    <ModeContext.Provider
      value={{
        mode,
        toggleMode,
        isTransitioning,
        currentMessages,
        addMessage,
        safeSessions,
        disguiseSessions,
        currentSessionId,
        newChat,
        selectSession,
        deleteSession,
        renameSession,
      }}
    >
      {children}
    </ModeContext.Provider>
  );
};
