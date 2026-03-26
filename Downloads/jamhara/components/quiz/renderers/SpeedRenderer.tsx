"use client";
import { useState, useEffect, useRef } from "react";
import type { SpeedQuestion } from "@/lib/supabase/types";

interface Props {
  question: SpeedQuestion;
  isAr: boolean;
  onDone: (correct: boolean, explanation: string) => void;
}

export default function SpeedRenderer({ question, isAr, onDone }: Props) {
  const timeLimit = question.time_limit ?? 15;
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [selected, setSelected] = useState<number | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const doneRef = useRef(false);
  const answered = selected !== null || timedOut;
  const opts = isAr ? question.options_ar : question.options_en;
  const pct = (timeLeft / timeLimit) * 100;
  const timerColor = pct > 50 ? "#4CB36C" : pct > 25 ? "#F59E0B" : "#E05A2B";

  useEffect(() => {
    const id = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(id);
          if (!doneRef.current) {
            doneRef.current = true;
            setTimedOut(true);
            onDone(false, isAr ? question.explanation_ar : question.explanation_en);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  function handleSelect(idx: number) {
    if (doneRef.current) return;
    doneRef.current = true;
    setSelected(idx);
    onDone(idx === question.correct_index, isAr ? question.explanation_ar : question.explanation_en);
  }

  function getStyle(idx: number): React.CSSProperties {
    const base: React.CSSProperties = {
      width: "100%", padding: "11px 16px", borderRadius: 10, border: "1.5px solid",
      fontSize: ".88rem", fontWeight: 500, cursor: answered ? "default" : "pointer",
      textAlign: isAr ? "right" : "left", fontFamily: "var(--font-cairo)",
      transition: "all 0.25s ease", display: "flex", alignItems: "center", gap: 10,
    };
    if (!answered) return { ...base, background: "var(--white)", borderColor: "var(--slate2)", color: "var(--ink)" };
    if (idx === question.correct_index) return { ...base, background: "#4CB36C18", borderColor: "#4CB36C", color: "#2a7a45", fontWeight: 600 };
    if (idx === selected) return { ...base, background: "#E05A2B12", borderColor: "#E05A2B", color: "#b03a18" };
    return { ...base, background: "var(--slate3)", borderColor: "var(--slate2)", color: "var(--muted)", opacity: 0.6 };
  }

  return (
    <div>
      {/* Timer bar */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
          <span style={{ fontSize: ".78rem", fontWeight: 700, color: timerColor, fontFamily: "var(--font-cairo)" }}>
            ⏱️ {isAr ? `${timeLeft} ثانية` : `${timeLeft}s`}
          </span>
          {timedOut && (
            <span style={{ fontSize: ".72rem", color: "#E05A2B", fontWeight: 700, fontFamily: "var(--font-cairo)" }}>
              {isAr ? "انتهى الوقت!" : "Time's up!"}
            </span>
          )}
        </div>
        <div style={{ height: 7, background: "var(--slate2)", borderRadius: 4, overflow: "hidden" }}>
          <div style={{
            height: "100%", width: `${pct}%`, background: timerColor,
            borderRadius: 4, transition: "width 1s linear, background 0.5s ease",
          }} />
        </div>
      </div>

      {/* Question */}
      <div style={{ background: "linear-gradient(135deg,#E05A2B08,#7B5EA708)", border: "1px solid var(--slate2)", borderRadius: 12, padding: 16, marginBottom: 14 }}>
        <p style={{ fontSize: "1rem", fontWeight: 700, color: "var(--ink)", lineHeight: 1.6, margin: 0, fontFamily: "var(--font-cairo)" }}>
          {isAr ? question.question_ar : question.question_en}
        </p>
      </div>

      {/* Options */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {opts.map((opt, idx) => (
          <button key={idx} onClick={() => handleSelect(idx)} style={getStyle(idx)}>
            <span style={{
              width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: ".75rem", fontWeight: 700,
              background: !answered ? "var(--slate2)" : idx === question.correct_index ? "#4CB36C" : idx === selected ? "#E05A2B" : "var(--slate2)",
              color: answered && (idx === question.correct_index || idx === selected) ? "#fff" : "var(--muted)",
              transition: "all 0.25s ease",
            }}>
              {["أ","ب","ج","د"][idx] ?? String.fromCharCode(65 + idx)}
            </span>
            <span style={{ flex: 1 }}>{opt}</span>
            {answered && idx === question.correct_index && <span>✅</span>}
            {answered && idx === selected && idx !== question.correct_index && <span>❌</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
