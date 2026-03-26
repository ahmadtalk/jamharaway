"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useToast, ToastContainer } from "@/components/admin/Toast";

// مجموعات الإيموجي للاختيار السريع
const EMOJI_GROUPS: { label: string; emojis: string[] }[] = [
  { label: "علوم وطبيعة",   emojis: ["🔬","🧬","🧪","⚛️","🌍","🌿","🔥","🌊","🧠","💊","🏥","🔭"] },
  { label: "مجتمع وثقافة",  emojis: ["🎨","🎭","📚","🏛️","☪️","✝️","📜","🌐","🗳️","⚖️","🎵","🎬"] },
  { label: "تقنية واقتصاد", emojis: ["💻","📱","🤖","📈","💰","🏦","🔧","🚀","🔌","⚙️","📊","🛒"] },
  { label: "رياضة ونمط حياة",emojis: ["⚽","🏆","🎯","🏋️","🌿","🍳","✈️","🏠","👶","🎮","🧘","🚗"] },
  { label: "سياسة وأحداث",  emojis: ["🏛️","⚡","🌐","🗺️","🏳️","📰","🔍","💡","🎙️","🤝","🌏","🚨"] },
];

function EmojiPicker({ value, onChange }: { value: string; onChange: (e: string) => void }) {
  return (
    <div>
      {EMOJI_GROUPS.map((g) => (
        <div key={g.label} style={{ marginBottom: 10 }}>
          <div style={{ fontSize: ".68rem", color: "#9BA0B8", fontWeight: 600, marginBottom: 5 }}>{g.label}</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {g.emojis.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => onChange(e)}
                style={{
                  width: 34, height: 34, borderRadius: 8, fontSize: "1.1rem",
                  border: value === e ? "2px solid #4CB36C" : "1px solid #E8EBF0",
                  background: value === e ? "#E8F6ED" : "#fff",
                  cursor: "pointer",
                  boxShadow: value === e ? "0 0 0 2px #4CB36C30" : "none",
                  transition: "all .12s",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                {e}
              </button>
            ))}
          </div>
        </div>
      ))}
      <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8 }}>
        <input
          type="text"
          value={value}
          maxLength={4}
          onChange={(e) => onChange(e.target.value)}
          placeholder="✏️"
          style={{
            width: 52, height: 34, textAlign: "center", fontSize: "1.2rem",
            border: "1px solid #E8EBF0", borderRadius: 8, outline: "none",
          }}
        />
        <span style={{ fontSize: ".75rem", color: "#9BA0B8" }}>أو اكتب إيموجي مخصص</span>
        {value && (
          <button type="button" onClick={() => onChange("")}
            style={{ fontSize: ".75rem", color: "#DC2626", background: "none", border: "none", cursor: "pointer" }}>
            مسح
          </button>
        )}
      </div>
    </div>
  );
}

interface Category {
  id: string;
  name_ar: string;
  name_en: string | null;
  slug: string;
  color: string | null;
  icon: string | null;
  parent_id: string | null;
  is_active: boolean;
  sort_order: number | null;
}

interface PostCountRow { category_id: string | null; }
interface Props { categories: Category[]; postCounts: PostCountRow[]; }

// ── لوحة ألوان ثرية — 42 لوناً في 7 مجموعات ──────────────────────────────
const COLOR_GROUPS: { label: string; colors: string[] }[] = [
  {
    label: "أخضر",
    colors: ["#4CB36C", "#16A34A", "#059669", "#10B981", "#6EE7B7", "#D1FAE5"],
  },
  {
    label: "أزرق",
    colors: ["#2196F3", "#1D4ED8", "#0891B2", "#06B6D4", "#60A5FA", "#BFDBFE"],
  },
  {
    label: "بنفسجي",
    colors: ["#7B5EA7", "#9333EA", "#7C3AED", "#6366F1", "#A78BFA", "#E9D5FF"],
  },
  {
    label: "أحمر / برتقالي",
    colors: ["#DC2626", "#C2410C", "#E05A2B", "#EA580C", "#F97316", "#FED7AA"],
  },
  {
    label: "وردي",
    colors: ["#BE185D", "#DB2777", "#EC4899", "#F43F5E", "#FB7185", "#FFE4E6"],
  },
  {
    label: "أصفر / ذهبي",
    colors: ["#D97706", "#F59E0B", "#EAB308", "#CA8A04", "#FDE68A", "#FEF9C3"],
  },
  {
    label: "رمادي / داكن",
    colors: ["#374151", "#4B5563", "#6B7280", "#9CA3AF", "#1E2130", "#373C55"],
  },
];

