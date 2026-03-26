import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileNav from "@/components/layout/MobileNav";
import type { Metadata } from "next";

type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return { title: locale === "ar" ? "من نحن | جمهرة" : "About | Jamhara" };
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  const isAr = locale === "ar";
  return (
    <div className="page-shell" style={{ display: "flex", flexDirection: "column", minHeight: "100dvh" }}>
      <Header />
      <div style={{ maxWidth: 720, margin: "0 auto", width: "100%", padding: "3rem clamp(.75rem, 2vw, 1.5rem) 5rem", flex: 1 }}>
        <StaticPageHeader color="#4CB36C" title={isAr ? "من نحن" : "About Us"} />
        {isAr ? (
          <>
            <p style={pStyle}>جمهرة منصة معرفية عربية تُقدّم محتوى موثوقاً ومنظّماً في 24 تخصصاً معرفياً، من الفلسفة والتاريخ إلى الذكاء الاصطناعي والفضاء.</p>
            <p style={pStyle}>نعتمد على الذكاء الاصطناعي لتوليد محتوى معلوماتي يرتكز على الحقائق الموثّقة والأرقام الدقيقة، مع مراجعة آلية تضمن الجودة والموثوقية.</p>
            <h2 style={h2Style}>رسالتنا</h2>
            <p style={pStyle}>نؤمن بأن المعرفة حق للجميع. هدفنا تقديم معلومات دقيقة وموثوقة للقارئ العربي بأسلوب سهل الفهم وجذّاب.</p>
            <h2 style={h2Style}>كيف نعمل</h2>
            <ul style={{ ...pStyle, paddingInlineStart: "1.25rem", display: "flex", flexDirection: "column", gap: 8 }}>
              <li>✦ نختار مواضيع متنوعة من أقسامنا الـ 24</li>
              <li>✦ نولّد محتوى يستند إلى حقائق موثّقة مع ذكر المصادر</li>
              <li>✦ نخضع كل منشور لمراجعة جودة آلية صارمة</li>
              <li>✦ ننشر يومياً لضمان تدفق معرفي مستمر</li>
            </ul>
          </>
        ) : (
          <>
            <p style={pStyle}>Jamhara is an Arabic knowledge platform delivering reliable, structured content across 24 disciplines — from philosophy and history to AI and space.</p>
            <p style={pStyle}>We leverage AI to generate fact-based informational content, with automated quality checks ensuring accuracy and reliability.</p>
            <h2 style={h2Style}>Our Mission</h2>
            <p style={pStyle}>We believe knowledge belongs to everyone. Our goal is to deliver accurate, trustworthy information to Arabic readers in an engaging and accessible format.</p>
            <h2 style={h2Style}>How We Work</h2>
            <ul style={{ ...pStyle, paddingInlineStart: "1.25rem", display: "flex", flexDirection: "column", gap: 8 }}>
              <li>✦ We select diverse topics across our 24 sections</li>
              <li>✦ We generate content grounded in documented facts with source citations</li>
              <li>✦ Every post undergoes strict automated quality review</li>
              <li>✦ We publish daily to ensure continuous knowledge flow</li>
            </ul>
          </>
        )}
      </div>
      <Footer locale={locale} />
      <MobileNav />
    </div>
  );
}

const pStyle: React.CSSProperties = { fontSize: "1rem", lineHeight: 1.85, color: "var(--ink2)", marginBottom: "1rem" };
const h2Style: React.CSSProperties = { fontFamily: "var(--font-cairo)", fontSize: "1.15rem", fontWeight: 700, color: "var(--ink)", margin: "1.75rem 0 .75rem" };
function StaticPageHeader({ title, color }: { title: string; color: string }) {
  return (
    <div style={{ borderBottom: "1px solid var(--slate)", marginBottom: "1.75rem", paddingBottom: "1rem", display: "flex", alignItems: "center", gap: 10 }}>
      <span style={{ width: 4, height: 28, borderRadius: 2, background: color, flexShrink: 0 }} />
      <h1 style={{ fontFamily: "var(--font-cairo)", fontSize: "1.5rem", fontWeight: 800, color: "var(--ink)" }}>{title}</h1>
    </div>
  );
}
