"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import type { QuizConfig, QuizType, MCQQuestion, LegacyMCQQuestion, TrueFalseQuestion, TimelineQuestion, MatchingQuestion, GuessWhoQuestion, SpeedQuestion, PostWithRelations } from "@/lib/supabase/types";
import { postUrl } from "@/lib/utils";
import JCardShell from "@/components/shared/JCardShell";
import MCQRenderer from "./renderers/MCQRenderer";
import TrueFalseRenderer from "./renderers/TrueFalseRenderer";
import TimelineRenderer from "./renderers/TimelineRenderer";
import MatchingRenderer from "./renderers/MatchingRenderer";
import GuessWhoRenderer from "./renderers/GuessWhoRenderer";
import SpeedRenderer from "./renderers/SpeedRenderer";

interface Props {
  id: string;
  title: string;
  config: QuizConfig;
  categoryName?: string;
  categorySlug?: string;
  categoryColor?: string;
  likeCount: number;
  publishedAt: string;
  locale: "ar" | "en";
  timeAgoStr: string;
  isDetail?: boolean;
  // New unified props
  parentCat?: { name_ar: string; name_en: string; slug: string; color?: string };
  subCat?: { name_ar: string; name_en: string; slug: string };
  tags?: string[];
  tags_en?: string[];
  post?: PostWithRelations;
}

// Quiz type metadata
const QUIZ_META: Record<QuizType, { emoji: string; color: string; label_ar: string; label_en: string }> = {
  mcq:        { emoji: "❓", color: "#7B5EA7", label_ar: "اختيار متعدد",  label_en: "Multiple Choice" },
  true_false: { emoji: "✓✗", color: "#2196F3", label_ar: "صواب أم خطأ؟", label_en: "True or False" },
  timeline:   { emoji: "📅", color: "#E05A2B", label_ar: "رتّب الأحداث", label_en: "Timeline Sort" },
  matching:   { emoji: "🔗", color: "#4CB36C", label_ar: "طابق الأزواج", label_en: "Match Pairs" },
  guess_who:  { emoji: "🎭", color: "#F59E0B", label_ar: "من أنا؟",       label_en: "Guess Who" },
  speed:      { emoji: "⚡", color: "#E05A2B", label_ar: "سباق الوقت",    label_en: "Speed Quiz" },
};

