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

/**
 * DYNAMIC SEMANTIC SUMMARY (English Optimized)
 * Extracts the core academic subject for the sidebar title.
 */
const generateSmartTitle = (content: string): string => {
    const text = content.trim().replace(/[?.,!:]/g, "");
    const words = text.split(/\s+/);

    // Academic keywords to skip
    const starters = ["solve", "calculate", "find", "evaluate", "what", "is", "explain", "determine", "prove"];
    let startIndex = 0;
    while (startIndex < words.length && startIndex < 3) {
        if (starters.includes(words[startIndex].toLowerCase())) startIndex++;
        else break;
    }

    const core = words.slice(startIndex);
    // Semantic stop points (prepositions)
    const breakPoints = ["and", "with", "in", "at", "of", "for", "using", "by"];
    let endPoint = core.length;
    for (let i = 0; i < core.length; i++) {
        if (breakPoints.includes(core[i].toLowerCase())) {
            endPoint = i;
            break;
        }
    }

    let title = core.slice(0, endPoint).join(" ");
    if (!title || title.length < 2) title = words.slice(0, 4).join(" ");

    return title.charAt(0).toUpperCase() + title.slice(1).toLowerCase();
};

// ADVANCED MOCK DATA POOL
// Trong ModeContext.tsx
const MOCK_DATA_POOL: ChatSession[] = [
    {
        id: "math-001",
        title: "Improper Integrals",
        mode: "disguise",
        createdAt: new Date(),
        messages: [
            {
                id: "m1",
                role: "user",
                content: String.raw`Evaluate the convergence of $I = \int_{1}^{\infty} \frac{\ln x}{x^2} dx$`,
                timestamp: new Date()
            },
            {
                id: "m2",
                role: "assistant",
                content: String.raw`To evaluate this integral, we use **Integration by Parts**:

**Step 1: Formula Selection**
Let $u = \ln x$ and $dv = x^{-2} dx$. Thus $du = \frac{1}{x} dx$ and $v = -\frac{1}{x}$.

**Step 2: Integration**
$$\int \frac{\ln x}{x^2} dx = -\frac{\ln x}{x} - \int -\frac{1}{x^2} dx = -\frac{\ln x}{x} - \frac{1}{x}$$

**Final Answer:**
> ✅ The integral converges to **1**.` ,
                timestamp: new Date()
            }
        ]
    }
];

interface ModeContextType {
    mode: AppMode;
    toggleMode: () => void;
    isTransitioning: boolean;
    currentMessages: Message[];
    addMessage: (msg: Omit<Message, "id" | "timestamp">) => void;
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
    if (!ctx) throw new Error("useMode must be used within a ModeProvider");
    return ctx;
};

export const ModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [mode, setMode] = useState<AppMode>("safe");
    const [isTransitioning, setIsTransitioning] = useState(false);

    const [safeSessions, setSafeSessions] = useState<ChatSession[]>([
        { id: "s-init", title: "New Conversation", messages: [], createdAt: new Date(), mode: "safe" }
    ]);
    const [disguiseSessions, setDisguiseSessions] = useState<ChatSession[]>(MOCK_DATA_POOL);

    const [safeCurrentId, setSafeCurrentId] = useState<string>(safeSessions[0].id);
    const [disguiseCurrentId, setDisguiseCurrentId] = useState<string>(MOCK_DATA_POOL[0].id);

    const currentSessionId = mode === "safe" ? safeCurrentId : disguiseCurrentId;

    const toggleMode = useCallback(() => {
        setIsTransitioning(true);
        setMode(prev => prev === "safe" ? "disguise" : "safe");
        setTimeout(() => {
            setIsTransitioning(false);
        }, 40);
    }, []);

    const addMessage = useCallback((msg: Omit<Message, "id" | "timestamp">) => {
        const newMsg: Message = { ...msg, id: crypto.randomUUID(), timestamp: new Date() };
        const update = mode === "safe" ? setSafeSessions : setDisguiseSessions;

        update(prev => prev.map(session => {
            if (session.id === currentSessionId) {
                let updatedTitle = session.title;
                if (session.messages.length === 0 && msg.role === "user") {
                    updatedTitle = generateSmartTitle(msg.content);
                }
                return { ...session, title: updatedTitle, messages: [...session.messages, newMsg] };
            }
            return session;
        }));
    }, [mode, currentSessionId]);

    const newChat = useCallback(() => {
        const session: ChatSession = { id: crypto.randomUUID(), title: "New Conversation", messages: [], createdAt: new Date(), mode };
        if (mode === "safe") {
            setSafeSessions(p => [session, ...p]);
            setSafeCurrentId(session.id);
        } else {
            setDisguiseSessions(p => [session, ...p]);
            setDisguiseCurrentId(session.id);
        }
    }, [mode]);

    const selectSession = (id: string) => mode === "safe" ? setSafeCurrentId(id) : setDisguiseCurrentId(id);

    const deleteSession = (id: string) => {
        const update = mode === "safe" ? setSafeSessions : setDisguiseSessions;
        const setCurId = mode === "safe" ? setSafeCurrentId : setDisguiseCurrentId;
        update(prev => {
            const filtered = prev.filter(s => s.id !== id);
            if (filtered.length === 0) {
                const fresh = mode === "safe"
                    ? { id: crypto.randomUUID(), title: "New Conversation", messages: [], createdAt: new Date(), mode: "safe" }
                    : { ...MOCK_DATA_POOL[0], id: crypto.randomUUID() };
                setCurId(fresh.id);
                return [fresh as ChatSession];
            }
            if (currentSessionId === id) setCurId(filtered[0].id);
            return filtered;
        });
    };

    const renameSession = (id: string, title: string) => {
        const update = mode === "safe" ? setSafeSessions : setDisguiseSessions;
        update(prev => prev.map(s => s.id === id ? { ...s, title } : s));
    };

    const currentMessages = (mode === "safe" ? safeSessions : disguiseSessions)
        .find(s => s.id === currentSessionId)?.messages ?? [];

    return (
        <ModeContext.Provider value={{
            mode, toggleMode, isTransitioning, currentMessages, addMessage,
            safeSessions, disguiseSessions, currentSessionId, newChat,
            selectSession, deleteSession, renameSession,
        }}>
            {children}
        </ModeContext.Provider>
    );
};
