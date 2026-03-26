"use client";
import { useState } from "react";
import type { TrueFalseQuestion } from "@/lib/supabase/types";

interface Props {
  question: TrueFalseQuestion;
  isAr: boolean;
  onDone: (correct: boolean, explanation: string) => void;
}

export default function TrueFalseRenderer({ question, isAr, onDone }: Props) {
  const [selected, setSelected] = useState<boolean | null>(null);
  const answered = selected !== null;

  function handleSelect(val: boolean) {
    if (answered) return;
    setSelected(val);
    onDone(val === question.is_true, isAr ? question.explanation_ar : question.explanation_en);
  }

  function btnStyle(val: boolean): React.CSSProperties {
    const isCorrect = val === question.is_true;
    const isSelected = selected === val;
    let bg = "var(--white)", border = "var(--slate2)", color = "var(--ink)";
    if (answered) {
      if (isCorrect) { bg = "#4CB36C18"; border = "#4CB36C"; color = "#2a7a45"; }
      else if (isSelected) { bg = "#E05A2B12"; border = "#E05A2B"; color = "#b03a18"; }
      else { bg = "var(--slate3)"; border = "var(--slate2)"; color = "var(--muted)"; }
    }
    return {
      flex: 1, padding: "22px 16px", borderRadius: 14, border: `2px solid ${border}`,
      background: bg, color, fontSize: "1.1rem", fontWeight: 700,
      cursor: answered ? "default" : "pointer", fontFamily: "var(--font-cairo)",
      transition: "all 0.25s ease", display: "flex", flexDirection: "column",
      alignItems: "center", gap: 8,
    };
  }

  const statement = isAr ? question.statement_ar : question.statement_en;

  return (
    <div>
      {/* Statement card */}
      <div style={{
        background: "linear-gradient(135deg,#2196F308,#7B5EA708)",
        border: "1px solid var(--slate2)", borderRadius: 14,
        padding: "22px 20px", marginBottom: 20, textAlign: "center",
      }}>
        <div style={{ fontSize: "1.4rem", marginBottom: 10 }}>🤔</div>
        <p style={{ fontSize: "1rem", fontWeight: 700, color: "var(--ink)", lineHeight: 1.7, margin: 0, fontFamily: "var(--font-cairo)" }}>
          {statement}
        </p>
      </div>

      {/* True / False buttons */}
      <div style={{ display: "flex", gap: 12 }}>
        <button onClick={() => handleSelect(true)} style={btnStyle(true)}>
          <span style={{ fontSize: "2rem" }}>{answered && question.is_true ? "✅" : "✓"}</span>
          <span>{isAr ? "صواب" : "True"}</span>
        </button>
        <button onClick={() => handleSelect(false)} style={btnStyle(false)}>
          <span style={{ fontSize: "2rem" }}>{answered && !question.is_true ? "✅" : "✗"}</span>
          <span>{isAr ? "خطأ" : "False"}</span>
        </button>
      </div>
    </div>
  );
}