export default function QuizCard({
  id, title, config,
  categoryName, categorySlug, categoryColor = "#4CB36C",
  likeCount, locale, timeAgoStr, isDetail = false,
  parentCat, subCat, tags, tags_en, post,
}: Props) {
  const questions = config.questions ?? [];
  const quizType: QuizType = config.quiz_type ?? "mcq";
  const isAr = locale === "ar";
  const meta = QUIZ_META[quizType] ?? QUIZ_META.mcq;

  // Quiz state — skip intro on detail page, user already navigated here intentionally
  const [phase, setPhase] = useState<"intro" | "playing" | "finished">(isDetail ? "playing" : "intro");
  const [currentQ, setCurrentQ] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [wrongIdxs, setWrongIdxs] = useState<number[]>([]);
  const [pendingExplanation, setPendingExplanation] = useState<string | null>(null);
  const [pendingCorrect, setPendingCorrect] = useState(false);
  const doneRef = useRef(false);

  const totalQ = questions.length;

  const handleDone = useCallback((correct: boolean, explanation?: string) => {
    if (doneRef.current) return;
    doneRef.current = true;
    setAnswered(true);
    setPendingCorrect(correct);
    setPendingExplanation(explanation ?? null);
    if (correct) setScore(s => s + 1);
    else setWrongIdxs(arr => [...arr, currentQ]);
  }, [currentQ]);

  const handleNext = useCallback(() => {
    doneRef.current = false;
    setAnswered(false);
    setPendingExplanation(null);
    if (currentQ + 1 >= totalQ) setPhase("finished");
    else setCurrentQ(n => n + 1);
  }, [currentQ, totalQ]);

  const handleRestart = useCallback(() => {
    doneRef.current = false;
    setPhase("intro");
    setCurrentQ(0);
    setAnswered(false);
    setScore(0);
    setWrongIdxs([]);
    setPendingExplanation(null);
  }, []);

  // Score helpers
  const pct = totalQ > 0 ? Math.round((score / totalQ) * 100) : 0;
  const circumference = 2 * Math.PI * 40;
  const dashOffset = circumference - (pct / 100) * circumference;

  function scoreMessage() {
    if (pct === 100) return isAr ? "مثالي! أنت خبير حقيقي 🏆" : "Perfect! You're a true expert 🏆";
    if (pct >= 80)  return isAr ? "ممتاز! أداء رائع 🌟" : "Excellent! Great performance 🌟";
    if (pct >= 60)  return isAr ? "جيد جداً! تقدم ملحوظ 👍" : "Very good! Solid progress 👍";
    if (pct >= 40)  return isAr ? "لا بأس، حاول مرة أخرى 💪" : "Not bad, try again 💪";
    return isAr ? "للمحاولة أجر! جرب مجدداً 🎯" : "Keep trying! Give it another go 🎯";
  }
  function scoreColor() {
    if (pct >= 80) return "#4CB36C";
    if (pct >= 60) return "#2196F3";
    if (pct >= 40) return "#F59E0B";
    return "#E05A2B";
  }

  function introDesc() {
    switch (quizType) {
      case "true_false": return isAr ? `${totalQ} جملة — حدد صحيحها من خاطئها` : `${totalQ} statements — true or false?`;
      case "timeline":   return isAr ? `${totalQ} جولة — رتّب الأحداث تاريخياً` : `${totalQ} round${totalQ > 1 ? "s" : ""} — sort chronologically`;
      case "matching":   return isAr ? `${totalQ} جولة — طابق كل عنصر بمقابله` : `${totalQ} round${totalQ > 1 ? "s" : ""} — match the pairs`;
      case "guess_who":  return isAr ? `${totalQ} شخصية — خمّن من التلميحات` : `${totalQ} characters — guess from hints`;
      case "speed": {
        const t = (questions[0] as SpeedQuestion)?.time_limit ?? 15;
        return isAr ? `${totalQ} أسئلة — ${t} ثانية لكل سؤال ⚡` : `${totalQ} questions — ${t}s per question ⚡`;
      }
      default: return isAr ? `${totalQ} أسئلة تنتظرك — هل أنت مستعد؟` : `${totalQ} questions await — are you ready?`;
    }
  }

  function renderQuestion() {
    const q = questions[currentQ];
    if (!q) return null;
    switch (quizType) {
      case "true_false":
        return <TrueFalseRenderer key={currentQ} question={q as TrueFalseQuestion} isAr={isAr} onDone={handleDone} />;
      case "timeline":
        return <TimelineRenderer key={currentQ} question={q as TimelineQuestion} isAr={isAr} onDone={handleDone} />;
      case "matching":
        return <MatchingRenderer key={currentQ} question={q as MatchingQuestion} isAr={isAr} onDone={handleDone} />;
      case "guess_who":
        return <GuessWhoRenderer key={currentQ} question={q as GuessWhoQuestion} isAr={isAr} onDone={handleDone} />;
      case "speed":
        return <SpeedRenderer key={currentQ} question={q as SpeedQuestion} isAr={isAr} onDone={handleDone} />;
      default:
        return <MCQRenderer key={currentQ} question={q as MCQQuestion | LegacyMCQQuestion} isAr={isAr} onDone={handleDone} />;
    }
  }

  function renderRecap() {
    if (wrongIdxs.length === 0 || !isDetail) return null;
    if (!["mcq", "speed", "true_false"].includes(quizType)) return null;
    return (
      <div style={{ background: "var(--slate3)", borderRadius: 12, padding: "14px 16px", marginBottom: 20, textAlign: isAr ? "right" : "left" }}>
        <p style={{ fontSize: ".8rem", fontWeight: 700, color: "var(--muted)", margin: "0 0 10px" }}>
          {isAr ? "الإجابات الخاطئة:" : "Questions you missed:"}
        </p>
        {wrongIdxs.map((qi, n) => {
          const wq = questions[qi] as any;
          return (
            <div key={qi} style={{ borderTop: n === 0 ? "none" : "1px solid var(--slate2)", paddingTop: n === 0 ? 0 : 8, marginTop: n === 0 ? 0 : 8 }}>
              <p style={{ fontSize: ".82rem", color: "var(--ink2)", margin: "0 0 4px", fontWeight: 600 }}>
                {isAr ? (wq.question_ar ?? wq.statement_ar) : (wq.question_en ?? wq.statement_en)}
              </p>
              {quizType === "true_false" ? (
                <p style={{ fontSize: ".8rem", color: "#4CB36C", margin: 0 }}>
                  ✓ {isAr ? (wq.is_true ? "صواب" : "خطأ") : (wq.is_true ? "True" : "False")}
                </p>
              ) : (
                <p style={{ fontSize: ".8rem", color: "#4CB36C", margin: 0 }}>
                  ✓ {isAr ? wq.options_ar?.[wq.correct_index] : wq.options_en?.[wq.correct_index]}
                </p>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // Build parentCat from legacy props if not provided directly
  const resolvedParentCat = parentCat ?? (categoryName && categorySlug
    ? { name_ar: categoryName, name_en: categoryName, slug: categorySlug, color: categoryColor }
    : undefined);

  // Type label includes subtype
  const typeLabel_ar = `اختبار — ${meta.label_ar}`;
  const typeLabel_en = `Quiz — ${meta.label_en}`;

  const sourceUrl = config.sourceUrl || undefined;
  const href = postUrl(id, locale);

  return (
    <JCardShell
      postId={id}
      postType="quiz"
      typeLabel_ar={typeLabel_ar}
      typeLabel_en={typeLabel_en}
      title={title}
      locale={locale}
      timeAgoStr={timeAgoStr}
      isDetail={isDetail}
      parentCat={resolvedParentCat}
      subCat={subCat}
      sourceUrl={sourceUrl}
      likeCount={likeCount}
      tags={tags} tags_en={tags_en}
    >
      {/* زر المشاركة — يظهر فقط في صفحة التفاصيل */}
      {isDetail && post && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>        </div>
      )}

      {/* Feed: show intro only */}
      {!isDetail ? (
        <div className="jcard-quiz-intro">
          <div
            className="jcard-quiz-icon"
            style={{
              background: `linear-gradient(135deg,${meta.color}20,${categoryColor}20)`,
              border: `2px solid ${meta.color}30`,
            }}
          >
            {meta.emoji}
          </div>
          <p style={{
            fontSize: ".83rem",
            fontWeight: 700,
            color: meta.color,
            margin: 0,
            fontFamily: "var(--font-cairo)",
          }}>
            {isAr ? meta.label_ar : meta.label_en}
          </p>
          <p style={{
            fontSize: ".85rem",
            color: "var(--muted)",
            lineHeight: 1.6,
            margin: 0,
            maxWidth: 300,
            textAlign: "center",
          }}>
            {introDesc()}
          </p>
          {config.difficulty && (
            <span style={{
              display: "inline-block",
              padding: "4px 14px",
              borderRadius: 100,
              fontSize: ".8rem",
              fontWeight: 600,
              background: config.difficulty === "easy" ? "#4CB36C18" : config.difficulty === "hard" ? "#E05A2B18" : "#F59E0B18",
              color: config.difficulty === "easy" ? "#2a7a45" : config.difficulty === "hard" ? "#b03a18" : "#b07a00",
            }}>
              {config.difficulty === "easy" ? (isAr ? "سهل" : "Easy") : config.difficulty === "hard" ? (isAr ? "صعب" : "Hard") : (isAr ? "متوسط" : "Medium")}
            </span>
          )}
          <Link
            href={href}
            className="jcard-quiz-start"
            style={{ background: `linear-gradient(135deg,${meta.color},${categoryColor})` }}
          >
            {isAr ? "ابدأ ←" : "Start →"}
          </Link>
        </div>
      ) : (
        /* Detail: full interactive quiz */
        <div>
          {/* ════ INTRO ════ */}
          {phase === "intro" && (
            <div style={{ textAlign: "center", padding: "24px 0 8px" }}>
              <div style={{
                width: 72, height: 72, borderRadius: "50%",
                background: `linear-gradient(135deg,${meta.color}20,${categoryColor}20)`,
                border: `2px solid ${meta.color}30`,
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 16px", fontSize: "2rem",
              }}>
                {meta.emoji}
              </div>
              <p style={{ fontSize: ".83rem", fontWeight: 700, color: meta.color, margin: "0 0 6px", fontFamily: "var(--font-cairo)" }}>
                {isAr ? meta.label_ar : meta.label_en}
              </p>
              <p style={{ fontSize: ".88rem", color: "var(--muted)", lineHeight: 1.6, margin: "0 0 20px", maxWidth: 300, marginInline: "auto" }}>
                {introDesc()}
              </p>
              {config.difficulty && (
                <div style={{ marginBottom: 20 }}>
                  <span style={{
                    display: "inline-block", padding: "4px 14px", borderRadius: 100, fontSize: ".8rem", fontWeight: 600,
                    background: config.difficulty === "easy" ? "#4CB36C18" : config.difficulty === "hard" ? "#E05A2B18" : "#F59E0B18",
                    color: config.difficulty === "easy" ? "#2a7a45" : config.difficulty === "hard" ? "#b03a18" : "#b07a00",
                  }}>
                    {config.difficulty === "easy" ? (isAr ? "سهل" : "Easy") : config.difficulty === "hard" ? (isAr ? "صعب" : "Hard") : (isAr ? "متوسط" : "Medium")}
                  </span>
                </div>
              )}
              <button
                onClick={() => setPhase("playing")}
                style={{
                  background: `linear-gradient(135deg,${meta.color},${categoryColor})`,
                  color: "#fff", border: "none", borderRadius: 12,
                  padding: "12px 36px", fontSize: "1rem", fontWeight: 700,
                  cursor: "pointer", fontFamily: "var(--font-cairo)",
                  boxShadow: `0 4px 16px ${meta.color}30`, transition: "transform .15s,box-shadow .15s",
                }}
                onMouseOver={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; }}
                onMouseOut={e => { (e.currentTarget as HTMLElement).style.transform = ""; }}
              >
                {isAr ? "ابدأ الاختبار" : "Start Quiz"}
              </button>
            </div>
          )}

          {/* ════ PLAYING ════ */}
          {phase === "playing" && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div style={{ flex: 1, height: 5, background: "var(--slate2)", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{
                    height: "100%",
                    width: `${((currentQ + (answered ? 1 : 0)) / totalQ) * 100}%`,
                    background: `linear-gradient(90deg,${meta.color},${categoryColor})`,
                    borderRadius: 3, transition: "width .4s ease",
                  }} />
                </div>
                <span style={{ fontSize: ".75rem", fontWeight: 700, color: "var(--muted)", whiteSpace: "nowrap" }}>
                  {currentQ + 1} / {totalQ}
                </span>
              </div>

              {renderQuestion()}

              {answered && pendingExplanation && (
                <div style={{
                  background: pendingCorrect ? "#4CB36C0F" : "#2196F30F",
                  border: `1px solid ${pendingCorrect ? "#4CB36C30" : "#2196F330"}`,
                  borderRadius: 10, padding: "12px 14px",
                  marginTop: 14, marginBottom: 4,
                  display: "flex", gap: 10, alignItems: "flex-start",
                }}>
                  <span style={{ fontSize: "1.1rem", lineHeight: 1 }}>{pendingCorrect ? "✅" : "💡"}</span>
                  <p style={{ margin: 0, fontSize: ".85rem", color: "var(--ink2)", lineHeight: 1.65, fontFamily: "var(--font-cairo)" }}>
                    {pendingExplanation}
                  </p>
                </div>
              )}

              {answered && (
                <button
                  onClick={handleNext}
                  style={{
                    width: "100%", marginTop: 12,
                    background: currentQ + 1 >= totalQ
                      ? "linear-gradient(135deg,#4CB36C,#2a7a45)"
                      : `linear-gradient(135deg,${meta.color},${categoryColor})`,
                    color: "#fff", border: "none", borderRadius: 10,
                    padding: "12px", fontSize: ".95rem", fontWeight: 700,
                    cursor: "pointer", fontFamily: "var(--font-cairo)",
                    marginBottom: 6, transition: "opacity .15s",
                  }}
                  onMouseOver={e => { (e.currentTarget as HTMLElement).style.opacity = ".9"; }}
                  onMouseOut={e => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
                >
                  {currentQ + 1 >= totalQ
                    ? (isAr ? "عرض النتيجة ←" : "See Results →")
                    : (isAr ? "السؤال التالي ←" : "Next Question →")}
                </button>
              )}
            </div>
          )}

          {/* ════ FINISHED ════ */}
          {phase === "finished" && (
            <div style={{ textAlign: "center", padding: "16px 0 8px" }}>
              <div style={{ position: "relative", display: "inline-flex", justifyContent: "center", alignItems: "center", marginBottom: 16 }}>
                <svg width="130" height="130" viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)" }}>
                  <circle cx="50" cy="50" r="40" fill="none" stroke="var(--slate2)" strokeWidth="9"/>
                  <circle cx="50" cy="50" r="40" fill="none" stroke={scoreColor()} strokeWidth="9"
                    strokeLinecap="round"
                    strokeDasharray={`${circumference}`}
                    strokeDashoffset={dashOffset}
                    style={{ transition: "stroke-dashoffset 1s cubic-bezier(.4,0,.2,1)" }}
                  />
                </svg>
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: "1.7rem", fontWeight: 900, color: scoreColor(), lineHeight: 1, fontFamily: "var(--font-cairo)" }}>
                    {score}/{totalQ}
                  </span>
                  <span style={{ fontSize: ".72rem", color: "var(--muted)", marginTop: 2 }}>{pct}%</span>
                </div>
              </div>

              <p style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--ink)", margin: "0 0 8px", fontFamily: "var(--font-cairo)" }}>
                {scoreMessage()}
              </p>
              <p style={{ fontSize: ".83rem", color: "var(--muted)", margin: "0 0 20px" }}>
                {isAr
                  ? `أجبت على ${score} من ${totalQ} بشكل صحيح`
                  : `You got ${score} out of ${totalQ} correct`}
              </p>

              {renderRecap()}

              <button
                onClick={handleRestart}
                style={{
                  background: "var(--slate2)", color: "var(--ink)", border: "none",
                  borderRadius: 10, padding: "10px 22px", fontSize: ".9rem",
                  fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-cairo)",
                }}
              >
                {isAr ? "↺ العب مجدداً" : "↺ Play Again"}
              </button>
            </div>
          )}
        </div>
      )}
    </JCardShell>
  );
}
