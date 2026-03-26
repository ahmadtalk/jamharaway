"use client";
import { useState } from "react";
import type { GuessWhoQuestion } from "@/lib/supabase/types";

interface Props {
  question: GuessWhoQuestion;
  isAr: boolean;
  onDone: (correct: boolean, explanation: string) => void;
}

export default function GuessWhoRenderer({ question, isAr, onDone }: Props) {
  const [hintsRevealed, setHintsRevealed] = useState(1);
  const [selected, setSelected] = useState<number | null>(null);
  const answered = selected !== null;
  const hints = isAr ? question.hints_ar : question.hints_en;
  const opts = isAr ? question.options_ar : question.options_en;
  const maxHints = hints.length;

  function handleSelect(idx: number) {
    if (answered) return;
    setSelected(idx);
    onDone(idx === question.correct_index, isAr ? question.explanation_ar : question.explanation_en);
  }

  function getOptStyle(idx: number): React.CSSProperties {
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
      {/* Mystery card */}
      <div style={{
        background: "linear-gradient(135deg,#F59E0B10,#7B5EA710)",
        border: "1px solid #F59E0B30", borderRadius: 14,
        padding: "20px 16px", marginBottom: 16,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <div style={{
            width: 44, height: 44, borderRadius: "50%",
            background: "linear-gradient(135deg,#F59E0B40,#7B5EA740)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.5rem", flexShrink: 0,
          }}>🎭</div>
          <p style={{ fontSize: ".9rem", fontWeight: 800, color: "#7B5EA7", margin: 0, fontFamily: "var(--font-cairo)" }}>
            {isAr ? "من أنا؟" : "Who Am I?"}
          </p>
        </div>

        {/* Hints */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {hints.slice(0, hintsRevealed).map((hint, i) => (
            <div key={i} style={{
              padding: "10px 14px", borderRadius: 10,
              background: "#fff", border: "1px solid #F59E0B20",
              display: "flex", gap: 10, alignItems: "flex-start",
            }}>
              <span style={{
                width: 20, height: 20, borderRadius: "50%",
                background: "#F59E0B", color: "#fff",
                fontSize: ".7rem", fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, marginTop: 1,
              }}>{i + 1}</span>
              <span style={{ fontSize: ".87rem", color: "var(--ink)", lineHeight: 1.55, fontFamily: "var(--font-cairo)" }}>
                {hint}
              </span>
            </div>
          ))}
        </div>

        {/* Reveal next hint */}
        {!answered && hintsRevealed < maxHints && (
          <button onClick={() => setHintsRevealed(h => h + 1)} style={{
            marginTop: 12, padding: "7px 16px", borderRadius: 20,
            border: "1.5px solid #F59E0B60", background: "#F59E0B15",
            color: "#b07a00", fontSize: ".78rem", fontWeight: 600,
            cursor: "pointer", fontFamily: "var(--font-cairo)",
            display: "block", marginInlineStart: "auto",
          }}>
            {isAr ? `تلميح آخر (${hintsRevealed}/${maxHints}) →` : `Next Hint (${hintsRevealed}/${maxHints}) →`}
          </button>
        )}
      </div>

      {/* Options */}
      <p style={{ fontSize: ".73rem", fontWeight: 600, color: "var(--muted)", marginBottom: 8, fontFamily: "var(--font-cairo)" }}>
        {isAr ? "خمّن الإجابة:" : "Guess the answer:"}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {opts.map((opt, idx) => (
          <button key={idx} onClick={() => handleSelect(idx)} style={getOptStyle(idx)}>
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
