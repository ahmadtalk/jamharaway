import Link from "next/link";
import { Cairo, IBM_Plex_Sans_Arabic } from "next/font/google";

const cairo = Cairo({ subsets: ["arabic", "latin"], weight: ["700", "900"], variable: "--font-cairo", display: "swap" });
const ibm = IBM_Plex_Sans_Arabic({ subsets: ["arabic"], weight: ["300", "400"], variable: "--font-ibm", display: "swap" });

export default function NotFound() {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} ${ibm.variable}`}>
      <body style={{ margin: 0, background: "#F6F8FA", fontFamily: "var(--font-ibm),'IBM Plex Sans Arabic',sans-serif", display: "flex", minHeight: "100dvh", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", padding: "40px 24px", maxWidth: 480 }}>
          {/* Logo */}
          <div style={{ fontFamily: "var(--font-cairo),sans-serif", fontWeight: 900, fontSize: "1.8rem", color: "#1A1E35", marginBottom: 32 }}>
            جمهرة
          </div>
          {/* 404 */}
          <div style={{ fontFamily: "var(--font-cairo),sans-serif", fontWeight: 900, fontSize: "7rem", color: "#E8EBF0", lineHeight: 1, marginBottom: 8 }}>
            404
          </div>
          <h1 style={{ fontFamily: "var(--font-cairo),sans-serif", fontWeight: 700, fontSize: "1.5rem", color: "#1E2130", marginBottom: 12 }}>
            الصفحة غير موجودة
          </h1>
          <p style={{ color: "#6B7280", fontSize: "1rem", marginBottom: 32, lineHeight: 1.7, fontWeight: 300 }}>
            ربما تم نقل هذه الصفحة أو حذفها، أو أن الرابط غير صحيح.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/ar" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "11px 24px", background: "#4CB36C", color: "#fff", borderRadius: 8, fontFamily: "var(--font-cairo),sans-serif", fontWeight: 700, fontSize: ".9rem", textDecoration: "none" }}>
              العودة للرئيسية
            </Link>
            <Link href="/ar/sections" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "11px 24px", background: "#fff", color: "#374151", border: "1.5px solid #E8EBF0", borderRadius: 8, fontFamily: "var(--font-cairo),sans-serif", fontWeight: 600, fontSize: ".9rem", textDecoration: "none" }}>
              تصفح الأقسام
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
