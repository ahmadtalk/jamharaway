"use client";
import type { ComparisonConfig, StanceTopic } from "@/lib/supabase/types";

function rgba(hex: string, a: number) {
  const m = hex.replace("#","").match(/.{2}/g);
  if (!m) return `rgba(0,0,0,${a})`;
  const [r,g,b] = m.map(v => parseInt(v,16));
  return `rgba(${r},${g},${b},${a})`;
}

export default function StanceRenderer({
  config, isAr,
}: { config: ComparisonConfig; isAr: boolean }) {
  const topics  = (config.topics ?? []) as StanceTopic[];
  if (!topics.length) return null;

  const colorA = config.entity_a.color || "#7B5EA7";
  const colorB = config.entity_b.color || "#E05A2B";
  const nameA  = isAr ? config.entity_a.name_ar : config.entity_a.name_en;
  const nameB  = isAr ? config.entity_b.name_ar : config.entity_b.name_en;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
      {topics.map((t, i) => {
        const topic    = isAr ? t.topic_ar    : t.topic_en;
        const stanceA  = isAr ? t.stance_a_ar : t.stance_a_en;
        const stanceB  = isAr ? t.stance_b_ar : t.stance_b_en;

        return (
          <div key={i} style={{
            borderRadius:10, border:"1px solid #EDEEF3",
            overflow:"hidden",
          }}>
            {/* Topic header */}
            <div style={{
              background:"#F4F5F8", padding:"7px 14px",
              fontSize:".72rem", fontWeight:700, color:"#3A3D52",
              borderBottom:"1px solid #EDEEF3", textAlign:"center",
            }}>
              {topic}
            </div>

            {/* Two stances side by side */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr" }}>
              {/* A */}
              <div style={{
                padding:"10px 12px",
                borderLeft:"none",
                borderRight:"1px solid #EDEEF3",
                background: rgba(colorA, 0.04),
              }}>
                <div style={{
                  fontSize:".6rem", fontWeight:800, color:colorA,
                  marginBottom:5, display:"flex", alignItems:"center", gap:4,
                }}>
                  {config.entity_a.emoji} {nameA}
                </div>
                <p style={{ fontSize:".72rem", color:"#3A3D52", lineHeight:1.55, margin:0 }}>
                  {stanceA}
                </p>
              </div>
              {/* B */}
              <div style={{
                padding:"10px 12px",
                background: rgba(colorB, 0.04),
              }}>
                <div style={{
                  fontSize:".6rem", fontWeight:800, color:colorB,
                  marginBottom:5, display:"flex", alignItems:"center", gap:4,
                }}>
                  {config.entity_b.emoji} {nameB}
                </div>
                <p style={{ fontSize:".72rem", color:"#3A3D52", lineHeight:1.55, margin:0 }}>
                  {stanceB}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
