import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import Footer from "@/components/layout/Footer";
import MobileNav from "@/components/layout/MobileNav";
import type { Metadata } from "next";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "ar" ? "فلسفتنا — في الأصل والغاية والمنهج" : "Our DNA — Jamhara",
    description: locale === "ar"
      ? "قصة جمهرة وفلسفتها المعرفية — من التأسيس إلى منهج 80/20 والقوالب المعرفية الـ43"
      : "Jamhara's story, DNA and knowledge philosophy",
  };
}

/* ── مساعدات بصرية للقوالب ─────────────────────────────────────── */
function BarPreview() {
  const bars = [65, 88, 45, 72, 55, 80];
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 40, padding: "0 4px" }}>
      {bars.map((h, i) => (
        <div key={i} style={{ flex: 1, height: `${h}%`, borderRadius: "3px 3px 0 0",
          background: `rgba(76,179,108,${0.35 + i * 0.1})` }} />
      ))}
    </div>
  );
}
function PiePreview() {
  return (
    <svg width="48" height="48" viewBox="0 0 36 36">
      <circle cx="18" cy="18" r="15.9" fill="none" stroke="#E8F6ED" strokeWidth="3.2" />
      <circle cx="18" cy="18" r="15.9" fill="none" stroke="#4CB36C" strokeWidth="3.2"
        strokeDasharray="60 40" strokeDashoffset="25" />
      <circle cx="18" cy="18" r="15.9" fill="none" stroke="#2D3A5A" strokeWidth="3.2"
        strokeDasharray="25 75" strokeDashoffset="-35" />
    </svg>
  );
}
function TextPreview() {
  return (
    <div style={{ padding: "4px 6px" }}>
      {[70, 100, 85, 60, 90, 75].map((w, i) => (
        <div key={i} style={{ height: i === 0 ? 7 : 4, borderRadius: 3, marginBottom: 5,
          width: `${w}%`, background: i === 0 ? "#DBE3EA" : "#EDF1F5" }} />
      ))}
    </div>
  );
}
function TimelinePreview() {
  const events = ["#4CB36C", "#2196F3", "#E05A2B", "#F59E0B"];
  return (
    <div style={{ padding: "4px 8px", position: "relative" }}>
      <div style={{ position: "absolute", top: 10, bottom: 10, right: 16,
        width: 2, background: "#EDF1F5", borderRadius: 1 }} />
      {events.map((color, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: color, flexShrink: 0, zIndex: 1 }} />
          <div style={{ height: 4, borderRadius: 2, flex: 1, background: "#EDF1F5" }} />
        </div>
      ))}
    </div>
  );
}
function QuizPreview() {
  return (
    <div style={{ padding: "4px 6px" }}>
      <div style={{ height: 5, borderRadius: 3, marginBottom: 7, width: "90%", background: "#DBE3EA" }} />
      {["#E8F6ED","#F0F4FF","#FFF3E8","#F3EEFF"].map((bg, i) => (
        <div key={i} style={{ height: 12, borderRadius: 4, marginBottom: 4,
          background: bg, border: `1px solid ${bg === "#E8F6ED" ? "#4CB36C33" : "#DBE3EA"}`,
          display: "flex", alignItems: "center", paddingRight: 6 }}>
          <div style={{ width: 4, height: 4, borderRadius: "50%",
            background: i === 0 ? "#4CB36C" : "#DBE3EA", marginLeft: 6 }} />
          <div style={{ height: 3, flex: 1, borderRadius: 2,
            background: i === 0 ? "#4CB36C88" : "#DBE3EA" }} />
        </div>
      ))}
    </div>
  );
}
function ComparePreview() {
  return (
    <div style={{ display: "flex", gap: 6, padding: "4px 6px" }}>
      {["#2D3A5A","#4CB36C"].map((color, ci) => (
        <div key={ci} style={{ flex: 1, border: `1.5px solid ${color}22`,
          borderRadius: 6, padding: "4px 5px" }}>
          <div style={{ height: 5, borderRadius: 3, marginBottom: 5, background: color, opacity: .5 }} />
          {[80, 55, 70].map((w, i) => (
            <div key={i} style={{ height: 3, borderRadius: 2, marginBottom: 4,
              width: `${w}%`, background: `${color}44` }} />
          ))}
        </div>
      ))}
    </div>
  );
}
function DebatePreview() {
  return (
    <div style={{ display: "flex", gap: 6, padding: "4px 6px" }}>
      <div style={{ flex: 1, borderRadius: 6, background: "#E8F6ED", padding: "4px 5px" }}>
        <div style={{ fontSize: 10, color: "#4CB36C", fontWeight: 700, marginBottom: 3 }}>له ✓</div>
        {[90, 70, 80].map((w, i) => (
          <div key={i} style={{ height: 3, borderRadius: 2, marginBottom: 3,
            width: `${w}%`, background: "#4CB36C44" }} />
        ))}
      </div>
      <div style={{ flex: 1, borderRadius: 6, background: "#FFF0EB", padding: "4px 5px" }}>
        <div style={{ fontSize: 10, color: "#E05A2B", fontWeight: 700, marginBottom: 3 }}>ضده ✗</div>
        {[75, 85, 65].map((w, i) => (
          <div key={i} style={{ height: 3, borderRadius: 2, marginBottom: 3,
            width: `${w}%`, background: "#E05A2B44" }} />
        ))}
      </div>
    </div>
  );
}
function ProfilePreview() {
  return (
    <div style={{ padding: "4px 8px", display: "flex", gap: 8 }}>
      <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#7B5EA733",
        border: "2px solid #7B5EA755", display: "flex", alignItems: "center",
        justifyContent: "center", fontSize: 14, flexShrink: 0 }}>👤</div>
      <div style={{ flex: 1 }}>
        <div style={{ height: 5, borderRadius: 3, marginBottom: 4, width: "60%", background: "#DBE3EA" }} />
        <div style={{ height: 3, borderRadius: 2, marginBottom: 3, background: "#EDF1F5" }} />
        <div style={{ height: 3, borderRadius: 2, width: "80%", background: "#EDF1F5" }} />
      </div>
    </div>
  );
}
function MapPreview() {
  const regions = [85, 60, 72, 45, 90, 38];
  return (
    <div style={{ padding: "4px 6px" }}>
      {regions.map((w, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 5 }}>
          <div style={{ fontSize: 9 }}>🌍</div>
          <div style={{ flex: 1, height: 6, borderRadius: 3, background: "#EDF1F5", overflow: "hidden" }}>
            <div style={{ width: `${w}%`, height: "100%",
              background: `rgba(5,150,105,${0.3 + i * 0.08})`, borderRadius: 3 }} />
          </div>
        </div>
      ))}
    </div>
  );
}
function FactcheckPreview() {
  const items = [
    { verdict: "✓", color: "#4CB36C", bg: "#E8F6ED", w: 85 },
    { verdict: "✗", color: "#DC2626", bg: "#FEE2E2", w: 70 },
    { verdict: "◑", color: "#D97706", bg: "#FEF3C7", w: 90 },
    { verdict: "✗", color: "#DC2626", bg: "#FEE2E2", w: 60 },
  ];
  return (
    <div style={{ padding: "4px 8px", width: "100%" }}>
      {items.map((item, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
          <span style={{
            width: 16, height: 16, borderRadius: 4, flexShrink: 0,
            background: item.bg, border: `1px solid ${item.color}44`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 9, fontWeight: 800, color: item.color,
          }}>{item.verdict}</span>
          <div style={{ flex: 1, height: 5, borderRadius: 3, background: "#EDF1F5", overflow: "hidden" }}>
            <div style={{ width: `${item.w}%`, height: "100%", background: `${item.color}33`, borderRadius: 3 }} />
          </div>
        </div>
      ))}
    </div>
  );
}
function BriefingPreview() {
  return (
    <div style={{ padding: "4px 8px", width: "100%" }}>
      {[90, 75, 85, 65, 80].map((w, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
          <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#1D4ED8", flexShrink: 0 }} />
          <div style={{ height: 4, borderRadius: 2, width: `${w}%`, background: i === 0 ? "#DBE3EA" : "#EDF1F5" }} />
        </div>
      ))}
      <div style={{
        marginTop: 6, borderRight: "3px solid #1D4ED833",
        paddingRight: 6,
      }}>
        <div style={{ height: 3, borderRadius: 2, marginBottom: 3, background: "#EDF1F5", width: "80%" }} />
        <div style={{ height: 3, borderRadius: 2, background: "#EDF1F5", width: "60%" }} />
      </div>
    </div>
  );
}
function ExplainerPreview() {
  return (
    <div style={{ padding: "4px 8px", width: "100%" }}>
      {[["ما","#16A34A","#F0FDF4"], ["لماذا","#16A34A","#F0FDF4"], ["كيف","#16A34A","#F0FDF4"]].map(([q, color, bg], i) => (
        <div key={i} style={{ marginBottom: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3 }}>
            <span style={{
              fontSize: 8, fontWeight: 800, color,
              background: bg, border: `1px solid ${color}33`,
              padding: "1px 5px", borderRadius: 4,
            }}>{q}؟</span>
            <div style={{ height: 4, flex: 1, borderRadius: 2, background: "#DBE3EA" }} />
          </div>
          <div style={{ height: 3, borderRadius: 2, width: "85%", background: "#EDF1F5", marginRight: 18 }} />
        </div>
      ))}
    </div>
  );
}
function ScenariosPreview() {
  return (
    <div style={{ display: "flex", gap: 4, padding: "4px 6px" }}>
      {[["🌟","#4CB36C","#E8F6ED"],["⚖️","#2196F3","#EFF6FF"],["⚠️","#E05A2B","#FFF0EB"]].map(([icon, color, bg], i) => (
        <div key={i} style={{ flex: 1, background: bg, borderRadius: 6, padding: "5px 5px 4px", textAlign: "center" }}>
          <div style={{ fontSize: 12, marginBottom: 3 }}>{icon}</div>
          {[100, 75, 85].map((w, j) => (
            <div key={j} style={{ height: 3, borderRadius: 2, marginBottom: 2,
              width: `${w}%`, background: `${color}44`, margin: "0 auto 3px" }} />
          ))}
        </div>
      ))}
    </div>
  );
}
function RankingPreview() {
  const items = [
    { medal: "🥇", w: 95 },
    { medal: "🥈", w: 78 },
    { medal: "🥉", w: 62 },
    { medal: "4",  w: 48 },
  ];
  return (
    <div style={{ padding: "4px 8px", width: "100%" }}>
      {items.map((item, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
          <span style={{ fontSize: i < 3 ? 11 : 8, flexShrink: 0, width: 14, textAlign: "center",
            color: i >= 3 ? "#9BA0B8" : undefined }}>{item.medal}</span>
          <div style={{ flex: 1, height: 6, borderRadius: 3, background: "#EDF1F5", overflow: "hidden" }}>
            <div style={{ width: `${item.w}%`, height: "100%", borderRadius: 3,
              background: i === 0 ? "#D97706" : i === 1 ? "#9BA0B8" : i === 2 ? "#C05E1A44" : "#EDF1F5" }} />
          </div>
        </div>
      ))}
    </div>
  );
}
function InterviewPreview() {
  return (
    <div style={{ padding: "4px 8px", width: "100%" }}>
      {[
        { q: true,  color: "#1D4ED8", w: [60, 80] },
        { q: false, color: "#374151", w: [90, 70, 55] },
        { q: true,  color: "#1D4ED8", w: [75] },
      ].map((item, i) => (
        <div key={i} style={{ marginBottom: 5 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 2 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", flexShrink: 0,
              background: item.color }} />
            <div style={{ height: 4, width: "50%", borderRadius: 2,
              background: `${item.color}44` }} />
          </div>
          {item.w.map((w, j) => (
            <div key={j} style={{ height: 3, borderRadius: 2, marginBottom: 2, marginRight: 11,
              width: `${w}%`, background: item.q ? `${item.color}22` : "#EDF1F5" }} />
          ))}
        </div>
      ))}
    </div>
  );
}
function QuotesPreview() {
  return (
    <div style={{ padding: "4px 6px", width: "100%" }}>
      {[
        { color: "#4CB36C", sentiment: "+" },
        { color: "#DC2626", sentiment: "−" },
        { color: "#6B7280", sentiment: "○" },
      ].map((item, i) => (
        <div key={i} style={{
          borderRight: `3px solid ${item.color}55`,
          paddingRight: 6, marginBottom: 6,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
            <div style={{ height: 3, width: "70%", borderRadius: 2, background: "#EDF1F5" }} />
            <span style={{ fontSize: 8, color: item.color, fontWeight: 800 }}>{item.sentiment}</span>
          </div>
          <div style={{ height: 3, width: "45%", borderRadius: 2, background: `${item.color}33` }} />
        </div>
      ))}
    </div>
  );
}
function GuidePreview() {
  return (
    <div style={{ padding: "4px 8px", width: "100%" }}>
      {[1, 2, 3, 4].map((num) => (
        <div key={num} style={{ display: "flex", alignItems: "flex-start", gap: 6, marginBottom: 6 }}>
          <div style={{
            width: 14, height: 14, borderRadius: "50%", flexShrink: 0,
            background: "#0891B222", border: "1px solid #0891B244",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 7, fontWeight: 800, color: "#0891B2",
          }}>{num}</div>
          <div style={{ flex: 1, paddingTop: 2 }}>
            <div style={{ height: 4, borderRadius: 2, marginBottom: 3, background: "#DBE3EA", width: "70%" }} />
            <div style={{ height: 3, borderRadius: 2, background: "#EDF1F5" }} />
          </div>
        </div>
      ))}
    </div>
  );
}
function NetworkPreview() {
  return (
    <svg width="72" height="52" viewBox="0 0 72 52">
      <circle cx="36" cy="26" r="7" fill="#9333EA22" stroke="#9333EA" strokeWidth="1.5" />
      {[[10,10,"#2D7A46"],[62,10,"#DC2626"],[10,42,"#1D4ED8"],[62,42,"#D97706"],[36,5,"#6B7280"]].map(([x,y,c], i) => (
        <g key={i}>
          <line x1={36} y1={26} x2={x as number} y2={y as number} stroke={c as string} strokeWidth="1" strokeOpacity=".5" />
          <circle cx={x as number} cy={y as number} r="4" fill={`${c}22`} stroke={c as string} strokeWidth="1.2" />
        </g>
      ))}
    </svg>
  );
}
function NumbersPreview() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, padding: "4px 6px" }}>
      {[["43","قالب"],["2014","تأسيس"],["18","نوع"],["∞","معرفة"]].map(([n,l], i) => (
        <div key={i} style={{ borderRadius: 6, background: "#EDF1F5",
          padding: "4px 6px", textAlign: "center" }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: "#2D3A5A" }}>{n}</div>
          <div style={{ fontSize: 7, color: "#9BA0B8", marginTop: 1 }}>{l}</div>
        </div>
      ))}
    </div>
  );
}

