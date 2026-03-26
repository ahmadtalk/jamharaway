"use client";
import { useEffect } from "react";
import Link from "next/link";

export default function LocaleError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", padding: "40px 24px" }}>
      <div style={{ textAlign: "center", maxWidth: 460 }}>
        <div style={{ fontSize: "3.5rem", marginBottom: 16 }}>⚠️</div>
        <h1 style={{ fontFamily: "var(--font-cairo),sans-serif", fontWeight: 700, fontSize: "1.3rem", color: "#1E2130", marginBottom: 10 }}>
          حدث خطأ في تحميل هذه الصفحة
        </h1>
        <p style={{ color: "#6B7280", fontSize: ".9rem", lineHeight: 1.7, marginBottom: 24, fontWeight: 300 }}>
          يمكنك المحاولة مجدداً أو العودة للصفحة الرئيسية.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={reset} style={{ padding: "10px 22px", background: "#4CB36C", color: "#fff", border: "none", borderRadius: 8, fontFamily: "var(--font-cairo),sans-serif", fontWeight: 700, fontSize: ".88rem", cursor: "pointer" }}>
            حاول مجدداً
          </button>
          <Link href="/ar" style={{ padding: "10px 22px", background: "#fff", color: "#374151", border: "1.5px solid #E8EBF0", borderRadius: 8, fontFamily: "var(--font-cairo),sans-serif", fontWeight: 600, fontSize: ".88rem", textDecoration: "none" }}>
            الرئيسية
          </Link>
        </div>
        {error.digest && (
          <p style={{ marginTop: 16, fontSize: ".72rem", color: "#C0C4D4" }}>#{error.digest}</p>
        )}
      </div>
    </div>
  );
}
