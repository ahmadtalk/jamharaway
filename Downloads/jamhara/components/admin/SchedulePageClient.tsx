"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

// ── Types ──────────────────────────────────────────────────────────────────
interface ScheduledJob {
  id: string;
  name: string;
  is_active: boolean;
  recurrence: "once" | "daily" | "interval";
  run_at_hour: number;
  run_at_minute: number;
  interval_minutes: number | null;
  active_hours_start: number | null;
  active_hours_end: number | null;
  post_types: string[];
  posts_count: number;
  category_slugs: string[] | null;
  last_run_at: string | null;
  total_runs: number;
  total_succeeded: number;
  total_failed: number;
  created_at: string;
}

interface JobRun {
  id: string;
  job_id: string | null;
  job_name: string | null;
  triggered_by: "cron" | "manual";
  started_at: string;
  completed_at: string | null;
  status: "running" | "done" | "failed" | "partial";
  posts_attempted: number;
  posts_succeeded: number;
  posts_failed: number;
  results: PostResult[] | null;
  error_message: string | null;
}

interface PostResult {
  type: string;
  category: string;
  success: boolean;
  title?: string;
  post_id?: string;
  error?: string;
}

interface Category {
  slug: string;
  name_ar: string;
}

interface Props {
  initialJobs: ScheduledJob[];
  initialRuns: JobRun[];
  categories: Category[];
}

// ── Constants ──────────────────────────────────────────────────────────────
const ALL_POST_TYPES = [
  { id: "article",    label: "مقال" },
  { id: "chart",      label: "مخطط" },
  { id: "quiz",       label: "اختبار" },
  { id: "comparison", label: "مقارنة" },
  { id: "ranking",    label: "ترتيب" },
  { id: "numbers",    label: "أرقام" },
  { id: "scenarios",  label: "سيناريوهات" },
  { id: "timeline",   label: "خط زمني" },
  { id: "factcheck",  label: "تدقيق" },
  { id: "profile",    label: "بروفايل" },
  { id: "briefing",   label: "موجز" },
  { id: "quotes",     label: "اقتباسات" },
  { id: "explainer",  label: "شارح" },
  { id: "debate",     label: "مناظرة" },
  { id: "guide",      label: "دليل عملي" },
  { id: "network",    label: "خريطة صلات" },
  { id: "interview",  label: "مقابلة" },
  { id: "map",        label: "توزيع جغرافي" },
];

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5); // 0,5,10,...,55

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  running: { bg: "#EDF3FF", color: "#3B6CC4", label: "جارٍ" },
  done:    { bg: "#E8F6ED", color: "#2D7A46", label: "✓ مكتمل" },
  partial: { bg: "#FFF3E8", color: "#C05E1A", label: "⚠ جزئي" },
  failed:  { bg: "#FEF2F2", color: "#DC2626", label: "✗ فشل" },
};