/* ── قوالب المحتوى ────────────────────────────────────────────── */
const TEMPLATE_GROUPS = [
  {
    title: "المقال المعرفي",
    color: "#3B6CC4",
    bg: "#EDF3FF",
    icon: "✍️",
    count: 1,
    desc: "مقال محكم بين 100 و160 كلمة، موثق بالمصادر، يبدأ بهوك يشدّ القارئ، ومقسّم إلى طبقات: الحدث والسياق والتحليل.",
    preview: <TextPreview />,
  },
  {
    title: "الاختبار التفاعلي",
    color: "#7C3AED",
    bg: "#F3EEFF",
    icon: "🎯",
    count: 6,
    desc: "ستة أنواع: اختيار من متعدد، صواب أو خطأ، رتّب الأحداث، طابق الأزواج، من أنا؟، وسباق الوقت. كل اختبار يقيس معرفة حقيقية.",
    preview: <QuizPreview />,
  },
  {
    title: "المقارنة البصرية",
    color: "#C05E1A",
    bg: "#FFF3E8",
    icon: "⚡",
    count: 6,
    desc: "ستة أنماط مقارنة: أعمدة، مصفوفة، ملفات شخصية، خط زمني مزدوج، مواقف وآراء، وطيف ومقياس. أداة قوية لفهم الاختلاف والتشابه.",
    preview: <ComparePreview />,
  },
  {
    title: "المخطط البياني",
    color: "#2D7A46",
    bg: "#E8F6ED",
    icon: "📈",
    count: 16,
    desc: "16 نوعاً بيانياً: منطقة، خطي، أعمدة عمودية وأفقية ومكدسة، دائري، حلقي، رادار، نقطي، مركّب، شجرة النسب، قمع، وأعمدة دائرية.",
    preview: <BarPreview />,
  },
  {
    title: "الخط الزمني",
    color: "#0D9488",
    bg: "#E0F7F4",
    icon: "⏳",
    count: 1,
    desc: "8 إلى 15 حدثاً مرتبة على خط زمني ملوّن بأنواع المحطات: إنجاز، أزمة، تأسيس، جائزة. يحوّل التاريخ إلى رحلة بصرية.",
    preview: <TimelinePreview />,
  },
  {
    title: "تحقق من الحقيقة",
    color: "#DC2626",
    bg: "#FEE2E2",
    icon: "🔍",
    count: 1,
    desc: "4 إلى 8 ادعاء شائع، كل منها محكوم عليه بحكم موثق: صحيح، خاطئ، مضلل، أو جزئي — مع تفسير واضح وروابط المصادر.",
    preview: <FactcheckPreview />,
  },
  {
    title: "البروفايل",
    color: "#4338CA",
    bg: "#F0F4FF",
    icon: "🪪",
    count: 1,
    desc: "تعريف صحفي ثري: شخص، منظمة، دولة، أو حركة. يتضمن حقائق سريعة، أرقاماً بارزة، خطاً زمنياً، وتحليلاً متعدد المحاور.",
    preview: <ProfilePreview />,
  },
  {
    title: "بالأرقام",
    color: "#4338CA",
    bg: "#EEF0FF",
    icon: "🔣",
    count: 1,
    desc: "شبكة بصرية ملوّنة من الأرقام المذهلة حول موضوع واحد. يحوّل الإحصاءات الجافة إلى قطعة يصعب تجاهلها.",
    preview: <NumbersPreview />,
  },
  {
    title: "الموجز التنفيذي",
    color: "#1D4ED8",
    bg: "#EFF6FF",
    icon: "🗞️",
    count: 1,
    desc: "نقاط رئيسية + اقتباس بارز + أرقام مفتاحية + خلاصة. ملخص يمنح القارئ كل ما يحتاج معرفته في أقل من دقيقتين.",
    preview: <BriefingPreview />,
  },
  {
    title: "المناظرة",
    color: "#C2410C",
    bg: "#FFF7ED",
    icon: "🏛️",
    count: 1,
    desc: "عرض متوازن لقضية خلافية من الجانبين: حجج التأييد وحجج المعارضة بالتفصيل، مع خلاصة تحريرية محايدة.",
    preview: <DebatePreview />,
  },
  {
    title: "الأسئلة الشارحة",
    color: "#16A34A",
    bg: "#F0FDF4",
    icon: "💡",
    count: 1,
    desc: "6 إلى 10 أسئلة تبدأ بـ «ما، لماذا، كيف» حول موضوع معقد، مع إجابات مفصّلة. يحوّل الغموض إلى وضوح.",
    preview: <ExplainerPreview />,
  },
  {
    title: "خريطة الصلات",
    color: "#9333EA",
    bg: "#FAF5FF",
    icon: "🔗",
    count: 1,
    desc: "شبكة علاقات بصرية: جهة مركزية وما يحيط بها من حلفاء وخصوم وشركاء ومنافسين. يكشف البنية الخفية للأحداث.",
    preview: <NetworkPreview />,
  },
  {
    title: "السيناريوهات",
    color: "#BE185D",
    bg: "#FDF2F8",
    icon: "🌀",
    count: 1,
    desc: "ثلاثة مسارات متوقعة: متفائل، واقعي، متشائم. يمنح القارئ أدوات التفكير الاستراتيجي في المستقبل.",
    preview: <ScenariosPreview />,
  },
  {
    title: "التوزيع الجغرافي",
    color: "#059669",
    bg: "#ECFDF5",
    icon: "🌍",
    count: 1,
    desc: "بيانات مقارنة عبر دول ومناطق مع أشرطة نسبية وعلم. يضع الأرقام في سياقها الجغرافي الحقيقي.",
    preview: <MapPreview />,
  },
  {
    title: "الترتيب والتصنيف",
    color: "#D97706",
    bg: "#FFFBEB",
    icon: "🥇",
    count: 1,
    desc: "قائمة مرتبة ترتيباً نازلاً أو تصاعدياً مع ميداليات ومؤشرات بصرية. لكل ما يستحق أن يُرتَّب.",
    preview: <RankingPreview />,
  },
  {
    title: "المقابلة الصحفية",
    color: "#D97706",
    bg: "#FFFBEB",
    icon: "🎙️",
    count: 1,
    desc: "حوار صحفي Q&A مع شخصية حقيقية أو بارزة. بنية سؤال/جواب واضحة مع هيدر هوية المُحاوَر.",
    preview: <InterviewPreview />,
  },
  {
    title: "الاقتباسات",
    color: "#7C3AED",
    bg: "#F3EEFF",
    icon: "🗣️",
    count: 1,
    desc: "5 إلى 8 اقتباسات بارزة لشخصيات متنوعة حول قضية واحدة، مرتّبة بحسب المشاعر: إيجابي، سلبي، محايد، تحذيري.",
    preview: <QuotesPreview />,
  },
  {
    title: "الخطوات العملية",
    color: "#0891B2",
    bg: "#E0F7FA",
    icon: "🧭",
    count: 1,
    desc: "دليل مرقّم قابل للتنفيذ مع أوقات تقديرية لكل خطوة وتحذيرات عند الضرورة. من القراءة إلى الفعل مباشرة.",
    preview: <GuidePreview />,
  },
];

