"use client";
import type { ComparisonConfig, MatrixFeature } from "@/lib/supabase/types";

const YES_VALS  = ["yes","نعم","✓","true","1"];
const NO_VALS   = ["no","لا","✗","false","0"];
const PART_VALS = ["partial","جزئي","~","some"];

function classify(v: string): "yes"|"no"|"partial"|"text" {
  const l = v.toLowerCase().trim();
  if (YES_VALS.includes(l))  return "yes";
  if (NO_VALS.includes(l))   return "no";
  if (PART_VALS.includes(l)) return "partial";
  return "text";
}

function Cell({ value, color }: { value: string; color: string }) {
  const type = classify(value);
  if (type === "yes")     return <span style={{ fontSize:"1rem", color:"#4CB36C" }}>✓</span>;
  if (type === "no")      return <span style={{ fontSize:"1rem", color:"#E05A2B" }}>✗</span>;
  if (type === "partial") return <span style={{ fontSize:".9rem", color:"#F59E0B" }}>◐</span>;
  return <span style={{ fontSize:".72rem", fontWeight:700, color, lineHeight:1.3 }}>{value}</span>;
}

export default function MatrixRenderer({
  config, isAr,
}: { config: ComparisonConfig; isAr: boolean }) {
  const features = (config.features ?? []) as MatrixFeature[];
  if (!features.length) return null;

  const colorA = config.entity_a.color || "#7B5EA7";
  const colorB = config.entity_b.color || "#E05A2B";
  const nameA  = isAr ? config.entity_a.name_ar : config.entity_a.name_en;
  const nameB  = isAr ? config.entity_b.name_ar : config.entity_b.name_en;

  return (
    <div style={{ overflowX:"auto" }}>
      <table style={{ width:"100%", borderCollapse:"collapse", fontSize:".8rem" }}>
        {/* Header */}
        <thead>
          <tr>
            <th style={{ padding:"8px 10px", textAlign:"right", color:"#9BA0B8",
              fontWeight:600, fontSize:".68rem", borderBottom:"2px solid #EDEEF3",
              width:"40%" }}>
              {isAr ? "الميزة" : "Feature"}
            </th>
            <th style={{ padding:"8px 12px", textAlign:"center",
              color:colorA, fontWeight:800, fontSize:".78rem",
              borderBottom:"2px solid #EDEEF3", width:"30%" }}>
              {config.entity_a.emoji} {nameA}
            </th>
            <th style={{ padding:"8px 12px", textAlign:"center",
              color:colorB, fontWeight:800, fontSize:".78rem",
              borderBottom:"2px solid #EDEEF3", width:"30%" }}>
              {config.entity_b.emoji} {nameB}
            </th>
          </tr>
        </thead>
        <tbody>
          {features.map((f, i) => {
            const name = isAr ? f.name_ar : f.name_en;
            const note = isAr ? f.note_ar  : f.note_en;
            const isEven = i % 2 === 0;
            return (
              <tr key={i} style={{ background: isEven ? "#FAFBFC" : "#fff" }}>
                <td style={{ padding:"9px 10px", borderBottom:"1px solid #F0F2F5",
                  color:"#3A3D52", fontWeight:600, lineHeight:1.35 }}>
                  {name}
                  {note && <div style={{ fontSize:".62rem", color:"#A0A5BE", marginTop:2 }}>{note}</div>}
                </td>
                <td style={{ padding:"9px 12px", textAlign:"center",
                  borderBottom:"1px solid #F0F2F5" }}>
                  <Cell value={f.value_a} color={colorA}/>
                </td>
                <td style={{ padding:"9px 12px", textAlign:"center",
                  borderBottom:"1px solid #F0F2F5" }}>
                  <Cell value={f.value_b} color={colorB}/>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {/* Legend */}
      <div style={{ display:"flex", gap:14, padding:"10px 10px 2px",
        fontSize:".62rem", color:"#9BA0B8" }}>
        <span><span style={{ color:"#4CB36C" }}>✓</span> {isAr?"متوفر":"Yes"}</span>
        <span><span style={{ color:"#E05A2B" }}>✗</span> {isAr?"غير متوفر":"No"}</span>
        <span><span style={{ color:"#F59E0B" }}>◐</span> {isAr?"جزئي":"Partial"}</span>
      </div>
    </div>
  );
}