// ── Helpers ────────────────────────────────────────────────────────────────
function fmt(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("ar-SA", {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

// ── Blank form ─────────────────────────────────────────────────────────────
const INTERVAL_OPTIONS = [5, 10, 15, 20, 30, 40, 60, 90, 120, 180, 240];

function blankForm() {
  return {
    name:               "",
    recurrence:         "interval" as "once" | "daily" | "interval",
    run_at_hour:        6,
    run_at_minute:      0,
    interval_minutes:   30,
    active_hours_start: null as number | null,
    active_hours_end:   null as number | null,
    post_types:         ["article"],
    posts_count:        1,
    category_slugs:     [] as string[],
  };
}

// ── Main Component ─────────────────────────────────────────────────────────
export function SchedulePageClient({ initialJobs, initialRuns, categories }: Props) {
  const router = useRouter();
  const [jobs, setJobs]           = useState<ScheduledJob[]>(initialJobs);
  const [runs, setRuns]           = useState<JobRun[]>(initialRuns);
  const [showModal, setShowModal] = useState(false);
  const [editJob, setEditJob]     = useState<ScheduledJob | null>(null);
  const [form, setForm]           = useState(blankForm());
  const [saving, setSaving]       = useState(false);
  const [saveError, setSaveError] = useState("");
  const [runningId, setRunningId] = useState<string | null>(null);
  const [runFeedback, setRunFeedback] = useState<{ jobId: string; msg: string; ok: boolean } | null>(null);
  const [expandedRun, setExpandedRun] = useState<string | null>(null);
  const [deletingId, setDeletingId]   = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"jobs" | "history" | "cycle">("jobs");
  const [cycleWorking, setCycleWorking] = useState(false);
  const [cycleMsg, setCycleMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // Default publishing cycle config (UTC times)
  const [cyclePeriods, setCyclePeriods] = useState([
    { key: "night",     label: "الليل",   emoji: "🌙", start: 0,  end: 6,  interval: 10, types: ["article", "briefing", "timeline", "profile"] },
    { key: "morning",   label: "الصباح",  emoji: "☀️", start: 6,  end: 12, interval: 5,  types: ["article", "chart", "quiz", "numbers", "factcheck"] },
    { key: "afternoon", label: "الظهيرة", emoji: "⛅", start: 12, end: 18, interval: 5,  types: ["article", "comparison", "ranking", "explainer", "debate"] },
    { key: "evening",   label: "المساء",  emoji: "🌆", start: 18, end: 24, interval: 8,  types: ["article", "quotes", "guide", "interview", "network", "map"] },
  ]);

  // ── Reload from server ───────────────────────────────
  const reload = useCallback(async () => {
    const [jobsRes, runsRes] = await Promise.all([
      fetch("/api/admin/schedules"),
      fetch("/api/admin/schedule-runs"),
    ]);
    const jobsData = await jobsRes.json();
    const runsData = await runsRes.json();
    setJobs(jobsData.jobs ?? []);
    setRuns(runsData.runs ?? []);
    router.refresh();
  }, [router]);

  // ── Open modal ───────────────────────────────────────
  function openAdd() {
    setEditJob(null);
    setForm(blankForm());
    setSaveError("");
    setShowModal(true);
  }

  function openEdit(job: ScheduledJob) {
    setEditJob(job);
    setForm({
      name:               job.name,
      recurrence:         job.recurrence,
      run_at_hour:        job.run_at_hour,
      run_at_minute:      job.run_at_minute,
      interval_minutes:   job.interval_minutes ?? 30,
      active_hours_start: job.active_hours_start ?? null,
      active_hours_end:   job.active_hours_end   ?? null,
      post_types:         job.post_types,
      posts_count:        job.posts_count,
      category_slugs:     job.category_slugs ?? [],
    });
    setSaveError("");
    setShowModal(true);
  }

  // ── Save (create or update) ──────────────────────────
  async function handleSave() {
    if (!form.name.trim()) { setSaveError("الاسم مطلوب"); return; }
    if (form.post_types.length === 0) { setSaveError("اختر نوعاً واحداً على الأقل"); return; }
    setSaving(true);
    setSaveError("");

    try {
      const url    = editJob ? `/api/admin/schedules/${editJob.id}` : "/api/admin/schedules";
      const method = editJob ? "PUT" : "POST";

      const payload = {
        ...form,
        active_hours_start: form.active_hours_start,
        active_hours_end:   form.active_hours_end,
      };
      const res  = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) { setSaveError(data.error ?? "حدث خطأ"); return; }

      setShowModal(false);
      await reload();
    } catch {
      setSaveError("تعذّر الاتصال بالخادم");
    } finally {
      setSaving(false);
    }
  }

  // ── Toggle active ────────────────────────────────────
  async function handleToggle(job: ScheduledJob) {
    const res  = await fetch(`/api/admin/schedules/${job.id}`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ action: "toggle" }),
    });
    const data = await res.json();
    if (data.success) {
      setJobs((prev) =>
        prev.map((j) => j.id === job.id ? { ...j, is_active: data.is_active } : j)
      );
    }
  }

  // ── Run now ──────────────────────────────────────────
  async function handleRunNow(job: ScheduledJob) {
    setRunningId(job.id);
    setRunFeedback(null);
    try {
      const res  = await fetch(`/api/admin/schedules/${job.id}`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ action: "run" }),
      });
      const data = await res.json() as {
        success?: boolean;
        ran?: number;
        summaries?: { job: string; status: string; succeeded: number; failed: number }[];
        error?: string;
      };

      // Build feedback message
      let msg = "";
      let ok  = false;
      if (!res.ok || data.error) {
        msg = `فشل التشغيل: ${data.error ?? `HTTP ${res.status}`}`;
      } else if (data.summaries && data.summaries.length > 0) {
        const s = data.summaries[0];
        const total = (s.succeeded ?? 0) + (s.failed ?? 0);
        if (s.status === "done") {
          msg = `✓ نُشر ${s.succeeded} من ${total} منشورات بنجاح`;
          ok  = true;
        } else if (s.status === "partial") {
          msg = `⚠ نُشر ${s.succeeded} ✓ وفشل ${s.failed} ✗ من ${total} منشورات`;
          ok  = false;
        } else {
          msg = `✗ فشل التوليد — تحقق من سجل التشغيل`;
        }
      } else {
        msg = "✓ أُرسل طلب التشغيل — راجع السجل";
        ok  = true;
      }

      setRunFeedback({ jobId: job.id, msg, ok });

      // Reload jobs + runs then switch to history tab
      await reload();
      setActiveTab("history");
    } catch (e) {
      setRunFeedback({ jobId: job.id, msg: `✗ تعذّر الاتصال: ${e instanceof Error ? e.message : "خطأ غير معروف"}`, ok: false });
    } finally {
      setRunningId(null);
      // Clear feedback after 8 seconds
      setTimeout(() => setRunFeedback(null), 8000);
    }
  }

  // ── Delete ───────────────────────────────────────────
  async function handleDelete(job: ScheduledJob) {
    if (!confirm(`حذف الجدولة "${job.name}"؟`)) return;
    setDeletingId(job.id);
    await fetch(`/api/admin/schedules/${job.id}`, { method: "DELETE" });
    setJobs((prev) => prev.filter((j) => j.id !== job.id));
    setDeletingId(null);
  }

  // ── Apply publishing cycle ──────────────────────────
  async function handleApplyCycle() {
    if (!confirm("سيتم إنشاء 4 جدولات لدورة النشر (ليل/صباح/ظهيرة/مساء). هل تريد المتابعة؟")) return;
    setCycleWorking(true);
    setCycleMsg(null);
    let created = 0;
    let errors  = 0;
    for (const p of cyclePeriods) {
      try {
        const res = await fetch("/api/admin/schedules", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name:               `دورة_${p.key}`,
            recurrence:         "interval",
            interval_minutes:   p.interval,
            active_hours_start: p.start,
            active_hours_end:   p.end,
            post_types:         p.types,
            posts_count:        1,
            category_slugs:     [],
          }),
        });
        if (res.ok) created++; else errors++;
      } catch { errors++; }
    }
    await reload();
    setCycleMsg({
      ok:   errors === 0,
      text: errors === 0
        ? `✓ تم إنشاء ${created} جدولات بنجاح — انتقل لتبويب الجدولات لمراجعتها`
        : `أُنشئ ${created} وفشل ${errors} — راجع الجدولات`,
    });
    setCycleWorking(false);
  }

  // ── Type checkbox toggle ─────────────────────────────
  function toggleType(typeId: string) {
    setForm((f) => ({
      ...f,
      post_types: f.post_types.includes(typeId)
        ? f.post_types.filter((t) => t !== typeId)
        : [...f.post_types, typeId],
    }));
  }

  // ── Category checkbox toggle ─────────────────────────
  function toggleCategory(slug: string) {
    setForm((f) => ({
      ...f,
      category_slugs: f.category_slugs.includes(slug)
        ? f.category_slugs.filter((s) => s !== slug)
        : [...f.category_slugs, slug],
    }));
  }

  // ── Render ───────────────────────────────────────────
  return (
    <div>

      {/* ── Cron status banner ── */}
      <div className="a-card" style={{ marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{
            width: 10, height: 10, borderRadius: "50%",
            background: "#4CB36C", display: "inline-block",
            boxShadow: "0 0 0 3px #E8F6ED",
          }} />
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: ".9rem" }}>محرك الجدولة نشط</p>
            <p style={{ margin: 0, fontSize: ".78rem", color: "#6B7280" }}>
              يُشغَّل كل 5 دقائق (cron-job.org) — يفحص الجدولات المحددة ويُنفّذها تلقائياً
            </p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: ".75rem", color: "#9BA0B8" }}>جميع الأوقات بتوقيت UTC</span>
          <span style={{ fontSize: ".75rem", color: "#9BA0B8" }}>•</span>
          <span style={{ fontSize: ".75rem", color: "#9BA0B8" }}>السعودية: UTC+3 | الإمارات: UTC+4</span>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: "flex", gap: 0, marginBottom: 20, borderBottom: "2px solid var(--a-border)", position: "relative" }}>
        {[
          { key: "jobs",    label: `الجدولات (${jobs.length})` },
          { key: "history", label: `سجل التشغيل (${runs.length})` },
          { key: "cycle",   label: "🗓 دورة النشر" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as "jobs" | "history" | "cycle")}
            style={{
              padding: "10px 20px",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              fontWeight: activeTab === tab.key ? 700 : 400,
              fontSize: ".875rem",
              color: activeTab === tab.key ? "var(--a-green)" : "#6B7280",
              borderBottom: activeTab === tab.key ? "2px solid var(--a-green)" : "2px solid transparent",
              marginBottom: -2,
              transition: "all .15s",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Run feedback banner ── */}
      {runFeedback && (
        <div style={{
          marginBottom: 16,
          padding: "12px 16px",
          borderRadius: 10,
          background: runFeedback.ok ? "#E8F6ED" : "#FEF2F2",
          border: `1px solid ${runFeedback.ok ? "#BBF7D0" : "#FECACA"}`,
          color: runFeedback.ok ? "#2D7A46" : "#DC2626",
          fontSize: ".85rem", fontWeight: 600,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <span>{runFeedback.msg}</span>
          <button
            onClick={() => setRunFeedback(null)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", fontSize: "1rem", lineHeight: 1, opacity: 0.6 }}
          >×</button>
        </div>
      )}

      {/* ═══════════════════════════════════════
          TAB: JOBS
      ═══════════════════════════════════════ */}
      {activeTab === "jobs" && (
        <div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
            <button className="a-btn" onClick={openAdd} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              إضافة جدولة
            </button>
          </div>

          {jobs.length === 0 ? (
            <div className="a-card" style={{ textAlign: "center", padding: "48px 20px" }}>
              <p style={{ color: "#9BA0B8", fontSize: ".9rem", margin: 0 }}>لا توجد جدولات بعد — أضف جدولتك الأولى</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {jobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  categories={categories}
                  running={runningId === job.id}
                  deleting={deletingId === job.id}
                  onEdit={() => openEdit(job)}
                  onToggle={() => handleToggle(job)}
                  onRunNow={() => handleRunNow(job)}
                  onDelete={() => handleDelete(job)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════
          TAB: HISTORY
      ═══════════════════════════════════════ */}
      {activeTab === "history" && (
        <div className="a-card">
          {runs.length === 0 ? (
            <p style={{ color: "#9BA0B8", textAlign: "center", padding: "32px 0", fontSize: ".85rem", margin: 0 }}>
              لا توجد عمليات تشغيل بعد
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {runs.map((run) => {
                const s = STATUS_STYLE[run.status] ?? STATUS_STYLE.failed;
                const isExpanded = expandedRun === run.id;
                return (
                  <div key={run.id} style={{ borderBottom: "1px solid var(--a-border)" }}>
                    {/* Run header row */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "auto 1fr auto auto auto",
                        gap: 12, alignItems: "center",
                        padding: "12px 4px",
                        cursor: "pointer",
                      }}
                      onClick={() => setExpandedRun(isExpanded ? null : run.id)}
                    >
                      {/* Status badge */}
                      <span className="a-badge" style={{ background: s.bg, color: s.color, minWidth: 64, textAlign: "center" }}>
                        {s.label}
                      </span>

                      {/* Job name + time */}
                      <div>
                        <p style={{ margin: 0, fontWeight: 600, fontSize: ".83rem" }}>
                          {run.job_name ?? "تشغيل يدوي"}
                          {run.triggered_by === "manual" && (
                            <span style={{ marginRight: 6, fontSize: ".7rem", color: "#9BA0B8", fontWeight: 400 }}>يدوي</span>
                          )}
                        </p>
                        <p style={{ margin: 0, fontSize: ".73rem", color: "#9BA0B8", marginTop: 2 }}>
                          {fmt(run.started_at)}
                          {run.completed_at && (
                            <span> · {Math.round((new Date(run.completed_at).getTime() - new Date(run.started_at).getTime()) / 1000)} ث</span>
                          )}
                        </p>
                      </div>

                      {/* Counts */}
                      <div style={{ display: "flex", gap: 12, fontSize: ".78rem" }}>
                        <span style={{ color: "#2D7A46" }}>✓ {run.posts_succeeded ?? 0}</span>
                        {(run.posts_failed ?? 0) > 0 && (
                          <span style={{ color: "#DC2626" }}>✗ {run.posts_failed}</span>
                        )}
                      </div>

                      {/* Error badge */}
                      {run.error_message && (
                        <span style={{ fontSize: ".7rem", color: "#DC2626", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {run.error_message}
                        </span>
                      )}

                      {/* Expand toggle */}
                      <svg
                        width="14" height="14" viewBox="0 0 20 20" fill="currentColor"
                        style={{ color: "#9BA0B8", transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform .2s", flexShrink: 0 }}
                      >
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>

                    {/* Expanded: post-level results */}
                    {isExpanded && run.results && (
                      <div style={{ padding: "0 4px 14px", display: "flex", flexDirection: "column", gap: 6 }}>
                        {run.error_message && (
                          <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8, padding: "10px 14px", marginBottom: 8 }}>
                            <p style={{ margin: 0, fontSize: ".8rem", color: "#DC2626", fontWeight: 600 }}>خطأ رئيسي</p>
                            <p style={{ margin: 0, fontSize: ".78rem", color: "#7F1D1D", marginTop: 4 }}>{run.error_message}</p>
                          </div>
                        )}
                        {run.results.map((r, i) => (
                          <div
                            key={i}
                            style={{
                              display: "flex", alignItems: "flex-start", gap: 10,
                              background: r.success ? "#F0FDF4" : "#FFF5F5",
                              border: `1px solid ${r.success ? "#BBF7D0" : "#FECACA"}`,
                              borderRadius: 8, padding: "8px 12px",
                            }}
                          >
                            <span style={{
                              fontWeight: 700, fontSize: ".8rem",
                              color: r.success ? "#2D7A46" : "#DC2626",
                              flexShrink: 0, marginTop: 1,
                            }}>
                              {r.success ? "✓" : "✗"}
                            </span>
                            <div style={{ flex: 1 }}>
                              <p style={{ margin: 0, fontSize: ".8rem", fontWeight: 600, color: "#1E2130" }}>
                                {r.title ?? (r.success ? "منشور جديد" : "فشل التوليد")}
                              </p>
                              <p style={{ margin: 0, marginTop: 3, fontSize: ".73rem", color: "#6B7280" }}>
                                النوع: {r.type} · التصنيف: {r.category}
                                {r.error && <span style={{ color: "#DC2626" }}> · {r.error}</span>}
                              </p>
                            </div>
                            {r.post_id && (
                              <a
                                href={`/p/${r.post_id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ fontSize: ".73rem", color: "var(--a-green)", textDecoration: "none", flexShrink: 0, marginTop: 2 }}
                              >
                                عرض ↗
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════
          TAB: PUBLISHING CYCLE
      ═══════════════════════════════════════ */}
      {activeTab === "cycle" && (
        <div>
          {/* Header */}
          <div className="a-card" style={{ marginBottom: 20, background: "linear-gradient(135deg,#F0FDF4,#EDF3FF)", border: "1px solid #BBF7D0" }}>
            <p style={{ margin: "0 0 6px", fontWeight: 700, fontSize: "1rem" }}>🗓 دورة النشر التلقائية</p>
            <p style={{ margin: 0, fontSize: ".82rem", color: "#374151", lineHeight: 1.6 }}>
              نظام النشر الذكي يُقسّم اليوم إلى 4 فترات — لكل فترة أنواع محتوى مفضّلة وفاصل زمني مستقل.
              سيتم إنشاء 4 جدولات «interval» مع نافذة ساعات نشطة.
            </p>
            <p style={{ margin: "8px 0 0", fontSize: ".77rem", color: "#6B7280" }}>
              ⚠ جميع الأوقات بتوقيت UTC — السعودية: +3 · الإمارات: +4
            </p>
          </div>

          {/* Period cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 16, marginBottom: 20 }}>
            {cyclePeriods.map((p, pi) => {
              // estimated posts per day from this period
              const windowMins = (p.end - p.start) * 60;
              const callsInWindow = Math.floor(windowMins / 5); // cron every 5 min
              const runsInWindow  = Math.floor(windowMins / Math.max(p.interval, 5));
              const est = Math.min(runsInWindow, callsInWindow);

              return (
                <div key={p.key} className="a-card" style={{ borderTop: "3px solid var(--a-green)", padding: 18 }}>
                  <p style={{ margin: "0 0 12px", fontWeight: 700, fontSize: ".95rem" }}>
                    {p.emoji} {p.label}
                    <span style={{ fontWeight: 400, fontSize: ".78rem", color: "#9BA0B8", marginRight: 8 }}>
                      {String(p.start).padStart(2,"0")}:00 – {p.end === 24 ? "24:00" : String(p.end).padStart(2,"0")+":00"} UTC
                    </span>
                  </p>

                  {/* Interval picker */}
                  <div style={{ marginBottom: 12 }}>
                    <p style={{ margin: "0 0 6px", fontSize: ".75rem", color: "#6B7280", fontWeight: 600 }}>الفاصل الزمني</p>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {[5, 6, 8, 10, 15, 20, 30].map((n) => (
                        <button
                          key={n} type="button"
                          onClick={() => setCyclePeriods((prev) => prev.map((x,i) => i===pi ? {...x, interval:n} : x))}
                          style={{
                            padding: "4px 10px", borderRadius: 6,
                            border: `2px solid ${p.interval === n ? "var(--a-green)" : "var(--a-border)"}`,
                            background: p.interval === n ? "var(--a-green)" : "#fff",
                            color: p.interval === n ? "#fff" : "#374151",
                            fontWeight: 700, fontSize: ".78rem", cursor: "pointer",
                          }}
                        >{n}د</button>
                      ))}
                    </div>
                    <p style={{ margin: "6px 0 0", fontSize: ".73rem", color: "#9BA0B8" }}>
                      ≈ {est} منشور في هذه الفترة
                    </p>
                  </div>

                  {/* Content types */}
                  <div>
                    <p style={{ margin: "0 0 6px", fontSize: ".75rem", color: "#6B7280", fontWeight: 600 }}>أنواع المحتوى</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                      {ALL_POST_TYPES.map((t) => {
                        const active = p.types.includes(t.id);
                        return (
                          <button
                            key={t.id} type="button"
                            onClick={() => setCyclePeriods((prev) => prev.map((x,i) => i===pi ? {
                              ...x,
                              types: active ? x.types.filter(tt=>tt!==t.id) : [...x.types, t.id],
                            } : x))}
                            style={{
                              padding: "3px 9px", borderRadius: 20,
                              border: `1px solid ${active ? "var(--a-green)" : "var(--a-border)"}`,
                              background: active ? "#E8F6ED" : "#fff",
                              color: active ? "#2D7A46" : "#9BA0B8",
                              fontSize: ".72rem", cursor: "pointer",
                            }}
                          >{t.label}</button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Total estimate */}
          <div className="a-card" style={{ marginBottom: 16, background: "#F8FAFF", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: ".9rem" }}>
                إجمالي منشورات يومياً (تقريبي):&nbsp;
                <span style={{ color: "var(--a-green)", fontSize: "1.1rem" }}>
                  ~{cyclePeriods.reduce((acc, p) => {
                    const wm = (p.end - p.start) * 60;
                    return acc + Math.floor(wm / Math.max(p.interval, 5));
                  }, 0)} منشور
                </span>
              </p>
              <p style={{ margin: "4px 0 0", fontSize: ".75rem", color: "#9BA0B8" }}>
                يتطلب: cron-job.org كل 5 دقائق + CRON_SECRET صحيح
              </p>
            </div>
            <button
              className="a-btn"
              onClick={handleApplyCycle}
              disabled={cycleWorking}
              style={{ display: "flex", alignItems: "center", gap: 6 }}
            >
              {cycleWorking ? "⏳ جارٍ الإنشاء..." : "🚀 تطبيق دورة النشر"}
            </button>
          </div>

          {cycleMsg && (
            <div style={{
              padding: "12px 16px", borderRadius: 10,
              background: cycleMsg.ok ? "#E8F6ED" : "#FEF2F2",
              border: `1px solid ${cycleMsg.ok ? "#BBF7D0" : "#FECACA"}`,
              color: cycleMsg.ok ? "#2D7A46" : "#DC2626",
              fontSize: ".85rem", fontWeight: 600,
            }}>
              {cycleMsg.text}
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════
          MODAL: Add / Edit schedule
      ═══════════════════════════════════════ */}
      {showModal && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 1000,
            background: "rgba(0,0,0,.45)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "16px",
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div style={{
            background: "#fff", borderRadius: 16,
            width: "100%", maxWidth: 580,
            maxHeight: "90vh", overflow: "auto",
            padding: "28px 28px 24px",
            boxShadow: "0 20px 60px rgba(0,0,0,.25)",
          }}>
            {/* Modal header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <h2 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700 }}>
                {editJob ? "تعديل الجدولة" : "إضافة جدولة جديدة"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#9BA0B8", fontSize: "1.2rem", lineHeight: 1 }}
              >×</button>
            </div>

            {/* ── Name ── */}
            <div style={{ marginBottom: 18 }}>
              <label className="a-label">اسم الجدولة</label>
              <input
                className="a-input"
                placeholder="مثال: توليد صباحي يومي"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>

            {/* ── Recurrence ── */}
            <div style={{ marginBottom: 18 }}>
              <label className="a-label">نوع التكرار</label>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {[
                  { val: "interval", label: "كل N دقيقة", icon: "⏱", desc: "يعمل باستمرار بفاصل زمني تختاره" },
                  { val: "daily",    label: "يومي",        icon: "🔁", desc: "مرة يومياً في وقت محدد" },
                  { val: "once",     label: "مرة واحدة",   icon: "1️⃣", desc: "يعمل مرة ثم يتوقف" },
                ].map((opt) => (
                  <label
                    key={opt.val}
                    style={{
                      flex: 1, minWidth: 120, display: "flex", flexDirection: "column", gap: 3,
                      border: `2px solid ${form.recurrence === opt.val ? "var(--a-green)" : "var(--a-border)"}`,
                      borderRadius: 10, padding: "10px 14px",
                      cursor: "pointer", transition: "all .15s",
                      background: form.recurrence === opt.val ? "#F0FDF4" : "#fff",
                    }}
                  >
                    <input
                      type="radio" name="recurrence" value={opt.val}
                      checked={form.recurrence === opt.val}
                      onChange={() => setForm((f) => ({ ...f, recurrence: opt.val as "once" | "daily" | "interval" }))}
                      style={{ display: "none" }}
                    />
                    <span style={{ fontSize: ".9rem" }}>{opt.icon} <strong>{opt.label}</strong></span>
                    <span style={{ fontSize: ".72rem", color: "#6B7280" }}>{opt.desc}</span>
                  </label>
                ))}
              </div>
              {form.recurrence === "once" && (
                <p style={{ margin: "8px 0 0", fontSize: ".75rem", color: "#C05E1A" }}>
                  ⚠ الجدولة ستُعطَّل تلقائياً بعد التشغيل
                </p>
              )}
            </div>

            {/* ── Interval picker (interval mode only) ── */}
            {form.recurrence === "interval" && (
              <>
              <div style={{ marginBottom: 18 }}>
                <label className="a-label">الفاصل الزمني بين كل تشغيل</label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {INTERVAL_OPTIONS.map((n) => {
                    const label = n < 60 ? `${n}د` : n === 60 ? "ساعة" : `${n / 60}س`;
                    return (
                      <button
                        key={n} type="button"
                        onClick={() => setForm((f) => ({ ...f, interval_minutes: n }))}
                        style={{
                          padding: "6px 14px", borderRadius: 8,
                          border: `2px solid ${form.interval_minutes === n ? "var(--a-green)" : "var(--a-border)"}`,
                          background: form.interval_minutes === n ? "var(--a-green)" : "#fff",
                          color: form.interval_minutes === n ? "#fff" : "#374151",
                          fontWeight: 700, fontSize: ".82rem",
                          cursor: "pointer", transition: "all .15s",
                        }}
                      >{label}</button>
                    );
                  })}
                </div>
                <p style={{ margin: "8px 0 0", fontSize: ".75rem", color: "#6B7280" }}>
                  ⏱ يعمل كل {form.interval_minutes} دقيقة باستمرار — تأكد أن cron-job.org مضبوط على كل 5 دقائق
                </p>
              </div>

              {/* ── Active hours window ── */}
              <div style={{ marginBottom: 18, padding: "14px 16px", borderRadius: 10, background: "#F8FAFF", border: "1px solid var(--a-border)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <label className="a-label" style={{ margin: 0 }}>
                    نافذة الساعات النشطة (UTC)
                    <span style={{ fontWeight: 400, color: "#9BA0B8", marginRight: 6, fontSize: ".73rem" }}>اختياري — يقيّد التشغيل لفترة محددة</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({
                      ...f,
                      active_hours_start: f.active_hours_start !== null ? null : 6,
                      active_hours_end:   f.active_hours_end   !== null ? null : 12,
                    }))}
                    style={{
                      fontSize: ".75rem", padding: "3px 10px",
                      border: `1px solid ${form.active_hours_start !== null ? "var(--a-green)" : "var(--a-border)"}`,
                      borderRadius: 6, cursor: "pointer",
                      background: form.active_hours_start !== null ? "#E8F6ED" : "#fff",
                      color: form.active_hours_start !== null ? "#2D7A46" : "#9BA0B8",
                    }}
                  >
                    {form.active_hours_start !== null ? "✓ مفعّل" : "تفعيل"}
                  </button>
                </div>

                {form.active_hours_start !== null && (
                  <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: ".78rem", color: "#6B7280", fontWeight: 600 }}>من</span>
                      <select
                        className="a-select"
                        value={form.active_hours_start ?? 0}
                        onChange={(e) => setForm((f) => ({ ...f, active_hours_start: +e.target.value }))}
                        style={{ width: "auto" }}
                      >
                        {HOURS.map((h) => (
                          <option key={h} value={h}>{String(h).padStart(2,"0")}:00</option>
                        ))}
                      </select>
                      <span style={{ fontSize: ".78rem", color: "#6B7280", fontWeight: 600 }}>إلى</span>
                      <select
                        className="a-select"
                        value={form.active_hours_end ?? 24}
                        onChange={(e) => setForm((f) => ({ ...f, active_hours_end: +e.target.value }))}
                        style={{ width: "auto" }}
                      >
                        {[...HOURS, 24].map((h) => (
                          <option key={h} value={h}>{h === 24 ? "24:00" : String(h).padStart(2,"0")+":00"}</option>
                        ))}
                      </select>
                    </div>
                    <span style={{ fontSize: ".73rem", color: "#9BA0B8" }}>
                      = {String(((form.active_hours_start ?? 0) + 3) % 24).padStart(2,"0")}:00 – {form.active_hours_end === 24 ? "03:00+1" : String(((form.active_hours_end ?? 0) + 3) % 24).padStart(2,"0")+":00"} SA
                    </span>
                  </div>
                )}
              </div>
              </>
            )}

            {/* ── Time (daily/once only) ── */}
            {form.recurrence !== "interval" && (
            <div style={{ marginBottom: 18 }}>
              <label className="a-label">وقت التشغيل (UTC)</label>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <select
                  className="a-select"
                  value={form.run_at_hour}
                  onChange={(e) => setForm((f) => ({ ...f, run_at_hour: +e.target.value }))}
                  style={{ width: "auto" }}
                >
                  {HOURS.map((h) => (
                    <option key={h} value={h}>{pad(h)}</option>
                  ))}
                </select>
                <span style={{ fontWeight: 700, color: "#6B7280" }}>:</span>
                <select
                  className="a-select"
                  value={form.run_at_minute}
                  onChange={(e) => setForm((f) => ({ ...f, run_at_minute: +e.target.value }))}
                  style={{ width: "auto" }}
                >
                  {MINUTES.map((m) => (
                    <option key={m} value={m}>{pad(m)}</option>
                  ))}
                </select>
                <span style={{ fontSize: ".78rem", color: "#9BA0B8" }}>
                  = {pad((form.run_at_hour + 3) % 24)}:{pad(form.run_at_minute)} توقيت السعودية
                </span>
              </div>
            </div>
            )}

            {/* ── Post count ── */}
            <div style={{ marginBottom: 18 }}>
              <label className="a-label">عدد المنشورات في كل تشغيل</label>
              <div style={{ display: "flex", gap: 8 }}>
                {[1, 2, 3, 5, 7, 10].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, posts_count: n }))}
                    style={{
                      width: 40, height: 40,
                      border: `2px solid ${form.posts_count === n ? "var(--a-green)" : "var(--a-border)"}`,
                      borderRadius: 8,
                      background: form.posts_count === n ? "var(--a-green)" : "#fff",
                      color: form.posts_count === n ? "#fff" : "#374151",
                      fontWeight: 700, fontSize: ".85rem",
                      cursor: "pointer", transition: "all .15s",
                    }}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Post types ── */}
            <div style={{ marginBottom: 18 }}>
              <label className="a-label">أنواع المحتوى (تُختار عشوائياً)</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {ALL_POST_TYPES.map((t) => {
                  const active = form.post_types.includes(t.id);
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => toggleType(t.id)}
                      style={{
                        padding: "6px 14px",
                        border: `2px solid ${active ? "var(--a-green)" : "var(--a-border)"}`,
                        borderRadius: 20,
                        background: active ? "#E8F6ED" : "#fff",
                        color: active ? "#2D7A46" : "#6B7280",
                        fontWeight: active ? 700 : 400,
                        fontSize: ".8rem",
                        cursor: "pointer", transition: "all .15s",
                      }}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>
              {form.post_types.length === 0 && (
                <p style={{ margin: "6px 0 0", fontSize: ".75rem", color: "#DC2626" }}>يجب اختيار نوع واحد على الأقل</p>
              )}
            </div>

            {/* ── Categories ── */}
            <div style={{ marginBottom: 24 }}>
              <label className="a-label">
                التصنيفات
                <span style={{ fontWeight: 400, color: "#9BA0B8", marginRight: 6, fontSize: ".75rem" }}>
                  (فارغ = عشوائي من جميع التصنيفات)
                </span>
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, maxHeight: 150, overflowY: "auto", padding: "4px 2px" }}>
                {categories.map((cat) => {
                  const active = form.category_slugs.includes(cat.slug);
                  return (
                    <button
                      key={cat.slug}
                      type="button"
                      onClick={() => toggleCategory(cat.slug)}
                      style={{
                        padding: "5px 12px",
                        border: `2px solid ${active ? "#3B6CC4" : "var(--a-border)"}`,
                        borderRadius: 20,
                        background: active ? "#EDF3FF" : "#fff",
                        color: active ? "#3B6CC4" : "#6B7280",
                        fontWeight: active ? 700 : 400,
                        fontSize: ".78rem",
                        cursor: "pointer", transition: "all .15s",
                      }}
                    >
                      {cat.name_ar}
                    </button>
                  );
                })}
              </div>
              {form.category_slugs.length > 0 && (
                <p style={{ margin: "6px 0 0", fontSize: ".73rem", color: "#9BA0B8" }}>
                  {form.category_slugs.length} تصنيف محدد
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, category_slugs: [] }))}
                    style={{ background: "none", border: "none", color: "#DC2626", cursor: "pointer", fontSize: ".73rem", marginRight: 8 }}
                  >
                    مسح الكل
                  </button>
                </p>
              )}
            </div>

            {/* Error */}
            {saveError && (
              <p style={{ color: "#DC2626", fontSize: ".8rem", margin: "0 0 14px" }}>{saveError}</p>
            )}

            {/* Actions */}
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{ padding: "9px 20px", border: "1px solid var(--a-border)", borderRadius: 8, background: "#fff", cursor: "pointer", fontSize: ".85rem" }}
              >
                إلغاء
              </button>
              <button
                type="button"
                className="a-btn"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "جارٍ الحفظ..." : editJob ? "حفظ التعديلات" : "إنشاء الجدولة"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── JobCard sub-component ──────────────────────────────────────────────────
function JobCard({
  job, categories, running, deleting,
  onEdit, onToggle, onRunNow, onDelete,
}: {
  job: ScheduledJob;
  categories: Category[];
  running: boolean;
  deleting: boolean;
  onEdit: () => void;
  onToggle: () => void;
  onRunNow: () => void;
  onDelete: () => void;
}) {
  const catMap = Object.fromEntries(categories.map((c) => [c.slug, c.name_ar]));
  const successRate = job.total_runs > 0
    ? Math.round((job.total_succeeded / (job.total_runs * job.posts_count || 1)) * 100)
    : null;

  return (
    <div className="a-card" style={{
      opacity: job.is_active ? 1 : 0.6,
      border: `1px solid ${job.is_active ? "var(--a-border)" : "#E5E7EB"}`,
      transition: "opacity .2s",
    }}>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>

        {/* Toggle switch */}
        <button
          onClick={onToggle}
          title={job.is_active ? "إيقاف" : "تفعيل"}
          style={{
            position: "relative",
            width: 44, height: 24, flexShrink: 0,
            borderRadius: 12,
            background: job.is_active ? "#4CB36C" : "#D1D5DB",
            border: "none", cursor: "pointer",
            transition: "background .2s", marginTop: 2,
          }}
        >
          <span style={{
            position: "absolute",
            top: 3, left: job.is_active ? 23 : 3,
            width: 18, height: 18, borderRadius: "50%",
            background: "#fff",
            transition: "left .2s",
          }} />
        </button>

        {/* Job info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: ".95rem" }}>{job.name}</p>

            <span className="a-badge" style={{
              background: job.recurrence === "daily" ? "#EDF3FF" : job.recurrence === "interval" ? "#F0FDF4" : "#FFF3E8",
              color:       job.recurrence === "daily" ? "#3B6CC4" : job.recurrence === "interval" ? "#2D7A46"  : "#C05E1A",
            }}>
              {job.recurrence === "daily" ? "🔁 يومي" : job.recurrence === "interval" ? `⏱ كل ${job.interval_minutes}د` : "1️⃣ مرة"}
            </span>

            {job.recurrence !== "interval" && (
              <span style={{ fontSize: ".85rem", fontWeight: 700, color: "#1E2130" }}>
                🕐 {String(job.run_at_hour).padStart(2, "0")}:{String(job.run_at_minute).padStart(2, "0")} UTC
              </span>
            )}

            {job.recurrence === "interval" && job.active_hours_start !== null && job.active_hours_end !== null && (
              <span style={{ fontSize: ".75rem", background: "#EDF3FF", color: "#3B6CC4", padding: "2px 8px", borderRadius: 6, fontWeight: 600 }}>
                🕐 {String(job.active_hours_start).padStart(2,"0")}–{job.active_hours_end === 24 ? "24" : String(job.active_hours_end).padStart(2,"0")} UTC
              </span>
            )}
          </div>

          {/* Meta row */}
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: ".75rem", color: "#6B7280" }}>
            <span>📦 {job.posts_count} منشور/تشغيل</span>

            <span>
              🎨 {job.post_types.slice(0, 3).map((t) =>
                ALL_POST_TYPES.find((p) => p.id === t)?.label ?? t
              ).join(", ")}
              {job.post_types.length > 3 && ` +${job.post_types.length - 3}`}
            </span>

            {job.category_slugs?.length ? (
              <span>
                📁 {job.category_slugs.slice(0, 2).map((s) => catMap[s] ?? s).join(", ")}
                {job.category_slugs.length > 2 && ` +${job.category_slugs.length - 2}`}
              </span>
            ) : (
              <span>📁 عشوائي</span>
            )}

            {job.last_run_at && (
              <span>⏱ آخر تشغيل: {new Date(job.last_run_at).toLocaleString("ar-SA", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
            )}

            {job.total_runs > 0 && (
              <span style={{ color: successRate !== null && successRate >= 80 ? "#2D7A46" : "#DC2626" }}>
                📊 {job.total_runs} تشغيل — نجاح {successRate}%
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
          <button
            onClick={onRunNow}
            disabled={running}
            title="تشغيل الآن"
            style={{
              padding: "6px 12px",
              border: "1px solid var(--a-green)",
              borderRadius: 8, background: "#E8F6ED",
              color: "#2D7A46", cursor: "pointer",
              fontSize: ".78rem", fontWeight: 600,
              opacity: running ? 0.6 : 1,
              transition: "opacity .15s",
            }}
          >
            {running ? "⏳" : "▶ الآن"}
          </button>

          <button
            onClick={onEdit}
            title="تعديل"
            style={{
              padding: "6px 10px",
              border: "1px solid var(--a-border)",
              borderRadius: 8, background: "#fff",
              color: "#374151", cursor: "pointer",
              fontSize: ".78rem",
            }}
          >
            ✏
          </button>

          <button
            onClick={onDelete}
            disabled={deleting}
            title="حذف"
            style={{
              padding: "6px 10px",
              border: "1px solid #FECACA",
              borderRadius: 8, background: "#FEF2F2",
              color: "#DC2626", cursor: "pointer",
              fontSize: ".78rem",
              opacity: deleting ? 0.5 : 1,
            }}
          >
            🗑
          </button>
        </div>
      </div>
    </div>
  );
}
