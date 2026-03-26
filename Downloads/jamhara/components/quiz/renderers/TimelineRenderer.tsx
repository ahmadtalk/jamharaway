"use client";
import { useState } from "react";
import type { TimelineQuestion, TimelineEvent } from "@/lib/supabase/types";

interface Props {
  question: TimelineQuestion;
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

export default function TimelineRenderer({ question, isAr, onDone }: Props) {
  const [shuffled] = useState(() => shuffle(question.events));
  const [userOrder, setUserOrder] = useState<string[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const instruction = isAr ? question.instruction_ar : question.instruction_en;
  const available = shuffled.filter(e => !userOrder.includes(e.id));
  const allSelected = userOrder.length === question.events.length;
  const correctOrder = [...question.events].sort((a, b) => a.order - b.order).map(e => e.id);

  function selectEvent(id: string) {
    if (revealed) return;
    setUserOrder(prev => [...prev, id]);
  }

  function deselectLast() {
    if (revealed) return;
    setUserOrder(prev => prev.slice(0, -1));
  }

  function confirm() {
    if (!allSelected || revealed) return;
    const correct = userOrder.every((id, i) => id === correctOrder[i]);
    setIsCorrect(correct);
    setRevealed(true);
    onDone(correct);
  }

  function getEvent(id: string): TimelineEvent {
    return question.events.find(e => e.id === id)!;
  }

  function getLabel(e: TimelineEvent) {
    return isAr ? e.label_ar : e.label_en;
  }

  return (
    <div>
      {/* Instruction */}
      <div style={{ background: "linear-gradient(135deg,#E05A2B08,#F59E0B08)", border: "1px solid var(--slate2)", borderRadius: 12, padding: "14px 16px", marginBottom: 14 }}>
        <p style={{ fontSize: ".92rem", fontWeight: 700, color: "var(--ink)", margin: 0, fontFamily: "var(--font-cairo)", lineHeight: 1.5 }}>
          📅 {instruction}
        </p>
      </div>

      {/* User's selection zone */}
      {userOrder.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <p style={{ fontSize: ".7rem", fontWeight: 600, color: "var(--muted)", marginBottom: 6 }}>
            {isAr ? "ترتيبك:" : "Your order:"}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {userOrder.map((id, i) => {
              const e = getEvent(id);
              const positionCorrect = revealed && correctOrder[i] === id;
              return (
                <div key={id} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 14px", borderRadius: 10,
                  background: !revealed ? "#7B5EA710" : positionCorrect ? "#4CB36C18" : "#E05A2B12",
                  border: `1.5px solid ${!revealed ? "#7B5EA730" : positionCorrect ? "#4CB36C" : "#E05A2B"}`,
                  transition: "all 0.3s ease",
                }}>
                  <span style={{
                    width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
                    background: !revealed ? "#7B5EA7" : positionCorrect ? "#4CB36C" : "#E05A2B",
                    color: "#fff", fontSize: ".75rem", fontWeight: 700,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>{i + 1}</span>
                  <span style={{ flex: 1, fontSize: ".88rem", fontWeight: 600, color: "var(--ink)", fontFamily: "var(--font-cairo)" }}>
                    {getLabel(e)}
                  </span>
                  {revealed && e.year && (
                    <span style={{ fontSize: ".72rem", color: "var(--muted)", direction: "ltr" }}>{e.year}</span>
                  )}
                  {revealed && <span>{positionCorrect ? "✅" : "❌"}</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Available events */}
      {!revealed && available.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <p style={{ fontSize: ".7rem", fontWeight: 600, color: "var(--muted)", marginBottom: 6 }}>
            {isAr ? "الأحداث — انقر لإضافتها بالترتيب:" : "Events — click to add in order:"}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {available.map(e => (
              <button key={e.id} onClick={() => selectEvent(e.id)} style={{
                padding: "10px 14px", borderRadius: 10,
                border: "1.5px solid var(--slate2)", background: "var(--white)",
                color: "var(--ink)", fontSize: ".88rem", fontWeight: 500,
                cursor: "pointer", textAlign: isAr ? "right" : "left",
                fontFamily: "var(--font-cairo)", transition: "all 0.15s ease",
              }}
                onMouseOver={ev => { (ev.currentTarget as HTMLElement).style.background = "#7B5EA710"; (ev.currentTarget as HTMLElement).style.borderColor = "#7B5EA7"; }}
                onMouseOut={ev => { (ev.currentTarget as HTMLElement).style.background = "var(--white)"; (ev.currentTarget as HTMLElement).style.borderColor = "var(--slate2)"; }}
              >
                {getLabel(e)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Result message */}
      {revealed && (
        <div style={{
          padding: "12px 14px", borderRadius: 10, marginBottom: 10,
          background: isCorrect ? "#4CB36C0F" : "#2196F30F",
          border: `1px solid ${isCorrect ? "#4CB36C30" : "#2196F330"}`,
        }}>
          <p style={{ margin: 0, fontSize: ".85rem", color: "var(--ink2)", lineHeight: 1.65, fontFamily: "var(--font-cairo)" }}>
            {isCorrect
              ? (isAr ? "✅ رائع! رتّبت جميع الأحداث بشكل صحيح." : "✅ Excellent! You ordered all events correctly.")
              : (isAr ? "💡 الترتيب الصحيح موضح أعلاه — ✅ موضع صحيح، ❌ موضع خاطئ" : "💡 Correct order shown above — ✅ correct position, ❌ wrong position")}
          </p>
        </div>
      )}

      {/* Controls */}
      {!revealed && (
        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
          {userOrder.length > 0 && (
            <button onClick={deselectLast} style={{
              padding: "10px 16px", borderRadius: 10,
              border: "1.5px solid var(--slate2)", background: "var(--white)",
              color: "var(--muted)", fontSize: ".83rem", fontWeight: 600,
              cursor: "pointer", fontFamily: "var(--font-cairo)",
            }}>
              {isAr ? "↺ تراجع" : "↺ Undo"}
            </button>
          )}
          {allSelected && (
            <button onClick={confirm} style={{
              flex: 1, padding: "11px", borderRadius: 10, border: "none",
              background: "linear-gradient(135deg,#E05A2B,#F59E0B)",
              color: "#fff", fontSize: ".92rem", fontWeight: 700,
              cursor: "pointer", fontFamily: "var(--font-cairo)",
            }}>
              {isAr ? "تأكيد الترتيب ✓" : "Confirm Order ✓"}
            </button>
          )}
          {!allSelected && userOrder.length === 0 && (
            <p style={{ fontSize: ".75rem", color: "var(--muted)", fontFamily: "var(--font-cairo)", margin: 0, alignSelf: "center" }}>
              {isAr ? "انقر على الأحداث بالترتيب الزمني الصحيح" : "Click events in the correct chronological order"}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
