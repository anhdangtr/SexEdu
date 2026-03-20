import { useMode } from "@/contexts/ModeContext";
import { Shield, Lock, Heart, Sigma, Brain, TrendingUp } from "lucide-react";

const SAFE_PROMPTS = [
  { icon: Heart, text: "Dậy thì là gì và diễn ra như thế nào?" },
  { icon: Lock, text: "Làm sao để nói chuyện với bố mẹ về vấn đề nhạy cảm?" },
  { icon: Shield, text: "Thế nào là một mối quan hệ lành mạnh?" },
];

const MATH_PROMPTS = [
  { icon: Brain, text: "Giải phương trình bậc hai: $x^2 - 5x + 6 = 0$" },
  { icon: TrendingUp, text: "Tính đạo hàm của $f(x) = 3x^3 + 2x$" },
  { icon: Sigma, text: "Giải thích định lý Pythagoras" },
];

interface WelcomeScreenProps {
  onPromptClick: (text: string) => void;
}

export const WelcomeScreen = ({ onPromptClick }: WelcomeScreenProps) => {
  const { mode } = useMode();
  const isSafe = mode === "safe";
  const prompts = isSafe ? SAFE_PROMPTS : MATH_PROMPTS;

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 animate-fade-in-up">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 mb-4">
        {isSafe ? (
          <Shield className="h-6 w-6 text-primary" />
        ) : (
          <Sigma className="h-6 w-6 text-primary" />
        )}
      </div>
      <h2 className="text-xl font-semibold text-foreground mb-1" style={{ lineHeight: "1.3" }}>
        {isSafe ? "Chào bạn! 👋" : "Chào mừng đến EduSolve"}
      </h2>
      <p className="text-sm text-muted-foreground text-center max-w-sm mb-8">
        {isSafe
          ? "Đây là không gian riêng tư và an toàn. Hãy hỏi bất cứ điều gì bạn muốn biết."
          : "Sẵn sàng giải quyết mọi bài toán. Hãy bắt đầu!"}
      </p>
      {isSafe && (
        <p className="text-[11px] text-muted-foreground/60 text-center max-w-xs mb-6 px-4">
          🔒 Cuộc trò chuyện hoàn toàn riêng tư. Dùng nút chuyển nhanh nếu cần.
        </p>
      )}
      <div className="grid w-full max-w-lg gap-3 sm:grid-cols-1">
        {prompts.map((p, i) => (
          <button
            key={i}
            onClick={() => onPromptClick(p.text)}
            className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-left text-sm text-foreground hover:translate-y-[-2px] hover:shadow-md active:scale-[0.98] transition-all mode-transition"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <p.icon className="h-4 w-4" />
            </div>
            <span>{p.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
