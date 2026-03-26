"use client";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import type { ComparisonConfig } from "@/lib/supabase/types";

function fmt(n: number) {
  if (Math.abs(n) >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + "B";
  if (Math.abs(n) >= 1_000_000)     return (n / 1_000_000).toFixed(1) + "M";
  if (Math.abs(n) >= 1_000)         return (n / 1_000).toFixed(1) + "K";
  return n.toString();
}

export default function TimelineDuelRenderer({
  config, isAr,
}: { config: ComparisonConfig; isAr: boolean }) {
  const points = config.data_points ?? [];
  if (!points.length) return null;

  const colorA = config.entity_a.color || "#7B5EA7";
  const colorB = config.entity_b.color || "#E05A2B";
  const nameA  = isAr ? config.entity_a.name_ar : config.entity_a.name_en;
  const nameB  = isAr ? config.entity_b.name_ar : config.entity_b.name_en;
  const unit   = isAr ? (config.unit_ar ?? "") : (config.unit_en ?? "");

  const data = points.map(p => ({
    label: p.label,
    [nameA]: p.value_a,
    [nameB]: p.value_b,
  }));

  return (
    <div>
      {/* Legend */}
      <div style={{ display:"flex", justifyContent:"center", gap:20, marginBottom:12 }}>
        {[{name:nameA, color:colorA},{name:nameB, color:colorB}].map(e => (
          <span key={e.name} style={{
            display:"flex", alignItems:"center", gap:6,
            fontSize:".72rem", fontWeight:700, color:e.color,
          }}>
            <svg width="18" height="4" viewBox="0 0 18 4">
              <line x1="0" y1="2" x2="18" y2="2" stroke={e.color} strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
            {e.name}
          </span>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top:4, right:8, bottom:0, left:0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#EDEEF3" vertical={false}/>
          <XAxis
            dataKey="label"
            tick={{ fontSize:10, fill:"#9BA0B8" }}
            axisLine={false} tickLine={false}
          />
          <YAxis
            tickFormatter={fmt}
            tick={{ fontSize:10, fill:"#9BA0B8" }}
            axisLine={false} tickLine={false}
            width={36}
          />
          <Tooltip
            formatter={(val, name) => [
              `${fmt(Number(val))}${unit ? " " + unit : ""}`, String(name),
            ]}
            contentStyle={{
              borderRadius:8, border:"1px solid #EDEEF3",
              fontSize:".75rem", boxShadow:"0 2px 8px rgba(0,0,0,.08)",
            }}
          />
          <Line
            type="monotone" dataKey={nameA} stroke={colorA}
            strokeWidth={2.5} dot={{ r:3, fill:colorA, strokeWidth:0 }}
            activeDot={{ r:5 }}
          />
          <Line
            type="monotone" dataKey={nameB} stroke={colorB}
            strokeWidth={2.5} dot={{ r:3, fill:colorB, strokeWidth:0 }}
            activeDot={{ r:5 }}
          />
        </LineChart>
      </ResponsiveContainer>

      {unit && (
        <p style={{ textAlign:"center", fontSize:".62rem", color:"#9BA0B8", marginTop:4 }}>
          {isAr ? "الوحدة:" : "Unit:"} {unit}
        </p>
      )}
    </div>
  );
}
