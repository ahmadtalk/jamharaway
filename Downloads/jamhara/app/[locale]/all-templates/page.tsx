import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileNav from "@/components/layout/MobileNav";
import type { Metadata } from "next";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === "ar";
  return {
    title: isAr ? "جميع القوالب | جمهرة" : "All Templates | Jamhara",
    description: isAr
      ? "استعرض جميع قوالب المحتوى المتاحة على منصة جمهرة — 43 قالباً في 18 نوعاً"
      : "Browse all content templates available on Jamhara — 43 templates across 18 types",
  };
}

// ── بيانات القوالب ────────────────────────────────────────────────────────────

interface Template {
  id: string;
  icon: string;
  name_ar: string;
  name_en: string;
  group_ar: string;
  group_en: string;
  accent: string;
  desc_ar: string;
  desc_en: string;
  when_ar: string;
  when_en: string;
  examples_ar: string[];
  examples_en: string[];
}

const TEMPLATES: Template[] = [
  // ── مقال ─────────────────────────────────────────────────────────────────
  {
    id: "article",
    icon: "📝",
    name_ar: "مقال",
    name_en: "Article",
    group_ar: "نص",
    group_en: "Text",
    accent: "#3B6CC4",
    desc_ar: "مقال صحفي أو تحليلي كامل مكتوب بأسلوب احترافي، يتضمن مقدمة وصلب وخاتمة مع مصادر موثوقة. يُقدَّم بتنسيق نصي مُهيكَل يسهل قراءته.",
    desc_en: "A full journalistic or analytical article written in a professional style, with an introduction, body, and conclusion, supported by credible sources.",
    when_ar: "حين تريد تغطية خبر أو تحليل حدث أو شرح فكرة بعمق دون الحاجة إلى تصور بصري.",
    when_en: "When you want to cover news, analyze an event, or explain an idea in depth without a visual format.",
    examples_ar: [
      "الذكاء الاصطناعي يُعيد رسم خريطة سوق العمل العالمي",
      "لماذا تتراجع الديمقراطية في أفريقيا جنوب الصحراء؟",
      "الفضاء التجاري: سباق جديد بين القطاع الخاص والحكومات",
    ],
    examples_en: [
      "How AI Is Redrawing the Global Labor Market",
      "Why Democracy Is Declining in Sub-Saharan Africa",
      "Commercial Space: A New Race Between Private Sector and Governments",
    ],
  },

  // ── مخطط ─────────────────────────────────────────────────────────────────
  {
    id: "chart",
    icon: "📊",
    name_ar: "مخطط بياني",
    name_en: "Chart",
    group_ar: "بيانات",
    group_en: "Data",
    accent: "#2D7A46",
    desc_ar: "عرض بيانات كمية في مخطط بصري تفاعلي. يدعم 15 نوعاً: خطي، أعمدة، دائري، حلقي، رادار، فقاعي، منطقة مكدسة، قمع، شجرة النسب، وغيرها. يختار Claude النوع الأنسب تلقائياً أو يمكنك تحديده.",
    desc_en: "Display quantitative data in an interactive visual chart. Supports 15 types: line, bar, pie, donut, radar, bubble, stacked area, funnel, treemap, and more.",
    when_ar: "حين تريد مقارنة أرقام، عرض اتجاهات زمنية، توزيع نسب، أو تحليل بيانات إحصائية.",
    when_en: "When comparing numbers, showing time trends, displaying proportions, or analyzing statistical data.",
    examples_ar: [
      "أسعار النفط من 2000 إلى 2025: رحلة التقلبات",
      "توزيع الثروة العالمية: من يملك ماذا؟",
      "الدول الأكثر إنتاجاً للطاقة المتجددة في 2024",
    ],
    examples_en: [
      "Oil Prices 2000–2025: A Journey Through Volatility",
      "Global Wealth Distribution: Who Owns What?",
      "Top Renewable Energy Producers in 2024",
    ],
  },

  // ── اختبار ───────────────────────────────────────────────────────────────
  {
    id: "quiz",
    icon: "🧩",
    name_ar: "اختبار",
    name_en: "Quiz",
    group_ar: "تفاعلي",
    group_en: "Interactive",
    accent: "#7C3AED",
    desc_ar: "اختبار تفاعلي في 6 أشكال: اختيار متعدد (MCQ)، صح وخطأ، ترتيب زمني، مطابقة الأزواج، خمّن الشخصية، وسؤال الثانية. يُصحَّح تلقائياً مع تفسير لكل إجابة.",
    desc_en: "Interactive quiz in 6 formats: MCQ, true/false, timeline ordering, pair matching, guess who, and speed round. Auto-graded with explanations.",
    when_ar: "لاختبار معلومات القراء حول موضوع، وإضافة طابع تفاعلي وتشاركي على المنصة.",
    when_en: "To test reader knowledge on a topic and add an interactive, shareable element to the platform.",
    examples_ar: [
      "اختبر معلوماتك عن الحرب العالمية الأولى",
      "هل تعرف عواصم دول العالم؟ — اختبار الثانية",
      "خمّن الشخصية: من قال هذا الاقتباس التاريخي؟",
    ],
    examples_en: [
      "Test Your Knowledge of World War I",
      "Do You Know World Capitals? — Speed Round",
      "Guess Who Said This Historical Quote?",
    ],
  },

  // ── مقارنة ────────────────────────────────────────────────────────────────
  {
    id: "comparison",
    icon: "⚖️",
    name_ar: "مقارنة",
    name_en: "Comparison",
    group_ar: "تحليل",
    group_en: "Analysis",
    accent: "#C05E1A",
    desc_ar: "مقارنة بين كيانين في 6 أشكال: أعمدة مقارنة، جدول الميزات، بروفايل جنباً إلى جنب، مقارنة زمنية، تناقض المواقف، ومقياس الطيف. يُبرز الفروق والتشابهات بوضوح.",
    desc_en: "Compare two entities in 6 formats: bar comparison, feature matrix, side-by-side profile, timeline duel, stance contrast, and spectrum scale.",
    when_ar: "لمقارنة شخصيتين أو دولتين أو منتجين أو فكرتين أو حقبتين تاريخيتين.",
    when_en: "To compare two people, countries, products, ideas, or historical eras.",
    examples_ar: [
      "بايدن مقابل ترامب: السياسة الخارجية الأمريكية",
      "الذكاء الاصطناعي: الصين مقابل الولايات المتحدة",
      "الرأسمالية مقابل الاشتراكية: ماذا تقدّم كل منهما؟",
    ],
    examples_en: [
      "Biden vs. Trump: US Foreign Policy Compared",
      "AI Race: China vs. United States",
      "Capitalism vs. Socialism: What Each Offers",
    ],
  },

  // ── ترتيب ─────────────────────────────────────────────────────────────────
  {
    id: "ranking",
    icon: "🏆",
    name_ar: "ترتيب وتصنيف",
    name_en: "Ranking",
    group_ar: "قوائم",
    group_en: "Lists",
    accent: "#D97706",
    desc_ar: "قائمة مرتبة تنازلياً بأرقام ووحدات قياس وتعليقات. تُعرض مع ميداليات ذهبية وفضية وبرونزية لأوائل القائمة، وإمكانية عرض التغيير مقارنة بالسابق (↑↓).",
    desc_en: "A descending ranked list with numbers, units, and comments. Displays gold/silver/bronze medals for the top three, with optional change indicators (↑↓).",
    when_ar: "لإبراز أكبر أو أقوى أو أسرع أو أغنى — أي قائمة تحتاج ترتيباً وأرقاماً.",
    when_en: "To highlight the biggest, strongest, fastest, or richest — any list needing ranking with numbers.",
    examples_ar: [
      "أغنى 10 رجال في العالم لعام 2025",
      "أكثر الدول إنتاجاً للقمح على مستوى العالم",
      "أكبر اقتصادات الخليج مقاساً بالناتج المحلي",
    ],
    examples_en: [
      "The 10 Richest People in the World 2025",
      "Top Wheat-Producing Countries Globally",
      "Largest Gulf Economies by GDP",
    ],
  },

  // ── أرقام ─────────────────────────────────────────────────────────────────
  {
    id: "numbers",
    icon: "🔢",
    name_ar: "بالأرقام",
    name_en: "By the Numbers",
    group_ar: "قوائم",
    group_en: "Lists",
    accent: "#4338CA",
    desc_ar: "شبكة بصرية من 5-10 إحصاءات مذهلة ومُختارة بعناية، كل رقم مع وصف سياقي يشرح أهميته. تعمل على مبدأ 'رقم واحد = فكرة واحدة'.",
    desc_en: "A visual grid of 5–10 carefully selected striking statistics, each with a contextual description explaining its significance.",
    when_ar: "لتحويل موضوع جافّ إلى تجربة مبهرة بالأرقام: إحصاءات الحروب، التحولات الاقتصادية، ظواهر بيئية.",
    when_en: "To transform a dry topic into a striking numbers experience: war statistics, economic shifts, environmental phenomena.",
    examples_ar: [
      "الأمن الغذائي العالمي بالأرقام: حقائق صادمة",
      "الفضاء بالأرقام: من الأرض إلى حافة الكون",
      "أزمة المياه: 7 أرقام تُعيد رسم الصورة",
    ],
    examples_en: [
      "Global Food Security by the Numbers: Shocking Facts",
      "Space by the Numbers: From Earth to the Edge of the Universe",
      "The Water Crisis: 7 Numbers That Reframe the Picture",
    ],
  },

  // ── سيناريوهات ────────────────────────────────────────────────────────────
  {
    id: "scenarios",
    icon: "🔀",
    name_ar: "سيناريوهات",
    name_en: "Scenarios",
    group_ar: "تحليل",
    group_en: "Analysis",
    accent: "#BE185D",
    desc_ar: "ثلاثة سيناريوهات مستقبلية حول قضية واحدة: متفائل، واقعي، متشائم. لكل سيناريو: الشروط اللازمة لتحققه + النتيجة المتوقعة + احتمالية الحدوث.",
    desc_en: "Three future scenarios for a single issue: optimistic, realistic, pessimistic. Each includes: required conditions, expected outcome, and probability.",
    when_ar: "لتحليل قضايا غير محسومة النتائج: الحروب، الانتخابات، المفاوضات، التحولات الاقتصادية.",
    when_en: "To analyze unsettled issues: wars, elections, negotiations, economic transitions.",
    examples_ar: [
      "سيناريوهات انتهاء الحرب في غزة",
      "ماذا سيحدث لأسواق العملات المشفرة؟",
      "مستقبل الدولار الأمريكي: 3 مسارات محتملة",
    ],
    examples_en: [
      "Scenarios for an End to the Gaza War",
      "What Will Happen to Crypto Markets?",
      "The Future of the US Dollar: 3 Possible Paths",
    ],
  },

  // ── خط زمني ──────────────────────────────────────────────────────────────
  {
    id: "timeline",
    icon: "⏳",
    name_ar: "خط زمني تاريخي",
    name_en: "Historical Timeline",
    group_ar: "تاريخ",
    group_en: "History",
    accent: "#0D9488",
    desc_ar: "سرد 8-15 حدثاً مرتباً على خط زمني مُلوَّن بأنواع مختلفة: نقطة تحول، أزمة، ابتكار، اكتشاف. يُعطي القارئ رؤية مكثّفة لتطور موضوع عبر الزمن.",
    desc_en: "8–15 events arranged on a color-coded timeline with different types: turning point, crisis, innovation, discovery — giving readers a condensed view of a topic's evolution.",
    when_ar: "لسرد تاريخ حرب، قضية، شخصية، مؤسسة، أو اختراع عبر الزمن.",
    when_en: "To narrate the history of a war, issue, person, institution, or invention over time.",
    examples_ar: [
      "100 عام من القضية الفلسطينية: المحطات الكبرى",
      "تاريخ الإنترنت: من ARPANET إلى الذكاء الاصطناعي",
      "تحولات السياسة الخارجية الأمريكية منذ 1945",
    ],
    examples_en: [
      "100 Years of the Palestinian Cause: Key Milestones",
      "History of the Internet: From ARPANET to AI",
      "Shifts in US Foreign Policy Since 1945",
    ],
  },

  // ── تدقيق حقائق ──────────────────────────────────────────────────────────
  {
    id: "factcheck",
    icon: "🔍",
    name_ar: "تدقيق حقائق",
    name_en: "Fact Check",
    group_ar: "تحقق",
    group_en: "Verification",
    accent: "#DC2626",
    desc_ar: "تحقق من 4-8 ادعاءات حول موضوع واحد. لكل ادعاء: حكم موثّق (صحيح / خاطئ / مضلل / جزئي / غير مؤكد) + تفسير مدعوم بمصادر.",
    desc_en: "Verify 4–8 claims about a single topic. Each claim gets: a verdict (true/false/misleading/partial/unverified) + explanation backed by sources.",
    when_ar: "لتصحيح معلومات شائعة، دحض شائعات، أو إجراء مراجعة نقدية لتصريحات رسمية.",
    when_en: "To correct common misinformation, debunk rumors, or critically review official statements.",
    examples_ar: [
      "هل فعلاً تُسبب الألواح الشمسية تلوثاً بيئياً؟",
      "تدقيق في أبرز ادعاءات قمة المناخ 2024",
      "5 معلومات خاطئة شائعة عن التغذية والصحة",
    ],
    examples_en: [
      "Do Solar Panels Actually Cause Environmental Pollution?",
      "Fact-Checking the Top Claims from COP 2024",
      "5 Common Myths About Nutrition and Health",
    ],
  },

  // ── بروفايل ──────────────────────────────────────────────────────────────
  {
    id: "profile",
    icon: "🪪",
    name_ar: "بروفايل",
    name_en: "Profile",
    group_ar: "شخصيات",
    group_en: "Profiles",
    accent: "#7B5EA7",
    desc_ar: "تعريف صحفي ثري بشخصية أو جهة أو دولة أو حركة. يشمل: معلومات أساسية سريعة، إحصاءات بارزة، مسار زمني للأحداث المهمة، ومحاور تحريرية معمّقة. يدعم صورة أو أيقونة تمثيلية.",
    desc_en: "A rich journalistic profile of a person, organization, country, or movement. Includes: quick facts, key stats, timeline of major events, and in-depth editorial sections.",
    when_ar: "لتقديم شخصية ناشئة أو مؤسسة بارزة أو تيار سياسي للقراء الذين لا يعرفونها.",
    when_en: "To introduce an emerging figure, prominent institution, or political movement to readers unfamiliar with it.",
    examples_ar: [
      "من هو محمد بن سلمان؟ — بروفايل شامل",
      "بروفايل: منظمة شنغهاي للتعاون — ما هي وماذا تريد؟",
      "الخلافة العثمانية: 600 عام في صفحة واحدة",
    ],
    examples_en: [
      "Who Is Mohammed bin Salman? — A Comprehensive Profile",
      "Profile: The Shanghai Cooperation Organization — What It Is and What It Wants",
      "The Ottoman Caliphate: 600 Years on One Page",
    ],
  },

  // ── موجز ──────────────────────────────────────────────────────────────────
  {
    id: "briefing",
    icon: "📋",
    name_ar: "موجز",
    name_en: "Briefing",
    group_ar: "ملخصات",
    group_en: "Summaries",
    accent: "#1D4ED8",
    desc_ar: "ملخص تنفيذي سريع يجمع: 5-7 نقاط رئيسية، اقتباساً بارزاً من شخصية محورية، 3-4 أرقام مفتاحية، وخلاصة تحريرية. مثالي للقراء المشغولين.",
    desc_en: "A fast executive summary combining: 5–7 key points, a featured quote from a key figure, 3–4 key numbers, and an editorial bottom line. Perfect for busy readers.",
    when_ar: "لتلخيص قمة دولية، تقرير مهم، أزمة متطورة، أو حدث كبير في صيغة سريعة القراءة.",
    when_en: "To summarize an international summit, major report, evolving crisis, or big event in a fast-reading format.",
    examples_ar: [
      "موجز: قمة مجموعة السبع 2025 — أبرز ما جرى",
      "موجز: تقرير صندوق النقد الدولي عن آفاق الاقتصاد العالمي",
      "موجز: أسبوع من التصعيد في الشرق الأوسط",
    ],
    examples_en: [
      "Briefing: G7 Summit 2025 — Key Takeaways",
      "Briefing: IMF World Economic Outlook Report",
      "Briefing: A Week of Escalation in the Middle East",
    ],
  },

  // ── اقتباسات ─────────────────────────────────────────────────────────────
  {
    id: "quotes",
    icon: "💬",
    name_ar: "اقتباسات",
    name_en: "Quotes",
    group_ar: "ملخصات",
    group_en: "Summaries",
    accent: "#7C3AED",
    desc_ar: "5-8 اقتباسات بارزة لشخصيات متنوعة حول قضية واحدة، مرتبة بشكل بصري جذاب. كل اقتباس مع اسم صاحبه ومنصبه وتاريخه، ومصنّف حسب نبرته (إيجابي / سلبي / تحذيري).",
    desc_en: "5–8 prominent quotes from diverse figures on one issue, visually arranged. Each quote with author name, title, date, and sentiment classification.",
    when_ar: "لرصد ردود الفعل الدولية على حدث، أو تجميع آراء المفكرين حول فكرة، أو توثيق تصريحات قادة.",
    when_en: "To capture international reactions to an event, compile thinkers' views on an idea, or document leaders' statements.",
    examples_ar: [
      "ماذا قال زعماء العالم عن انتخاب ترامب مجدداً؟",
      "أبرز اقتباسات دافوس 2025: الاقتصاد العالمي في كلمات",
      "الذكاء الاصطناعي بأقلام المفكرين: 6 رؤى متناقضة",
    ],
    examples_en: [
      "What World Leaders Said About Trump's Re-election",
      "Top Davos 2025 Quotes: The Global Economy in Words",
      "AI Through Thinkers' Eyes: 6 Contrasting Visions",
    ],
  },

  // ── أسئلة شارحة ──────────────────────────────────────────────────────────
  {
    id: "explainer",
    icon: "❓",
    name_ar: "أسئلة شارحة",
    name_en: "Explainer",
    group_ar: "تعليمي",
    group_en: "Educational",
    accent: "#16A34A",
    desc_ar: "قالب صحفي يشرح موضوعاً معقداً عبر 6-10 أسئلة وأجوبة منطقية التدرج. كل سؤال يُجيب على تساؤل حقيقي في ذهن القارئ، بلغة واضحة وبعيدة عن التقنية المُفرطة.",
    desc_en: "A journalistic format explaining a complex topic through 6–10 logically progressive Q&As. Each question addresses a real reader query in clear, accessible language.",
    when_ar: "للمواضيع التي تحتاج تبسيطاً: التحولات الجيوسياسية، التكنولوجيا الناشئة، الأزمات الاقتصادية.",
    when_en: "For topics needing simplification: geopolitical shifts, emerging technology, economic crises.",
    examples_ar: [
      "ما هو الاحتياطي الفيدرالي الأمريكي وكيف يؤثر علينا؟",
      "الحوثيون: من هم، وماذا يريدون، ومن يدعمهم؟",
      "تغير المناخ — الأسئلة التي يخجل الجميع من طرحها",
    ],
    examples_en: [
      "What Is the US Federal Reserve and How Does It Affect Us?",
      "The Houthis: Who Are They, What Do They Want, Who Backs Them?",
      "Climate Change — The Questions Everyone Is Afraid to Ask",
    ],
  },

  // ── مناظرة ───────────────────────────────────────────────────────────────
  {
    id: "debate",
    icon: "⚖️",
    name_ar: "مناظرة",
    name_en: "Debate",
    group_ar: "تحليل",
    group_en: "Analysis",
    accent: "#C2410C",
    desc_ar: "عرض منظّم لحجج الجانبين حول قضية خلافية: 4-5 حجج لكل طرف، ملخص الموقف، وخلاصة تحريرية مُوازنة. يُعطي القارئ صورة متكاملة دون الانحياز.",
    desc_en: "A structured presentation of both sides of a controversial issue: 4–5 arguments per side, a position summary, and a balanced editorial conclusion.",
    when_ar: "للقضايا التي تنقسم حولها الآراء: قرارات سياسية، قضايا أخلاقية، خيارات اقتصادية.",
    when_en: "For issues dividing opinion: policy decisions, ethical dilemmas, economic choices.",
    examples_ar: [
      "عقوبة الإعدام: الحجج مع وضد",
      "هل الذكاء الاصطناعي خطر على البشرية؟ — جانبان",
      "الهجرة في أوروبا: بين التخوف والضرورة",
    ],
    examples_en: [
      "Capital Punishment: The Case For and Against",
      "Is AI a Threat to Humanity? — Two Sides",
      "Immigration in Europe: Between Fear and Necessity",
    ],
  },

  // ── خطوات عملية ──────────────────────────────────────────────────────────
  {
    id: "guide",
    icon: "📋",
    name_ar: "خطوات عملية",
    name_en: "How-to Guide",
    group_ar: "تعليمي",
    group_en: "Educational",
    accent: "#0891B2",
    desc_ar: "دليل مرقّم من 5-9 خطوات عملية قابلة للتنفيذ. كل خطوة تحمل: أيقونة، عنواناً، وصفاً واضحاً، وقتاً تقديرياً، وتحذيراً إن وُجد. يُقدَّم مع هدف واضح ومستوى صعوبة.",
    desc_en: "A numbered guide of 5–9 actionable steps. Each step has: an icon, title, clear description, time estimate, and optional warning. Presented with a clear goal and difficulty level.",
    when_ar: "لشرح آلية عمل شيء أو تعليم مهارة: إجراءات قانونية، خطوات تقنية، بروتوكولات طارئة.",
    when_en: "To explain how something works or teach a skill: legal procedures, technical steps, emergency protocols.",
    examples_ar: [
      "كيف تحصل على الجنسية الكندية؟ — خطوة بخطوة",
      "8 خطوات لحماية بياناتك الشخصية على الإنترنت",
      "كيف تبدأ استثمارك في الأسهم للمبتدئين؟",
    ],
    examples_en: [
      "How to Obtain Canadian Citizenship — Step by Step",
      "8 Steps to Protect Your Personal Data Online",
      "How to Start Investing in Stocks for Beginners",
    ],
  },

  // ── خريطة الصلات ──────────────────────────────────────────────────────────
  {
    id: "network",
    icon: "🕸️",
    name_ar: "خريطة الصلات",
    name_en: "Network Map",
    group_ar: "تحليل",
    group_en: "Analysis",
    accent: "#9333EA",
    desc_ar: "شبكة علاقات تضع كياناً مركزياً وتُظهر 5-10 أطراف مرتبطة به مع نوع العلاقة (حليف، خصم، شريك، تابع...) وقوتها. تُجسّد تعقيدات العلاقات الدولية أو المؤسسية في صورة واحدة.",
    desc_en: "A relationship network placing a central entity and showing 5–10 connected parties with their relationship type (ally, rival, partner, subsidiary...) and strength.",
    when_ar: "لكشف شبكة نفوذ، تحالفات إقليمية، شركاء تجاريين، أو علاقات مؤسسية معقدة.",
    when_en: "To reveal influence networks, regional alliances, business partners, or complex institutional relationships.",
    examples_ar: [
      "شبكة النفوذ الإيراني في الشرق الأوسط",
      "أبرز علاقات أوبك+ مع الدول المنتجة والمستهلكة",
      "روسيا ودول الجوار: خريطة صلات متشعبة",
    ],
    examples_en: [
      "Iran's Influence Network in the Middle East",
      "OPEC+ Key Relationships with Producers and Consumers",
      "Russia and Neighboring States: A Complex Web",
    ],
  },

  // ── مقابلة ───────────────────────────────────────────────────────────────
  {
    id: "interview",
    icon: "🎙️",
    name_ar: "مقابلة",
    name_en: "Interview",
    group_ar: "شخصيات",
    group_en: "Profiles",
    accent: "#D97706",
    desc_ar: "حوار صحفي محاكاة في شكل سؤال وجواب، يستند إلى مواقف وتصريحات الشخصية الموثّقة والمعروفة. يُقدَّم مع هيدر يضم اسم المُحاوَر ومنصبه وسياق المقابلة. 6-8 أسئلة جريئة ومتنوعة.",
    desc_en: "A simulated journalistic Q&A interview, grounded in the subject's documented and known positions. Presented with a header showing the interviewee's name, title, and context. 6–8 bold, varied questions.",
    when_ar: "لاستحضار رأي شخصية بارزة في قضية راهنة، أو لتقديم فكر مؤسسة عبر حوار متخيّل موثق.",
    when_en: "To present a prominent figure's view on a current issue, or convey an institution's thinking through a documented imagined dialogue.",
    examples_ar: [
      "لو سألنا هنري كيسنجر عن الشرق الأوسط اليوم",
      "مقابلة متخيّلة: مسؤول في البنك الدولي عن الديون الأفريقية",
      "ماذا كانت ستقول حنا آرنت عن الأنظمة الرقمية؟",
    ],
    examples_en: [
      "If We Asked Henry Kissinger About Today's Middle East",
      "Imagined Interview: A World Bank Official on African Debt",
      "What Would Hannah Arendt Say About Digital Regimes?",
    ],
  },

  // ── توزيع جغرافي ──────────────────────────────────────────────────────────
  {
    id: "map",
    icon: "🗺️",
    name_ar: "توزيع جغرافي",
    name_en: "Geographic Data",
    group_ar: "بيانات",
    group_en: "Data",
    accent: "#059669",
    desc_ar: "بيانات مقارنة لـ 6-12 دولة أو منطقة مع أشرطة نسبية تُوضّح الفوارق. كل دولة تحمل: علمها، قيمتها، وحدة القياس، وملاحظة اختيارية. تنتهي باستنتاج تحليلي رئيسي.",
    desc_en: "Comparative data for 6–12 countries or regions with proportional bars showing disparities. Each entry has: flag, value, unit, optional note. Ends with a key analytical insight.",
    when_ar: "لمقارنة مؤشرات دولية: معدلات الفقر، الإنتاج، الجرائم، الانبعاثات، الاستثمارات.",
    when_en: "To compare international indicators: poverty rates, production, crime, emissions, investments.",
    examples_ar: [
      "من يُنفق أكثر على التعليم؟ — 12 دولة مقارنة",
      "توزيع انبعاثات الكربون: من يتحمل المسؤولية؟",
      "أعلى معدلات الاكتفاء الغذائي حول العالم",
    ],
    examples_en: [
      "Who Spends Most on Education? — 12 Countries Compared",
      "Carbon Emissions Distribution: Who Bears Responsibility?",
      "Highest Food Self-Sufficiency Rates Worldwide",
    ],
  },
];

