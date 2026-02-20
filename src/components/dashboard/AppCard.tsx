import Link from "next/link";
import type { AppItem } from "@/types/tools";

export default function AppCard({ app }: { app: AppItem }) {
  return (
    <Link
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
            <p className="mb-2 text-xs font-semibold text-gray-400">يتضمن:</p>
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
    </Link>
  );
}
