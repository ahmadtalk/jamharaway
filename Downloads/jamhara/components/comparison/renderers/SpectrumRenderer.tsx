"use client";
import { useEffect, useState } from "react";
import type { ComparisonConfig, SpectrumAxis } from "@/lib/supabase/types";

function rgba(hex: string, a: number) {
  const m = hex.replace("#","").match(/.{2}/g);
  if (!m) return `rgba(0,0,0,${a})`;
  const [r,g,b] = m.map(v => parseInt(v,16));
  return `rgba(${r},${g},${b},${a})`;
}

function AxisRow({
  axis, colorA, colorB, isAr, animate,
}: {
  axis: SpectrumAxis;
  colorA: string; colorB: string;
  isAr: boolean; animate: boolean;
}) {
  const name     = isAr ? axis.name_ar     : axis.name_en;
  const minLabel = isAr ? axis.min_label_ar : axis.min_label_en;
  const maxLabel = isAr ? axis.max_label_ar : axis.max_label_en;
  const note     = isAr ? axis.note_ar     : axis.note_en;

  const posA = Math.max(1, Math.min(99, axis.position_a));
  const posB = Math.max(1, Math.min(99, axis.position_b));

  return (
    <div style={{ marginBottom:14 }}>
      {/* Name */}
      <div style={{ fontSize:".72rem", fontWeight:700, color:"#3A3D52", marginBottom:6, textAlign:"center" }}>
        {name}
      </div>

      {/* Min / Max labels */}
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
        <span style={{ fontSize:".6rem", color:"#9BA0B8", fontWeight:600 }}>{minLabel}</span>
        <span style={{ fontSize:".6rem", color:"#9BA0B8", fontWeight:600 }}>{maxLabel}</span>
      </div>

      {/* Track with dots */}
      <div style={{
        position:"relative", height:10,
        background:"#EDEEF3", borderRadius:5,
      }}>
        {/* Gradient highlight between the two points */}
        <div style={{
          position:"absolute", top:0, bottom:0,
          left:`${Math.min(posA, posB)}%`,
          width:`${Math.abs(posA-posB)}%`,
          background:`linear-gradient(to right, ${rgba(colorA,.25)}, ${rgba(colorB,.25)})`,
        }}/>

        {/* Dot A */}
        <div style={{
          position:"absolute", top:"50%",
          left: animate ? `${posA}%` : (posA > posB ? "99%" : "1%"),
          transform:"translate(-50%,-50%)",
          width:16, height:16, borderRadius:"50%",
          background:colorA,
          border:"2px solid #fff",
          boxShadow:`0 0 0 1.5px ${colorA}`,
          transition:"left .75s cubic-bezier(.22,1,.36,1)",
          zIndex:2,
          display:"flex", alignItems:"center", justifyContent:"center",
        }}>
          <span style={{ fontSize:".45rem", color:"#fff", fontWeight:900, lineHeight:1 }}>A</span>
        </div>

        {/* Dot B */}
        <div style={{
          position:"absolute", top:"50%",
          left: animate ? `${posB}%` : (posB > posA ? "99%" : "1%"),
          transform:"translate(-50%,-50%)",
          width:16, height:16, borderRadius:"50%",
          background:colorB,
          border:"2px solid #fff",
          boxShadow:`0 0 0 1.5px ${colorB}`,
          transition:"left .75s cubic-bezier(.22,1,.36,1) .08s",
          zIndex:2,
          display:"flex", alignItems:"center", justifyContent:"center",
        }}>
          <span style={{ fontSize:".45rem", color:"#fff", fontWeight:900, lineHeight:1 }}>B</span>
        </div>
      </div>

      {/* Note */}
      {note && (
        <p style={{ textAlign:"center", fontSize:".64rem", color:"#A0A5BE",
          marginTop:5, lineHeight:1.45 }}>
          {note}
        </p>
      )}
    </div>
  );
}

export default function SpectrumRenderer({
  config, isAr,
}: { config: ComparisonConfig; isAr: boolean }) {
  const axes   = (config.axes ?? []) as SpectrumAxis[];
  const [animate, setAnimate] = useState(false);
  useEffect(() => { const t = setTimeout(() => setAnimate(true), 100); return () => clearTimeout(t); }, []);

  if (!axes.length) return null;

  const colorA = config.entity_a.color || "#7B5EA7";
  const colorB = config.entity_b.color || "#E05A2B";
  const nameA  = isAr ? config.entity_a.name_ar : config.entity_a.name_en;
  const nameB  = isAr ? config.entity_b.name_ar : config.entity_b.name_en;

  return (
    <div>
      {/* Legend */}
      <div style={{ display:"flex", justifyContent:"center", gap:18, marginBottom:14 }}>
        {[{name:nameA, color:colorA, letter:"A"},{name:nameB, color:colorB, letter:"B"}].map(e=>(
          <span key={e.letter} style={{
            display:"flex", alignItems:"center", gap:6,
            fontSize:".7rem", fontWeight:700, color:e.color,
          }}>
            <span style={{
              width:14, height:14, borderRadius:"50%", background:e.color,
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:".45rem", color:"#fff", fontWeight:900, flexShrink:0,
            }}>{e.letter}</span>
            {e.name}
          </span>
        ))}
      </div>

      {axes.map((axis, i) => (
        <AxisRow key={i} axis={axis} colorA={colorA} colorB={colorB} isAr={isAr} animate={animate}/>
      ))}
    </div>
  );
}
