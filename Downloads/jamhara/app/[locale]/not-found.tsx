import Link from "next/link";
import { headers } from "next/headers";

export default async function LocaleNotFound() {
  // Detect locale from referer or default to ar
  const headersList = await headers();
  const referer = headersList.get("referer") ?? "";
  const locale = referer.includes("/en") ? "en" : "ar";
  const isAr = locale === "ar";

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      minHeight: "60vh", padding: "40px 24px", direction: isAr ? "rtl" : "ltr",
    }}>
      <div style={{ textAlign: "center", maxWidth: 460 }}>
        <div style={{ fontSize: "5rem", fontWeight: 900, color: "#E8EBF0", fontFamily: "var(--font-cairo),sans-serif", lineHeight: 1 }}>
          404
        </div>
        <h1 style={{ fontFamily: "var(--font-cairo),sans-serif", fontWeight: 700, fontSize: "1.4rem", color: "#1E2130", margin: "16px 0 10px" }}>
          {isAr ? "الصفحة غير موجودة" : "Page Not Found"}
        </h1>
        <p style={{ color: "#6B7280", fontSize: ".95rem", lineHeight: 1.7, marginBottom: 28, fontWeight: 300 }}>
          {isAr
            ? "ربما تم نقل هذا المحتوى أو حذفه. جرّب البحث عنه أو العودة للرئيسية."
            : "This content may have been moved or deleted. Try searching or return to the homepage."}
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href={`/${locale}`} style={{ padding: "10px 22px", background: "#4CB36C", color: "#fff", borderRadius: 8, fontFamily: "var(--font-cairo),sans-serif", fontWeight: 700, fontSize: ".88rem", textDecoration: "none" }}>
            {isAr ? "الرئيسية" : "Homepage"}
          </Link>
          <Link href={`/${locale}/sections`} style={{ padding: "10px 22px", background: "#fff", color: "#374151", border: "1.5px solid #E8EBF0", borderRadius: 8, fontFamily: "var(--font-cairo),sans-serif", fontWeight: 600, fontSize: ".88rem", textDecoration: "none" }}>
            {isAr ? "الأقسام" : "Sections"}
          </Link>
        </div>
      </div>
    </div>
  );
}
