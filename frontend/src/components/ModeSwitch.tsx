import { useMode } from "@/contexts/ModeContext";
import { Accessibility } from "lucide-react";

export const ModeSwitch = () => {
  const { mode, toggleMode } = useMode();
  const isSafe = mode === "safe";

  return (
    <button
      onClick={toggleMode}
      className="group flex items-center gap-1.5 rounded-full bg-secondary/60 px-2.5 py-1.5 text-xs text-muted-foreground mode-transition hover:bg-secondary hover:text-foreground active:scale-[0.97] transition-all"
      title="Quick Switch (Ctrl+M)"
    >
      <Accessibility className="h-3.5 w-3.5" />
      <div className="h-4 w-7 rounded-full bg-switch-track relative mode-transition">
        <div
          className={`absolute top-0.5 h-3 w-3 rounded-full bg-primary-foreground shadow-sm transition-transform duration-300 ${
            isSafe ? "left-0.5" : "left-3.5"
          }`}
        />
      </div>
    </button>
  );
};
