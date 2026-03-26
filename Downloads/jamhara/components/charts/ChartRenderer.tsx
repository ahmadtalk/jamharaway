"use client";
import { useState } from "react";
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine, PieChart, Pie, Cell,
  ScatterChart, Scatter, ZAxis, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ComposedChart, Brush,
  Treemap, FunnelChart, Funnel, LabelList,
  RadialBarChart, RadialBar,
} from "recharts";
import type { ChartConfig } from "@/lib/supabase/types";

/* ──────────────── Palette (12 colors) ──────────────── */
const PALETTE = [
  "#4CB36C", "#373C55", "#E05A2B", "#7B5EA7",
  "#2196F3", "#F59E0B", "#00BCD4", "#E91E63",
  "#8BC34A", "#FF5722", "#607D8B", "#795548",
];
const STAT_ACCENT = ["#4CB36C", "#373C55", "#E05A2B", "#7A7F99"];

function color(s: { color?: string }, idx: number) {
  return s.color || PALETTE[idx % PALETTE.length];
}

/* ──────────────── SVG Gradients ──────────────── */
function GradDefs({ series, prefix }: { series: any[]; prefix: string }) {
  return (
    <defs>
      {series.map((s, i) => (
        <linearGradient key={i} id={`${prefix}${i}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={color(s, i)} stopOpacity={0.28} />
          <stop offset="100%" stopColor={color(s, i)} stopOpacity={0.02} />
        </linearGradient>
      ))}
    </defs>
  );
}

/* ──────────────── Rich Tooltip ──────────────── */
function RichTooltip({ active, payload, label, unit, xLabel }: any) {
  if (!active || !payload?.length) return null;
  const borderColor = payload[0]?.color || "#4CB36C";
  return (
    <div style={{
      background: "var(--white)",
      border: "1px solid var(--slate2)",
      borderInlineStart: `3px solid ${borderColor}`,
      borderRadius: 9,
      padding: "10px 14px",
      fontSize: 13,
      boxShadow: "0 8px 28px rgba(0,0,0,.13)",
      direction: "rtl",
      minWidth: 130,
    }}>
      {label !== undefined && (
        <div style={{ color: "var(--muted)", fontSize: 11, marginBottom: 7, fontWeight: 500, fontVariantNumeric: "lining-nums" }}>
          {xLabel ? `${xLabel}: ` : ""}{label}
        </div>
      )}
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: i < payload.length - 1 ? 4 : 0 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: p.color, flexShrink: 0 }} />
          <span style={{ color: "var(--ink2)", fontSize: 12 }}>{p.name}</span>
          <span style={{ color: "var(--ink)", fontWeight: 800, fontVariantNumeric: "lining-nums", marginInlineStart: "auto", paddingInlineStart: 10 }}>
            {typeof p.value === "number" ? p.value.toLocaleString("ar-SA") : p.value}{unit || ""}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ──────────────── Annotations Strip ──────────────── */
function Annots({ items }: { items?: any[] }) {
  if (!items?.length) return null;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 18px", padding: "10px 8px 0", direction: "rtl" }}>
      {items.map((a, i) => (
        <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 11, color: "var(--muted)" }}>
          <span style={{ display: "inline-block", width: 16, height: 0, borderTop: `2px dashed ${a.color || "#E05A2B"}` }} />
          <span style={{ color: a.color || "#E05A2B", fontWeight: 700 }}>{a.x}</span>
          <span>{a.label}</span>
        </span>
      ))}
    </div>
  );
}

/* ──────────────── Stat Cards ──────────────── */
function StatCards({ stats }: { stats?: any[] }) {
  if (!stats?.length) return null;
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: `repeat(${Math.min(stats.length, 4)}, 1fr)`,
      gap: 8, padding: "0 8px 16px", direction: "rtl",
    }}>
      {stats.map((s, i) => (
        <div key={i} style={{
          background: "var(--white)",
          border: "1px solid var(--slate2)",
          borderTop: `3px solid ${STAT_ACCENT[i % STAT_ACCENT.length]}`,
          borderRadius: 8, padding: "12px 14px 10px",
        }}>
          <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 6, lineHeight: 1.3 }}>{s.label}</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "var(--ink)", fontVariantNumeric: "lining-nums", lineHeight: 1 }}>{s.value}</div>
          {s.unit && <div style={{ fontSize: 11, color: "var(--muted2)", marginTop: 4 }}>{s.unit}</div>}
        </div>
      ))}
    </div>
  );
}

/* ──────────────── Shared axis helpers ──────────────── */
function tickFmt(v: number) {
  // Only abbreviate large numbers — keep small numbers readable
  if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(1)} م`;
  if (Math.abs(v) >= 10_000)    return `${(v / 1_000).toFixed(0)} ك`;
  return v % 1 === 0 ? String(v) : v.toFixed(1);
}

/* ══════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════ */
interface Props { config: ChartConfig; height?: number; }

export default function ChartRenderer({ config, height = 300 }: Props) {
  const { chartType, series = [], xAxis, yAxis, annotations, stats } = config ?? {};
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const toggle = (name: string) =>
    setHidden(prev => { const n = new Set(prev); n.has(name) ? n.delete(name) : n.add(name); return n; });

  /* Guard */
  if (!config || !series?.length) {
    return (
      <div style={{ height, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)", fontSize: 13 }}>
        لا توجد بيانات
      </div>
    );
  }

  const margin = { top: 12, right: 20, left: 4, bottom: 4 };

  /* Merge multi-series data */
  const allX = Array.from(new Set(series.flatMap(s => s.data.map(d => d.x))));
  const merged = allX.map(x => {
    const pt: Record<string, any> = { x };
    series.forEach(s => {
      const d = s.data.find(d => d.x === x);
      pt[s.name] = d ? d.y : null;
    });
    return pt;
  });

  /* Shared sub-components */
  // If too many X ticks, show every nth to avoid crowding
  const xTickCount = allX.length;
  const xTickInterval = xTickCount > 16 ? Math.ceil(xTickCount / 12) - 1
    : xTickCount > 10 ? 1 : 0;

  const XAx = (
    <XAxis dataKey="x"
      tick={{ fontSize: 12, fill: "var(--muted)", fontVariantNumeric: "lining-nums" } as any}
      axisLine={{ stroke: "var(--slate2)" }} tickLine={false}
      interval={xTickInterval}
      label={xAxis?.label ? { value: xAxis.label, position: "insideBottom", offset: -8, fill: "var(--muted)", fontSize: 12 } : undefined}
    />
  );
  const YAx = (
    <YAxis tick={{ fontSize: 12, fill: "var(--muted)", fontVariantNumeric: "lining-nums" } as any}
      axisLine={false} tickLine={false} width={50} tickFormatter={tickFmt}
      label={yAxis?.label ? { value: `${yAxis.label}${yAxis.unit ? ` (${yAxis.unit})` : ""}`, angle: -90, position: "insideLeft", fill: "var(--muted)", fontSize: 12, dx: -4 } : undefined}
    />
  );
  const Grid = <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,.06)" vertical={false} />;
  const TT   = <Tooltip content={<RichTooltip unit={yAxis?.unit} xLabel={xAxis?.label} />} cursor={{ stroke: "var(--slate2)", strokeWidth: 1 }} />;
  const LegendItem = (v: string) => (
    <span style={{
      color: hidden.has(v) ? "var(--muted2)" : "var(--ink2)",
      textDecoration: hidden.has(v) ? "line-through" : "none",
      cursor: "pointer",
      userSelect: "none",
      transition: "opacity .15s",
      opacity: hidden.has(v) ? 0.5 : 1,
    }}>{v}</span>
  );
  const Leg = series.length > 1 ? (
    <Legend
      wrapperStyle={{ fontSize: 13, paddingTop: 10, direction: "rtl" }}
      onClick={(e: any) => toggle(e.dataKey || e.value)}
      formatter={LegendItem}
    />
  ) : null;
  const Refs = annotations?.map((a, i) => (
    <ReferenceLine key={i} x={a.x} stroke={a.color || "#E05A2B"} strokeDasharray="5 3" strokeWidth={1.5} />
  ));

  /* ── PIE ─────────────────────────────────────── */
  if (chartType === "pie") {
    const pd = series[0]?.data.map(d => ({ name: d.x, value: d.y })) || [];
    const tot = pd.reduce((a, d) => a + d.value, 0);
    const R = Math.PI / 180;
    const outerR = (height / 2) * 0.72;
    const renderLabel = ({ cx, cy, midAngle, outerRadius, percent, name }: any) => {
      if (percent < 0.04) return null;
      const r = outerRadius + 22;
      const x = cx + r * Math.cos(-midAngle * R);
      const y = cy + r * Math.sin(-midAngle * R);
      return (
        <text x={x} y={y} textAnchor={x > cx ? "start" : "end"} dominantBaseline="central"
          fontSize={11} fontFamily="inherit" fontWeight={600} fill="var(--ink2)">
          {name}
          <tspan x={x} dy={13} fontSize={10} fill="var(--muted)" fontWeight={400}>
            {(percent * 100).toFixed(1)}%
          </tspan>
        </text>
      );
    };
    return (
      <div style={{ width: "100%" }}>
        <StatCards stats={stats} />
        <ResponsiveContainer width="100%" height={height + 50}>
          <PieChart>
            <Pie data={pd} dataKey="value" nameKey="name"
              cx="50%" cy="50%" outerRadius={outerR} paddingAngle={1}
              label={renderLabel} labelLine={false}
              animationBegin={0} animationDuration={700} animationEasing="ease-out"
            >
              {pd.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} stroke="var(--white)" strokeWidth={2} />)}
            </Pie>
            <Tooltip content={({ active, payload }: any) => {
              if (!active || !payload?.length) return null;
              const d = payload[0];
              return (
                <div style={{ background: "var(--white)", border: "1px solid var(--slate2)", borderInlineStart: `3px solid ${d.payload.fill}`, borderRadius: 9, padding: "10px 14px", fontSize: 13, direction: "rtl", boxShadow: "0 8px 28px rgba(0,0,0,.13)" }}>
                  <div style={{ fontWeight: 700, color: "var(--ink)", marginBottom: 4 }}>{d.name}</div>
                  <div style={{ color: "var(--muted)", fontVariantNumeric: "lining-nums" }}>
                    {d.value.toLocaleString("ar-SA")}{yAxis?.unit ? ` ${yAxis.unit}` : ""} · {((d.value / tot) * 100).toFixed(1)}%
                  </div>
                </div>
              );
            }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }

  /* ── DONUT ───────────────────────────────────── */
  if (chartType === "donut") {
    const pd = series[0]?.data.map(d => ({ name: d.x, value: d.y })) || [];
    const tot = pd.reduce((a, d) => a + d.value, 0);
    const outerR = (height / 2) * 0.72;
    const innerR = outerR * 0.52;
    const R = Math.PI / 180;
    const renderLabel = ({ cx, cy, midAngle, outerRadius, percent, name }: any) => {
      if (percent < 0.04) return null;
      const r = outerRadius + 22;
      const x = cx + r * Math.cos(-midAngle * R);
      const y = cy + r * Math.sin(-midAngle * R);
      return (
        <text x={x} y={y} textAnchor={x > cx ? "start" : "end"} dominantBaseline="central"
          fontSize={11} fontFamily="inherit" fontWeight={600} fill="var(--ink2)">
          {name}
          <tspan x={x} dy={13} fontSize={10} fill="var(--muted)" fontWeight={400}>
            {(percent * 100).toFixed(1)}%
          </tspan>
        </text>
      );
    };
    return (
      <div style={{ width: "100%" }}>
        <StatCards stats={stats} />
        <ResponsiveContainer width="100%" height={height + 50}>
          <PieChart>
            <Pie data={pd} dataKey="value" nameKey="name"
              cx="50%" cy="50%" innerRadius={innerR} outerRadius={outerR} paddingAngle={3}
              label={renderLabel} labelLine={false}
              animationBegin={0} animationDuration={700} animationEasing="ease-out"
            >
              {pd.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} stroke="var(--white)" strokeWidth={2} />)}
            </Pie>
            {/* Center label */}
            <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" fontFamily="inherit">
              <tspan x="50%" dy={-8} fontSize={22} fontWeight={800} fill="var(--ink)" style={{ fontVariantNumeric: "lining-nums" } as any}>
                {tot.toLocaleString("ar-SA")}
              </tspan>
              <tspan x="50%" dy={20} fontSize={11} fill="var(--muted)">
                {yAxis?.unit || "الإجمالي"}
              </tspan>
            </text>
            <Tooltip content={({ active, payload }: any) => {
              if (!active || !payload?.length) return null;
              const d = payload[0];
              return (
                <div style={{ background: "var(--white)", border: "1px solid var(--slate2)", borderInlineStart: `3px solid ${d.payload.fill}`, borderRadius: 9, padding: "10px 14px", fontSize: 13, direction: "rtl", boxShadow: "0 8px 28px rgba(0,0,0,.13)" }}>
                  <div style={{ fontWeight: 700, color: "var(--ink)", marginBottom: 4 }}>{d.name}</div>
                  <div style={{ color: "var(--muted)", fontVariantNumeric: "lining-nums" }}>
                    {d.value.toLocaleString("ar-SA")}{yAxis?.unit ? ` ${yAxis.unit}` : ""} · {((d.value / tot) * 100).toFixed(1)}%
                  </div>
                </div>
              );
            }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }

  /* ── RADAR ───────────────────────────────────── */
  if (chartType === "radar") {
    const radarData = (series[0]?.data || []).map(d => {
      const pt: Record<string, any> = { subject: d.x };
      series.forEach(s => {
        const found = s.data.find(p => p.x === d.x);
        pt[s.name] = found ? found.y : 0;
      });
      return pt;
    });
    return (
      <div style={{ width: "100%" }}>
        <StatCards stats={stats} />
        <ResponsiveContainer width="100%" height={Math.max(height, 380)}>
          <RadarChart data={radarData} margin={{ top: 24, right: 60, bottom: 24, left: 60 }}
            outerRadius="72%"
          >
            <PolarGrid stroke="var(--slate2)" gridType="polygon" />
            <PolarAngleAxis dataKey="subject"
              tick={{ fontSize: 13, fill: "var(--ink2)", fontFamily: "inherit", fontWeight: 500 } as any}
            />
            {/* Hide radius axis numbers — they clutter the chart */}
            <PolarRadiusAxis tick={false} axisLine={false} />
            {series.map((s, i) => (
              <Radar key={i} name={s.name} dataKey={s.name}
                stroke={color(s, i)} fill={color(s, i)}
                fillOpacity={hidden.has(s.name) ? 0 : 0.15}
                strokeOpacity={hidden.has(s.name) ? 0 : 1}
                strokeWidth={2.5} dot={false}
              />
            ))}
            <Legend wrapperStyle={{ fontSize: 13, paddingTop: 12, direction: "rtl" }}
              formatter={(v: string) => <span style={{ color: "var(--ink2)" }}>{v}</span>}
            />
            <Tooltip content={<RichTooltip unit={yAxis?.unit} />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  /* ── SCATTER / BUBBLE ────────────────────────── */
  if (chartType === "scatter") {
    // Check if any series has z values (bubble mode)
    const hasBubble = series.some(s => s.data.some(d => d.z != null && d.z !== 0));
    return (
      <div style={{ width: "100%" }}>
        <StatCards stats={stats} />
        <ResponsiveContainer width="100%" height={height}>
          <ScatterChart margin={{ ...margin, bottom: 28 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,.06)" vertical={false} />
            <XAxis dataKey="x" type="number" name={xAxis?.label || "x"}
              tick={{ fontSize: 12, fill: "var(--muted)" } as any}
              axisLine={{ stroke: "var(--slate2)" }} tickLine={false}
              label={xAxis?.label ? { value: xAxis.label, position: "insideBottom", offset: -10, fill: "var(--muted)", fontSize: 12 } : undefined}
            />
            <YAxis dataKey="y" type="number" name={yAxis?.label || "y"}
              tick={{ fontSize: 12, fill: "var(--muted)" } as any}
              axisLine={false} tickLine={false} width={50} tickFormatter={tickFmt}
              label={yAxis?.label ? { value: `${yAxis.label}${yAxis.unit ? ` (${yAxis.unit})` : ""}`, angle: -90, position: "insideLeft", fill: "var(--muted)", fontSize: 12 } : undefined}
            />
            {/* ZAxis only when bubble mode — otherwise fixed dot size */}
            {hasBubble
              ? <ZAxis dataKey="z" range={[60, 480]} />
              : <ZAxis range={[60, 60]} />
            }
            <Tooltip content={({ active, payload }: any) => {
              if (!active || !payload?.length) return null;
              const d = payload[0].payload;
              const c = color(series[0] ?? {}, 0);
              return (
                <div style={{ background: "var(--white)", border: "1px solid var(--slate2)", borderInlineStart: `3px solid ${c}`, borderRadius: 9, padding: "10px 14px", fontSize: 13, direction: "rtl", boxShadow: "0 8px 28px rgba(0,0,0,.13)" }}>
                  {d.label && <div style={{ fontWeight: 700, color: "var(--ink)", marginBottom: 6 }}>{d.label}</div>}
                  <div style={{ color: "var(--ink2)", fontVariantNumeric: "lining-nums" }}>{xAxis?.label || "x"}: <strong>{d.x}</strong></div>
                  <div style={{ color: "var(--ink2)", fontVariantNumeric: "lining-nums" }}>{yAxis?.label || "y"}: <strong>{d.y}</strong>{yAxis?.unit ? ` ${yAxis.unit}` : ""}</div>
                  {d.z != null && <div style={{ color: "var(--muted)", fontVariantNumeric: "lining-nums", fontSize: 11, marginTop: 3 }}>الحجم: {d.z}</div>}
                </div>
              );
            }} />
            {series.length > 1 && (
              <Legend wrapperStyle={{ fontSize: 13, paddingTop: 10, direction: "rtl" }}
                formatter={(v: string) => <span style={{ color: "var(--ink2)" }}>{v}</span>}
              />
            )}
            {series.map((s, i) => {
              const c = color(s, i);
              return (
                <Scatter key={i} name={s.name} data={s.data}
                  fill={c} fillOpacity={0.75}
                  stroke={c} strokeWidth={1}
                />
              );
            })}
            {Refs}
          </ScatterChart>
        </ResponsiveContainer>
        <Annots items={annotations} />
      </div>
    );
  }

  /* ── COMPOSED (bar + line mix) ───────────────── */
  if (chartType === "composed") {
    return (
      <div style={{ width: "100%" }}>
        <StatCards stats={stats} />
        <ResponsiveContainer width="100%" height={height}>
          <ComposedChart data={merged} margin={{ ...margin, top: 24 }}>
            <GradDefs series={series} prefix="cg" />
            {Grid}{XAx}{YAx}{TT}{Leg}{Refs}
            {series.map((s, i) => {
              const c = color(s, i);
              const st = (s as any).seriesType || (i === 0 ? "bar" : "line");
              const isHidden = hidden.has(s.name);
              if (st === "bar") {
                return <Bar key={i} dataKey={s.name} fill={c} fillOpacity={isHidden ? 0 : 0.85} radius={[5,5,0,0]} maxBarSize={52} hide={isHidden} />;
              }
              if (st === "area") {
                return <Area key={i} type="monotone" dataKey={s.name} stroke={c} strokeWidth={2.5} fill={`url(#cg${i})`} dot={false} activeDot={{ r: 5, strokeWidth: 2, stroke: "var(--white)", fill: c } as any} connectNulls hide={isHidden} />;
              }
              return <Line key={i} type="monotone" dataKey={s.name} stroke={c} strokeWidth={2.5} dot={false} activeDot={{ r: 5, strokeWidth: 2, stroke: "var(--white)", fill: c } as any} connectNulls hide={isHidden} />;
            })}
          </ComposedChart>
        </ResponsiveContainer>
        <Annots items={annotations} />
      </div>
    );
  }

  /* ── HORIZONTAL BAR ─────────────────────────── */
  if (chartType === "bar-horizontal") {
    return (
      <div style={{ width: "100%" }}>
        <StatCards stats={stats} />
        <ResponsiveContainer width="100%" height={Math.max(height, series[0]?.data.length * 40 + 40)}>
          <BarChart data={merged} layout="vertical" margin={{ top: 8, right: 40, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,.06)" horizontal={false} />
            <XAxis type="number"
              tick={{ fontSize: 12, fill: "var(--muted)", fontVariantNumeric: "lining-nums" } as any}
              axisLine={{ stroke: "var(--slate2)" }} tickLine={false} tickFormatter={tickFmt}
            />
            <YAxis type="category" dataKey="x" width={100}
              tick={{ fontSize: 12, fill: "var(--ink2)" } as any}
              axisLine={false} tickLine={false}
            />
            {TT}{Leg}
            {series.map((s, i) => {
              const c = color(s, i);
              return <Bar key={i} dataKey={s.name} fill={c} fillOpacity={hidden.has(s.name) ? 0 : 0.88}
                radius={[0, 6, 6, 0]} maxBarSize={32} hide={hidden.has(s.name)}
                animationDuration={600} animationEasing="ease-out"
              />;
            })}
          </BarChart>
        </ResponsiveContainer>
        <Annots items={annotations} />
      </div>
    );
  }

  /* ── STACKED BAR ─────────────────────────────── */
  if (chartType === "bar-stacked") {
    return (
      <div style={{ width: "100%" }}>
        <StatCards stats={stats} />
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={merged} margin={{ ...margin, top: 20 }}>
            {Grid}{XAx}{YAx}{TT}{Leg}{Refs}
            {series.map((s, i) => {
              const c = color(s, i);
              const isLast = i === series.length - 1;
              return <Bar key={i} dataKey={s.name} stackId="a" fill={c}
                fillOpacity={hidden.has(s.name) ? 0 : 0.88}
                radius={isLast ? [5, 5, 0, 0] : [0, 0, 0, 0]}
                hide={hidden.has(s.name)}
                animationDuration={600}
              />;
            })}
          </BarChart>
        </ResponsiveContainer>
        <Annots items={annotations} />
      </div>
    );
  }

  /* ── 100% STACKED BAR ───────────────────────── */
  if (chartType === "bar-100") {
    // Normalise each x-point so all series sum to 100
    const norm100 = merged.map(pt => {
      const total = series.reduce((s, sr) => s + (Number(pt[sr.name]) || 0), 0);
      const newPt: Record<string, any> = { x: pt.x };
      series.forEach(sr => { newPt[sr.name] = total ? +((Number(pt[sr.name]) / total) * 100).toFixed(1) : 0; });
      return newPt;
    });
    const YAx100 = (
      <YAxis tick={{ fontSize: 12, fill: "var(--muted)" } as any}
        axisLine={false} tickLine={false} width={40}
        tickFormatter={(v: number) => `${v}%`} domain={[0, 100]}
      />
    );
    return (
      <div style={{ width: "100%" }}>
        <StatCards stats={stats} />
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={norm100} margin={{ ...margin, top: 16 }}>
            {Grid}{XAx}{YAx100}{Leg}
            <Tooltip formatter={(v) => [`${v}%`]} />
            {series.map((s, i) => {
              const c = color(s, i);
              const isLast = i === series.length - 1;
              return <Bar key={i} dataKey={s.name} stackId="a" fill={c}
                fillOpacity={hidden.has(s.name) ? 0 : 0.88}
                radius={isLast ? [5, 5, 0, 0] : [0, 0, 0, 0]}
                hide={hidden.has(s.name)}
              />;
            })}
          </BarChart>
        </ResponsiveContainer>
        <Annots items={annotations} />
      </div>
    );
  }

  /* ── STACKED AREA ────────────────────────────── */
  if (chartType === "area-stacked") {
    return (
      <div style={{ width: "100%" }}>
        <StatCards stats={stats} />
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={merged} margin={margin}>
            <GradDefs series={series} prefix="as" />
            {Grid}{XAx}{YAx}{TT}{Leg}{Refs}
            {series.map((s, i) => {
              const c = color(s, i);
              return <Area key={i} type="monotone" dataKey={s.name} stackId="a"
                stroke={c} strokeWidth={2} fill={`url(#as${i})`}
                fillOpacity={hidden.has(s.name) ? 0 : 1}
                dot={false} activeDot={{ r: 5, strokeWidth: 2, stroke: "var(--white)", fill: c } as any}
                connectNulls hide={hidden.has(s.name)}
                animationDuration={700}
              />;
            })}
          </AreaChart>
        </ResponsiveContainer>
        <Annots items={annotations} />
      </div>
    );
  }

  /* ── TREEMAP ─────────────────────────────────── */
  if (chartType === "treemap") {
    const treeData = series[0]?.data.map((d, i) => ({
      name: d.x,
      size: d.y,
      fill: PALETTE[i % PALETTE.length],
    })) || [];

    const TreeContent = (props: any) => {
      const { x, y, width, height: h, name, size, fill } = props;
      if (!width || !h || width < 5 || h < 5) return null;
      const showLabel = width > 55 && h > 35;
      const showValue = width > 70 && h > 55;
      return (
        <g>
          <rect x={x} y={y} width={width} height={h}
            fill={fill} fillOpacity={0.85} stroke="#fff" strokeWidth={2} rx={5} />
          {showLabel && (
            <text x={x + width / 2} y={y + h / 2 + (showValue ? -9 : 5)}
              textAnchor="middle" dominantBaseline="middle"
              fontSize={Math.min(13, width / 6)} fontWeight={700} fill="#fff"
              fontFamily="inherit" style={{ pointerEvents: "none" }}>
              {name}
            </text>
          )}
          {showValue && (
            <text x={x + width / 2} y={y + h / 2 + 10}
              textAnchor="middle" dominantBaseline="middle"
              fontSize={Math.min(11, width / 8)} fill="rgba(255,255,255,0.85)"
              fontFamily="inherit" style={{ pointerEvents: "none", fontVariantNumeric: "lining-nums" }}>
              {Number(size).toLocaleString("ar-SA")}{yAxis?.unit ? ` ${yAxis.unit}` : ""}
            </text>
          )}
        </g>
      );
    };

    return (
      <div style={{ width: "100%" }}>
        <StatCards stats={stats} />
        <ResponsiveContainer width="100%" height={height + 60}>
          <Treemap data={treeData} dataKey="size" content={<TreeContent />}
            animationDuration={500} animationEasing="ease-out"
          />
        </ResponsiveContainer>
      </div>
    );
  }

  /* ── FUNNEL ──────────────────────────────────── */
  if (chartType === "funnel") {
    const funnelData = series[0]?.data.map((d, i) => ({
      name: d.x,
      value: d.y,
      fill: PALETTE[i % PALETTE.length],
    })) || [];

    return (
      <div style={{ width: "100%" }}>
        <StatCards stats={stats} />
        <ResponsiveContainer width="100%" height={height + 40}>
          <FunnelChart>
            <Tooltip content={({ active, payload }: any) => {
              if (!active || !payload?.length) return null;
              const d = payload[0];
              const pct = funnelData[0]?.value
                ? ((d.value / funnelData[0].value) * 100).toFixed(1)
                : null;
              return (
                <div style={{ background: "var(--white)", border: "1px solid var(--slate2)", borderInlineStart: `3px solid ${d.payload.fill}`, borderRadius: 9, padding: "10px 14px", fontSize: 13, direction: "rtl", boxShadow: "0 8px 28px rgba(0,0,0,.13)" }}>
                  <div style={{ fontWeight: 700, color: "var(--ink)", marginBottom: 4 }}>{d.name}</div>
                  <div style={{ color: "var(--muted)", fontVariantNumeric: "lining-nums" }}>
                    {Number(d.value).toLocaleString("ar-SA")}{yAxis?.unit ? ` ${yAxis.unit}` : ""}
                    {pct && ` · ${pct}%`}
                  </div>
                </div>
              );
            }} />
            <Funnel dataKey="value" data={funnelData} isAnimationActive animationDuration={600}>
              <LabelList dataKey="name" position="right" fill="var(--ink2)" stroke="none"
                style={{ fontSize: 12, fontFamily: "inherit" } as any} />
            </Funnel>
          </FunnelChart>
        </ResponsiveContainer>
      </div>
    );
  }

  /* ── RADIAL BAR ──────────────────────────────── */
  if (chartType === "radialbar") {
    const radialData = series[0]?.data.map((d, i) => ({
      name: d.x,
      value: d.y,
      fill: PALETTE[i % PALETTE.length],
    })) || [];

    return (
      <div style={{ width: "100%" }}>
        <StatCards stats={stats} />
        <ResponsiveContainer width="100%" height={height + 60}>
          <RadialBarChart cx="50%" cy="50%" innerRadius="15%" outerRadius="88%"
            data={radialData} startAngle={90} endAngle={-270}
            margin={{ top: 8, right: 8, bottom: 8, left: 8 }}
          >
            <RadialBar dataKey="value" background={{ fill: "var(--slate3)" }} cornerRadius={6}
              label={{ position: "insideStart", fill: "#fff", fontSize: 11, fontWeight: 700,
                formatter: (v: any) => v > 0 ? Number(v).toLocaleString("ar-SA") : "" }}
              isAnimationActive animationDuration={700}
            />
            <Legend iconSize={10} iconType="circle"
              wrapperStyle={{ fontSize: 12, direction: "rtl", paddingTop: 8 }}
              formatter={(v: string) => <span style={{ color: "var(--ink2)" }}>{v}</span>}
            />
            <Tooltip content={({ active, payload }: any) => {
              if (!active || !payload?.length) return null;
              const d = payload[0];
              return (
                <div style={{ background: "var(--white)", border: "1px solid var(--slate2)", borderInlineStart: `3px solid ${d.payload.fill}`, borderRadius: 9, padding: "10px 14px", fontSize: 13, direction: "rtl", boxShadow: "0 8px 28px rgba(0,0,0,.13)" }}>
                  <div style={{ fontWeight: 700, color: "var(--ink)", marginBottom: 4 }}>{d.name}</div>
                  <div style={{ color: "var(--muted)", fontVariantNumeric: "lining-nums" }}>
                    {Number(d.value).toLocaleString("ar-SA")}{yAxis?.unit ? ` ${yAxis.unit}` : ""}
                  </div>
                </div>
              );
            }} />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  /* ── LINE / AREA / BAR ───────────────────────── */
  const Comp = chartType === "area" ? AreaChart : chartType === "bar" ? BarChart : LineChart;

  // Custom bar label — shows value on top of each bar
  const BarLabel = (props: any) => {
    const { x, y, width, value } = props;
    if (value === null || value === undefined) return null;
    const display = typeof value === "number" ? tickFmt(value) : String(value);
    return (
      <text x={x + width / 2} y={y - 5} textAnchor="middle" fontSize={11}
        fill="var(--muted)" fontFamily="inherit" style={{ fontVariantNumeric: "lining-nums" } as any}>
        {display}{yAxis?.unit ? ` ${yAxis.unit}` : ""}
      </text>
    );
  };

  return (
    <div style={{ width: "100%" }}>
      <StatCards stats={stats} />
      <ResponsiveContainer width="100%" height={height}>
        <Comp data={merged} margin={chartType === "bar" ? { ...margin, top: 28 } : margin}>
          {chartType === "area" && <GradDefs series={series} prefix="ag" />}
          {Grid}{XAx}{YAx}{TT}{Leg}{Refs}

          {series.map((s, i) => {
            const c = color(s, i);
            const dot = { r: 5, strokeWidth: 2, stroke: "var(--white)", fill: c } as any;

            const isHidden = hidden.has(s.name);
            if (chartType === "bar") {
              return (
                <Bar key={i} dataKey={s.name} fill={c} fillOpacity={isHidden ? 0 : 0.88}
                  radius={[5,5,0,0]} maxBarSize={56} hide={isHidden}
                  label={series.length === 1 ? <BarLabel /> : false}
                  animationDuration={600} animationEasing="ease-out"
                />
              );
            }
            if (chartType === "area") {
              return (
                <Area key={i} type="monotone" dataKey={s.name}
                  stroke={c} strokeWidth={2.5} fill={`url(#ag${i})`}
                  dot={false} activeDot={dot} connectNulls hide={isHidden}
                  animationDuration={700} animationEasing="ease-out"
                />
              );
            }
            return (
              <Line key={i} type="monotone" dataKey={s.name}
                stroke={c} strokeWidth={2.5}
                dot={false} activeDot={dot} connectNulls hide={isHidden}
                animationDuration={700} animationEasing="ease-out"
              />
            );
          })}
        </Comp>
      </ResponsiveContainer>
      <Annots items={annotations} />
    </div>
  );
}
