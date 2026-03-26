"use client";

import { useState, useMemo } from "react";

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
interface Cat {
  id: string;
  name_ar: string;
  name_en: string;
  slug: string;
  parent_id: string | null;
  color: string;
}

type Group = "article" | "quiz" | "comparison" | "chart" | "advanced" | "news";
type Difficulty = "easy" | "medium" | "hard";

interface Template {
  id: string;
  label: string;
  icon: string;
  desc: string;
  group: Group;
  api: string;
  quizType?: string;
  compType?: string;
  chartType?: string;   // "auto" | "area" | "line" | "bar" | "pie" | "donut" | "scatter" | "radar" | "composed"
  hasDifficulty?: boolean;
  usesSearch?: boolean;
}

/* ─────────────────────────────────────────────
   19 Templates
───────────────────────────────────────────── */
const TEMPLATES: Template[] = [
  // Article (1)
  { id: "article", label: "مقال", icon: "📰", desc: "مقال معرفي موثق بالمصادر", group: "article", api: "/api/generate" },

  // Quiz (6)
  { id: "quiz-mcq",         label: "اختيار من متعدد", icon: "✅", desc: "4 خيارات — إجابة واحدة صحيحة",    group: "quiz", api: "/api/generate-quiz", quizType: "mcq",        hasDifficulty: true, usesSearch: true },
  { id: "quiz-true_false",  label: "صواب أو خطأ",     icon: "⚖️", desc: "عبارات يحكم عليها المستخدم",     group: "quiz", api: "/api/generate-quiz", quizType: "true_false", hasDifficulty: true, usesSearch: true },
  { id: "quiz-timeline",    label: "رتّب الأحداث",    icon: "📅", desc: "أحداث تُرتَّب زمنياً بالسحب",    group: "quiz", api: "/api/generate-quiz", quizType: "timeline",   hasDifficulty: true, usesSearch: true },
  { id: "quiz-matching",    label: "طابق الأزواج",    icon: "🔗", desc: "صِل كل عنصر بما يقابله",         group: "quiz", api: "/api/generate-quiz", quizType: "matching",   hasDifficulty: true, usesSearch: true },
  { id: "quiz-guess_who",   label: "من أنا؟",          icon: "🎭", desc: "تلميحات تدريجية لمعرفة الشخصية", group: "quiz", api: "/api/generate-quiz", quizType: "guess_who",  hasDifficulty: true, usesSearch: true },
  { id: "quiz-speed",       label: "سباق الوقت",       icon: "⚡", desc: "أسئلة بمؤقت 15 ثانية لكل سؤال",  group: "quiz", api: "/api/generate-quiz", quizType: "speed",      hasDifficulty: true, usesSearch: true },

  // Comparison (6)
  { id: "comp-bars",          label: "أعمدة مقارنة",   icon: "📊", desc: "أشرطة متوازية بنقاط مئوية",    group: "comparison", api: "/api/generate-comparison", compType: "bars",          usesSearch: true },
  { id: "comp-matrix",        label: "مصفوفة",         icon: "🔲", desc: "جدول ✓ / ✗ / ◐ لكل ميزة",     group: "comparison", api: "/api/generate-comparison", compType: "matrix",        usesSearch: true },
  { id: "comp-profile",       label: "ملفات شخصية",    icon: "👤", desc: "بطاقتان بمعلومات وإحصاءات",    group: "comparison", api: "/api/generate-comparison", compType: "profile",       usesSearch: true },
  { id: "comp-timeline_duel", label: "خط زمني مزدوج", icon: "📈", desc: "منحنيان يتقاطعان عبر الزمن",   group: "comparison", api: "/api/generate-comparison", compType: "timeline_duel", usesSearch: true },
  { id: "comp-stance",        label: "مواقف وآراء",    icon: "💬", desc: "موقف كل طرف من عدة قضايا",     group: "comparison", api: "/api/generate-comparison", compType: "stance",        usesSearch: true },
  { id: "comp-spectrum",      label: "طيف ومقياس",     icon: "🌈", desc: "موضع كل طرف على محاور متعددة", group: "comparison", api: "/api/generate-comparison", compType: "spectrum",      usesSearch: true },

  // Chart (9)
  { id: "chart-auto",     label: "تلقائي",        icon: "🤖", desc: "الذكاء الاصطناعي يختار الشكل الأنسب للبيانات",           group: "chart", api: "/api/generate-chart", chartType: "auto",           usesSearch: true },
  { id: "chart-area",     label: "منطقة",         icon: "📈", desc: "تطور زمني مع تظليل المساحة — الأفضل للاتجاهات",         group: "chart", api: "/api/generate-chart", chartType: "area",           usesSearch: true },
  { id: "chart-line",     label: "خطي",           icon: "📉", desc: "سلاسل زمنية متعددة أو بيانات دقيقة",                   group: "chart", api: "/api/generate-chart", chartType: "line",           usesSearch: true },
  { id: "chart-bar",      label: "أعمدة",         icon: "📊", desc: "مقارنات بين فئات أو دول أو فترات",                     group: "chart", api: "/api/generate-chart", chartType: "bar",            usesSearch: true },
  { id: "chart-bar-h",    label: "أعمدة أفقية",   icon: "⬛", desc: "مثل الأعمدة لكن أفقي — أفضل للأسماء الطويلة والفئات الكثيرة", group: "chart", api: "/api/generate-chart", chartType: "bar-horizontal", usesSearch: true },
  { id: "chart-stacked",  label: "أعمدة مكدسة",  icon: "🗂️", desc: "أجزاء مكدسة فوق بعضها — يُظهر المجموع والتوزيع معاً",  group: "chart", api: "/api/generate-chart", chartType: "bar-stacked",    usesSearch: true },
  { id: "chart-100",      label: "أعمدة 100%",    icon: "💯", desc: "كل عمود = 100% — لمقارنة التوزيع النسبي بين فترات",     group: "chart", api: "/api/generate-chart", chartType: "bar-100",        usesSearch: true },
  { id: "chart-astacked", label: "منطقة مكدسة",  icon: "🌊", desc: "مناطق متراكمة — لإجماليات تتراكم عبر الزمن",            group: "chart", api: "/api/generate-chart", chartType: "area-stacked",   usesSearch: true },
  { id: "chart-pie",      label: "دائري",         icon: "🥧", desc: "توزيع نسبي بسيط (3-6 فئات)",                           group: "chart", api: "/api/generate-chart", chartType: "pie",            usesSearch: true },
  { id: "chart-donut",    label: "حلقي",          icon: "🍩", desc: "توزيع نسبي مع إجمالي في المنتصف",                      group: "chart", api: "/api/generate-chart", chartType: "donut",          usesSearch: true },
  { id: "chart-scatter",  label: "نقطي / فقاعي",  icon: "🫧", desc: "العلاقة بين متغيرين — حجم الفقاعة يعبر عن متغير ثالث",  group: "chart", api: "/api/generate-chart", chartType: "scatter",        usesSearch: true },
  { id: "chart-radar",    label: "رادار",         icon: "🕸️", desc: "مقارنة كيانات عبر أبعاد متعددة (5 دول × 5 مؤشرات)",   group: "chart", api: "/api/generate-chart", chartType: "radar",          usesSearch: true },
  { id: "chart-composed", label: "مركّب",         icon: "🔀", desc: "مزج أعمدة مع خط على نفس الرسم (قيم + نسبة مئوية)",    group: "chart", api: "/api/generate-chart", chartType: "composed",       usesSearch: true },
  { id: "chart-treemap",  label: "شجرة النسب",    icon: "🟩", desc: "مستطيلات بأحجام تناسبية — لبيانات هرمية أو توزيعات كبيرة", group: "chart", api: "/api/generate-chart", chartType: "treemap",     usesSearch: true },
  { id: "chart-funnel",   label: "قمع",           icon: "🔻", desc: "مراحل تتناقص — لإظهار معدلات التحويل أو الإتمام",       group: "chart", api: "/api/generate-chart", chartType: "funnel",         usesSearch: true },
  { id: "chart-radialbar",label: "أعمدة دائرية", icon: "🎯", desc: "أقواس دائرية لمقارنة قيم متعددة بصرياً",                group: "chart", api: "/api/generate-chart", chartType: "radialbar",      usesSearch: true },

  // Advanced (10)
  { id: "ranking",   label: "ترتيب وتصنيف",   icon: "🏆", desc: "قائمة مرتبة بأرقام وميداليات",           group: "advanced", api: "/api/generate-ranking",   usesSearch: true },
  { id: "numbers",   label: "بالأرقام",        icon: "🔢", desc: "أرقام مذهلة في شبكة بصرية ملونة",       group: "advanced", api: "/api/generate-numbers",   usesSearch: true },
  { id: "scenarios", label: "سيناريوهات",      icon: "🔀", desc: "3 سيناريوهات: متفائل / واقعي / متشائم", group: "advanced", api: "/api/generate-scenarios", usesSearch: true },
  { id: "timeline",  label: "خط زمني تاريخي", icon: "⏳", desc: "8–15 حدث على خط زمني ملون بأنواعها",    group: "advanced", api: "/api/generate-timeline",  usesSearch: true },
  { id: "factcheck", label: "تحقق من الحقيقة",icon: "🔍", desc: "4–8 ادعاء مع حكم موثق بالمصادر",        group: "advanced", api: "/api/generate-factcheck", usesSearch: true },
  { id: "profile",   label: "بروفايل",         icon: "🪪", desc: "تعريف صحفي ثري بالشخصيات والجهات",      group: "advanced", api: "/api/generate-profile",  usesSearch: true },
  { id: "briefing",  label: "موجز",            icon: "📋", desc: "ملخص تنفيذي بنقاط + اقتباس + أرقام",    group: "advanced", api: "/api/generate-briefing",  usesSearch: true },
  { id: "quotes",    label: "اقتباسات",        icon: "💬", desc: "5-8 اقتباسات بارزة حول قضية واحدة",     group: "advanced", api: "/api/generate-quotes",   usesSearch: true },
  { id: "explainer", label: "أسئلة شارحة",     icon: "❓", desc: "6-10 أسئلة تشرح موضوعاً معقداً",        group: "advanced", api: "/api/generate-explainer", usesSearch: true },
  { id: "debate",    label: "مناظرة",          icon: "⚖️", desc: "حجج الجانبين حول قضية خلافية",          group: "advanced", api: "/api/generate-debate",   usesSearch: true },
  { id: "guide",     label: "خطوات عملية",     icon: "📋", desc: "دليل عملي خطوة بخطوة مع أوقات وتحذيرات",  group: "advanced", api: "/api/generate-guide",     usesSearch: true },
  { id: "network",   label: "خريطة الصلات",     icon: "🕸️", desc: "شبكة علاقات مركزية: حلفاء وخصوم وشركاء",  group: "advanced", api: "/api/generate-network",   usesSearch: true },
  { id: "interview", label: "مقابلة",           icon: "🎙️", desc: "حوار صحفي محاكاة مع شخصية بارزة",         group: "advanced", api: "/api/generate-interview", usesSearch: true },
  { id: "map",       label: "توزيع جغرافي",     icon: "🗺️", desc: "بيانات مقارنة عبر دول ومناطق بأشرطة بيانية", group: "advanced", api: "/api/generate-map",       usesSearch: true },

  // News (1)
  { id: "news", label: "خبر", icon: "📰", desc: "خبر عاجل مُعاد صياغته من مصادر موثوقة عبر GNews", group: "news", api: "/api/generate-news", usesSearch: false },
];

