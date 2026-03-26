import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileNav from "@/components/layout/MobileNav";
import type { Metadata } from "next";

type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return { title: locale === "ar" ? "شروط الخدمة | جمهرة" : "Terms of Service | Jamhara" };
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

export default async function TermsPage({ params }: Props) {
  const { locale } = await params;
  const isAr = locale === "ar";
  return (
    <div className="page-shell" style={{ display: "flex", flexDirection: "column", minHeight: "100dvh" }}>
      <Header />
      <div style={{ maxWidth: 720, margin: "0 auto", width: "100%", padding: "3rem clamp(.75rem, 2vw, 1.5rem) 5rem", flex: 1 }}>
        <StaticPageHeader color="#373C55" title={isAr ? "شروط الخدمة" : "Terms of Service"} />
        <p style={{ ...pStyle, color: "var(--muted)", fontSize: ".85rem" }}>{isAr ? "آخر تحديث: مارس 2026" : "Last updated: March 2026"}</p>
        {isAr ? (
          <>
            <h2 style={h2Style}>1. قبول الشروط</h2>
            <p style={pStyle}>باستخدامك منصة جمهرة، فإنك توافق على الالتزام بهذه الشروط والأحكام. إذا كنت لا توافق على أي من هذه الشروط، يرجى التوقف عن استخدام المنصة.</p>
            <h2 style={h2Style}>2. طبيعة المحتوى</h2>
            <p style={pStyle}>المحتوى المنشور على جمهرة مُولَّد بمساعدة الذكاء الاصطناعي ويُخضع لمراجعة آلية للجودة. على الرغم من حرصنا على الدقة، لا نضمن خلوّ المحتوى من الأخطاء. يُرجى التحقق من المعلومات الحساسة من مصادرها الأصلية.</p>
            <h2 style={h2Style}>3. حقوق الملكية الفكرية</h2>
            <p style={pStyle}>جميع المحتويات المنشورة على جمهرة محمية بموجب قوانين حقوق الملكية الفكرية. لا يجوز إعادة نشر المحتوى أو توزيعه تجارياً دون إذن مسبق.</p>
            <h2 style={h2Style}>4. الاستخدام المقبول</h2>
            <p style={pStyle}>يُمنع استخدام المنصة لأغراض غير قانونية أو لنشر محتوى مسيء أو مضلل. نحتفظ بالحق في تعليق أي حساب ينتهك هذه الشروط.</p>
            <h2 style={h2Style}>5. تعديل الشروط</h2>
            <p style={pStyle}>نحتفظ بحق تعديل هذه الشروط في أي وقت. سيُبلَّغ المستخدمون بأي تغييرات جوهرية عبر المنصة.</p>
          </>
        ) : (
          <>
            <h2 style={h2Style}>1. Acceptance of Terms</h2>
            <p style={pStyle}>By using Jamhara, you agree to be bound by these terms. If you disagree, please stop using the platform.</p>
            <h2 style={h2Style}>2. Content Nature</h2>
            <p style={pStyle}>Content on Jamhara is AI-generated and subject to automated quality review. While we strive for accuracy, we do not guarantee error-free content. Please verify sensitive information from primary sources.</p>
            <h2 style={h2Style}>3. Intellectual Property</h2>
            <p style={pStyle}>All content on Jamhara is protected by intellectual property laws. Commercial redistribution requires prior written permission.</p>
            <h2 style={h2Style}>4. Acceptable Use</h2>
            <p style={pStyle}>Using the platform for illegal purposes or distributing harmful content is prohibited. We reserve the right to suspend accounts violating these terms.</p>
            <h2 style={h2Style}>5. Changes to Terms</h2>
            <p style={pStyle}>We reserve the right to modify these terms at any time. Users will be notified of material changes through the platform.</p>
          </>
        )}
      </div>
      <Footer locale={locale} />
      <MobileNav />
    </div>
  );
}
