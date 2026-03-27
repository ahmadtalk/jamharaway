"use client";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from "recharts";

interface Props {
  dailyData:     { date: string; count: number }[];
  typeChartData: { name: string; value: number; color: string }[];
  topPostsData:  { title: string; views: number }[];
}

export function DashboardCharts({ dailyData, typeChartData, topPostsData }: Props) {
  // ارتفاع ديناميكي لمخطط الأنواع بحسب عدد الأنواع
  const typeChartHeight = Math.max(200, typeChartData.length * 26 + 20);

  return (
    <div className="a-charts-grid">

      {/* المنشورات — آخر 14 يوماً */}
      <div className="a-card">
        <p className="a-card-title">المنشورات — آخر 14 يوماً</p>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={dailyData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F0F2F7" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#9BA0B8" }} />
            <YAxis tick={{ fontSize: 10, fill: "#9BA0B8" }} allowDecimals={false} />
            <Tooltip
              contentStyle={{ borderRadius: 8, fontSize: 12, border: "1px solid #E8EBF0" }}
              formatter={(v: unknown) => [String(v), "منشورات"]}
            />
            <Bar dataKey="count" fill="#4CB36C" radius={[4, 4, 0, 0]} maxBarSize={32} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* توزيع أنواع المحتوى — 18 نوع */}
      <div className="a-card">
        <p className="a-card-title">توزيع أنواع المحتوى</p>
        <ResponsiveContainer width="100%" height={typeChartHeight}>
          <BarChart
            data={typeChartData}
            layout="vertical"
            margin={{ top: 4, right: 24, left: 80, bottom: 0 }}
          >
            <XAxis type="number" tick={{ fontSize: 10, fill: "#9BA0B8" }} allowDecimals={false} />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 11, fill: "#374151" }}
              width={80}
            />
            <Tooltip
              contentStyle={{ borderRadius: 8, fontSize: 12, border: "1px solid #E8EBF0" }}
              formatter={(v: unknown) => [String(v), "منشور"]}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={16}>
              {typeChartData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* الأكثر مشاهدة — عرض كامل */}
      {topPostsData.some(p => p.views > 0) && (
        <div className="a-card a-charts-full">
          <p className="a-card-title">الأكثر مشاهدة</p>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart
              data={topPostsData}
              layout="vertical"
              margin={{ top: 4, right: 20, left: 170, bottom: 0 }}
            >
              <XAxis type="number" tick={{ fontSize: 10, fill: "#9BA0B8" }} />
              <YAxis
                type="category"
                dataKey="title"
                tick={{ fontSize: 11, fill: "#374151" }}
                width={170}
              />
              <Tooltip
                contentStyle={{ borderRadius: 8, fontSize: 12, border: "1px solid #E8EBF0" }}
                formatter={(v: unknown) => [
                  typeof v === "number" ? v.toLocaleString("en") : String(v),
                  "مشاهدة",
                ]}
              />
              <Bar dataKey="views" fill="#0891B2" radius={[0, 4, 4, 0]} maxBarSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

    </div>
  );
}