// ── مجموعات القوالب ───────────────────────────────────────────────────────────
const GROUPS = [
  { id: "نص",        en: "Text",          color: "#3B6CC4" },
  { id: "بيانات",   en: "Data",          color: "#2D7A46" },
  { id: "تفاعلي",   en: "Interactive",   color: "#7C3AED" },
  { id: "تحليل",    en: "Analysis",      color: "#C05E1A" },
  { id: "قوائم",    en: "Lists",         color: "#D97706" },
  { id: "تاريخ",    en: "History",       color: "#0D9488" },
  { id: "تحقق",     en: "Verification",  color: "#DC2626" },
  { id: "شخصيات",   en: "Profiles",      color: "#7B5EA7" },
  { id: "ملخصات",   en: "Summaries",     color: "#1D4ED8" },
  { id: "تعليمي",   en: "Educational",   color: "#16A34A" },
];

// ── الصفحة الرئيسية ───────────────────────────────────────────────────────────
export default async function AllTemplatesPage({ params }: Props) {
  const { locale } = await params;
  const isAr = locale === "ar";

  return (
    <div className="page-shell" style={{ display: "flex", flexDirection: "column", minHeight: "100dvh" }}>
      <Header />
      <main style={{
        maxWidth: 860,
        margin: "0 auto",
        width: "100%",
        padding: "2.5rem clamp(.75rem, 2vw, 1.5rem) 5rem",
        flex: 1,
      }}>

        {/* ── Hero ─────────────────────────────────────────────── */}
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "#E8F6ED", borderRadius: 20,
            padding: "4px 14px", marginBottom: "1rem",
          }}>
            <span style={{ fontSize: ".7rem", fontWeight: 700, color: "#2D7A46", letterSpacing: ".06em" }}>
              {isAr ? "جميع القوالب" : "ALL TEMPLATES"}
            </span>
          </div>
          <h1 style={{
            fontFamily: "var(--font-cairo), 'Cairo', sans-serif",
            fontWeight: 800, fontSize: "clamp(1.6rem, 4vw, 2.4rem)",
            color: "#1A1D2E", margin: "0 0 .75rem", lineHeight: 1.2,
          }}>
            {isAr ? "مكتبة قوالب جمهرة" : "Jamhara Template Library"}
          </h1>
          <p style={{
            fontSize: "1rem", color: "#5A5F7A",
            lineHeight: 1.7, maxWidth: 560, margin: "0 auto 1.5rem",
          }}>
            {isAr
              ? "43 قالباً في 18 نوعاً من المحتوى — كل قالب مُصمَّم خصيصاً لنوع معيّن من القصص الصحفية والمعلوماتية"
              : "43 templates across 18 content types — each designed specifically for a type of journalistic or informational story"}
          </p>

          {/* Stats row */}
          <div style={{
            display: "flex", justifyContent: "center", gap: "clamp(1rem, 4vw, 2.5rem)",
            flexWrap: "wrap",
          }}>
            {[
              { n: "18", label: isAr ? "نوع محتوى" : "Content Types" },
              { n: "43", label: isAr ? "قالب متاح" : "Templates" },
              { n: "10", label: isAr ? "مجموعات" : "Groups" },
            ].map(s => (
              <div key={s.n} style={{ textAlign: "center" }}>
                <div style={{
                  fontFamily: "var(--font-cairo), sans-serif",
                  fontWeight: 800, fontSize: "1.8rem", color: "#4CB36C",
                }}>
                  {s.n}
                </div>
                <div style={{ fontSize: ".72rem", color: "#9CA3AF", fontWeight: 600 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── قوائم القوالب ─────────────────────────────────────── */}
        {TEMPLATES.map((t) => (
          <div key={t.id} style={{
            background: "#fff",
            border: "1px solid #E8EBF0",
            borderRadius: 14,
            marginBottom: 20,
            overflow: "hidden",
          }}>
            {/* Header */}
            <div style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "14px 18px",
              background: `linear-gradient(135deg, ${t.accent}0D 0%, ${t.accent}05 100%)`,
              borderBottom: `2px solid ${t.accent}22`,
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: `${t.accent}18`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1.4rem", flexShrink: 0,
              }}>
                {t.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <h2 style={{
                    fontFamily: "var(--font-cairo), sans-serif",
                    fontWeight: 800, fontSize: "1rem",
                    color: "#1A1D2E", margin: 0,
                  }}>
                    {isAr ? t.name_ar : t.name_en}
                  </h2>
                  <span style={{
                    fontSize: ".6rem", fontWeight: 700,
                    color: t.accent,
                    background: `${t.accent}18`,
                    borderRadius: 20, padding: "2px 9px",
                  }}>
                    {isAr ? t.group_ar : t.group_en}
                  </span>
                </div>
                <p style={{ fontSize: ".72rem", color: "#9CA3AF", margin: "2px 0 0", fontStyle: "italic" }}>
                  {isAr ? t.name_en : t.name_ar}
                </p>
              </div>
            </div>

            {/* Body */}
            <div style={{ padding: "16px 18px" }}>
              {/* Description */}
              <p style={{
                fontSize: ".82rem", color: "#374151",
                lineHeight: 1.75, marginBottom: 12, marginTop: 0,
              }}>
                {isAr ? t.desc_ar : t.desc_en}
              </p>

              {/* When to use */}
              <div style={{
                display: "flex", gap: 8, alignItems: "flex-start",
                padding: "9px 12px",
                background: `${t.accent}08`,
                border: `1px solid ${t.accent}20`,
                borderRadius: 9,
                marginBottom: 14,
              }}>
                <span style={{ fontSize: ".85rem", flexShrink: 0, marginTop: 1 }}>💡</span>
                <p style={{ fontSize: ".77rem", color: "#374151", margin: 0, lineHeight: 1.65 }}>
                  <strong style={{ color: t.accent }}>
                    {isAr ? "متى تستخدمه؟ " : "When to use? "}
                  </strong>
                  {isAr ? t.when_ar : t.when_en}
                </p>
              </div>

              {/* Examples */}
              <p style={{
                fontSize: ".65rem", fontWeight: 700, color: "#9CA3AF",
                letterSpacing: ".06em", textTransform: "uppercase",
                marginBottom: 8, marginTop: 0,
              }}>
                {isAr ? "أمثلة على العناوين" : "Example Headlines"}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {(isAr ? t.examples_ar : t.examples_en).map((ex, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "flex-start", gap: 8,
                    padding: "7px 10px",
                    background: "#F8F9FB",
                    border: "1px solid #E8EBF0",
                    borderRadius: 8,
                  }}>
                    <span style={{
                      flexShrink: 0,
                      width: 18, height: 18, borderRadius: "50%",
                      background: t.accent,
                      color: "#fff",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: ".58rem", fontWeight: 800, marginTop: 1,
                    }}>
                      {i + 1}
                    </span>
                    <span style={{ fontSize: ".78rem", color: "#373C55", lineHeight: 1.5 }}>
                      {ex}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        {/* ── CTA ──────────────────────────────────────────────── */}
        <div style={{
          textAlign: "center",
          padding: "2rem 1.5rem",
          background: "linear-gradient(135deg, #E8F6ED 0%, #F2FAF5 100%)",
          border: "1px solid #B7DFC6",
          borderRadius: 16,
          marginTop: 8,
        }}>
          <p style={{
            fontFamily: "var(--font-cairo), sans-serif",
            fontWeight: 800, fontSize: "1.1rem",
            color: "#1A1D2E", marginBottom: 6, marginTop: 0,
          }}>
            {isAr ? "ابدأ التوليد من لوحة التحكم" : "Start Generating from the Dashboard"}
          </p>
          <p style={{ fontSize: ".8rem", color: "#5A5F7A", marginBottom: 0, marginTop: 0 }}>
            {isAr
              ? "جميع هذه القوالب متاحة مباشرة في /admin/generate"
              : "All these templates are available directly at /admin/generate"}
          </p>
        </div>

      </main>
      <Footer locale={locale} />
      <MobileNav />
    </div>
  );
}
