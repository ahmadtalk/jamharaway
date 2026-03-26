import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileNav from "@/components/layout/MobileNav";
import type { Metadata } from "next";

type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return { title: locale === "ar" ? "سياسة الكوكيز | جمهرة" : "Cookie Policy | Jamhara" };
}

function StaticPageHeader({ title, color }: { title: string; color: string }) {
  return (
    <div style={{ borderBottom: "1px solid var(--slate)", marginBottom: "1.75rem", paddingBottom: "1rem", display: "flex", alignItems: "center", gap: 10 }}>
      <span style={{ width: 4, height: 28, borderRadius: 2, background: color, flexShrink: 0 }} />
      <h1 style={{ fontFamily: "var(--font-cairo)", fontSize: "1.5rem", fontWeight: 800, color: "var(--ink)" }}>{title}</h1>
    </div>
  );
}

const pStyle: React.CSSProperties = { fontSize: ".95rem", lineHeight: 1.85, color: "var(--ink2)", marginBottom: ".875rem" };
const h2Style: React.CSSProperties = { fontFamily: "var(--font-cairo)", fontSize: "1.05rem", fontWeight: 700, color: "var(--ink)", margin: "1.5rem 0 .5rem" };

export default async function CookiesPage({ params }: Props) {
  const { locale } = await params;
  const isAr = locale === "ar";
  return (
    <div className="page-shell" style={{ display: "flex", flexDirection: "column", minHeight: "100dvh" }}>
      <Header />
      <div style={{ maxWidth: 720, margin: "0 auto", width: "100%", padding: "3rem clamp(.75rem, 2vw, 1.5rem) 5rem", flex: 1 }}>
        <StaticPageHeader color="#7C3AED" title={isAr ? "سياسة الكوكيز" : "Cookie Policy"} />
        <p style={{ ...pStyle, color: "var(--muted)", fontSize: ".85rem" }}>{isAr ? "آخر تحديث: مارس 2026" : "Last updated: March 2026"}</p>
        {isAr ? (
          <>
            <p style={pStyle}>تشرح هذه الصفحة كيفية استخدام جمهرة لملفات تعريف الارتباط (الكوكيز) وما هي خياراتك.</p>
            <h2 style={h2Style}>ما هي الكوكيز؟</h2>
            <p style={pStyle}>الكوكيز ملفات نصية صغيرة تُخزَّن على جهازك عند زيارة المواقع. تساعد في تذكر تفضيلاتك وتحسين تجربتك.</p>
            <h2 style={h2Style}>أنواع الكوكيز التي نستخدمها</h2>
            <div style={{ background: "var(--slate3)", borderRadius: 10, padding: "1rem", marginBottom: "1rem" }}>
              <p style={{ ...pStyle, marginBottom: ".5rem", fontWeight: 600, color: "var(--ink)" }}>كوكيز ضرورية</p>
              <p style={{ ...pStyle, marginBottom: 0 }}>مطلوبة لعمل الموقع الأساسي، مثل حفظ معرّف الجلسة للتفاعلات المجهولة.</p>
            </div>
            <div style={{ background: "var(--slate3)", borderRadius: 10, padding: "1rem", marginBottom: "1rem" }}>
              <p style={{ ...pStyle, marginBottom: ".5rem", fontWeight: 600, color: "var(--ink)" }}>كوكيز التحليل</p>
              <p style={{ ...pStyle, marginBottom: 0 }}>تساعدنا على فهم كيفية استخدام الزوار للموقع لتحسين المحتوى.</p>
            </div>
            <h2 style={h2Style}>التحكم في الكوكيز</h2>
            <p style={pStyle}>يمكنك تعطيل الكوكيز من إعدادات متصفحك، لكن ذلك قد يؤثر على بعض وظائف الموقع.</p>
          </>
        ) : (
          <>
            <p style={pStyle}>This page explains how Jamhara uses cookies and your available choices.</p>
            <h2 style={h2Style}>What Are Cookies?</h2>
            <p style={pStyle}>Cookies are small text files stored on your device when you visit websites. They help remember preferences and improve your experience.</p>
            <h2 style={h2Style}>Types of Cookies We Use</h2>
            <div style={{ background: "var(--slate3)", borderRadius: 10, padding: "1rem", marginBottom: "1rem" }}>
              <p style={{ ...pStyle, marginBottom: ".5rem", fontWeight: 600, color: "var(--ink)" }}>Essential Cookies</p>
              <p style={{ ...pStyle, marginBottom: 0 }}>Required for basic site functionality, such as storing an anonymous session ID for interactions.</p>
            </div>
            <div style={{ background: "var(--slate3)", borderRadius: 10, padding: "1rem", marginBottom: "1rem" }}>
              <p style={{ ...pStyle, marginBottom: ".5rem", fontWeight: 600, color: "var(--ink)" }}>Analytics Cookies</p>
              <p style={{ ...pStyle, marginBottom: 0 }}>Help us understand how visitors use the site to improve content.</p>
            </div>
            <h2 style={h2Style}>Controlling Cookies</h2>
            <p style={pStyle}>You can disable cookies in your browser settings, though this may affect some site functionality.</p>
          </>
        )}
      </div>
      <Footer locale={locale} />
      <MobileNav />
    </div>
  );
}
