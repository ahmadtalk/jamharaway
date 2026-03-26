"use client";

import { useState } from "react";

// ── Types ──────────────────────────────────────────────────────────────────
export type ProfileSubjectType = "person" | "organization" | "country" | "movement" | "other";

export interface ProfileQuickFact {
  icon: string;
  label_ar: string;
  label_en: string;
  value_ar: string;
  value_en: string;
}
export interface ProfileStat {
  icon?: string;
  label_ar: string;
  label_en: string;
  value: string;
  unit?: string;
}
export interface ProfileTimelineItem {
  year: string;
  event_ar: string;
  event_en: string;
  type?: "milestone" | "award" | "crisis" | "founding" | "death" | "other";
}
export interface ProfileSection {
  title_ar: string;
  title_en: string;
  content_ar: string;
  content_en: string;
}
export interface ProfileConfig {
  subject_type: ProfileSubjectType;
  full_name_ar: string;
  full_name_en: string;
  known_as_ar?: string;
  known_as_en?: string;
  tagline_ar?: string;
  tagline_en?: string;
  avatar_emoji: string;
  avatar_color: string;
  image_url?: string;
  quick_facts: ProfileQuickFact[];
  stats?: ProfileStat[];
  timeline?: ProfileTimelineItem[];
  sections?: ProfileSection[];
  tags_ar?: string[];
  tags_en?: string[];
  source?: string;
  sourceUrl?: string;
}

// ── Sub-components ─────────────────────────────────────────────────────────
function SectionHeader({
  title,
  count,
  open,
  onToggle,
  color = "#4CB36C",
}: {
  title: string;
  count?: number;
  open: boolean;
  onToggle: () => void;
  color?: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        padding: "12px 0",
        borderBottom: open ? `2px solid ${color}22` : "none",
        marginBottom: open ? 16 : 0,
      }}
    >
      <span style={{ fontWeight: 700, fontSize: ".92rem", color: "#373C55", display: "flex", alignItems: "center", gap: 8 }}>
        {title}
        {count !== undefined && (
          <span style={{ fontSize: ".72rem", background: color + "22", color, padding: "2px 8px", borderRadius: 20, fontWeight: 600 }}>
            {count}
          </span>
        )}
      </span>
      <span style={{ fontSize: ".85rem", color: "#9BA0B8", transform: open ? "rotate(180deg)" : "none", transition: "transform .2s" }}>▼</span>
    </button>
  );
}

function AddBtn({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 6,
        padding: "7px 14px", borderRadius: 8,
        border: "1.5px dashed #C5E8D0", background: "#F2FAF5",
        color: "#2D7A46", fontSize: ".8rem", fontWeight: 600, cursor: "pointer",
        marginTop: 8, fontFamily: "inherit",
      }}
    >
      + {label}
    </button>
  );
}

function RemoveBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "4px 10px", borderRadius: 6, border: "1px solid #FEE2E2",
        background: "#FEF2F2", color: "#DC2626", fontSize: ".75rem",
        fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
      }}
    >
      حذف
    </button>
  );
}

function FieldPair({
  labelAr,
  labelEn,
  valueAr,
  valueEn,
  onChangeAr,
  onChangeEn,
  multiline = false,
}: {
  labelAr: string;
  labelEn: string;
  valueAr: string;
  valueEn: string;
  onChangeAr: (v: string) => void;
  onChangeEn: (v: string) => void;
  multiline?: boolean;
}) {
  const base: React.CSSProperties = {
    width: "100%", padding: "8px 12px",
    border: "1.5px solid #E8EBF0", borderRadius: 8,
    fontSize: ".85rem", fontFamily: "inherit", color: "#1E2130",
    background: "#FAFAFA", transition: "border-color .15s",
  };
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
      <div>
        <label className="a-label">{labelAr}</label>
        {multiline ? (
          <textarea
            className="a-textarea"
            value={valueAr}
            onChange={(e) => onChangeAr(e.target.value)}
            rows={3}
            style={{ direction: "rtl" }}
          />
        ) : (
          <input style={{ ...base, direction: "rtl" }} value={valueAr} onChange={(e) => onChangeAr(e.target.value)} />
        )}
      </div>
      <div>
        <label className="a-label">{labelEn}</label>
        {multiline ? (
          <textarea
            className="a-textarea"
            value={valueEn}
            onChange={(e) => onChangeEn(e.target.value)}
            rows={3}
            style={{ direction: "ltr" }}
          />
        ) : (
          <input style={{ ...base, direction: "ltr" }} value={valueEn} onChange={(e) => onChangeEn(e.target.value)} />
        )}
      </div>
    </div>
  );
}

