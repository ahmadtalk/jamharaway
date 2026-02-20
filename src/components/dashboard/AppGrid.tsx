import AppCard from "./AppCard";
import type { AppItem } from "@/types/tools";

interface AppGridProps {
  apps: AppItem[];
}

export default function AppGrid({ apps }: AppGridProps) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {apps.map((app) => (
        <AppCard key={app.href} app={app} />
      ))}
    </div>
  );
}
