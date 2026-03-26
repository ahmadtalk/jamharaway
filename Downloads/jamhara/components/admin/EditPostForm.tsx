"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useToast, ToastContainer } from "@/components/admin/Toast";
import { ProfileConfigEditor, ProfileConfig } from "@/components/admin/ProfileConfigEditor";

interface Category {
  id: string;
  name_ar: string;
  color: string | null;
}

interface Post {
  id: string;
  title_ar: string;
  title_en: string | null;
  body_ar: string | null;
  category_id: string | null;
  status: string;
  image_url: string | null;
  type: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content_config: any | null;
}

interface EditPostFormProps {
  post: Post;
  categories: Category[];
}

export function EditPostForm({ post, categories }: EditPostFormProps) {
  const router = useRouter();
  const { toast, toasts, remove } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [titleAr, setTitleAr] = useState(post.title_ar);
  const [titleEn, setTitleEn] = useState(post.title_en ?? "");
  const [bodyAr, setBodyAr] = useState(post.body_ar ?? "");
  const [categoryId, setCategoryId] = useState(post.category_id ?? "");
  const [status, setStatus] = useState(post.status ?? "draft");
  const [saving, setSaving] = useState(false);

  // Image state
  const [imageUrl, setImageUrl] = useState<string | null>(post.image_url ?? null);
  const [imageLoading, setImageLoading] = useState(false);

  // Profile config state
  const [profileConfig, setProfileConfig] = useState<ProfileConfig | null>(
    post.type === "profile" && post.content_config ? (post.content_config as ProfileConfig) : null
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!titleAr.trim()) {
      toast("العنوان بالعربية مطلوب", "error");
      return;
    }
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        id: post.id,
        title_ar: titleAr,
        title_en: titleEn || null,
        body_ar: bodyAr || null,
        category_id: categoryId || null,
        status,
      };
      if (post.type === "profile" && profileConfig) {
        body.content_config = profileConfig;
      }
      const res = await fetch("/api/admin/posts/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        toast("تم حفظ التغييرات بنجاح", "success");
        router.refresh();
      } else {
        const data = await res.json();
        toast(data.error ?? "حدث خطأ", "error");
      }
    } catch {
      toast("حدث خطأ في الاتصال", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleRegenerateImage() {
    setImageLoading(true);
    try {
      const res = await fetch("/api/admin/posts/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post_id: post.id, action: "regenerate" }),
      });
      const data = await res.json();
      if (res.ok && data.image_url) {
        setImageUrl(data.image_url);
        toast("تم توليد الصورة وحفظها بنجاح", "success");
      } else {
        toast(data.error ?? "فشل توليد الصورة", "error");
      }
    } catch {
      toast("حدث خطأ في الاتصال", "error");
    } finally {
      setImageLoading(false);
    }
  }

  async function handleRemoveImage() {
    if (!imageUrl) return;
    setImageLoading(true);
    try {
      const res = await fetch("/api/admin/posts/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post_id: post.id, action: "remove" }),
      });
      if (res.ok) {
        setImageUrl(null);
        toast("تم إزالة الصورة", "success");
      } else {
        const data = await res.json();
        toast(data.error ?? "فشل إزالة الصورة", "error");
      }
    } catch {
      toast("حدث خطأ في الاتصال", "error");
    } finally {
      setImageLoading(false);
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast("الملف المختار ليس صورة", "error");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast("حجم الصورة يجب أن يكون أقل من 5 ميغابايت", "error");
      return;
    }

    setImageLoading(true);
    try {
      const formData = new FormData();
      formData.append("post_id", post.id);
      formData.append("file", file);

      const res = await fetch("/api/admin/posts/image", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.image_url) {
        setImageUrl(data.image_url);
        toast("تم رفع الصورة بنجاح", "success");
      } else {
        toast(data.error ?? "فشل رفع الصورة", "error");
      }
    } catch {
      toast("حدث خطأ في الاتصال", "error");
    } finally {
      setImageLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <>
      {/* ── Image Management Card ─────────────────── */}
      <div className="a-card" style={{ marginBottom: 20 }}>
        <p style={{ fontWeight: 700, fontSize: ".9rem", color: "#373C55", marginBottom: 14 }}>
          الصورة
        </p>

        {imageUrl ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ position: "relative", borderRadius: 8, overflow: "hidden", maxWidth: 420, border: "1px solid var(--a-border)" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt="صورة المنشور"
                style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover", display: "block" }}
              />
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button
                type="button"
                className="a-btn-sm"
                disabled={imageLoading}
                onClick={handleRegenerateImage}
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                {imageLoading ? "جارٍ التوليد..." : "✨ توليد صورة جديدة بالذكاء الاصطناعي"}
              </button>
              <button
                type="button"
                className="a-btn-sm"
                disabled={imageLoading}
                onClick={() => fileInputRef.current?.click()}
                style={{ background: "#EDF1F5", color: "#374151", border: "1px solid var(--a-border)" }}
              >
                {imageLoading ? "جارٍ الرفع..." : "تحميل صورة"}
              </button>
              <button
                type="button"
                className="a-btn-danger"
                disabled={imageLoading}
                onClick={handleRemoveImage}
                style={{ fontSize: ".78rem", padding: "5px 12px" }}
              >
                إزالة الصورة
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div
              style={{
                border: "2px dashed var(--a-border)",
                borderRadius: 8,
                padding: "32px 24px",
                textAlign: "center",
                color: "#9BA0B8",
                maxWidth: 420,
                background: "#FAFBFC",
              }}
            >
              <div style={{ fontSize: "2rem", marginBottom: 8 }}>🖼️</div>
              <p style={{ fontSize: ".85rem", margin: 0 }}>لا توجد صورة لهذا المنشور</p>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button
                type="button"
                className="a-btn-sm"
                disabled={imageLoading}
                onClick={handleRegenerateImage}
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                {imageLoading ? "جارٍ التوليد..." : "✨ توليد صورة بالذكاء الاصطناعي"}
              </button>
              <button
                type="button"
                className="a-btn-sm"
                disabled={imageLoading}
                onClick={() => fileInputRef.current?.click()}
                style={{ background: "#EDF1F5", color: "#374151", border: "1px solid var(--a-border)" }}
              >
                {imageLoading ? "جارٍ الرفع..." : "تحميل صورة"}
              </button>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          style={{ display: "none" }}
          onChange={handleFileUpload}
        />
      </div>

      <form onSubmit={handleSubmit}>
        {/* ── Basic Fields ─────────────────────────── */}
        <div className="a-card" style={{ marginBottom: 20 }}>
          <div className="a-edit-grid">
            <div className="a-form-group full">
              <label className="a-label" htmlFor="title_ar">
                العنوان بالعربية <span style={{ color: "#DC2626" }}>*</span>
              </label>
              <textarea
                id="title_ar"
                className="a-textarea"
                value={titleAr}
                onChange={(e) => setTitleAr(e.target.value)}
                required
                rows={2}
              />
            </div>

            <div className="a-form-group full">
              <label className="a-label" htmlFor="title_en">
                العنوان بالإنجليزية
              </label>
              <input
                id="title_en"
                type="text"
                className="a-input"
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
              />
            </div>

            {/* body_ar — hidden for profile (content lives in content_config) */}
            {post.type !== "profile" && (
              <div className="a-form-group full">
                <label className="a-label" htmlFor="body_ar">
                  المحتوى بالعربية
                </label>
                <textarea
                  id="body_ar"
                  className="a-textarea tall"
                  value={bodyAr}
                  onChange={(e) => setBodyAr(e.target.value)}
                  rows={10}
                />
              </div>
            )}

            <div className="a-form-group">
              <label className="a-label" htmlFor="category_id">
                القسم
              </label>
              <select
                id="category_id"
                className="a-select"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                <option value="">— بدون قسم —</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name_ar}
                  </option>
                ))}
              </select>
            </div>

            <div className="a-form-group">
              <label className="a-label">الحالة</label>
              <div className="a-status-toggle">
                <button
                  type="button"
                  className={`a-status-btn${status === "draft" ? " active-draft" : ""}`}
                  onClick={() => setStatus("draft")}
                >
                  مسودة
                </button>
                <button
                  type="button"
                  className={`a-status-btn${status === "published" ? " active-published" : ""}`}
                  onClick={() => setStatus("published")}
                >
                  منشور
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Profile Config Editor ─────────────────── */}
        {post.type === "profile" && profileConfig && (
          <div style={{ marginBottom: 20 }}>
            <p style={{
              fontWeight: 700, fontSize: ".82rem", color: "#7B5EA7",
              textTransform: "uppercase", letterSpacing: ".06em",
              marginBottom: 12, display: "flex", alignItems: "center", gap: 6,
            }}>
              <span style={{ background: "#7B5EA722", padding: "2px 10px", borderRadius: 20 }}>🪪 بيانات البروفايل</span>
            </p>
            <ProfileConfigEditor
              config={profileConfig}
              onChange={setProfileConfig}
            />
          </div>
        )}

        {/* ── Actions ──────────────────────────────── */}
        <div style={{ display: "flex", gap: 10 }}>
          <button type="submit" className="a-btn" disabled={saving}>
            {saving ? "جارٍ الحفظ..." : "حفظ التغييرات"}
          </button>
          <button
            type="button"
            className="a-btn-ghost"
            onClick={() => router.push("/admin/posts")}
            style={{ padding: "10px 20px" }}
          >
            إلغاء
          </button>
        </div>
      </form>

      <ToastContainer toasts={toasts} onRemove={remove} />
    </>
  );
}
