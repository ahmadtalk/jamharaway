import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileNav from "@/components/layout/MobileNav";
import type { Metadata } from "next";

type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return { title: locale === "ar" ? "سياسة الخصوصية | جمهرة" : "Privacy Policy | Jamhara" };
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

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  const isAr = locale === "ar";
  return (
    <div className="page-shell" style={{ display: "flex", flexDirection: "column", minHeight: "100dvh" }}>
      <Header />
      <div style={{ maxWidth: 720, margin: "0 auto", width: "100%", padding: "3rem clamp(.75rem, 2vw, 1.5rem) 5rem", flex: 1 }}>
        <StaticPageHeader color="#1D4ED8" title={isAr ? "سياسة الخصوصية" : "Privacy Policy"} />
        <p style={{ ...pStyle, color: "var(--muted)", fontSize: ".85rem" }}>{isAr ? "آخر تحديث: مارس 2026" : "Last updated: March 2026"}</p>
        {isAr ? (
          <>
            <h2 style={h2Style}>البيانات التي نجمعها</h2>
            <p style={pStyle}>نجمع بيانات مجهولة الهوية لتحسين تجربة المستخدم، تشمل: صفحات الزيارة، ومدة التصفح، والتفاعلات مع المحتوى (إعجاب، مشاركة). لا نجمع معلومات شخصية تعريفية.</p>
            <h2 style={h2Style}>كيف نستخدم البيانات</h2>
            <p style={pStyle}>تُستخدم البيانات حصراً لتحسين المنصة وفهم اهتمامات المستخدمين. لا نبيع بياناتك لأي طرف ثالث.</p>
            <h2 style={h2Style}>الكوكيز</h2>
            <p style={pStyle}>نستخدم ملفات تعريف الارتباط (كوكيز) لحفظ تفضيلاتك وتتبع الجلسات بشكل مجهول. يمكنك التحكم فيها من إعدادات متصفحك.</p>
            <h2 style={h2Style}>حقوقك</h2>
            <p style={pStyle}>يحق لك في أي وقت طلب حذف أي بيانات مرتبطة بجلستك. تواصل معنا على hello@jamhara.com.</p>
          </>
        ) : (
          <>
            <h2 style={h2Style}>Data We Collect</h2>
            <p style={pStyle}>We collect anonymous usage data to improve user experience, including: pages visited, browsing duration, and content interactions (likes, shares). We do not collect personally identifiable information.</p>
            <h2 style={h2Style}>How We Use Data</h2>
            <p style={pStyle}>Data is used exclusively to improve the platform and understand user interests. We never sell your data to third parties.</p>
            <h2 style={h2Style}>Cookies</h2>
            <p style={pStyle}>We use cookies to save preferences and track sessions anonymously. You can control cookies through your browser settings.</p>
            <h2 style={h2Style}>Your Rights</h2>
            <p style={pStyle}>You may request deletion of any session-related data at any time. Contact us at hello@jamhara.com.</p>
          </>
        )}
      </div>
      <Footer locale={locale} />
      <MobileNav />
    </div>
  );
}
