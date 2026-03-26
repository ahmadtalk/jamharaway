"use client";
import type { ComparisonConfig, ProfileEntity } from "@/lib/supabase/types";

function rgba(hex: string, a: number) {
  const m = hex.replace("#","").match(/.{2}/g);
  if (!m) return `rgba(0,0,0,${a})`;
  const [r,g,b] = m.map(v => parseInt(v,16));
  return `rgba(${r},${g},${b},${a})`;
}

function Card({ entity, color, isAr }: { entity: ProfileEntity; color: string; isAr: boolean }) {
  const name      = isAr ? entity.name_ar      : entity.name_en;
  const subtitle  = isAr ? entity.subtitle_ar  : entity.subtitle_en;
  const highlight = isAr ? entity.highlight_ar : entity.highlight_en;
  const tags      = isAr ? entity.tags_ar      : entity.tags_en;

  return (
    <div style={{
      flex:1, borderRadius:12,
      border:`1.5px solid ${rgba(color, 0.25)}`,
      background:`linear-gradient(160deg, ${rgba(color,0.06)} 0%, #fff 60%)`,
      overflow:"hidden",
    }}>
      {/* Top accent */}
      <div style={{ height:3, background:color }}/>

      <div style={{ padding:"14px 14px 12px" }}>
        {/* Emoji + name */}
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
          {entity.emoji && <span style={{ fontSize:"1.6rem", lineHeight:1 }}>{entity.emoji}</span>}
          <div>
            <div style={{ fontFamily:"var(--font-cairo),sans-serif",
              fontWeight:800, fontSize:".95rem", color, lineHeight:1.2 }}>
              {name}
            </div>
            {subtitle && <div style={{ fontSize:".65rem", color:"#9BA0B8", marginTop:1 }}>{subtitle}</div>}
          </div>
        </div>

        {/* Stats */}
        {entity.stats?.length > 0 && (
          <div style={{ borderTop:`1px solid ${rgba(color,0.15)}`,
            paddingTop:10, marginTop:10,
            display:"flex", flexDirection:"column", gap:6 }}>
            {entity.stats.map((s, i) => {
              const label = isAr ? s.label_ar : s.label_en;
              return (
                <div key={i} style={{ display:"flex", justifyContent:"space-between",
                  alignItems:"baseline", gap:6 }}>
                  <span style={{ fontSize:".66rem", color:"#9BA0B8", fontWeight:600 }}>{label}</span>
                  <span style={{ fontSize:".78rem", fontWeight:800, color:"#1A1D2E",
                    textAlign:"left" }}>{s.value}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Highlight */}
        {highlight && (
          <div style={{
            marginTop:10, padding:"8px 10px", borderRadius:8,
            background:rgba(color,0.08), borderRight:`3px solid ${color}`,
            fontSize:".68rem", color:"#3A3D52", lineHeight:1.5,
          }}>
            {highlight}
          </div>
        )}

        {/* Tags */}
        {tags?.length && (
          <div style={{ display:"flex", flexWrap:"wrap", gap:4, marginTop:10 }}>
            {tags.map((t,i) => (
              <span key={i} style={{
                fontSize:".6rem", fontWeight:600, padding:"2px 7px",
                borderRadius:20, background:rgba(color,0.1), color,
              }}>{t}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProfileRenderer({
  config, isAr,
}: { config: ComparisonConfig; isAr: boolean }) {
  const colorA = config.entity_a.color || "#7B5EA7";
  const colorB = config.entity_b.color || "#E05A2B";

  // entity_a/b must be ProfileEntity
  const entityA = config.entity_a as ProfileEntity;
  const entityB = config.entity_b as ProfileEntity;

  return (
    <div style={{ display:"flex", gap:10, alignItems:"stretch" }}>
      <Card entity={entityA} color={colorA} isAr={isAr}/>
      <Card entity={entityB} color={colorB} isAr={isAr}/>
    </div>
  );
}