const ALL_PRESET_COLORS = COLOR_GROUPS.flatMap((g) => g.colors);

// ─────────────────────────────────────────────────────────────────────────────

function slugify(text: string): string {
  return text.toLowerCase().trim()
    .replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-");
}

function buildCountMap(postCounts: PostCountRow[]): Record<string, number> {
  const map: Record<string, number> = {};
  for (const row of postCounts)
    if (row.category_id) map[row.category_id] = (map[row.category_id] ?? 0) + 1;
  return map;
}

// ── ColorPicker مكوّن مشترك ────────────────────────────────────────────────
function ColorPicker({ value, onChange }: { value: string; onChange: (c: string) => void }) {
  return (
    <div>
      {COLOR_GROUPS.map((group) => (
        <div key={group.label} style={{ marginBottom: 10 }}>
          <div style={{ fontSize: ".68rem", color: "#9BA0B8", fontWeight: 600, marginBottom: 5, letterSpacing: ".04em" }}>
            {group.label}
          </div>
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
            {group.colors.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => onChange(c)}
                title={c}
                style={{
                  width: 26, height: 26, borderRadius: 6,
                  background: c,
                  border: value === c ? "2px solid #1E2130" : "1px solid rgba(0,0,0,0.12)",
                  cursor: "pointer",
                  outline: value === c ? "2px solid white" : "none",
                  outlineOffset: "-3px",
                  boxShadow: value === c ? `0 0 0 3px ${c}60` : "none",
                  transition: "transform .12s",
                  transform: value === c ? "scale(1.15)" : "scale(1)",
                  flexShrink: 0,
                }}
              />
            ))}
          </div>
        </div>
      ))}

      {/* مدخل hex مخصص */}
      <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 26, height: 26, borderRadius: 6, flexShrink: 0,
          background: value, border: "1px solid rgba(0,0,0,0.15)",
        }} />
        <input
          type="text"
          value={value}
          maxLength={7}
          onChange={(e) => {
            const v = e.target.value;
            if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) onChange(v);
          }}
          placeholder="#4CB36C"
          dir="ltr"
          style={{
            fontFamily: "monospace", fontSize: ".82rem",
            border: "1px solid var(--a-border)", borderRadius: 6,
            padding: "4px 10px", width: 100, outline: "none",
            color: "#1E2130",
          }}
        />
        <input
          type="color"
          value={/^#[0-9A-Fa-f]{6}$/.test(value) ? value : "#4CB36C"}
          onChange={(e) => onChange(e.target.value)}
          style={{ width: 28, height: 28, border: "none", background: "none", cursor: "pointer", padding: 0 }}
          title="اختر لوناً مخصصاً"
        />
        <span style={{ fontSize: ".72rem", color: "#9BA0B8" }}>لون مخصص</span>
      </div>
    </div>
  );
}

// ── Edit Modal ─────────────────────────────────────────────────────────────
interface EditModalProps {
  cat: Category;
  onClose: () => void;
  onSaved: () => void;
  toast: (msg: string, type: "success" | "error") => void;
}

