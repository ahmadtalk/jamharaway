import AppGrid from "@/components/dashboard/AppGrid";
import { apps } from "@/config/tools";

export default function CoverageIndexPage() {
  const coverageApp = apps.find((a) => a.href === "/dashboard/apps/coverage");
  const children = coverageApp?.children ?? [];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-navy-700">أصول التغطية الصحفية</h1>
        <p className="mt-1 text-gray-500">أساليب وقوالب التغطية الصحفية الميدانية والمهنية</p>
      </div>
      <AppGrid apps={children} />
    </div>
  );
}
