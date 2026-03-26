"use client";
import { useState, useEffect } from "react";
import type { ComparisonConfig, ComparisonDimension } from "@/lib/supabase/types";

function rgba(hex: string, a: number) {
  const m = hex.replace("#","").match(/.{2}/g);
  if (!m) return `rgba(0,0,0,${a})`;
  const [r,g,b] = m.map(v => parseInt(v,16));
  return `rgba(${r},${g},${b},${a})`;
}

const TRACK = "#EDEEF3";

function DimRow({
  dim, colorA, colorB, isAr, animate,
}: {
  dim: ComparisonDimension;
  colorA: string; colorB: string;
  isAr: boolean; animate: boolean;
}) {
  const name = isAr ? dim.name_ar : dim.name_en;
  const note = isAr ? dim.note_ar : dim.note_en;
  const winA = dim.score_a > dim.score_b;
  const winB = dim.score_b > dim.score_a;

  return (
    <div style={{ marginBottom:12 }}>
      <div style={{ textAlign:"center", fontSize:".7rem", fontWeight:700,
        color:"#5A5F7A", marginBottom:5 }}>
        {name}
      </div>

      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        {/* A: score + bar (right-to-left) */}
        <div style={{ flex:1, display:"flex", alignItems:"center", gap:7 }}>
          <span style={{ fontSize:".68rem", fontWeight:800,
            color: winA ? colorA : "#9BA0B8",
            minWidth:22, textAlign:"right", flexShrink:0 }}>
            {dim.score_a}
          </span>
          <div style={{ flex:1, height:8, borderRadius:"4px 0 0 4px",
            background:TRACK, position:"relative", overflow:"hidden" }}>
            <div style={{
              position:"absolute", top:0, bottom:0, right:0,
              borderRadius:"4px 0 0 4px",
              background: winA ? colorA : rgba(colorA,0.4),
              width: animate ? `${dim.score_a}%` : "0%",
              transition:"width .7s cubic-bezier(.22,1,.36,1)",
            }}/>
          </div>
        </div>

        {/* Spine */}
        <div style={{ width:2, height:20, background:"#D0D3DF", borderRadius:1, flexShrink:0 }}/>

        {/* B: bar + score (left-to-right) */}
        <div style={{ flex:1, display:"flex", alignItems:"center", gap:7 }}>
          <div style={{ flex:1, height:8, borderRadius:"0 4px 4px 0",
            background:TRACK, position:"relative", overflow:"hidden" }}>
            <div style={{
              position:"absolute", top:0, bottom:0, left:0,
              borderRadius:"0 4px 4px 0",
              background: winB ? colorB : rgba(colorB,0.4),
              width: animate ? `${dim.score_b}%` : "0%",
              transition:"width .7s cubic-bezier(.22,1,.36,1)",
            }}/>
          </div>
          <span style={{ fontSize:".68rem", fontWeight:800,
            color: winB ? colorB : "#9BA0B8",
            minWidth:22, textAlign:"left", flexShrink:0 }}>
            {dim.score_b}
          </span>
        </div>
      </div>

      {note && (
        <p style={{ textAlign:"center", fontSize:".65rem", color:"#A0A5BE",
          marginTop:4, lineHeight:1.45, padding:"0 4px" }}>
          {note}
        </p>
      )}
    </div>
  );
}

export default function BarsRenderer({
  config, isAr,
}: { config: ComparisonConfig; isAr: boolean }) {
  const [animate, setAnimate] = useState(false);
  useEffect(() => { const t = setTimeout(() => setAnimate(true), 80); return () => clearTimeout(t); }, []);

  const dims   = (config.dimensions ?? []) as ComparisonDimension[];
  const colorA = config.entity_a.color || "#7B5EA7";
  const colorB = config.entity_b.color || "#E05A2B";

  if (!dims.length) return null;

  return (
    <div>
      {dims.map((dim,i) => (
        <DimRow key={i} dim={dim} colorA={colorA} colorB={colorB} isAr={isAr} animate={animate}/>
      ))}
    </div>
  );
}
