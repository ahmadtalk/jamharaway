import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileNav from "@/components/layout/MobileNav";
import type { Metadata } from "next";

type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return { title: locale === "ar" ? "اتصل بنا | جمهرة" : "Contact | Jamhara" };
}

function StaticPageHeader({ title, color }: { title: string; color: string }) {
  return (
    <div style={{ borderBottom: "1px solid var(--slate)", marginBottom: "1.75rem", paddingBottom: "1rem", display: "flex", alignItems: "center", gap: 10 }}>
      <span style={{ width: 4, height: 28, borderRadius: 2, background: color, flexShrink: 0 }} />
      <h1 style={{ fontFamily: "var(--font-cairo)", fontSize: "1.5rem", fontWeight: 800, color: "var(--ink)" }}>{title}</h1>
    </div>
  );
}

const pStyle: React.CSSProperties = { fontSize: "1rem", lineHeight: 1.85, color: "var(--ink2)", marginBottom: "1rem" };
const h2Style: React.CSSProperties = { fontFamily: "var(--font-cairo)", fontSize: "1.1rem", fontWeight: 700, color: "var(--ink)", margin: "1.5rem 0 .75rem" };

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  const isAr = locale === "ar";
  return (
    <div className="page-shell" style={{ display: "flex", flexDirection: "column", minHeight: "100dvh" }}>
      <Header />
      <div style={{ maxWidth: 720, margin: "0 auto", width: "100%", padding: "3rem clamp(.75rem, 2vw, 1.5rem) 5rem", flex: 1 }}>
        <StaticPageHeader color="#4CB36C" title={isAr ? "اتصل بنا" : "Contact Us"} />
        {isAr ? (
          <>
            <p style={pStyle}>نسعد بتواصلك معنا في أي وقت. يمكنك مراسلتنا عبر البريد الإلكتروني أو متابعتنا على منصات التواصل الاجتماعي.</p>
            <h2 style={h2Style}>البريد الإلكتروني</h2>
            <p style={pStyle}><a href="mailto:hello@jamhara.com" style={{ color: "var(--green)", fontWeight: 600 }}>hello@jamhara.com</a></p>
            <h2 style={h2Style}>لماذا تتواصل معنا؟</h2>
            <ul style={{ ...pStyle, paddingInlineStart: "1.25rem", display: "flex", flexDirection: "column", gap: 8 }}>
              <li>✦ الإبلاغ عن معلومة غير دقيقة</li>
              <li>✦ اقتراح موضوع أو قسم جديد</li>
              <li>✦ الشراكات والتعاون</li>
              <li>✦ أي استفسار عام</li>
            </ul>
            <p style={{ ...pStyle, marginTop: "1.5rem", color: "var(--muted)", fontSize: ".9rem" }}>
              نهدف للرد على رسائلكم خلال 48 ساعة.
            </p>
          </>
        ) : (
          <>
            <p style={pStyle}>We&apos;d love to hear from you. Reach us via email or follow us on social media.</p>
            <h2 style={h2Style}>Email</h2>
            <p style={pStyle}><a href="mailto:hello@jamhara.com" style={{ color: "var(--green)", fontWeight: 600 }}>hello@jamhara.com</a></p>
            <h2 style={h2Style}>Reasons to Contact</h2>
            <ul style={{ ...pStyle, paddingInlineStart: "1.25rem", display: "flex", flexDirection: "column", gap: 8 }}>
              <li>✦ Report inaccurate information</li>
              <li>✦ Suggest a new topic or section</li>
              <li>✦ Partnerships and collaboration</li>
              <li>✦ General inquiries</li>
            </ul>
            <p style={{ ...pStyle, marginTop: "1.5rem", color: "var(--muted)", fontSize: ".9rem" }}>
              We aim to respond within 48 hours.
            </p>
          </>
        )}
      </div>
      <Footer locale={locale} />
      <MobileNav />
    </div>
  );
}
