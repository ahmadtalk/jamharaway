import AppGrid from "@/components/dashboard/AppGrid";
import { apps } from "@/config/tools";

export default function DashboardPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-navy-700">مرحباً بك في تدقيق</h1>
        <p className="mt-1 text-gray-500">اختر أداة التحليل المناسبة للبدء</p>
      </div>
      <AppGrid apps={apps} />
    </div>
  );
}
