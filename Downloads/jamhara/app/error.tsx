"use client";
import { useEffect } from "react";
import { Cairo, IBM_Plex_Sans_Arabic } from "next/font/google";

const cairo = Cairo({ subsets: ["arabic", "latin"], weight: ["700", "900"], variable: "--font-cairo", display: "swap" });
const ibm = IBM_Plex_Sans_Arabic({ subsets: ["arabic"], weight: ["300", "400"], variable: "--font-ibm", display: "swap" });

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);

  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} ${ibm.variable}`}>
      <body style={{ margin: 0, background: "#F6F8FA", fontFamily: "var(--font-ibm),sans-serif", display: "flex", minHeight: "100dvh", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", padding: "40px 24px", maxWidth: 480 }}>
          <div style={{ fontFamily: "var(--font-cairo),sans-serif", fontWeight: 900, fontSize: "1.8rem", color: "#1A1E35", marginBottom: 32 }}>
            جمهرة
          </div>
          <div style={{ fontSize: "4rem", marginBottom: 16 }}>⚠️</div>
          <h1 style={{ fontFamily: "var(--font-cairo),sans-serif", fontWeight: 700, fontSize: "1.4rem", color: "#1E2130", marginBottom: 10 }}>
            حدث خطأ غير متوقع
          </h1>
          <p style={{ color: "#6B7280", fontSize: ".95rem", lineHeight: 1.7, marginBottom: 32, fontWeight: 300 }}>
            نعتذر عن هذا الخطأ. يمكنك المحاولة مجدداً أو العودة للصفحة الرئيسية.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button onClick={reset} style={{ padding: "11px 24px", background: "#4CB36C", color: "#fff", border: "none", borderRadius: 8, fontFamily: "var(--font-cairo),sans-serif", fontWeight: 700, fontSize: ".9rem", cursor: "pointer" }}>
              حاول مجدداً
            </button>
            <a href="/ar" style={{ padding: "11px 24px", background: "#fff", color: "#374151", border: "1.5px solid #E8EBF0", borderRadius: 8, fontFamily: "var(--font-cairo),sans-serif", fontWeight: 600, fontSize: ".9rem", textDecoration: "none", display: "inline-block" }}>
              الرئيسية
            </a>
          </div>
          {error.digest && (
            <p style={{ marginTop: 20, fontSize: ".72rem", color: "#9BA0B8", fontFamily: "monospace" }}>
              رمز الخطأ: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
