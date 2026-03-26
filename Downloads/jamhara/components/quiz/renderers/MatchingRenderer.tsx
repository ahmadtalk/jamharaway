"use client";
import { useState, useEffect, useRef } from "react";
import type { MatchingQuestion } from "@/lib/supabase/types";

interface Props {
  question: MatchingQuestion;
  isAr: boolean;
  onDone: (correct: boolean) => void;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function MatchingRenderer({ question, isAr, onDone }: Props) {
  const [shuffledRight] = useState(() => shuffle(question.pairs));
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matches, setMatches] = useState<Record<string, string>>({});
  const [wrongFlash, setWrongFlash] = useState<string | null>(null);
  const [firstTryCorrect, setFirstTryCorrect] = useState<Set<string>>(new Set());
  const [attempted, setAttempted] = useState<Set<string>>(new Set());
  const doneCalled = useRef(false);

  const instruction = isAr ? question.instruction_ar : question.instruction_en;
  const matchedCount = Object.keys(matches).length;
  const allMatched = matchedCount === question.pairs.length;

  useEffect(() => {
    if (allMatched && !doneCalled.current) {
      doneCalled.current = true;
      const perfect = firstTryCorrect.size === question.pairs.length;
      setTimeout(() => onDone(perfect), 400);
    }
  }, [allMatched]);

  function handleLeftClick(id: string) {
    if (matches[id] !== undefined || allMatched) return;
    setSelectedLeft(prev => prev === id ? null : id);
  }

  function handleRightClick(pairId: string) {
    if (!selectedLeft) return;
    const alreadyUsed = Object.values(matches).includes(pairId);
    if (alreadyUsed) return;
    const isCorrect = pairId === selectedLeft;
    if (isCorrect) {
      if (!attempted.has(selectedLeft)) {
        setFirstTryCorrect(prev => new Set([...prev, selectedLeft!]));
      }
      setMatches(prev => ({ ...prev, [selectedLeft!]: pairId }));
      setSelectedLeft(null);
    } else {
      setAttempted(prev => new Set([...prev, selectedLeft!]));
      setWrongFlash(pairId);
      setTimeout(() => setWrongFlash(null), 500);
      setSelectedLeft(null);
    }
  }

  function getRightMatchedLeftId(pairId: string): string | null {
    const entry = Object.entries(matches).find(([, r]) => r === pairId);
    return entry ? entry[0] : null;
  }

  return (
    <div>
      {/* Instruction */}
      <div style={{ background: "linear-gradient(135deg,#4CB36C08,#2196F308)", border: "1px solid var(--slate2)", borderRadius: 12, padding: "14px 16px", marginBottom: 14 }}>
        <p style={{ fontSize: ".92rem", fontWeight: 700, color: "var(--ink)", margin: 0, fontFamily: "var(--font-cairo)", lineHeight: 1.5 }}>
          🔗 {instruction}
        </p>
      </div>

      {/* Two columns */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {/* Left */}
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          <p style={{ fontSize: ".68rem", fontWeight: 700, color: "var(--muted)", margin: "0 0 2px", textAlign: "center", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            {isAr ? "العناصر" : "Items"}
          </p>
          {question.pairs.map(pair => {
            const isMatched = matches[pair.id] !== undefined;
            const isSelected = selectedLeft === pair.id;
            return (
              <button key={pair.id} onClick={() => handleLeftClick(pair.id)} style={{
                padding: "10px 10px", borderRadius: 10, minHeight: 50,
                border: `2px solid ${isMatched ? "#4CB36C" : isSelected ? "#7B5EA7" : "var(--slate2)"}`,
                background: isMatched ? "#4CB36C18" : isSelected ? "#7B5EA718" : "var(--white)",
                color: isMatched ? "#2a7a45" : isSelected ? "#5a3f8a" : "var(--ink)",
                fontSize: ".82rem", fontWeight: 600, cursor: isMatched ? "default" : "pointer",
                textAlign: "center", fontFamily: "var(--font-cairo)", transition: "all 0.2s ease",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
              }}>
                {isAr ? pair.left_ar : pair.left_en}
                {isMatched && " ✓"}
              </button>
            );
          })}
        </div>

        {/* Right (shuffled) */}
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          <p style={{ fontSize: ".68rem", fontWeight: 700, color: "var(--muted)", margin: "0 0 2px", textAlign: "center", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            {isAr ? "مقابلاتها" : "Matches"}
          </p>
          {shuffledRight.map(pair => {
            const isMatched = getRightMatchedLeftId(pair.id) !== null;
            const isFlash = wrongFlash === pair.id;
            return (
              <button key={pair.id} onClick={() => handleRightClick(pair.id)} style={{
                padding: "10px 10px", borderRadius: 10, minHeight: 50,
                border: `2px solid ${isMatched ? "#4CB36C" : isFlash ? "#E05A2B" : selectedLeft && !isMatched ? "#7B5EA730" : "var(--slate2)"}`,
                background: isMatched ? "#4CB36C18" : isFlash ? "#E05A2B18" : selectedLeft && !isMatched ? "#7B5EA705" : "var(--white)",
                color: isMatched ? "#2a7a45" : isFlash ? "#b03a18" : "var(--ink)",
                fontSize: ".82rem", fontWeight: 600,
                cursor: isMatched ? "default" : selectedLeft ? "pointer" : "default",
                textAlign: "center", fontFamily: "var(--font-cairo)", transition: "all 0.2s ease",
                display: "flex", alignItems: "center", justifyContent: "center",
                outline: selectedLeft && !isMatched ? "2px dashed #7B5EA740" : "none",
              }}>
                {isAr ? pair.right_ar : pair.right_en}
              </button>
            );
          })}
        </div>
      </div>

      {/* Status hint */}
      <p style={{ fontSize: ".73rem", color: selectedLeft ? "#7B5EA7" : "var(--muted)", textAlign: "center", marginTop: 10, fontFamily: "var(--font-cairo)", fontWeight: selectedLeft ? 600 : 400 }}>
        {allMatched
          ? (isAr
              ? (firstTryCorrect.size === question.pairs.length ? "✅ مثالي! طابقت الكل من المحاولة الأولى!" : `👍 أتممت المطابقة! (${firstTryCorrect.size}/${question.pairs.length} من أول محاولة)`)
              : (firstTryCorrect.size === question.pairs.length ? "✅ Perfect! All matched on first try!" : `👍 Matching complete! (${firstTryCorrect.size}/${question.pairs.length} first try)`))
          : selectedLeft
            ? (isAr ? "الآن انقر على مقابلها في اليمين ←" : "Now click its match on the right →")
            : (isAr ? "انقر على عنصر من اليسار لتبدأ المطابقة" : "Click a left item to start matching")}
      </p>
    </div>
  );
}
