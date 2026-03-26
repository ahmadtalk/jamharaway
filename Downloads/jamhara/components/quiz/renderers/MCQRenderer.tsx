"use client";
import { useState } from "react";
import type { MCQQuestion, LegacyMCQQuestion } from "@/lib/supabase/types";

interface Props {
  question: MCQQuestion | LegacyMCQQuestion;
  isAr: boolean;
  onDone: (correct: boolean, explanation: string) => void;
}

export default function MCQRenderer({ question, isAr, onDone }: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const answered = selected !== null;
  const opts = isAr ? question.options_ar : question.options_en;

  function handleSelect(idx: number) {
    if (answered) return;
    setSelected(idx);
    onDone(idx === question.correct_index, isAr ? question.explanation_ar : question.explanation_en);
  }

  function getStyle(idx: number): React.CSSProperties {
    const base: React.CSSProperties = {
      width: "100%", padding: "12px 16px", borderRadius: 10, border: "1.5px solid",
      fontSize: ".9rem", fontWeight: 500, cursor: answered ? "default" : "pointer",
      textAlign: isAr ? "right" : "left", fontFamily: "var(--font-cairo)",
      lineHeight: 1.5, transition: "all 0.25s ease", display: "flex", alignItems: "center", gap: 10,
    };
    if (!answered) return { ...base, background: "var(--white)", borderColor: "var(--slate2)", color: "var(--ink)" };
    if (idx === question.correct_index) return { ...base, background: "#4CB36C18", borderColor: "#4CB36C", color: "#2a7a45", fontWeight: 600 };
    if (idx === selected) return { ...base, background: "#E05A2B12", borderColor: "#E05A2B", color: "#b03a18" };
    return { ...base, background: "var(--slate3)", borderColor: "var(--slate2)", color: "var(--muted)", opacity: 0.6 };
  }

  const qText = isAr ? question.question_ar : question.question_en;

  return (
    <div>
      <div style={{ background: "linear-gradient(135deg,#7B5EA708,#4CB36C08)", border: "1px solid var(--slate2)", borderRadius: 12, padding: 16, marginBottom: 14 }}>
        <p style={{ fontSize: "1rem", fontWeight: 700, color: "var(--ink)", lineHeight: 1.6, margin: 0, fontFamily: "var(--font-cairo)" }}>{qText}</p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {opts.map((opt, idx) => (
          <button key={idx} onClick={() => handleSelect(idx)} style={getStyle(idx)}>
            <span style={{
              width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: ".78rem", fontWeight: 700,
              background: !answered ? "var(--slate2)" : idx === question.correct_index ? "#4CB36C" : idx === selected ? "#E05A2B" : "var(--slate2)",
              color: answered && (idx === question.correct_index || idx === selected) ? "#fff" : "var(--muted)",
              transition: "all 0.25s ease",
            }}>
              {["أ","ب","ج","د"][idx] ?? String.fromCharCode(65 + idx)}
            </span>
            <span style={{ flex: 1 }}>{opt}</span>
            {answered && idx === question.correct_index && (
              <svg width="16" height="16" viewBox="0 0 20 20" fill="#4CB36C" style={{ flexShrink: 0 }}>
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
              </svg>
            )}
            {answered && idx === selected && idx !== question.correct_index && (
              <svg width="16" height="16" viewBox="0 0 20 20" fill="#E05A2B" style={{ flexShrink: 0 }}>
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
              </svg>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
