"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { postUrl } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
}

interface SearchResult {
  id: string;
  title: string;
  body_excerpt: string;
  type: string;
  category_name: string;
  category_slug: string;
  category_color: string;
}

const TYPE_LABELS: Record<string, string> = {
  article:    "📝 مقال",
  chart:      "📊 مخطط",
  quiz:       "❓ اختبار",
  comparison: "⚔️ مقارنة",
  ranking:    "🏆 ترتيب",
  numbers:    "📋 أرقام",
  scenarios:  "🔀 سيناريوهات",
  timeline:   "📅 خط زمني",
  factcheck:  "✅ تحقق",
};

const TYPE_LABELS_EN: Record<string, string> = {
  article:    "📝 Article",
  chart:      "📊 Chart",
  quiz:       "❓ Quiz",
  comparison: "⚔️ Comparison",
  ranking:    "🏆 Ranking",
  numbers:    "📋 Numbers",
  scenarios:  "🔀 Scenarios",
  timeline:   "📅 Timeline",
  factcheck:  "✅ Factcheck",
};

export default function SearchModal({ open, onClose }: Props) {
  const router = useRouter();
  const locale = useLocale() as "ar" | "en";
  const isAr = locale === "ar";

  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [searchError, setSearchError] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Focus input when modal opens; reset state
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 60);
    } else {
      setQuery("");
      setResults([]);
      setSearched(false);
      setLoading(false);
      setSearchError(false);
    }
  }, [open]);

  // Escape key handler
  useEffect(() => {
    if (!open) return;
    const handle = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, [open, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const doSearch = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      setSearched(false);
      setLoading(false);
      setSearchError(false);
      return;
    }
    setLoading(true);
    setSearchError(false);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&locale=${locale}`);
      if (!res.ok) throw new Error("search failed");
      const json = await res.json();
      setResults(json.results ?? []);
    } catch {
      setResults([]);
      setSearchError(true);
    } finally {
      setLoading(false);
      setSearched(true);
    }
  }, [locale]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setSearchError(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val), 300);
  };

  const handleResultClick = (result: SearchResult) => {
    router.push(postUrl(result.id, locale));
    onClose();
  };

  const handleShowAll = () => {
    const path = locale === "en"
      ? `/en/search?q=${encodeURIComponent(query)}`
      : `/search?q=${encodeURIComponent(query)}`;
    router.push(path);
    onClose();
  };

  if (!open) return null;

  const typeLabels = isAr ? TYPE_LABELS : TYPE_LABELS_EN;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(15,17,30,0.72)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          zIndex: 1000,
          animation: "fadeIn 0.15s ease",
        }}
      />

      {/* Modal container */}
      <div
        style={{
          position: "fixed",
          top: "15%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "min(640px, 92vw)",
          zIndex: 1001,
          animation: "slideDown 0.18s cubic-bezier(.22,1,.36,1)",
          direction: isAr ? "rtl" : "ltr",
        }}
        onClick={(e) => e.stopPropagation()}
      >

        {/* Search input box */}
        <div style={{ position: "relative" }}>
          {/* Search icon inside input */}
          <span style={{
            position: "absolute",
            top: "50%",
            insetInlineStart: 18,
            transform: "translateY(-50%)",
            color: "rgba(255,255,255,0.45)",
            pointerEvents: "none",
            display: "flex",
            alignItems: "center",
          }}>
            <svg width={20} height={20} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="8.5" cy="8.5" r="5.5" />
              <path d="M15.5 15.5l-3.2-3.2" />
            </svg>
          </span>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleChange}
            placeholder={isAr ? "ابحث في جمهرة..." : "Search Jamhara..."}
            style={{
              width: "100%",
              height: 54,
              fontSize: "1.1rem",
              paddingInline: "54px",
              paddingBlock: 0,
              borderRadius: 14,
              border: "1.5px solid rgba(255,255,255,0.12)",
              background: "rgba(22,26,46,0.97)",
              color: "#fff",
              outline: "none",
              fontFamily: isAr ? "var(--font-cairo, Cairo, sans-serif)" : "inherit",
              boxSizing: "border-box",
              boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
              transition: "border-color 0.15s",
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; }}
          />

          {/* Clear button */}
          {query && (
            <button
              onClick={() => { setQuery(""); setResults([]); setSearched(false); inputRef.current?.focus(); }}
              style={{
                position: "absolute",
                top: "50%",
                insetInlineEnd: 14,
                transform: "translateY(-50%)",
                background: "rgba(255,255,255,0.12)",
                border: "none",
                borderRadius: "50%",
                width: 26,
                height: 26,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "rgba(255,255,255,0.6)",
                fontSize: 13,
                padding: 0,
                transition: "background 0.15s, color 0.15s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.22)";
                (e.currentTarget as HTMLButtonElement).style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.12)";
                (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.6)";
              }}
              aria-label={isAr ? "مسح البحث" : "Clear search"}
            >
              ✕
            </button>
          )}
        </div>

        {/* Results panel */}
        {(loading || (searched && query.length >= 2) || searchError) && (
          <div style={{
            marginTop: 8,
            background: "#fff",
            borderRadius: 14,
            boxShadow: "0 12px 48px rgba(0,0,0,0.28)",
            overflow: "hidden",
            border: "1px solid rgba(0,0,0,0.07)",
          }}>
            {/* Loading shimmer */}
            {loading && (
              <div style={{ padding: "8px 0" }}>
                {[1, 2, 3].map((i) => (
                  <div key={i} style={{ padding: "12px 18px", display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                      background: "linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%)",
                      backgroundSize: "200% 100%",
                      animation: "shimmer 1.4s infinite",
                    }} />
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                      <div style={{
                        height: 14, borderRadius: 6, background: "linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%)",
                        backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite", width: "65%",
                      }} />
                      <div style={{
                        height: 11, borderRadius: 6, background: "linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%)",
                        backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite", width: "85%",
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty state */}
            {!loading && searched && results.length === 0 && !searchError && (
              <div style={{
                padding: "36px 20px",
                textAlign: "center",
                color: "var(--muted, #888)",
                direction: isAr ? "rtl" : "ltr",
              }}>
                <div style={{ fontSize: "2rem", marginBottom: 10 }}>🔍</div>
                <p style={{
                  fontFamily: isAr ? "var(--font-cairo, Cairo, sans-serif)" : "inherit",
                  fontWeight: 700,
                  fontSize: "1rem",
                  color: "#333",
                  margin: "0 0 4px",
                }}>
                  {isAr ? "لا توجد نتائج" : "No results found"}
                </p>
                <p style={{ fontSize: ".83rem", margin: 0 }}>
                  {isAr ? `لم نجد شيئًا لـ "${query}"` : `Nothing found for "${query}"`}
                </p>
              </div>
            )}

            {/* Error state */}
            {!loading && searchError && (
              <div style={{ textAlign: "center", padding: "32px 16px", direction: isAr ? "rtl" : "ltr" }}>
                <div style={{ fontSize: "2rem", marginBottom: 8 }}>🔌</div>
                <p style={{ fontSize: ".9rem", color: "#DC2626", fontWeight: 600, margin: "0 0 4px" }}>
                  {isAr ? "تعذّر الاتصال بالبحث" : "Search unavailable"}
                </p>
                <p style={{ fontSize: ".82rem", color: "#9BA0B8", marginTop: 4, margin: 0 }}>
                  {isAr ? "تحقق من اتصالك وحاول مجدداً" : "Check your connection and try again"}
                </p>
              </div>
            )}

            {/* Results list */}
            {!loading && !searchError && results.length > 0 && (
              <>
                <div style={{ maxHeight: "60vh", overflowY: "auto" }}>
                  {results.map((result, i) => (
                    <button
                      key={result.id}
                      onClick={() => handleResultClick(result)}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 12,
                        width: "100%",
                        padding: "13px 18px",
                        background: "transparent",
                        border: "none",
                        borderBottom: i < results.length - 1 ? "1px solid #f2f2f2" : "none",
                        cursor: "pointer",
                        textAlign: isAr ? "right" : "left",
                        direction: isAr ? "rtl" : "ltr",
                        transition: "background 0.1s",
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#f8f9fb"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                    >
                      {/* Type + category badge column */}
                      <div style={{
                        flexShrink: 0,
                        width: 38,
                        height: 38,
                        borderRadius: 9,
                        background: result.category_color ? result.category_color + "18" : "#4CB36C18",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.1rem",
                        marginTop: 1,
                      }}>
                        {(typeLabels[result.type] ?? "📄").split(" ")[0]}
                      </div>

                      {/* Text */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 2 }}>
                          <span style={{
                            fontFamily: isAr ? "var(--font-cairo, Cairo, sans-serif)" : "inherit",
                            fontWeight: 700,
                            fontSize: ".93rem",
                            color: "#1a1a2e",
                            lineHeight: 1.35,
                          }}>
                            {result.title}
                          </span>
                        </div>
                        <p style={{
                          margin: 0,
                          fontSize: ".78rem",
                          color: "#666",
                          lineHeight: 1.45,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}>
                          {result.body_excerpt}
                        </p>
                        {/* Badges row */}
                        <div style={{ display: "flex", gap: 5, marginTop: 5, flexWrap: "wrap" }}>
                          {result.category_name && (
                            <span style={{
                              display: "inline-flex", alignItems: "center", gap: 4,
                              background: result.category_color + "18",
                              color: result.category_color || "#4CB36C",
                              borderRadius: 100, padding: "2px 8px",
                              fontSize: ".69rem", fontWeight: 700,
                            }}>
                              <span style={{ width: 5, height: 5, borderRadius: "50%", background: result.category_color || "#4CB36C", flexShrink: 0 }} />
                              {result.category_name}
                            </span>
                          )}
                          <span style={{
                            display: "inline-flex", alignItems: "center",
                            background: "#f0f1f5",
                            color: "#555",
                            borderRadius: 100, padding: "2px 8px",
                            fontSize: ".69rem", fontWeight: 600,
                          }}>
                            {typeLabels[result.type] ?? result.type}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Show all results footer */}
                <button
                  onClick={handleShowAll}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    width: "100%",
                    padding: "12px 18px",
                    background: "transparent",
                    border: "none",
                    borderTop: "1px solid #f0f0f0",
                    cursor: "pointer",
                    color: "var(--primary, #2563eb)",
                    fontFamily: isAr ? "var(--font-cairo, Cairo, sans-serif)" : "inherit",
                    fontWeight: 700,
                    fontSize: ".85rem",
                    transition: "background 0.1s",
                    direction: isAr ? "rtl" : "ltr",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#f5f8ff"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                >
                  {isAr ? `عرض كل النتائج لـ "${query}"` : `View all results for "${query}"`}
                  <svg width={14} height={14} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
                    style={{ transform: isAr ? "rotate(180deg)" : "none" }}>
                    <path d="M4 10h12M12 5l5 5-5 5" />
                  </svg>
                </button>
              </>
            )}
          </div>
        )}

        {/* Hint text when idle */}
        {!loading && !searched && query.length < 2 && (
          <div style={{
            marginTop: 12,
            textAlign: "center",
            color: "rgba(255,255,255,0.38)",
            fontSize: ".78rem",
            direction: isAr ? "rtl" : "ltr",
          }}>
            {isAr ? "اكتب للبحث في المقالات، المخططات، الاختبارات..." : "Type to search articles, charts, quizzes..."}
          </div>
        )}

        {/* Keyboard shortcut hint */}
        <div style={{
          marginTop: query.length >= 2 && !loading ? 10 : 8,
          textAlign: isAr ? "left" : "right",
          paddingInlineEnd: 4,
          display: "flex",
          justifyContent: "flex-end",
          gap: 6,
          color: "rgba(255,255,255,0.3)",
          fontSize: ".72rem",
        }}>
          <kbd style={{ background: "rgba(255,255,255,0.08)", borderRadius: 4, padding: "1px 6px", fontSize: ".7rem", fontFamily: "monospace" }}>Esc</kbd>
          <span>{isAr ? "للإغلاق" : "to close"}</span>
        </div>
      </div>

      {/* Keyframe animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateX(-50%) translateY(-16px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </>
  );
}