// ── Item wrappers ──────────────────────────────────────────────────────────
const itemWrap: React.CSSProperties = {
  border: "1.5px solid #E8EBF0", borderRadius: 10,
  padding: "14px 16px", background: "#FAFBFC",
  display: "flex", flexDirection: "column", gap: 10,
};

// ── Main component ─────────────────────────────────────────────────────────
export function ProfileConfigEditor({
  config,
  onChange,
}: {
  config: ProfileConfig;
  onChange: (c: ProfileConfig) => void;
}) {
  const [open, setOpen] = useState({
    basic: true,
    facts: true,
    stats: false,
    timeline: false,
    sections: false,
    tags: false,
  });

  function set<K extends keyof ProfileConfig>(key: K, value: ProfileConfig[K]) {
    onChange({ ...config, [key]: value });
  }

  // ── Quick Facts helpers ──
  function updateFact(i: number, k: keyof ProfileQuickFact, v: string) {
    const facts = [...(config.quick_facts ?? [])];
    facts[i] = { ...facts[i], [k]: v };
    set("quick_facts", facts);
  }
  function addFact() {
    set("quick_facts", [
      ...(config.quick_facts ?? []),
      { icon: "📌", label_ar: "", label_en: "", value_ar: "", value_en: "" },
    ]);
  }
  function removeFact(i: number) {
    set("quick_facts", (config.quick_facts ?? []).filter((_, idx) => idx !== i));
  }

  // ── Stats helpers ──
  function updateStat(i: number, k: keyof ProfileStat, v: string) {
    const stats = [...(config.stats ?? [])];
    stats[i] = { ...stats[i], [k]: v };
    set("stats", stats);
  }
  function addStat() {
    set("stats", [
      ...(config.stats ?? []),
      { icon: "📊", label_ar: "", label_en: "", value: "", unit: "" },
    ]);
  }
  function removeStat(i: number) {
    set("stats", (config.stats ?? []).filter((_, idx) => idx !== i));
  }

  // ── Timeline helpers ──
  function updateTimeline(i: number, k: keyof ProfileTimelineItem, v: string) {
    const items = [...(config.timeline ?? [])];
    items[i] = { ...items[i], [k]: v };
    set("timeline", items);
  }
  function addTimeline() {
    set("timeline", [
      ...(config.timeline ?? []),
      { year: "", event_ar: "", event_en: "", type: "milestone" },
    ]);
  }
  function removeTimeline(i: number) {
    set("timeline", (config.timeline ?? []).filter((_, idx) => idx !== i));
  }

  // ── Sections helpers ──
  function updateSection(i: number, k: keyof ProfileSection, v: string) {
    const secs = [...(config.sections ?? [])];
    secs[i] = { ...secs[i], [k]: v };
    set("sections", secs);
  }
  function addSection() {
    set("sections", [
      ...(config.sections ?? []),
      { title_ar: "", title_en: "", content_ar: "", content_en: "" },
    ]);
  }
  function removeSection(i: number) {
    set("sections", (config.sections ?? []).filter((_, idx) => idx !== i));
  }

  const inputBase: React.CSSProperties = {
    width: "100%", padding: "8px 12px",
    border: "1.5px solid #E8EBF0", borderRadius: 8,
    fontSize: ".85rem", fontFamily: "inherit", color: "#1E2130",
    background: "#FAFAFA",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* ── 1. المعلومات الأساسية ─── */}
      <div className="a-card">
        <SectionHeader
          title="المعلومات الأساسية"
          open={open.basic}
          onToggle={() => setOpen((p) => ({ ...p, basic: !p.basic }))}
        />
        {open.basic && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {/* نوع الموضوع */}
            <div>
              <label className="a-label">نوع الموضوع</label>
              <select
                className="a-select"
                value={config.subject_type}
                onChange={(e) => set("subject_type", e.target.value as ProfileSubjectType)}
              >
                <option value="person">شخص</option>
                <option value="organization">منظمة / مؤسسة</option>
                <option value="country">دولة</option>
                <option value="movement">حركة / تيار</option>
                <option value="other">أخرى</option>
              </select>
            </div>

            {/* الاسم */}
            <FieldPair
              labelAr="الاسم الكامل (ع)"
              labelEn="Full Name (EN)"
              valueAr={config.full_name_ar}
              valueEn={config.full_name_en}
              onChangeAr={(v) => set("full_name_ar", v)}
              onChangeEn={(v) => set("full_name_en", v)}
            />

            {/* الاسم المعروف به */}
            <FieldPair
              labelAr="الاسم المعروف به (ع)"
              labelEn="Known As (EN)"
              valueAr={config.known_as_ar ?? ""}
              valueEn={config.known_as_en ?? ""}
              onChangeAr={(v) => set("known_as_ar", v)}
              onChangeEn={(v) => set("known_as_en", v)}
            />

            {/* الوصف المختصر */}
            <FieldPair
              labelAr="الوصف المختصر (ع)"
              labelEn="Tagline (EN)"
              valueAr={config.tagline_ar ?? ""}
              valueEn={config.tagline_en ?? ""}
              onChangeAr={(v) => set("tagline_ar", v)}
              onChangeEn={(v) => set("tagline_en", v)}
            />

            {/* avatar_emoji + avatar_color */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <label className="a-label">إيموجي الهوية</label>
                <input
                  style={inputBase}
                  value={config.avatar_emoji}
                  onChange={(e) => set("avatar_emoji", e.target.value)}
                  placeholder="👤"
                />
              </div>
              <div>
                <label className="a-label">لون البطاقة (hex)</label>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input
                    type="color"
                    value={config.avatar_color}
                    onChange={(e) => set("avatar_color", e.target.value)}
                    style={{ width: 44, height: 38, padding: 2, border: "1.5px solid #E8EBF0", borderRadius: 8, cursor: "pointer", background: "#FAFAFA" }}
                  />
                  <input
                    style={{ ...inputBase, flex: 1 }}
                    value={config.avatar_color}
                    onChange={(e) => set("avatar_color", e.target.value)}
                    placeholder="#7B5EA7"
                  />
                </div>
              </div>
            </div>

            {/* رابط الصورة */}
            <div>
              <label className="a-label">رابط الصورة (اختياري — https فقط)</label>
              <input
                style={{ ...inputBase, direction: "ltr" }}
                value={config.image_url ?? ""}
                onChange={(e) => set("image_url", e.target.value)}
                placeholder="https://..."
              />
            </div>

            {/* المصدر */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <label className="a-label">اسم المصدر</label>
                <input
                  style={inputBase}
                  value={config.source ?? ""}
                  onChange={(e) => set("source", e.target.value)}
                />
              </div>
              <div>
                <label className="a-label">رابط المصدر</label>
                <input
                  style={{ ...inputBase, direction: "ltr" }}
                  value={config.sourceUrl ?? ""}
                  onChange={(e) => set("sourceUrl", e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── 2. الحقائق السريعة ─── */}
      <div className="a-card">
        <SectionHeader
          title="الحقائق السريعة"
          count={config.quick_facts?.length ?? 0}
          open={open.facts}
          onToggle={() => setOpen((p) => ({ ...p, facts: !p.facts }))}
        />
        {open.facts && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {(config.quick_facts ?? []).map((fact, i) => (
              <div key={i} style={itemWrap}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: ".8rem", fontWeight: 700, color: "#9BA0B8" }}>حقيقة {i + 1}</span>
                  <RemoveBtn onClick={() => removeFact(i)} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "60px 1fr 1fr", gap: 8, alignItems: "start" }}>
                  <div>
                    <label className="a-label">أيقونة</label>
                    <input style={{ ...inputBase, textAlign: "center", fontSize: "1.3rem", padding: "4px" }} value={fact.icon} onChange={(e) => updateFact(i, "icon", e.target.value)} />
                  </div>
                  <div>
                    <label className="a-label">التسمية (ع)</label>
                    <input style={{ ...inputBase, direction: "rtl" }} value={fact.label_ar} onChange={(e) => updateFact(i, "label_ar", e.target.value)} />
                  </div>
                  <div>
                    <label className="a-label">Label (EN)</label>
                    <input style={{ ...inputBase, direction: "ltr" }} value={fact.label_en} onChange={(e) => updateFact(i, "label_en", e.target.value)} />
                  </div>
                </div>
                <FieldPair
                  labelAr="القيمة (ع)"
                  labelEn="Value (EN)"
                  valueAr={fact.value_ar}
                  valueEn={fact.value_en}
                  onChangeAr={(v) => updateFact(i, "value_ar", v)}
                  onChangeEn={(v) => updateFact(i, "value_en", v)}
                />
              </div>
            ))}
            <AddBtn onClick={addFact} label="إضافة حقيقة" />
          </div>
        )}
      </div>

      {/* ── 3. الإحصائيات ─── */}
      <div className="a-card">
        <SectionHeader
          title="الإحصائيات البارزة"
          count={config.stats?.length ?? 0}
          open={open.stats}
          onToggle={() => setOpen((p) => ({ ...p, stats: !p.stats }))}
          color="#2196F3"
        />
        {open.stats && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {(config.stats ?? []).map((stat, i) => (
              <div key={i} style={itemWrap}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: ".8rem", fontWeight: 700, color: "#9BA0B8" }}>إحصاء {i + 1}</span>
                  <RemoveBtn onClick={() => removeStat(i)} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "60px 1fr 1fr 100px", gap: 8, alignItems: "start" }}>
                  <div>
                    <label className="a-label">أيقونة</label>
                    <input style={{ ...inputBase, textAlign: "center", fontSize: "1.3rem", padding: "4px" }} value={stat.icon ?? ""} onChange={(e) => updateStat(i, "icon", e.target.value)} />
                  </div>
                  <div>
                    <label className="a-label">التسمية (ع)</label>
                    <input style={{ ...inputBase, direction: "rtl" }} value={stat.label_ar} onChange={(e) => updateStat(i, "label_ar", e.target.value)} />
                  </div>
                  <div>
                    <label className="a-label">Label (EN)</label>
                    <input style={{ ...inputBase, direction: "ltr" }} value={stat.label_en} onChange={(e) => updateStat(i, "label_en", e.target.value)} />
                  </div>
                  <div>
                    <label className="a-label">الوحدة</label>
                    <input style={inputBase} value={stat.unit ?? ""} onChange={(e) => updateStat(i, "unit", e.target.value)} placeholder="%" />
                  </div>
                </div>
                <div>
                  <label className="a-label">القيمة</label>
                  <input style={{ ...inputBase, direction: "ltr" }} value={stat.value} onChange={(e) => updateStat(i, "value", e.target.value)} />
                </div>
              </div>
            ))}
            <AddBtn onClick={addStat} label="إضافة إحصاء" />
          </div>
        )}
      </div>

      {/* ── 4. خط الزمن ─── */}
      <div className="a-card">
        <SectionHeader
          title="خط الزمن"
          count={config.timeline?.length ?? 0}
          open={open.timeline}
          onToggle={() => setOpen((p) => ({ ...p, timeline: !p.timeline }))}
          color="#0D9488"
        />
        {open.timeline && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {(config.timeline ?? []).map((item, i) => (
              <div key={i} style={itemWrap}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: ".8rem", fontWeight: 700, color: "#9BA0B8" }}>حدث {i + 1}</span>
                  <RemoveBtn onClick={() => removeTimeline(i)} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 10 }}>
                  <div>
                    <label className="a-label">السنة</label>
                    <input style={{ ...inputBase, direction: "ltr" }} value={item.year} onChange={(e) => updateTimeline(i, "year", e.target.value)} placeholder="2020" />
                  </div>
                  <div>
                    <label className="a-label">النوع</label>
                    <select className="a-select" value={item.type ?? "milestone"} onChange={(e) => updateTimeline(i, "type", e.target.value)}>
                      <option value="milestone">🟢 إنجاز</option>
                      <option value="award">🏆 جائزة</option>
                      <option value="founding">🔵 تأسيس</option>
                      <option value="crisis">🔴 أزمة</option>
                      <option value="death">⚫ وفاة</option>
                      <option value="other">⚪ أخرى</option>
                    </select>
                  </div>
                </div>
                <FieldPair
                  labelAr="الحدث (ع)"
                  labelEn="Event (EN)"
                  valueAr={item.event_ar}
                  valueEn={item.event_en}
                  onChangeAr={(v) => updateTimeline(i, "event_ar", v)}
                  onChangeEn={(v) => updateTimeline(i, "event_en", v)}
                />
              </div>
            ))}
            <AddBtn onClick={addTimeline} label="إضافة حدث" />
          </div>
        )}
      </div>

      {/* ── 5. الأقسام التفصيلية ─── */}
      <div className="a-card">
        <SectionHeader
          title="الأقسام التفصيلية"
          count={config.sections?.length ?? 0}
          open={open.sections}
          onToggle={() => setOpen((p) => ({ ...p, sections: !p.sections }))}
          color="#7C3AED"
        />
        {open.sections && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {(config.sections ?? []).map((sec, i) => (
              <div key={i} style={{ ...itemWrap, gap: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: ".8rem", fontWeight: 700, color: "#9BA0B8" }}>قسم {i + 1}</span>
                  <RemoveBtn onClick={() => removeSection(i)} />
                </div>
                <FieldPair
                  labelAr="العنوان (ع)"
                  labelEn="Title (EN)"
                  valueAr={sec.title_ar}
                  valueEn={sec.title_en}
                  onChangeAr={(v) => updateSection(i, "title_ar", v)}
                  onChangeEn={(v) => updateSection(i, "title_en", v)}
                />
                <FieldPair
                  labelAr="المحتوى (ع)"
                  labelEn="Content (EN)"
                  valueAr={sec.content_ar}
                  valueEn={sec.content_en}
                  onChangeAr={(v) => updateSection(i, "content_ar", v)}
                  onChangeEn={(v) => updateSection(i, "content_en", v)}
                  multiline
                />
              </div>
            ))}
            <AddBtn onClick={addSection} label="إضافة قسم" />
          </div>
        )}
      </div>

      {/* ── 6. الوسوم ─── */}
      <div className="a-card">
        <SectionHeader
          title="الوسوم"
          open={open.tags}
          onToggle={() => setOpen((p) => ({ ...p, tags: !p.tags }))}
          color="#E05A2B"
        />
        {open.tags && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <label className="a-label">الوسوم بالعربية (مفصولة بفواصل)</label>
              <input
                style={{ ...inputBase, direction: "rtl" }}
                value={(config.tags_ar ?? []).join("، ")}
                onChange={(e) =>
                  set("tags_ar", e.target.value.split(/[,،]/).map((t) => t.trim()).filter(Boolean))
                }
                placeholder="اقتصاد، تمويل، شرق أوسط"
              />
            </div>
            <div>
              <label className="a-label">Tags in English (comma-separated)</label>
              <input
                style={{ ...inputBase, direction: "ltr" }}
                value={(config.tags_en ?? []).join(", ")}
                onChange={(e) =>
                  set("tags_en", e.target.value.split(",").map((t) => t.trim()).filter(Boolean))
                }
                placeholder="economy, finance, middle east"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