function EditModal({ cat, onClose, onSaved, toast }: EditModalProps) {
  const [nameAr, setNameAr] = useState(cat.name_ar);
  const [nameEn, setNameEn] = useState(cat.name_en ?? "");
  const [slug, setSlug] = useState(cat.slug);
  const [color, setColor] = useState(cat.color ?? ALL_PRESET_COLORS[0]);
  const [icon, setIcon] = useState(cat.icon ?? "");
  const [isActive, setIsActive] = useState(cat.is_active);
  const [sortOrder, setSortOrder] = useState(cat.sort_order ?? 0);
  const [saving, setSaving] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!nameAr.trim() || !slug.trim()) {
      toast("الاسم بالعربية والـ slug مطلوبان", "error");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: cat.id, name_ar: nameAr, name_en: nameEn || null, slug, color, icon: icon || null, is_active: isActive, sort_order: sortOrder }),
      });
      const data = await res.json();
      if (res.ok) {
        toast("تم حفظ التعديلات بنجاح ✓", "success");
        onSaved();
      } else {
        toast(data.error ?? "حدث خطأ", "error");
      }
    } catch {
      toast("حدث خطأ في الاتصال", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, background: "rgba(30,33,48,.45)",
          zIndex: 900, backdropFilter: "blur(2px)",
        }}
      />

      {/* Modal */}
      <div style={{
        position: "fixed", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        background: "#fff", borderRadius: 16,
        width: "min(680px, 96vw)",
        maxHeight: "90vh", overflowY: "auto",
        zIndex: 901,
        boxShadow: "0 24px 60px rgba(0,0,0,.18)",
        padding: "28px 28px 24px",
      }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22 }}>
          <div>
            <h2 style={{ fontFamily: "var(--font-cairo,sans-serif)", fontWeight: 800, fontSize: "1.15rem", color: "#1E2130", margin: 0 }}>
              تعديل التصنيف
            </h2>
            <p style={{ fontSize: ".78rem", color: "#9BA0B8", margin: "3px 0 0" }}>
              {cat.slug}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: "#F3F4F6", border: "none", borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 18, color: "#6B7280", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSave}>
          <div className="a-edit-grid">
            {/* اسم عربي */}
            <div className="a-form-group">
              <label className="a-label">الاسم بالعربية <span style={{ color: "#DC2626" }}>*</span></label>
              <input type="text" className="a-input" value={nameAr} onChange={(e) => setNameAr(e.target.value)} required />
            </div>

            {/* اسم إنجليزي */}
            <div className="a-form-group">
              <label className="a-label">الاسم بالإنجليزية</label>
              <input type="text" className="a-input" value={nameEn} onChange={(e) => setNameEn(e.target.value)} placeholder="optional" dir="ltr" />
            </div>

            {/* Slug */}
            <div className="a-form-group">
              <label className="a-label">Slug <span style={{ color: "#DC2626" }}>*</span></label>
              <input type="text" className="a-input" value={slug} onChange={(e) => setSlug(e.target.value)} required dir="ltr" />
            </div>

            {/* ترتيب */}
            <div className="a-form-group">
              <label className="a-label">الترتيب (sort_order)</label>
              <input type="number" className="a-input" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} min={0} />
            </div>

            {/* الحالة */}
            <div className="a-form-group full">
              <label className="a-label">الحالة</label>
              <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                {[
                  { v: true, label: "نشط", color: "#2D7A46", bg: "#E8F6ED" },
                  { v: false, label: "معطل", color: "#6B7280", bg: "#F3F4F6" },
                ].map(({ v, label, color: c, bg }) => (
                  <button
                    key={String(v)}
                    type="button"
                    onClick={() => setIsActive(v)}
                    style={{
                      padding: "5px 18px", borderRadius: 100, fontSize: ".82rem", fontWeight: 600,
                      border: `1.5px solid ${isActive === v ? c : "#E8EBF0"}`,
                      background: isActive === v ? bg : "#fff",
                      color: isActive === v ? c : "#9BA0B8",
                      cursor: "pointer", transition: "all .15s",
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* الأيقونة */}
            <div className="a-form-group full">
              <label className="a-label" style={{ marginBottom: 8, display: "block" }}>
                الأيقونة (إيموجي)
                {icon && (
                  <span style={{
                    marginInlineStart: 10, fontSize: "1.3rem", verticalAlign: "middle",
                  }}>{icon}</span>
                )}
              </label>
              <EmojiPicker value={icon} onChange={setIcon} />
            </div>

            {/* اللون */}
            <div className="a-form-group full">
              <label className="a-label" style={{ marginBottom: 8, display: "block" }}>
                اللون
                <span style={{
                  marginInlineStart: 10, padding: "1px 10px", borderRadius: 100,
                  background: color, color: "#fff", fontSize: ".72rem", fontWeight: 700,
                  letterSpacing: ".04em", verticalAlign: "middle",
                }}>
                  {color}
                </span>
              </label>
              <ColorPicker value={color} onChange={setColor} />
            </div>
          </div>

          <div style={{ marginTop: 22, display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "8px 20px", borderRadius: 8, border: "1px solid #E8EBF0",
                background: "#fff", color: "#6B7280", cursor: "pointer", fontSize: ".88rem",
              }}
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={saving}
              className="a-btn"
              style={{ minWidth: 120 }}
            >
              {saving ? "جارٍ الحفظ..." : "حفظ التعديلات"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
export function CategoriesPageClient({ categories, postCounts }: Props) {
  const router = useRouter();
  const { toast, toasts, remove } = useToast();

  // Add form
  const [showAddForm, setShowAddForm] = useState(false);
  const [nameAr, setNameAr] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [slug, setSlug] = useState("");
  const [color, setColor] = useState(ALL_PRESET_COLORS[0]);
  const [newIcon, setNewIcon] = useState("");
  const [parentId, setParentId] = useState("");
  const [adding, setAdding] = useState(false);

  // Edit modal
  const [editingCat, setEditingCat] = useState<Category | null>(null);

  // Delete
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const countMap = buildCountMap(postCounts);
  const topLevelCategories = categories.filter((c) => !c.parent_id);

  function handleNameEnChange(val: string) {
    setNameEn(val);
    setSlug(slugify(val));
  }

  const handleAdd = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameAr.trim()) { toast("الاسم بالعربية مطلوب", "error"); return; }
    if (!slug.trim()) { toast("الـ slug مطلوب", "error"); return; }
    setAdding(true);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name_ar: nameAr, name_en: nameEn || null, slug, color, icon: newIcon || null, parent_id: parentId || null }),
      });
      const data = await res.json();
      if (res.ok) {
        toast("تم إضافة التصنيف بنجاح ✓", "success");
        setNameAr(""); setNameEn(""); setSlug(""); setColor(ALL_PRESET_COLORS[0]); setNewIcon(""); setParentId("");
        setShowAddForm(false);
        router.refresh();
      } else {
        toast(data.error ?? "حدث خطأ", "error");
      }
    } catch { toast("حدث خطأ في الاتصال", "error"); }
    finally { setAdding(false); }
  }, [nameAr, nameEn, slug, color, parentId, toast, router]);

  async function handleDelete(id: string) {
    if (!confirm("هل تريد حذف هذا التصنيف نهائياً؟")) return;
    setDeletingId(id);
    try {
      const res = await fetch("/api/admin/categories/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (res.ok) { toast("تم حذف التصنيف", "success"); router.refresh(); }
      else toast(data.error ?? "حدث خطأ", "error");
    } catch { toast("حدث خطأ في الاتصال", "error"); }
    finally { setDeletingId(null); }
  }

  return (
    <>
      {/* Edit modal */}
      {editingCat && (
        <EditModal
          cat={editingCat}
          onClose={() => setEditingCat(null)}
          onSaved={() => { setEditingCat(null); router.refresh(); }}
          toast={toast}
        />
      )}

      {/* ── Table ── */}
      <div className="a-card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "18px 24px", borderBottom: "1px solid #E8EBF0", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
          <h2 className="a-card-title" style={{ marginBottom: 0 }}>
            جميع التصنيفات ({categories.length})
          </h2>
          <button
            onClick={() => setShowAddForm((v) => !v)}
            className="a-btn"
            style={{ fontSize: ".82rem", padding: "7px 18px" }}
          >
            {showAddForm ? "إخفاء النموذج ✕" : "+ إضافة تصنيف جديد"}
          </button>
        </div>

        {/* نموذج الإضافة — قابل للطي */}
        {showAddForm && (
          <div style={{ padding: "20px 24px", borderBottom: "1px solid #E8EBF0", background: "#FAFBFC" }}>
            <form onSubmit={handleAdd}>
              <div className="a-edit-grid">
                <div className="a-form-group">
                  <label className="a-label" htmlFor="cat-name-ar">
                    الاسم بالعربية <span style={{ color: "#DC2626" }}>*</span>
                  </label>
                  <input id="cat-name-ar" type="text" className="a-input" value={nameAr}
                    onChange={(e) => setNameAr(e.target.value)} placeholder="مثال: السياسة" required />
                </div>

                <div className="a-form-group">
                  <label className="a-label" htmlFor="cat-name-en">الاسم بالإنجليزية</label>
                  <input id="cat-name-en" type="text" className="a-input" value={nameEn}
                    onChange={(e) => handleNameEnChange(e.target.value)} placeholder="politics" />
                </div>

                <div className="a-form-group">
                  <label className="a-label" htmlFor="cat-slug">
                    Slug <span style={{ color: "#DC2626" }}>*</span>
                  </label>
                  <input id="cat-slug" type="text" className="a-input" value={slug}
                    onChange={(e) => setSlug(e.target.value)} placeholder="politics" required dir="ltr" />
                </div>

                <div className="a-form-group">
                  <label className="a-label">التصنيف الأب (اختياري)</label>
                  <select className="a-select" value={parentId} onChange={(e) => setParentId(e.target.value)}>
                    <option value="">— تصنيف رئيسي —</option>
                    {topLevelCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name_ar}</option>
                    ))}
                  </select>
                </div>

                <div className="a-form-group full">
                  <label className="a-label" style={{ marginBottom: 8, display: "block" }}>
                    الأيقونة (إيموجي)
                    {newIcon && <span style={{ marginInlineStart: 10, fontSize: "1.3rem", verticalAlign: "middle" }}>{newIcon}</span>}
                  </label>
                  <EmojiPicker value={newIcon} onChange={setNewIcon} />
                </div>

                <div className="a-form-group full">
                  <label className="a-label" style={{ marginBottom: 8, display: "block" }}>
                    اللون
                    <span style={{
                      marginInlineStart: 10, padding: "1px 10px", borderRadius: 100,
                      background: color, color: "#fff", fontSize: ".72rem", fontWeight: 700,
                      verticalAlign: "middle",
                    }}>
                      {color}
                    </span>
                  </label>
                  <ColorPicker value={color} onChange={setColor} />
                </div>
              </div>

              <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
                <button type="submit" className="a-btn" disabled={adding}>
                  {adding ? "جارٍ الإضافة..." : "إضافة التصنيف"}
                </button>
                <button type="button" onClick={() => setShowAddForm(false)}
                  style={{ padding: "8px 18px", borderRadius: 8, border: "1px solid #E8EBF0", background: "#fff", color: "#6B7280", cursor: "pointer", fontSize: ".88rem" }}>
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="a-table-wrap">
          <table className="a-table">
            <thead>
              <tr>
                <th>الأيقونة</th>
                <th>الاسم</th>
                <th>Slug</th>
                <th>اللون</th>
                <th>المنشورات</th>
                <th>الترتيب</th>
                <th>الحالة</th>
                <th style={{ width: 120 }}>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "40px", color: "#9BA0B8" }}>
                    لا توجد تصنيفات
                  </td>
                </tr>
              )}
              {categories.map((cat) => {
                const count = countMap[cat.id] ?? 0;
                const isDeleting = deletingId === cat.id;
                return (
                  <tr key={cat.id}>
                    <td style={{ textAlign: "center" }}>
                      {cat.icon ? (
                        <span style={{ fontSize: "1.3rem", lineHeight: 1 }}>{cat.icon}</span>
                      ) : (
                        <span style={{
                          display: "inline-block", width: 22, height: 22, borderRadius: 6,
                          background: (cat.color ?? "#ccc") + "20",
                          border: `1px solid ${cat.color ?? "#ccc"}40`,
                        }} />
                      )}
                    </td>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <span style={{ fontWeight: 600, fontSize: ".88rem" }}>{cat.name_ar}</span>
                        {cat.name_en && <span style={{ fontSize: ".75rem", color: "#9BA0B8" }}>{cat.name_en}</span>}
                      </div>
                    </td>
                    <td>
                      <code style={{ fontSize: ".78rem", color: "#6B7280", direction: "ltr", display: "inline-block" }}>
                        {cat.slug}
                      </code>
                    </td>
                    <td>
                      {cat.color ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                          <span style={{
                            display: "inline-block", width: 18, height: 18, borderRadius: 5,
                            background: cat.color, border: "1px solid rgba(0,0,0,0.1)", flexShrink: 0,
                          }} title={cat.color} />
                          <code style={{ fontSize: ".7rem", color: "#9BA0B8", direction: "ltr" }}>{cat.color}</code>
                        </div>
                      ) : (
                        <span style={{ color: "#9BA0B8", fontSize: ".75rem" }}>—</span>
                      )}
                    </td>
                    <td style={{ fontSize: ".85rem", color: "#374151" }}>{count}</td>
                    <td style={{ fontSize: ".82rem", color: "#6B7280" }}>{cat.sort_order ?? "—"}</td>
                    <td>
                      <span className="a-badge" style={{
                        background: cat.is_active ? "#E8F6ED" : "#F3F4F6",
                        color: cat.is_active ? "#2D7A46" : "#6B7280",
                      }}>
                        {cat.is_active ? "نشط" : "معطل"}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        {/* زر تعديل */}
                        <button
                          onClick={() => setEditingCat(cat)}
                          style={{
                            padding: "4px 12px", borderRadius: 6, border: "1px solid #E8EBF0",
                            background: "#fff", color: "#374151", fontSize: ".8rem",
                            cursor: "pointer", fontWeight: 600,
                            transition: "all .15s",
                          }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.background = "#F3F4F6";
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.background = "#fff";
                          }}
                        >
                          تعديل
                        </button>

                        {/* زر حذف */}
                        {count > 0 ? (
                          <button className="a-btn-danger" disabled title="لا يمكن حذف تصنيف يحتوي على منشورات"
                            style={{ opacity: 0.35, cursor: "not-allowed" }}>
                            حذف
                          </button>
                        ) : (
                          <button className="a-btn-danger" onClick={() => handleDelete(cat.id)} disabled={isDeleting}>
                            {isDeleting ? "..." : "حذف"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <ToastContainer toasts={toasts} onRemove={remove} />
    </>
  );
}
