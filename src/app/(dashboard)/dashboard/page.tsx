import {
  HiOutlineScale,
  HiOutlineTemplate,
  HiOutlineLightningBolt,
  HiOutlinePencilAlt,
  HiOutlineDocumentText,
  HiOutlineHand,
  HiOutlineVideoCamera,
} from "react-icons/hi";
import { IconType } from "react-icons";

/* ──────────────── بيانات التطبيقات ──────────────── */

interface AppItem {
  title: string;
  description: string;
  href: string;
  icon: IconType;
  color: string;
  children?: AppItem[];
}

const apps: AppItem[] = [
  {
    title: "الجدارة التحريرية",
    description: "تقييم مدى أهمية الخبر واستحقاقه للنشر وفق معايير الجدارة التحريرية",
    href: "/dashboard/apps/editorial-merit",
    icon: HiOutlineScale,
    color: "from-brand-500 to-brand-400",
  },
  {
    title: "القوالب الصحفية",
    description: "تحليل بنية النص وفق القوالب الصحفية الستة المعتمدة",
    href: "/dashboard/apps/templates",
    icon: HiOutlineTemplate,
    color: "from-indigo-500 to-indigo-400",
    children: [
      {
        title: "الهرم المقلوب",
        description: "ترتيب المعلومات من الأهم إلى الأقل أهمية",
        href: "/dashboard/apps/templates/inverted-pyramid",
        icon: HiOutlineTemplate,
        color: "",
      },
      {
        title: "الهرم المعتدل",
        description: "التدرج المتوازن في عرض المعلومات",
        href: "/dashboard/apps/templates/moderate-pyramid",
        icon: HiOutlineTemplate,
        color: "",
      },
      {
        title: "الساعة الرملية",
        description: "الجمع بين الهرم المقلوب والسرد القصصي",
        href: "/dashboard/apps/templates/hourglass",
        icon: HiOutlineTemplate,
        color: "",
      },
      {
        title: "الماسة الإخبارية",
        description: "البدء بملخص ثم التوسع والعودة للتركيز",
        href: "/dashboard/apps/templates/diamond",
        icon: HiOutlineTemplate,
        color: "",
      },
      {
        title: "سيخ الكباب",
        description: "ربط عناصر الخبر بمحور مركزي واحد",
        href: "/dashboard/apps/templates/kebab",
        icon: HiOutlineTemplate,
        color: "",
      },
      {
        title: "كأس المارتيني",
        description: "الانطلاق من العام إلى التفاصيل الدقيقة",
        href: "/dashboard/apps/templates/martini",
        icon: HiOutlineTemplate,
        color: "",
      },
    ],
  },
  {
    title: "الأخبار العاجلة",
    description: "تقييم مدى ملاءمة الخبر لمعايير الأخبار العاجلة والتغطية الفورية",
    href: "/dashboard/apps/breaking-news",
    icon: HiOutlineLightningBolt,
    color: "from-red-500 to-orange-400",
  },
  {
    title: "العناوين",
    description: "تحليل جودة العناوين الصحفية وفعاليتها في جذب القارئ",
    href: "/dashboard/apps/headlines",
    icon: HiOutlinePencilAlt,
    color: "from-amber-500 to-yellow-400",
  },
  {
    title: "التقرير الصحفي",
    description: "تقييم شامل لجودة التقرير الصحفي من حيث البنية والمحتوى والمصادر",
    href: "/dashboard/apps/press-report",
    icon: HiOutlineDocumentText,
    color: "from-emerald-500 to-teal-400",
  },
  {
    title: "الاحتياجات الخمسة",
    description: "التحقق من اكتمال عناصر الخبر الأساسية: من، ماذا، أين، متى، لماذا",
    href: "/dashboard/apps/five-needs",
    icon: HiOutlineHand,
    color: "from-cyan-500 to-blue-400",
  },
  {
    title: "أصول التغطية الصحفية",
    description: "تحليل أساليب وقوالب التغطية الصحفية الميدانية والمهنية",
    href: "/dashboard/apps/coverage",
    icon: HiOutlineVideoCamera,
    color: "from-purple-500 to-pink-400",
    children: [
      {
        title: "الصناديق الخمسة",
        description: "تقسيم التغطية إلى خمسة صناديق منهجية",
        href: "/dashboard/apps/coverage/five-boxes",
        icon: HiOutlineVideoCamera,
        color: "",
      },
    ],
  },
];

/* ──────────────── الصفحة الرئيسية ──────────────── */

export default function DashboardPage() {
  return (
    <div>
      {/* الترحيب */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-navy-700">
          مرحباً بك في تدقيق
        </h1>
        <p className="mt-1 text-gray-500">
          اختر أداة التحليل المناسبة للبدء
        </p>
      </div>

      {/* شبكة التطبيقات */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {apps.map((app) => (
          <AppCard key={app.href} app={app} />
        ))}
      </div>
    </div>
  );
}

/* ──────────────── بطاقة التطبيق ──────────────── */

function AppCard({ app }: { app: AppItem }) {
  return (
    <a
      href={app.href}
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
    >
      {/* الشريط العلوي الملون */}
      <div className={`h-2 w-full bg-gradient-to-l ${app.color}`} />

      <div className="flex flex-1 flex-col p-5">
        {/* الأيقونة والعنوان */}
        <div className="mb-3 flex items-center gap-3">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-bl ${app.color} text-white shadow-sm`}
          >
            <app.icon className="h-5 w-5" />
          </div>
          <h3 className="text-base font-bold text-navy-700">{app.title}</h3>
        </div>

        {/* الوصف */}
        <p className="mb-4 flex-1 text-sm leading-relaxed text-gray-500">
          {app.description}
        </p>

        {/* القوالب الفرعية */}
        {app.children && app.children.length > 0 && (
          <div className="mb-4 rounded-xl bg-gray-50 p-3">
            <p className="mb-2 text-xs font-semibold text-gray-400">
              يتضمن:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {app.children.map((child) => (
                <span
                  key={child.href}
                  className="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-navy-600 shadow-sm"
                >
                  {child.title}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* زر الفتح */}
        <div className="flex items-center text-sm font-semibold text-brand-500 transition-colors group-hover:text-brand-600">
          <span>فتح الأداة</span>
          <svg
            className="mr-1 h-4 w-4 rotate-180 transition-transform group-hover:-translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
        </div>
      </div>
    </a>
  );
}