/* ── مكوّن كبسولة القالب ─────────────────────────────────────── */
function TemplateCard({ t }: { t: typeof TEMPLATE_GROUPS[0] }) {
  return (
    <div style={{
      border: `1px solid ${t.color}22`,
      borderRadius: 14,
      overflow: "hidden",
      background: "#fff",
      boxShadow: "0 2px 12px rgba(0,0,0,.06)",
      display: "flex",
      flexDirection: "column",
    }}>
      {/* رأس الكبسولة */}
      <div style={{ background: t.bg, padding: "12px 14px 10px", borderBottom: `1px solid ${t.color}18` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: "1.1rem" }}>{t.icon}</span>
          <span style={{ fontWeight: 700, fontSize: ".88rem", color: t.color }}>{t.title}</span>
          {t.count > 1 && (
            <span style={{
              fontSize: ".65rem", fontWeight: 700,
              background: t.color, color: "#fff",
              padding: "1px 7px", borderRadius: 100, marginRight: "auto",
            }}>{t.count} أنواع</span>
          )}
        </div>
      </div>
      {/* معاينة بصرية */}
      <div style={{ minHeight: 64, display: "flex", alignItems: "center", justifyContent: "center",
        padding: "8px 0", background: "#FAFAFA", borderBottom: "1px solid #EDF1F5" }}>
        {t.preview}
      </div>
      {/* الوصف */}
      <div style={{ padding: "10px 14px", flex: 1 }}>
        <p style={{ fontSize: ".78rem", color: "#6B7280", lineHeight: 1.6, margin: 0 }}>{t.desc}</p>
      </div>
    </div>
  );
}

