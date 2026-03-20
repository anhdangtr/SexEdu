import { useState } from "react";
import { Calculator, Calendar, Plus, Minus, X, Divide, Equal, Delete } from "lucide-react";

const SCHEDULE = [
  { time: "07:30", subject: "Toán cao cấp", room: "A201" },
  { time: "09:15", subject: "Vật lý đại cương", room: "B105" },
  { time: "13:00", subject: "Giải tích II", room: "A301" },
  { time: "14:45", subject: "Đại số tuyến tính", room: "C202" },
];

const CALC_BUTTONS = [
  "7", "8", "9", "÷",
  "4", "5", "6", "×",
  "1", "2", "3", "−",
  "0", ".", "=", "+",
];

export const MathSidebar = () => {
  const [display, setDisplay] = useState("0");
  const [prevVal, setPrevVal] = useState<number | null>(null);
  const [op, setOp] = useState<string | null>(null);

  const handleCalc = (btn: string) => {
    if ("0123456789.".includes(btn)) {
      setDisplay((d) => (d === "0" ? btn : d + btn));
    } else if ("÷×−+".includes(btn)) {
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
      setDisplay(String(parseFloat(result.toFixed(8))));
      setPrevVal(null);
      setOp(null);
    }
  };

  const clearCalc = () => {
    setDisplay("0");
    setPrevVal(null);
    setOp(null);
  };

  return (
    <div className="flex flex-col gap-4 p-4 animate-slide-in">
      {/* Calculator */}
      <div className="rounded-xl border border-border bg-card p-3 mode-transition">
        <div className="flex items-center gap-2 mb-3">
          <Calculator className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold text-foreground uppercase tracking-wider">Scientific Calculator</span>
        </div>
        <div className="rounded-lg bg-muted px-3 py-2 mb-2 text-right font-mono text-lg text-foreground truncate">
          {display}
        </div>
        <div className="flex justify-end mb-2">
          <button
            onClick={clearCalc}
            className="rounded-md bg-destructive/10 px-2 py-1 text-xs font-medium text-destructive hover:bg-destructive/20 active:scale-95 transition-all"
          >
            AC
          </button>
        </div>
        <div className="grid grid-cols-4 gap-1">
          {CALC_BUTTONS.map((btn) => (
            <button
              key={btn}
              onClick={() => handleCalc(btn)}
              className={`h-9 rounded-md text-sm font-medium transition-all active:scale-95 ${
                "÷×−+=".includes(btn)
                  ? "bg-primary/15 text-primary hover:bg-primary/25"
                  : "bg-muted text-foreground hover:bg-muted-foreground/10"
              }`}
            >
              {btn}
            </button>
          ))}
        </div>
      </div>

      {/* Schedule */}
      <div className="rounded-xl border border-border bg-card p-3 mode-transition">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold text-foreground uppercase tracking-wider">Class Schedule</span>
        </div>
        <div className="space-y-2">
          {SCHEDULE.map((cls) => (
            <div
              key={cls.time}
              className="flex items-center gap-3 rounded-lg bg-muted/50 px-3 py-2 text-xs"
            >
              <span className="font-mono text-muted-foreground w-10 shrink-0">{cls.time}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{cls.subject}</p>
                <p className="text-muted-foreground">{cls.room}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
