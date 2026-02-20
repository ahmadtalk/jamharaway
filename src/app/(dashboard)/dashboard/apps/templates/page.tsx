import AppGrid from "@/components/dashboard/AppGrid";
import { apps } from "@/config/tools";

export default function TemplatesIndexPage() {
  const templatesApp = apps.find((a) => a.href === "/dashboard/apps/templates");
  const children = templatesApp?.children ?? [];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-navy-700">القوالب الصحفية</h1>
        <p className="mt-1 text-gray-500">اختر القالب الصحفي المراد تحليل النص وفقه</p>
      </div>
      <AppGrid apps={children} />
    </div>
  );
}