/* ── الصفحة الرئيسية ──────────────────────────────────────────── */
export default async function PhilosophyPage({ params }: Props) {
  const { locale } = await params;
  const isAr = locale === "ar";

  return (
    <div className="page-shell" style={{ display: "flex", flexDirection: "column", minHeight: "100dvh" }}>
      <Header />
      <div className="page" style={{ flex: 1 }}>
        <Sidebar categories={[]} />

        <main style={{ paddingBottom: "4rem" }}>

          {/* ════════════════════════════════════════════
              ترويسة الصفحة
          ════════════════════════════════════════════ */}
          <div style={{
            margin: "1rem 0 2.5rem",
            borderRadius: 20,
            overflow: "hidden",
            background: "linear-gradient(135deg, #0f172a 0%, #1e3a2f 50%, #1e1b4b 100%)",
            position: "relative",
            boxShadow: "0 16px 64px rgba(5,10,20,.5)",
          }}>
            {/* شبكة */}
            <div style={{
              position: "absolute", inset: 0, pointerEvents: "none",
              backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 28px,rgba(255,255,255,.025) 28px,rgba(255,255,255,.025) 29px),repeating-linear-gradient(90deg,transparent,transparent 28px,rgba(255,255,255,.025) 28px,rgba(255,255,255,.025) 29px)",
            }} />
            {/* وهج */}
            <div style={{
              position: "absolute", top: -80, right: -80,
              width: 320, height: 320, borderRadius: "50%", pointerEvents: "none",
              background: "radial-gradient(circle, rgba(76,179,108,.2) 0%, transparent 65%)",
            }} />
            <div style={{
              position: "absolute", bottom: -60, left: -60,
              width: 240, height: 240, borderRadius: "50%", pointerEvents: "none",
              background: "radial-gradient(circle, rgba(99,102,241,.18) 0%, transparent 65%)",
            }} />

            <div style={{ position: "relative", padding: "2.5rem 2rem 2.2rem" }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "rgba(76,179,108,.12)", border: "1px solid rgba(76,179,108,.25)",
                padding: "4px 14px", borderRadius: 100, marginBottom: "1.2rem",
              }}>
                <span style={{ fontSize: ".7rem", fontWeight: 800, color: "#4CB36C", letterSpacing: ".06em" }}>
                  📖 في الأصل والغاية والمنهج
                </span>
              </div>

              <h1 style={{
                fontFamily: "var(--font-cairo)", fontSize: "2.2rem",
                fontWeight: 900, color: "#fff", margin: "0 0 .5rem",
                lineHeight: 1.1, letterSpacing: "-.02em",
              }}>
                فلسفة جمهرة
              </h1>
              <p style={{
                fontSize: "1rem", color: "rgba(255,255,255,.55)",
                margin: "0 0 1.8rem", lineHeight: 1.6, maxWidth: 560,
              }}>
                كيف نرى المعرفة، وكيف نصنعها، ولماذا نسميها جمهرة
              </p>

              {/* إحصائيات سريعة */}
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {[
                  ["2014", "عام التأسيس"],
                  ["43",   "قالب محتوى"],
                  ["18",   "نوع معرفي"],
                ].map(([n, l]) => (
                  <div key={n} style={{
                    display: "flex", alignItems: "center", gap: 8,
                    background: "rgba(255,255,255,.07)", backdropFilter: "blur(8px)",
                    border: "1px solid rgba(255,255,255,.11)",
                    borderRadius: 100, padding: "7px 16px",
                  }}>
                    <span style={{ fontSize: "1.05rem", fontWeight: 800, color: "#fff", lineHeight: 1 }}>{n}</span>
                    <span style={{ fontSize: ".7rem", color: "rgba(255,255,255,.45)", fontWeight: 600 }}>{l}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ════════════════════════════════════════════
              القصة
          ════════════════════════════════════════════ */}
          <section style={{ marginBottom: "2.5rem" }}>
            <SectionHeading num="01" title="القصة" sub="من وتدب إلى جمهرة" />
            <div className="philo-prose">
              <p>
                في عام <strong>2014</strong>، انطلقت جمهرة تحت اسم <strong>«وتدب»</strong> — منصة ناشئة تؤمن بأن العالم العربي يستحق أن يقرأ معرفة موثوقة، بلغة عربية راقية، ومقدَّمة بأسلوب يحترم عقل القارئ. كانت الفكرة بسيطة في جوهرها: نُكثِّف المعرفة الواسعة في كبسولات محكمة، ونوثّقها بمصادر يمكن التحقق منها.
              </p>
              <p>
                في <strong>2015</strong>، تحوّلت المنصة إلى اسمها الجديد الذي يحمل في طيّاته إرثاً عربياً عريقاً: <strong>جمهرة</strong>. لم يكن مجرد تغيير علامة تجارية، بل إعلانٌ عن هوية فكرية راسخة، واختيارٌ واعٍ لكلمة تقف في قلب التقليد الموسوعي العربي.
              </p>
            </div>
          </section>

          {/* ════════════════════════════════════════════
              لماذا جمهرة؟
          ════════════════════════════════════════════ */}
          <section style={{ marginBottom: "2.5rem" }}>
            <SectionHeading num="02" title="لماذا جمهرة؟" sub="كلمة تحمل تاريخاً من عشرة قرون" />
            <div className="philo-prose">
              <p>
                «الجمهرة» ليست كلمة عادية. إنها العنوان الذي اختاره كبار علماء العرب لموسوعاتهم ومعاجمهم عبر القرون:
              </p>
              <ul style={{ margin: "1rem 0", paddingRight: "1.5rem", lineHeight: 2 }}>
                <li><strong>جمهرة أشعار العرب</strong> — أبو زيد القرشي (170 هـ)</li>
                <li><strong>جمهرة اللغة</strong> — أبو بكر بن دريد الأزدي (321 هـ)</li>
                <li><strong>جمهرة الأمثال</strong> — أبو هلال العسكري (395 هـ)</li>
              </ul>
              <p>
                وقد أبدى العلامة <strong>محمود محمد شاكر</strong> في كتابه «أباطيل وأسمار» تفضيله لهذا اللفظ على مصطلح «دائرة المعارف» المستورد، فقال:
              </p>
            </div>

            {/* الاقتباس */}
            <blockquote style={{
              margin: "1.5rem 0",
              padding: "1.5rem 1.8rem",
              borderRight: "4px solid #4CB36C",
              background: "#F2FAF5",
              borderRadius: "0 12px 12px 0",
              position: "relative",
            }}>
              <div style={{
                position: "absolute", top: 12, right: 12,
                fontSize: "2.5rem", color: "#4CB36C", opacity: .25,
                fontFamily: "serif", lineHeight: 1,
              }}>"</div>
              <p style={{
                fontFamily: "var(--font-cairo)", fontSize: ".95rem",
                lineHeight: 1.8, color: "#1E2130", margin: 0,
                fontStyle: "normal", fontWeight: 400,
              }}>
                وأنا كنت لا أرتاح إلى هذا اللفظ «دائرة المعارف» لأنه ترجمة وأُوثر عليه اللفظ الذي شاع عند أسلافنا وجهلناه اليوم وهو لفظ «الجمهرة» في مثل هذا المعنى نفسه… فالجمهرة أو «دائرة المعارف» إنما هي مؤلَّف يتضمن معرفة صحيحة سليمة وافية عن كل موضوع يحتاج الناس إلى معرفته، ويستوعب في كل مادة من مواده خلاصة ما ينبغي أن تعرفه عن هذا الموضوع أو ذاك.
              </p>
              <footer style={{ marginTop: "1rem", fontSize: ".78rem", color: "#6B7280", fontWeight: 600 }}>
                — محمود محمد شاكر، أباطيل وأسمار
              </footer>
            </blockquote>

            <div className="philo-prose">
              <p>
                هذا الإرث هو ما تحمله جمهرة على عاتقها: تقديم «معرفة صحيحة سليمة وافية» لكل قارئ عربي، بأساليب عصرية تليق بهذا التراث النبيل.
              </p>
            </div>
          </section>

          {/* ════════════════════════════════════════════
              فلسفة المعرفة
          ════════════════════════════════════════════ */}
          <section style={{ marginBottom: "2.5rem" }}>
            <SectionHeading num="03" title="فلسفة المعرفة" sub="ثلاثة مبادئ لا نتنازل عنها" />

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: "1.5rem" }}>
              {[
                {
                  icon: "✅",
                  color: "#2D7A46",
                  bg: "#E8F6ED",
                  title: "التوثيق أولاً",
                  body: "لا نُنشر خبراً بلا مصدر، ولا حكماً بلا دليل. كل منشور في جمهرة يحمل بصمة مصادره الأصلية المتحقق منها.",
                },
                {
                  icon: "🔬",
                  color: "#1D4ED8",
                  bg: "#EFF6FF",
                  title: "التحقق متعدد الطبقات",
                  body: "المعلومة تمر بثلاث طبقات: توليد ذكي، مراجعة آلية، واعتماد بشري. لا شيء يصل إليك قبل اجتياز هذه المراحل.",
                },
                {
                  icon: "⚖️",
                  color: "#7C3AED",
                  bg: "#F3EEFF",
                  title: "الحياد الموضوعي",
                  body: "جمهرة لا تروّج لأيديولوجية ولا تنحاز لتيار. هدفها الوحيد: تقديم الحقيقة كما هي، من كل جوانبها.",
                },
              ].map((p) => (
                <div key={p.title} style={{
                  background: p.bg, borderRadius: 14,
                  padding: "1.2rem 1.3rem",
                  border: `1px solid ${p.color}22`,
                }}>
                  <div style={{ fontSize: "1.4rem", marginBottom: 8 }}>{p.icon}</div>
                  <h3 style={{ fontFamily: "var(--font-cairo)", fontWeight: 700, fontSize: ".92rem",
                    color: p.color, margin: "0 0 8px" }}>{p.title}</h3>
                  <p style={{ fontSize: ".78rem", color: "#4B5563", lineHeight: 1.6, margin: 0 }}>{p.body}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ════════════════════════════════════════════
              منهج 80/20
          ════════════════════════════════════════════ */}
          <section style={{ marginBottom: "2.5rem" }}>
            <SectionHeading num="04" title="منهج 80/20" sub="ذكاء اصطناعي + عقل بشري" />

            <div style={{
              borderRadius: 16, overflow: "hidden",
              border: "1px solid #E8EBF0",
              background: "#fff",
              boxShadow: "0 4px 20px rgba(0,0,0,.06)",
            }}>
              {/* شريط النسب */}
              <div style={{ display: "flex", height: 12 }}>
                <div style={{ width: "80%", background: "linear-gradient(90deg, #4CB36C, #2D7A46)" }} />
                <div style={{ flex: 1, background: "linear-gradient(90deg, #3B6CC4, #1D4ED8)" }} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
                {/* 80% الذكاء الاصطناعي */}
                <div style={{ padding: "1.5rem 1.6rem", borderLeft: "1px solid #EDF1F5" }}>
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    background: "#E8F6ED", borderRadius: 100,
                    padding: "3px 12px", marginBottom: "1rem",
                  }}>
                    <span style={{ fontSize: "1rem", fontWeight: 900, color: "#2D7A46" }}>80%</span>
                    <span style={{ fontSize: ".7rem", color: "#2D7A46", fontWeight: 600 }}>الذكاء الاصطناعي</span>
                  </div>
                  <h3 style={{ fontFamily: "var(--font-cairo)", fontWeight: 700, fontSize: ".95rem",
                    color: "#2D7A46", margin: "0 0 10px" }}>قوة الآلة</h3>
                  <ul style={{ margin: 0, padding: "0 1rem", fontSize: ".78rem", color: "#4B5563", lineHeight: 2 }}>
                    <li>البحث في آلاف المصادر بثوانٍ</li>
                    <li>استخراج البيانات وتنظيمها</li>
                    <li>الصياغة في 43 قالباً بصرياً</li>
                    <li>إنتاج المحتوى بلغة عربية سليمة</li>
                    <li>النشر المتواصل على مدار الساعة</li>
                  </ul>
                </div>
                {/* 20% البشر */}
                <div style={{ padding: "1.5rem 1.6rem" }}>
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    background: "#EFF6FF", borderRadius: 100,
                    padding: "3px 12px", marginBottom: "1rem",
                  }}>
                    <span style={{ fontSize: "1rem", fontWeight: 900, color: "#1D4ED8" }}>20%</span>
                    <span style={{ fontSize: ".7rem", color: "#1D4ED8", fontWeight: 600 }}>العقل البشري</span>
                  </div>
                  <h3 style={{ fontFamily: "var(--font-cairo)", fontWeight: 700, fontSize: ".95rem",
                    color: "#1D4ED8", margin: "0 0 10px" }}>حكمة الإنسان</h3>
                  <ul style={{ margin: 0, padding: "0 1rem", fontSize: ".78rem", color: "#4B5563", lineHeight: 2 }}>
                    <li>التحقق من الدقة والموثوقية</li>
                    <li>اعتماد المحتوى ونشره</li>
                    <li>تقييم الجودة الصحفية</li>
                    <li>تصحيح السياق الثقافي</li>
                    <li>القرار التحريري النهائي</li>
                  </ul>
                </div>
              </div>

              <div style={{
                padding: "1rem 1.6rem", background: "#F9FAFB",
                borderTop: "1px solid #EDF1F5",
              }}>
                <p style={{ margin: 0, fontSize: ".8rem", color: "#6B7280", lineHeight: 1.6 }}>
                  <strong style={{ color: "#374151" }}>النتيجة:</strong> سرعة الآلة + دقة الإنسان. نُنتج ما لا يستطيع أي منهما إنتاجه منفرداً — معرفة موثّقة، متحققة، ومقدَّمة بإتقان.
                </p>
              </div>
            </div>
          </section>

          {/* ════════════════════════════════════════════
              القوالب المعرفية
          ════════════════════════════════════════════ */}
          <section style={{ marginBottom: "2.5rem" }}>
            <SectionHeading num="05" title="القوالب المعرفية الـ43" sub="لأن المعرفة لا تُقال بشكل واحد" />

            <div className="philo-prose" style={{ marginBottom: "1.5rem" }}>
              <p>
                المعرفة أشكال لا شكل واحد. حدث سياسي يُقدَّم تحليلاً، رقم اقتصادي يُصاغ مخططاً، موقف فكري يُعرض مناظرةً، وعلاقة تحالف تُرسم خريطةً. لذلك أنشأنا <strong>43 قالباً معرفياً</strong> موزعة على <strong>18 نوعاً</strong> — لكل موضوع القالب الذي يُبرزه أكثر.
              </p>
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: 16,
            }}>
              {TEMPLATE_GROUPS.map((t) => (
                <TemplateCard key={t.title} t={t} />
              ))}
            </div>
          </section>

          {/* ════════════════════════════════════════════
              الختام — رسالتنا
          ════════════════════════════════════════════ */}
          <section>
            <div style={{
              borderRadius: 18,
              background: "linear-gradient(135deg, #0f172a 0%, #1e3a2f 60%, #1e1b4b 100%)",
              padding: "2.5rem 2rem",
              position: "relative",
              overflow: "hidden",
              textAlign: "center",
            }}>
              <div style={{
                position: "absolute", inset: 0, pointerEvents: "none",
                backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 28px,rgba(255,255,255,.02) 28px,rgba(255,255,255,.02) 29px),repeating-linear-gradient(90deg,transparent,transparent 28px,rgba(255,255,255,.02) 28px,rgba(255,255,255,.02) 29px)",
              }} />
              <div style={{
                position: "absolute", top: "50%", left: "50%",
                transform: "translate(-50%, -50%)",
                width: 300, height: 300, borderRadius: "50%", pointerEvents: "none",
                background: "radial-gradient(circle, rgba(76,179,108,.12) 0%, transparent 65%)",
              }} />
              <div style={{ position: "relative" }}>
                <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>📚</div>
                <h2 style={{
                  fontFamily: "var(--font-cairo)", fontSize: "1.5rem",
                  fontWeight: 900, color: "#fff",
                  margin: "0 0 1rem", lineHeight: 1.2,
                }}>
                  نحن لا ننتج محتوى — نبني معرفة
                </h2>
                <p style={{
                  fontSize: ".9rem", color: "rgba(255,255,255,.55)",
                  maxWidth: 480, margin: "0 auto 1.5rem",
                  lineHeight: 1.7,
                }}>
                  جمهرة تؤمن بأن القارئ العربي يستحق مصادر يثق بها، تحترم وقته وعقله. نحن لسنا خوارزمية تنتج بلا قيود — نحن فريق تحريري يستخدم الذكاء الاصطناعي أداةً، لا بديلاً عن الحكم والضمير.
                </p>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  background: "rgba(76,179,108,.15)", border: "1px solid rgba(76,179,108,.3)",
                  padding: "8px 20px", borderRadius: 100,
                }}>
                  <span style={{ fontSize: ".82rem", fontWeight: 700, color: "#4CB36C" }}>
                    منذ 2014 — ونحن نبني
                  </span>
                </div>
              </div>
            </div>
          </section>

        </main>
      </div>

      <Footer locale={locale} />
      <MobileNav />
    </div>
  );
}

/* ── مكوّن عنوان القسم ───────────────────────────────────────── */
function SectionHeading({ num, title, sub }: { num: string; title: string; sub: string }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: "1.2rem" }}>
      <span style={{
        fontFamily: "var(--font-cairo)", fontSize: ".7rem", fontWeight: 900,
        color: "#4CB36C", background: "#E8F6ED",
        padding: "3px 10px", borderRadius: 6, flexShrink: 0, marginTop: 4,
        letterSpacing: ".04em",
      }}>{num}</span>
      <div>
        <h2 style={{ fontFamily: "var(--font-cairo)", fontWeight: 900, fontSize: "1.25rem",
          color: "#1E2130", margin: "0 0 2px", lineHeight: 1.2 }}>{title}</h2>
        <p style={{ fontSize: ".78rem", color: "#9BA0B8", margin: 0, fontWeight: 500 }}>{sub}</p>
      </div>
    </div>
  );
}