const GROUPS: { id: Group; label: string; icon: string; count: number }[] = [
  { id: "article",    label: "مقال",   icon: "✍️", count: 1 },
  { id: "news",       label: "أخبار",  icon: "📰", count: 1 },
  { id: "quiz",       label: "اختبار", icon: "🧠", count: 6 },
  { id: "comparison", label: "مقارنة", icon: "⚔️", count: 6 },
  { id: "chart",      label: "مخطط",   icon: "📊", count: 16 },
  { id: "advanced",   label: "متقدم",  icon: "✨", count: 14 },
];

const NEWS_APIS = new Set(["/api/generate", "/api/generate-factcheck", "/api/generate-profile", "/api/generate-map", "/api/generate-news"]);

/* ─────────────────────────────────────────────
   Component
───────────────────────────────────────────── */
export function GeneratePageClient({
  mainCats,
  subCats,
}: {
  mainCats: Cat[];
  subCats: Cat[];
}) {
  const [catId,          setCatId]          = useState("");
  const [subId,          setSubId]          = useState("");
  const [group,          setGroup]          = useState<Group>("article");
  const [template,       setTemplate]       = useState<Template>(TEMPLATES[0]);
  const [topic,          setTopic]          = useState("");
  const [context,        setContext]        = useState("");
  const [sourceUrl,      setSourceUrl]      = useState("");
  const [difficulty,     setDifficulty]     = useState<Difficulty>("medium");
  const [generateImage,  setGenerateImage]  = useState(true);
  const [useWebSearch,   setUseWebSearch]   = useState(() => NEWS_APIS.has(TEMPLATES[0].api));
  const [loading,        setLoading]        = useState(false);
  const [result,         setResult]         = useState<{ ok: boolean; data: Record<string, unknown> } | null>(null);

  const filteredSubs = useMemo(
    () => subCats.filter((s) => s.parent_id === catId),
    [catId, subCats]
  );

  const groupTemplates = TEMPLATES.filter((t) => t.group === group);

  function handleGroupChange(g: Group) {
    setGroup(g);
    const firstTemplate = TEMPLATES.find((t) => t.group === g)!;
    setTemplate(firstTemplate);
    setResult(null);
    setUseWebSearch(NEWS_APIS.has(firstTemplate.api));
  }

  function handleCatChange(id: string) {
    setCatId(id);
    setSubId("");
    setResult(null);
  }

  async function handleGenerate() {
    if (!catId) return;
    const cat = mainCats.find((c) => c.id === catId);
    const sub = filteredSubs.find((s) => s.id === subId);
    if (!cat) return;

    setLoading(true);
    setResult(null);

    const body: Record<string, string | boolean> = { category_slug: cat.slug };
    if (sub)       body.subcategory_slug = sub.slug;
    if (topic)     body.topic            = topic.trim();
    if (context)   body.context          = context.trim();
    if (sourceUrl) body.source_url       = sourceUrl.trim();
    if (template.quizType)  body.quiz_type       = template.quizType;
    if (template.compType)  body.comparison_type = template.compType;
    if (template.chartType && template.chartType !== "auto") body.chart_type = template.chartType;
    if (template.hasDifficulty) body.difficulty = difficulty;
    // Only applies to article template — send flag so the API skips Replicate when unchecked
    if (template.id === "article") body.generate_image = generateImage;
    body.use_web_search = useWebSearch;

    try {
      // Route through /api/admin/generate proxy (handles auth + GENERATE_SECRET internally)
      const res = await fetch("/api/admin/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _api: template.api, ...body }),
      });
      const data = await res.json();
      setResult({ ok: res.ok, data });
    } catch (e) {
      setResult({ ok: false, data: { error: e instanceof Error ? e.message : "خطأ في الاتصال" } });
    } finally {
      setLoading(false);
    }
  }

  const selectedCatName = mainCats.find((c) => c.id === catId)?.name_ar ?? "";
  const selectedSubName = filteredSubs.find((s) => s.id === subId)?.name_ar ?? "";

  return (
    <div className="a-gen-shell">

      {/* ── Step 1: Category ─────────────────── */}
      <div className="a-card a-gen-card">
        <p className="a-gen-step-label">
          <span className="a-gen-step-num">1</span> القسم
        </p>
        <div className="a-gen-row">
          <div className="a-gen-field">
            <label className="a-label">
              القسم الرئيسي <span style={{ color: "#E05A2B" }}>*</span>
            </label>
            <select className="a-select" value={catId} onChange={(e) => handleCatChange(e.target.value)}>
              <option value="">— اختر قسماً —</option>
              {mainCats.map((c) => (
                <option key={c.id} value={c.id}>{c.name_ar}</option>
              ))}
            </select>
          </div>

          <div className="a-gen-field">
            <label className="a-label">
              القسم الفرعي{" "}
              <span style={{ color: "#9BA0B8", fontWeight: 400 }}>(اختياري)</span>
            </label>
            <select
              className="a-select"
              value={subId}
              onChange={(e) => setSubId(e.target.value)}
              disabled={!catId || filteredSubs.length === 0}
            >
              <option value="">
                — {!catId ? "اختر قسماً أولاً" : filteredSubs.length === 0 ? "لا يوجد أقسام فرعية" : "اختر قسماً فرعياً"} —
              </option>
              {filteredSubs.map((s) => (
                <option key={s.id} value={s.id}>{s.name_ar}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── Step 2: Template ─────────────────── */}
      <div className="a-card a-gen-card">
        <p className="a-gen-step-label">
          <span className="a-gen-step-num">2</span> القالب
          <span style={{ fontWeight: 400, color: "#9BA0B8", fontSize: ".82rem", marginRight: 8 }}>
            43 قالب متاح
          </span>
        </p>

        {/* Group tabs */}
        <div className="a-gen-groups">
          {GROUPS.map((g) => (
            <button
              key={g.id}
              className={`a-gen-group-btn${group === g.id ? " active" : ""}`}
              onClick={() => handleGroupChange(g.id)}
            >
              <span>{g.icon}</span>
              <span>{g.label}</span>
              <span className="a-gen-group-count">{g.count}</span>
            </button>
          ))}
        </div>

        {/* Template cards */}
        <div className="a-gen-templates">
          {groupTemplates.map((t) => (
            <button
              key={t.id}
              className={`a-gen-tpl-card${template.id === t.id ? " active" : ""}`}
              onClick={() => { setTemplate(t); setResult(null); setUseWebSearch(NEWS_APIS.has(t.api)); }}
            >
              <span className="a-gen-tpl-icon">{t.icon}</span>
              <span className="a-gen-tpl-label">{t.label}</span>
              <span className="a-gen-tpl-desc">{t.desc}</span>
              {t.usesSearch && (
                <span className="a-gen-tpl-search" title="يبحث على الإنترنت">🔍</span>
              )}
            </button>
          ))}
        </div>

        {/* Selected info bar */}
        <div className="a-gen-selected-info">
          <span className="a-badge" style={{ background: "#E8F6ED", color: "#2D7A46" }}>
            {template.icon} {template.label}
          </span>
          {useWebSearch && (
            <span className="a-badge" style={{ background: "#E3F2FD", color: "#1565C0", fontSize: ".72rem" }}>
              🔍 بحث على الإنترنت
            </span>
          )}
          {!useWebSearch && (
            <span className="a-badge" style={{ background: "#FFF3E0", color: "#E65100", fontSize: ".72rem" }}>
              ⚡ بدون بحث
            </span>
          )}
          <code style={{ fontSize: ".7rem", color: "#9BA0B8", marginRight: "auto" }}>
            {template.api}
          </code>
        </div>
      </div>

      {/* ── Step 3: Optional fields ──────────── */}
      <div className="a-card a-gen-card">
        <p className="a-gen-step-label">
          <span className="a-gen-step-num">3</span> تفاصيل إضافية
          <span style={{ fontWeight: 400, color: "#9BA0B8", fontSize: ".82rem", marginRight: 8 }}>(اختيارية)</span>
        </p>

        <div className="a-gen-row">
          <div className="a-gen-field" style={{ flex: 2 }}>
            <label className="a-label">الموضوع</label>
            <input
              type="text"
              className="a-input"
              placeholder='مثال: "تأثير الذكاء الاصطناعي على سوق العمل العربي"'
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>
          {template.hasDifficulty && (
            <div className="a-gen-field">
              <label className="a-label">مستوى الصعوبة</label>
              <select className="a-select" value={difficulty} onChange={(e) => setDifficulty(e.target.value as Difficulty)}>
                <option value="easy">سهل</option>
                <option value="medium">متوسط</option>
                <option value="hard">صعب</option>
              </select>
            </div>
          )}
        </div>

        <div className="a-gen-field" style={{ marginTop: 12 }}>
          <label className="a-label">سياق أو محتوى للاعتماد عليه</label>
          <textarea
            className="a-textarea"
            placeholder="الصق هنا مقالة أو نصاً أو بيانات — سيستند إليها الذكاء الاصطناعي كمصدر أساسي أو يوسعها أو يلخصها"
            rows={4}
            value={context}
            onChange={(e) => setContext(e.target.value)}
          />
        </div>

        <div className="a-gen-field" style={{ marginTop: 12 }}>
          <label className="a-label">رابط المصدر</label>
          <input
            type="url"
            className="a-input"
            placeholder="https://example.com/article"
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            dir="ltr"
          />
        </div>

        {/* Web Search Toggle */}
        <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 10 }}>
          <input
            id="web-search-checkbox"
            type="checkbox"
            checked={useWebSearch}
            onChange={(e) => setUseWebSearch(e.target.checked)}
            style={{ width: 16, height: 16, cursor: "pointer", accentColor: "var(--a-green)" }}
          />
          <label
            htmlFor="web-search-checkbox"
            style={{ fontSize: ".875rem", color: "#374151", cursor: "pointer", userSelect: "none" }}
          >
            🔍 البحث على الإنترنت
            <span style={{ color: "#9BA0B8", fontSize: ".78rem", marginRight: 6 }}>
              {useWebSearch ? "(مفعّل — استدعاءان لـ Claude)" : "(معطّل — استدعاء واحد، أسرع وأوفر)"}
            </span>
          </label>
        </div>

        {template.id === "article" && process.env.NEXT_PUBLIC_REPLICATE_ENABLED !== "false" && (
          <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 10 }}>
            <input
              id="generate-image-checkbox"
              type="checkbox"
              checked={generateImage}
              onChange={(e) => setGenerateImage(e.target.checked)}
              style={{ width: 16, height: 16, cursor: "pointer", accentColor: "var(--a-green)" }}
            />
            <label
              htmlFor="generate-image-checkbox"
              style={{ fontSize: ".875rem", color: "#374151", cursor: "pointer", userSelect: "none" }}
            >
              توليد صورة مع المقال
              <span style={{ color: "#9BA0B8", fontSize: ".78rem", marginRight: 6 }}>
                (يستخدم Replicate — يزيد وقت التوليد)
              </span>
            </label>
          </div>
        )}
      </div>

      {/* ── Generate footer ───────────────────── */}
      <div className="a-gen-footer">
        <div className="a-gen-footer-summary">
          {!catId ? (
            <span style={{ color: "#E05A2B" }}>⚠ اختر قسماً أولاً</span>
          ) : (
            <>
              <span className="a-badge" style={{ background: "#EDF1F5", color: "#374151" }}>
                {selectedCatName}
              </span>
              {selectedSubName && (
                <span className="a-badge" style={{ background: "#EDF1F5", color: "#374151" }}>
                  {selectedSubName}
                </span>
              )}
              <span className="a-badge" style={{ background: "#E8F6ED", color: "#2D7A46" }}>
                {template.icon} {template.label}
              </span>
            </>
          )}
        </div>

        <button
          className="a-btn"
          style={{ minWidth: 180, fontSize: "1rem", padding: "10px 32px" }}
          disabled={!catId || loading}
          onClick={handleGenerate}
        >
          {loading ? (
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="a-gen-spinner" />
              جارٍ التوليد...
            </span>
          ) : (
            `✨ توليد ${template.label}`
          )}
        </button>
      </div>

      {/* ── Result ───────────────────────────── */}
      {result && (
        <div className={`a-card a-gen-result${result.ok ? " success" : " error"}`}>
          {result.ok ? (
            <>
              <p className="a-gen-result-title" style={{ color: "#2D7A46" }}>✓ تم التوليد بنجاح</p>
              {(() => {
                const post = (result.data as { post?: { title_ar?: string; id?: string } }).post;
                if (!post) return null;
                return (
                  <div className="a-gen-result-body">
                    <p style={{ fontWeight: 600, fontSize: ".95rem", marginTop: 6 }}>{post.title_ar}</p>
                    <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                      <span className="a-badge" style={{ background: "#E8F6ED", color: "#2D7A46" }}>
                        {template.icon} {template.label}
                      </span>
                      {selectedCatName && (
                        <span className="a-badge" style={{ background: "#EDF1F5", color: "#374151" }}>{selectedCatName}</span>
                      )}
                      {selectedSubName && (
                        <span className="a-badge" style={{ background: "#EDF1F5", color: "#374151" }}>{selectedSubName}</span>
                      )}
                    </div>
                    {post.id && (
                      <a
                        href={`/ar/p/${post.id}`}
                        target="_blank"
                        className="a-btn-ghost"
                        style={{ marginTop: 12, display: "inline-block", fontSize: ".82rem" }}
                      >
                        عرض المنشور ↗
                      </a>
                    )}
                  </div>
                );
              })()}
            </>
          ) : (
            <>
              <p className="a-gen-result-title" style={{ color: "#DC2626" }}>✗ فشل التوليد</p>
              <p style={{ fontSize: ".85rem", color: "#374151", marginTop: 6 }}>
                {String(
                  (result.data as { error?: unknown }).error ??
                  (result.data as { reason?: unknown }).reason ??
                  "خطأ غير معروف"
                )}
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
