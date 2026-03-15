import React, { useState, useEffect, Component } from "react";
import REFS from "./refs.json";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, Legend,
} from "recharts";

// ── SYSTEM DEFINITIONS ──────────────────────────────────────────────────────
const SYSTEMS = {
  old:  {
    label: "OLD BEAST",  color: "#F59E0B", glow: "rgba(245,158,11,0.4)",  dim: "rgba(245,158,11,0.15)",
    cpu: "i7-7700K",        gpu: "GTX 1080 Ti",      ram: "16GB DDR4", vram: "11GB GDDR5X",
    tdp: 421, price: 21990, year: 2017, mult: null,
  },
  mine: {
    label: "PLANNED",    color: "#06B6D4", glow: "rgba(6,182,212,0.4)",   dim: "rgba(6,182,212,0.15)",
    cpu: "Ryzen 5 7600X",   gpu: "RTX 5060 Ti 16GB", ram: "32GB DDR5", vram: "16GB GDDR7",
    tdp: 330, price: 12000, mult: "2.2× GPU · 3.2× CPU · 7× AI",
  },
  high: {
    label: "HIGH-END",   color: "#A855F7", glow: "rgba(168,85,247,0.4)",  dim: "rgba(168,85,247,0.15)",
    cpu: "Ryzen 7 7800X3D", gpu: "RTX 5070",         ram: "32GB DDR5", vram: "12GB GDDR7",
    tdp: 410, price: 21000, mult: "2.6× GPU · 3.6× CPU · 10× AI",
  },
};

// ── GAMING FPS DATA ──────────────────────────────────────────────────────────
const FPS_1080P = [
  { game: "Cyberpunk 2077", old: 55,  mine: 98,  high: 125 },
  { game: "Elden Ring",     old: 95,  mine: 142, high: 168 },
  { game: "Hogwarts",       old: 60,  mine: 96,  high: 122 },
  { game: "CoD Warzone",    old: 122, mine: 178, high: 205 },
  { game: "Fortnite",       old: 112, mine: 162, high: 198 },
  { game: "RDR2",           old: 76,  mine: 112, high: 133 },
  { game: "BG3",            old: 82,  mine: 122, high: 148 },
  { game: "Starfield",      old: 46,  mine: 82,  high: 102 },
];

const FPS_1440P = [
  { game: "Cyberpunk 2077", old: 35,  mine: 72,  high: 96  },
  { game: "Elden Ring",     old: 72,  mine: 112, high: 142 },
  { game: "Hogwarts",       old: 42,  mine: 73,  high: 96  },
  { game: "CoD Warzone",    old: 90,  mine: 142, high: 172 },
  { game: "Fortnite",       old: 82,  mine: 132, high: 167 },
  { game: "RDR2",           old: 55,  mine: 86,  high: 112 },
  { game: "BG3",            old: 60,  mine: 96,  high: 122 },
  { game: "Starfield",      old: 32,  mine: 58,  high: 79  },
];

const RADAR_DATA = [
  { subject: "1080p FPS",   old: 48, mine: 80, high: 100 },
  { subject: "1440p FPS",   old: 38, mine: 72, high: 100 },
  { subject: "CPU Score",   old: 28, mine: 90, high: 100 },
  { subject: "GPU Score",   old: 38, mine: 82, high: 100 },
  { subject: "AI Perf",     old: 10, mine: 73, high: 100 },
  { subject: "VRAM",        old: 55, mine: 100,high: 75  },
  { subject: "Memory BW",   old: 32, mine: 88, high: 100 },
];

const BENCHMARKS = [
  { metric: "Cinebench R23 (MT)", unit: "pts", old: 4820,  mine: 15240, high: 15080, max: 16000 },
  { metric: "Cinebench R23 (ST)", unit: "pts", old: 1190,  mine: 1920,  high: 2050,  max: 2200  },
  { metric: "3DMark TimeSpy",     unit: "pts", old: 8500,  mine: 18200, high: 22400, max: 24000 },
  { metric: "3DMark Firestrike",  unit: "pts", old: 22000, mine: 48000, high: 58000, max: 62000 },
  { metric: "AI TOPS (INT8)",     unit: "TOPS",old: 22,    mine: 612,   high: 838,   max: 900   },
  { metric: "VRAM",               unit: "GB",  old: 11,    mine: 16,    high: 12,    max: 16    },
  { metric: "Mem Bandwidth",      unit: "GB/s",old: 484,   mine: 960,   high: 960,   max: 1000  },
];

// ── AI WORKLOADS (image + video gen) ────────────────────────────────────────
const AI_WORKLOADS = [
  // Image generation
  { task: "LLM 7B (tok/s)",              old: "~4",    mine: "~62",   high: "~85",   oldRaw: 4,   mineRaw: 62,  highRaw: 85,  max: 100, cat: "LLM"   },
  { task: "LLM 13B (tok/s)",             old: "OOM",   mine: "~38",   high: "~28",   oldRaw: 0,   mineRaw: 38,  highRaw: 28,  max: 45,  cat: "LLM"   },
  { task: "SD 1.5 (img/s @ 512px)",      old: "1.8",   mine: "14.2",  high: "18.6",  oldRaw: 1.8, mineRaw: 14.2,highRaw: 18.6,max: 20,  cat: "IMG"   },
  { task: "SDXL (img/s @ 1024px)",       old: "0.6",   mine: "4.8",   high: "6.4",   oldRaw: 0.6, mineRaw: 4.8, highRaw: 6.4, max: 7,   cat: "IMG"   },
  { task: "FLUX.1 Schnell (img/s)",      old: "N/A",   mine: "1.2",   high: "1.8",   oldRaw: 0,   mineRaw: 120, highRaw: 180, max: 200, cat: "IMG"   },
  // Video generation
  { task: "Stable Video Diffusion (fps)",old: "N/A",   mine: "0.4fps",high: "0.7fps",oldRaw: 0,   mineRaw: 40,  highRaw: 70,  max: 80,  cat: "VID"   },
  { task: "AnimateDiff (frames/min)",    old: "N/A",   mine: "~22",   high: "~34",   oldRaw: 0,   mineRaw: 22,  highRaw: 34,  max: 40,  cat: "VID"   },
  { task: "CogVideoX-5B (rel. score)",   old: "OOM",   mine: "62",    high: "100",   oldRaw: 0,   mineRaw: 62,  highRaw: 100, max: 100, cat: "VID"   },
  { task: "Wan2.1 480p T2V (rel. score)",old: "OOM",   mine: "68",    high: "100",   oldRaw: 0,   mineRaw: 68,  highRaw: 100, max: 100, cat: "VID"   },
  // Other AI
  { task: "Whisper Large (RTF)",         old: "0.12x", mine: "1.8x",  high: "2.4x",  oldRaw: 12,  mineRaw: 180, highRaw: 240, max: 250, cat: "AUD"   },
  { task: "YOLO v8 (FPS)",              old: "38",    mine: "210",   high: "285",   oldRaw: 38,  mineRaw: 210, highRaw: 285, max: 300, cat: "CV"    },
];

const CAT_LABELS = { LLM: "LARGE LANGUAGE MODELS", IMG: "IMAGE GENERATION", VID: "VIDEO GENERATION", AUD: "AUDIO / SPEECH", CV: "COMPUTER VISION" };
const CAT_COLORS = { LLM: "#4ADE80", IMG: "#F472B6", VID: "#FB923C", AUD: "#60A5FA", CV: "#FACC15" };

// ── POWER DATA ───────────────────────────────────────────────────────────────
// tdp: full system peak (CPU + GPU + platform overhead)
// fpsPerWatt: avg 1080p FPS / (tdp/100)
// topsPerWatt: AI TOPS / (tdp/100)
// monthlyKr: at 1.8 kr/kWh, gaming 4h/day, 30 days
const POWER_DATA = [
  { metric: "Peak System Draw",       unit: "W",           old: 421,  mine: 330,  high: 410,  max: 500  },
  { metric: "Gaming Efficiency",      unit: "FPS / 100W",  old: 19.2, mine: 37.6, high: 36.6, max: 40   },
  { metric: "AI Efficiency",          unit: "TOPS / 100W", old: 5.2,  mine: 185,  high: 204,  max: 220  },
  { metric: "Monthly Gaming Cost",    unit: "kr",          old: 91,   mine: 71,   high: 89,   max: 100  },
];

// For peak power, lower = better — we'll invert that display
const POWER_CHART_DATA = [
  { label: "OLD BEAST",  watts: 421, fpsW: 19.2, aiW: 5.2,  monthlykr: 91  },
  { label: "PLANNED",   watts: 330, fpsW: 37.6, aiW: 185,  monthlykr: 71  },
  { label: "HIGH-END",   watts: 410, fpsW: 36.6, aiW: 204,  monthlykr: 89  },
];

// ── UTILS ─────────────────────────────────────────────────────────────────────
const fmt = (n) => n >= 1000 ? `${(n / 1000).toFixed(1)}K` : n;
const pct = (v, max) => Math.min((v / max) * 100, 100);

// ── CUSTOM TOOLTIP ────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#0a0a0a", border: "1px solid #333", padding: "10px 14px", fontFamily: "monospace", fontSize: 12 }}>
      <div style={{ color: "#888", marginBottom: 6, letterSpacing: 2 }}>{label?.toUpperCase()}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, display: "flex", justifyContent: "space-between", gap: 24 }}>
          <span>{p.name}</span>
          <span style={{ fontWeight: 700 }}>{p.value} FPS</span>
        </div>
      ))}
    </div>
  );
};

// ── GLOW BAR ──────────────────────────────────────────────────────────────────
const GlowBar = ({ value, max, color, glow, label, unit = "", animated = true, isWinner = false }) => {
  const [width, setWidth] = useState(0);
  const p = pct(value, max);
  useEffect(() => { const t = setTimeout(() => setWidth(p), 100); return () => clearTimeout(t); }, [p]);
  return (
    <div style={{ marginBottom: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 11, fontFamily: "monospace", color: "#666" }}>
        <span style={{ color: isWinner ? "#fff" : "#aaa", display: "flex", alignItems: "center", gap: 6 }}>
          {label}
          {isWinner && <span style={{ fontSize: 9, color: "#FFD700", letterSpacing: 1 }}>▲ BEST</span>}
        </span>
        <span style={{ color }}>{fmt(value)}{unit}</span>
      </div>
      <div style={{ height: 10, background: "#111", borderRadius: 2, overflow: "hidden", position: "relative" }}>
        <div style={{
          height: "100%", width: animated ? `${width}%` : `${p}%`,
          background: `linear-gradient(90deg, ${color}88, ${color})`,
          boxShadow: isWinner ? `0 0 12px ${glow}` : `0 0 8px ${glow}`,
          borderRadius: 2,
          transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)",
        }} />
      </div>
    </div>
  );
};

// ── SYSTEM CARD ───────────────────────────────────────────────────────────────
const SystemCard = ({ sys, id }) => (
  <div style={{
    border: `1px solid ${sys.color}44`,
    borderTop: `3px solid ${sys.color}`,
    background: `linear-gradient(135deg, #0d0d0d 0%, ${sys.dim} 100%)`,
    padding: "16px 20px",
    borderRadius: 2,
    flex: 1,
    minWidth: 200,
    position: "relative",
    overflow: "hidden",
  }}>
    <div style={{ position: "absolute", top: 0, right: 0, width: 60, height: 60, background: `radial-gradient(circle at top right, ${sys.glow}, transparent 70%)`, pointerEvents: "none" }} />
    <div style={{ fontSize: 10, color: sys.color, letterSpacing: 4, marginBottom: 6, fontFamily: "monospace" }}>
      SYS::{id.toUpperCase()}
    </div>
    <div style={{ fontSize: 16, color: "#fff", fontFamily: "monospace", fontWeight: 700, marginBottom: 10, textShadow: `0 0 12px ${sys.glow}` }}>
      {sys.label}
    </div>
    {[["CPU", sys.cpu], ["GPU", sys.gpu], ["RAM", sys.ram], ["VRAM", sys.vram]].map(([k, v]) => (
      <div key={k} style={{ display: "flex", gap: 8, fontSize: 11, fontFamily: "monospace", marginBottom: 3 }}>
        <span style={{ color: sys.color, minWidth: 40 }}>{k}</span>
        <span style={{ color: "#ccc" }}>{v}</span>
      </div>
    ))}
    <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #1a1a1a", display: "flex", justifyContent: "space-between", fontSize: 10, fontFamily: "monospace" }}>
      <span style={{ color: "#444" }}>~{sys.tdp}W peak</span>
      <span style={{ color: "#666" }}>≈{sys.price.toLocaleString()} kr{sys.year ? ` (${sys.year})` : ""}</span>
    </div>
    {sys.mult && (
      <div style={{ marginTop: 8, padding: "5px 8px", background: `${sys.color}11`, border: `1px solid ${sys.color}22`, borderRadius: 2, fontSize: 9, color: sys.color, fontFamily: "monospace", letterSpacing: 1 }}>
        vs OLD: {sys.mult}
      </div>
    )}
  </div>
);

// ── FPS TAB ───────────────────────────────────────────────────────────────────
const FpsTab = ({ data }) => (
  <div>
    <ResponsiveContainer width="100%" height={380}>
      <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 60 }} barGap={3} barCategoryGap="25%">
        <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
        <XAxis dataKey="game" tick={{ fill: "#555", fontSize: 11, fontFamily: "monospace" }} angle={-35} textAnchor="end" interval={0} />
        <YAxis tick={{ fill: "#555", fontSize: 11, fontFamily: "monospace" }} label={{ value: "FPS", angle: -90, position: "insideLeft", fill: "#444", fontSize: 11, fontFamily: "monospace" }} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "#ffffff08" }} />
        <Bar dataKey="old"  name="OLD BEAST" fill={SYSTEMS.old.color}  radius={[2,2,0,0]} />
        <Bar dataKey="mine" name="PLANNED"  fill={SYSTEMS.mine.color} radius={[2,2,0,0]} />
        <Bar dataKey="high" name="HIGH-END"  fill={SYSTEMS.high.color} radius={[2,2,0,0]} />
      </BarChart>
    </ResponsiveContainer>
    <Legend />
  </div>
);

// ── RADAR TAB ─────────────────────────────────────────────────────────────────
const RadarTab = () => (
  <div>
    <ResponsiveContainer width="100%" height={420}>
      <RadarChart data={RADAR_DATA} margin={{ top: 20, right: 40, bottom: 20, left: 40 }}>
        <PolarGrid stroke="#222" />
        <PolarAngleAxis dataKey="subject" tick={{ fill: "#666", fontSize: 11, fontFamily: "monospace" }} />
        <Radar name="OLD BEAST" dataKey="old"  stroke={SYSTEMS.old.color}  fill={SYSTEMS.old.color}  fillOpacity={0.12} strokeWidth={2} />
        <Radar name="PLANNED"  dataKey="mine" stroke={SYSTEMS.mine.color} fill={SYSTEMS.mine.color} fillOpacity={0.15} strokeWidth={2} />
        <Radar name="HIGH-END"  dataKey="high" stroke={SYSTEMS.high.color} fill={SYSTEMS.high.color} fillOpacity={0.12} strokeWidth={2} />
      </RadarChart>
    </ResponsiveContainer>
    <div style={{ display: "flex", gap: 20, justifyContent: "center" }}>
      {Object.entries(SYSTEMS).map(([k, s]) => (
        <div key={k} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontFamily: "monospace", color: s.color }}>
          <div style={{ width: 24, height: 2, background: s.color }} />
          {s.label}
        </div>
      ))}
    </div>
  </div>
);

// ── BENCHMARKS TAB ────────────────────────────────────────────────────────────
const BenchmarksTab = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
    {BENCHMARKS.map((b) => {
      const maxVal = Math.max(b.old, b.mine, b.high);
      return (
        <div key={b.metric}>
          <div style={{ fontSize: 11, color: "#666", fontFamily: "monospace", letterSpacing: 2, marginBottom: 8, textTransform: "uppercase" }}>
            // {b.metric}
          </div>
          {Object.entries(SYSTEMS).map(([k, s]) => (
            <GlowBar key={k} label={s.label} value={b[k]} max={b.max} color={s.color} glow={s.glow} unit={` ${b.unit}`} isWinner={b[k] === maxVal && b[k] > 0} />
          ))}
        </div>
      );
    })}
  </div>
);

// ── AI WORKLOAD TAB ───────────────────────────────────────────────────────────
const AiTab = () => {
  const categories = [...new Set(AI_WORKLOADS.map(r => r.cat))];
  return (
    <div>
      {categories.map(cat => (
        <div key={cat} style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 10, color: CAT_COLORS[cat], fontFamily: "monospace", letterSpacing: 3, marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 20, height: 1, background: CAT_COLORS[cat] }} />
            {CAT_LABELS[cat]}
            <div style={{ flex: 1, height: 1, background: `${CAT_COLORS[cat]}22` }} />
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "monospace", fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #222" }}>
                  <th style={{ textAlign: "left", color: "#444", padding: "6px 12px", fontWeight: 400, letterSpacing: 2, fontSize: 10 }}>WORKLOAD</th>
                  {Object.entries(SYSTEMS).map(([k, s]) => (
                    <th key={k} style={{ textAlign: "center", color: s.color, padding: "6px 12px", fontWeight: 400, letterSpacing: 2, fontSize: 10 }}>
                      {s.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {AI_WORKLOADS.filter(r => r.cat === cat).map((row, i) => {
                  const maxRaw = Math.max(row.oldRaw, row.mineRaw, row.highRaw);
                  return (
                    <tr key={i} style={{ borderBottom: "1px solid #111", transition: "background 0.15s" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#ffffff06"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <td style={{ padding: "10px 12px", color: "#888", fontSize: 11 }}>{row.task}</td>
                      {[
                        { key: "old",  val: row.old,  raw: row.oldRaw,  sys: SYSTEMS.old  },
                        { key: "mine", val: row.mine, raw: row.mineRaw, sys: SYSTEMS.mine },
                        { key: "high", val: row.high, raw: row.highRaw, sys: SYSTEMS.high },
                      ].map(({ key, val, raw, sys }) => {
                        const p = pct(raw, row.max);
                        const isMax = raw === maxRaw && raw > 0;
                        const isNA = val === "N/A" || val === "OOM";
                        return (
                          <td key={key} style={{ padding: "10px 12px", textAlign: "center" }}>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                              <span style={{
                                color: isNA ? "#333" : sys.color,
                                fontWeight: isMax ? 700 : 400,
                                fontSize: 13,
                                textShadow: isMax ? `0 0 10px ${sys.glow}` : "none",
                              }}>
                                {val}
                                {isMax && <span style={{ fontSize: 8, marginLeft: 4, color: "#FFD700" }}>▲</span>}
                              </span>
                              <div style={{ width: 60, height: 3, background: "#111", borderRadius: 2, overflow: "hidden" }}>
                                <div style={{ height: "100%", width: `${p}%`, background: sys.color, opacity: isNA ? 0.1 : 0.8, borderRadius: 2 }} />
                              </div>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
      <div style={{ marginTop: 8, padding: "12px 16px", background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: 2 }}>
        <div style={{ fontSize: 10, color: "#444", fontFamily: "monospace", letterSpacing: 2, marginBottom: 8 }}>// NOTES</div>
        <div style={{ fontSize: 11, color: "#555", fontFamily: "monospace", lineHeight: 1.8 }}>
          <div>▸ LLM 13B: PLANNED wins on VRAM (16GB) — HIGH-END limited to 12GB GDDR7</div>
          <div>▸ GTX 1080 Ti has no Tensor Cores — AI workloads run on CUDA cores only (very slow)</div>
          <div>▸ RTX 5000 Blackwell: 4th-gen Tensor Cores + FP8 — massive AI throughput leap</div>
          <div>▸ Video gen (AnimateDiff, CogVideoX, Wan2.1) requires 8GB+ VRAM — OLD BEAST cannot run most</div>
          <div>▸ Whisper RTF: Real-Time Factor (1.8x = 1.8× faster than real time)</div>
        </div>
      </div>
    </div>
  );
};

// ── POWER TAB ─────────────────────────────────────────────────────────────────
const PowerTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#0a0a0a", border: "1px solid #333", padding: "10px 14px", fontFamily: "monospace", fontSize: 12 }}>
      <div style={{ color: "#888", marginBottom: 6, letterSpacing: 2 }}>{label?.toUpperCase()}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || "#ccc", display: "flex", justifyContent: "space-between", gap: 24 }}>
          <span>{p.name}</span>
          <span style={{ fontWeight: 700 }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
};

const PowerTab = () => {
  const effData = [
    { label: "OLD BEAST", fpsW: 19.2, aiW: 5.2   },
    { label: "PLANNED",  fpsW: 37.6, aiW: 185    },
    { label: "HIGH-END",  fpsW: 36.6, aiW: 204    },
  ];
  const COLORS = [SYSTEMS.old.color, SYSTEMS.mine.color, SYSTEMS.high.color];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>

      {/* Peak Power Draw */}
      <div>
        <div style={{ fontSize: 10, color: "#444", fontFamily: "monospace", letterSpacing: 3, marginBottom: 14 }}>// PEAK SYSTEM POWER DRAW (W)</div>
        {Object.entries(SYSTEMS).map(([k, s]) => {
        return (
          <GlowBar key={k} label={`${s.label}  (lower = better)`} value={s.tdp} max={500} color={s.color} glow={s.glow} unit=" W" isWinner={s.tdp === Math.min(...Object.values(SYSTEMS).map(x => x.tdp))} />
          );
        })}
        <div style={{ fontSize: 10, color: "#333", fontFamily: "monospace", marginTop: 8 }}>
          ▸ PLANNED draws 91W less than OLD BEAST at peak — saves heat and noise
        </div>
      </div>

      {/* Performance per Watt */}
      <div>
        <div style={{ fontSize: 10, color: "#444", fontFamily: "monospace", letterSpacing: 3, marginBottom: 14 }}>// GAMING EFFICIENCY — avg 1080p FPS / 100W</div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={effData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }} barCategoryGap="35%">
            <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: "#555", fontSize: 11, fontFamily: "monospace" }} />
            <YAxis tick={{ fill: "#555", fontSize: 11, fontFamily: "monospace" }} label={{ value: "FPS/100W", angle: -90, position: "insideLeft", fill: "#444", fontSize: 10, fontFamily: "monospace" }} />
            <Tooltip content={<PowerTooltip />} cursor={{ fill: "#ffffff06" }} />
            <Bar dataKey="fpsW" name="FPS / 100W" radius={[2,2,0,0]}>
              {effData.map((_, i) => (
                <Cell key={i} fill={COLORS[i]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* AI efficiency */}
      <div>
        <div style={{ fontSize: 10, color: "#444", fontFamily: "monospace", letterSpacing: 3, marginBottom: 14 }}>// AI EFFICIENCY — TOPS (INT8) / 100W</div>
        {Object.entries(SYSTEMS).map(([k, s]) => {
          const tops = BENCHMARKS.find(b => b.metric === "AI TOPS (INT8)");
          const val = tops[k];
          const eff = +(val / (s.tdp / 100)).toFixed(1);
          const maxEff = 210;
          const isWinner = eff === Math.max(
            +(tops.old / (SYSTEMS.old.tdp / 100)).toFixed(1),
            +(tops.mine / (SYSTEMS.mine.tdp / 100)).toFixed(1),
            +(tops.high / (SYSTEMS.high.tdp / 100)).toFixed(1),
          );
          return (
            <GlowBar key={k} label={s.label} value={eff} max={maxEff} color={s.color} glow={s.glow} unit=" TOPS/100W" isWinner={isWinner} />
          );
        })}
      </div>

      {/* Monthly cost */}
      <div>
        <div style={{ fontSize: 10, color: "#444", fontFamily: "monospace", letterSpacing: 3, marginBottom: 14 }}>// ESTIMATED MONTHLY ELECTRICITY COST (gaming 4h/day · 1.8 kr/kWh)</div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {Object.entries(SYSTEMS).map(([k, s]) => {
            const kr = Math.round(s.tdp / 1000 * 4 * 30 * 1.8);
            const isMin = kr === Math.min(...Object.values(SYSTEMS).map(x => Math.round(x.tdp / 1000 * 4 * 30 * 1.8)));
            return (
              <div key={k} style={{
                flex: 1, minWidth: 120, padding: "16px", background: "#0d0d0d",
                border: `1px solid ${isMin ? s.color + "66" : "#1a1a1a"}`,
                borderTop: `2px solid ${s.color}`,
                borderRadius: 2, textAlign: "center",
              }}>
                <div style={{ fontSize: 10, color: s.color, fontFamily: "monospace", letterSpacing: 2, marginBottom: 8 }}>{s.label}</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: isMin ? s.color : "#aaa", fontFamily: "monospace", textShadow: isMin ? `0 0 16px ${s.glow}` : "none" }}>
                  {kr}
                </div>
                <div style={{ fontSize: 10, color: "#444", fontFamily: "monospace", marginTop: 4 }}>kr / month</div>
                {isMin && <div style={{ fontSize: 9, color: "#FFD700", fontFamily: "monospace", marginTop: 6, letterSpacing: 1 }}>▲ LOWEST COST</div>}
              </div>
            );
          })}
        </div>
        <div style={{ fontSize: 10, color: "#333", fontFamily: "monospace", marginTop: 12 }}>
          ▸ PLANNED saves ~{Math.round(SYSTEMS.old.tdp / 1000 * 4 * 30 * 1.8) - Math.round(SYSTEMS.mine.tdp / 1000 * 4 * 30 * 1.8)} kr/month vs OLD BEAST — ~{Math.round((Math.round(SYSTEMS.old.tdp / 1000 * 4 * 30 * 1.8) - Math.round(SYSTEMS.mine.tdp / 1000 * 4 * 30 * 1.8)) * 12)} kr/year
        </div>
      </div>

    </div>
  );
};

// ── VALUE TAB ─────────────────────────────────────────────────────────────────
const ValueTab = () => {
  const avgFps1080 = (data) => Math.round(data.reduce((s, r) => s + r.mine, 0) / data.length);
  const avgFpsOld = Math.round(FPS_1080P.reduce((s, r) => s + r.old, 0) / FPS_1080P.length);
  const avgFpsMine = Math.round(FPS_1080P.reduce((s, r) => s + r.mine, 0) / FPS_1080P.length);
  const avgFpsHigh = Math.round(FPS_1080P.reduce((s, r) => s + r.high, 0) / FPS_1080P.length);

  const systems = [
    { ...SYSTEMS.old,  avgFps: avgFpsOld,  tops: 22,  fpsPerKkr: +(avgFpsOld  / (SYSTEMS.old.price  / 1000)).toFixed(1), topsPerKkr: +(22  / (SYSTEMS.old.price  / 1000)).toFixed(2) },
    { ...SYSTEMS.mine, avgFps: avgFpsMine, tops: 612, fpsPerKkr: +(avgFpsMine / (SYSTEMS.mine.price / 1000)).toFixed(1), topsPerKkr: +(612 / (SYSTEMS.mine.price / 1000)).toFixed(2) },
    { ...SYSTEMS.high, avgFps: avgFpsHigh, tops: 838, fpsPerKkr: +(avgFpsHigh / (SYSTEMS.high.price / 1000)).toFixed(1), topsPerKkr: +(838 / (SYSTEMS.high.price / 1000)).toFixed(2) },
  ];

  const rows = [
    { label: "Approx. Price",           unit: "kr",          vals: systems.map(s => s.price.toLocaleString()), raws: systems.map(s => s.price), max: 40000, lowerBetter: true  },
    { label: "Avg 1080p FPS",           unit: "FPS",         vals: systems.map(s => s.avgFps), raws: systems.map(s => s.avgFps), max: 165, lowerBetter: false },
    { label: "AI TOPS (INT8)",          unit: "TOPS",        vals: systems.map(s => s.tops),   raws: systems.map(s => s.tops),   max: 900, lowerBetter: false },
    { label: "Gaming Value (FPS/1kkr)", unit: "FPS/1kkr",    vals: systems.map(s => s.fpsPerKkr), raws: systems.map(s => s.fpsPerKkr), max: 10, lowerBetter: false },
    { label: "AI Value (TOPS/1kkr)",    unit: "TOPS/1kkr",   vals: systems.map(s => s.topsPerKkr), raws: systems.map(s => s.topsPerKkr), max: 50, lowerBetter: false },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {rows.map((row) => {
        const winner = row.lowerBetter
          ? Math.min(...row.raws)
          : Math.max(...row.raws);
        return (
          <div key={row.label}>
            <div style={{ fontSize: 11, color: "#666", fontFamily: "monospace", letterSpacing: 2, marginBottom: 8, textTransform: "uppercase" }}>
              // {row.label}
            </div>
            {systems.map((s, i) => {
              const raw = row.raws[i];
              const barVal = row.lowerBetter ? row.max - raw : raw;
              const barMax = row.lowerBetter ? row.max - Math.min(...row.raws) * 0.5 : row.max;
              const isWinner = raw === winner;
              return (
                <GlowBar
                  key={s.label}
                  label={s.label}
                  value={raw}
                  max={row.lowerBetter ? row.max : row.max}
                  color={s.color}
                  glow={s.glow}
                  unit={` ${row.unit}`}
                  animated
                  isWinner={isWinner}
                />
              );
            })}
          </div>
        );
      })}
      <div style={{ padding: "14px 16px", background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: 2 }}>
        <div style={{ fontSize: 10, color: "#444", fontFamily: "monospace", letterSpacing: 2, marginBottom: 10 }}>// VALUE VERDICT</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 11, fontFamily: "monospace", lineHeight: 1.8 }}>
          <div style={{ color: SYSTEMS.mine.color }}>▸ PLANNED delivers the best FPS-per-kr and TOPS-per-kr — highest value system</div>
          <div style={{ color: SYSTEMS.high.color }}>▸ HIGH-END is fastest overall but costs ~1.75× more than PLANNED for ~20% more FPS</div>
          <div style={{ color: SYSTEMS.old.color  }}>▸ OLD BEAST was solid for its time — PLANNED is faster in every metric for similar price</div>
          <div style={{ color: "#555"             }}>▸ OLD BEAST: 21,990 kr (Webhallen). PLANNED: 12,000 kr (parts). HIGH-END: 21,000 kr (Webhallen Config).</div>
        </div>
      </div>
    </div>
  );
};

// ── CUSTOM AI COMPARISON TAB ─────────────────────────────────────────────────
// ── CUSTOM COMPARISON COLORS ─────────────────────────────────────────────────
// Colors for the three systems in custom comparison results (amber/cyan/purple)
const C_COLORS = ["#F59E0B", "#06B6D4", "#A855F7"];
const C_GLOWS  = ["rgba(245,158,11,0.4)", "rgba(6,182,212,0.4)", "rgba(168,85,247,0.4)"];

// Builds the comparison prompt with reference data baked in so the AI can interpolate
// The JSON template is large (~2KB output) — max_tokens in runAI must accommodate this
const buildPrompt = (x, y, z) => `You are a PC hardware benchmark database. Output ONLY a JSON object. No prose, no markdown, no explanation, no code fences. Start your response with { and end with }. Output the COMPLETE JSON — do not stop early or truncate.

SYSTEMS TO ANALYSE:
A: ${x}
B: ${y}
C: ${z || "Ryzen 7 7800X3D + RTX 5070 + 32GB DDR5 — high-end 2025 gaming desktop"}

--- REFERENCE DATA (use these as anchors, interpolate for unlisted hardware) ---

3DMark TimeSpy GPU score:
GTX 1070=6500, GTX 1080=7500, GTX 1080Ti=8500, RTX 2070=9000, RTX 2080=10500, RTX 2080Ti=13000
RTX 3050(8GB)=6800, RTX 3060=9500, RTX 3060Ti=11500, RTX 3070=13000, RTX 3080=16000, RTX 3090=18000
RTX 4060=10500, RTX 4060Ti=13500, RTX 4070=17000, RTX 4070Ti=21000, RTX 4080=24000, RTX 4090=32000
RTX 5060Ti=18500, RTX 5070=22500, RTX 5080=28000
RX 6700XT=10500, RX 7600=9000, RX 7700XT=12500, RX 7800XT=14500, RX 9060XT=13500, RX 9070=19500, RX 9070XT=22000

Cinebench R23 MT (CPU):
i5-10400=10800, i5-12600K=15800, i7-7700K=4820, i7-9700K=8800, i7-12700K=20000, i7-13700K=24000
R5-3600=9800, R5-3600X=10200, R5-5500=11200, R5-5600=12500, R5-5600X=12800
R5-7500F=14500, R5-7600X=15240, R7-7800X3D=15080, R7-9800X3D=16800

1080p Cyberpunk 2077 Ultra FPS:
GTX1080Ti=55, RTX3050=45, RTX3060=60, RTX3060Ti=75, RTX3070=88, RTX3080=105
RTX4060=65, RTX4060Ti=82, RTX4070=100, RTX4070Ti=118, RTX4080=140, RTX4090=165
RTX5060Ti=98, RTX5070=125, RX7700XT=72, RX9060XT=78, RX9070=112

AI TOPS INT8 (Tensor/AI cores):
GTX1080Ti=22(no tensor), RTX3050=112, RTX3060=102, RTX3060Ti=136, RTX3070=163, RTX3080=238
RTX4060=194, RTX4060Ti=184, RTX4070=330, RTX4070Ti=641, RTX4080=780, RTX4090=1321
RTX5060Ti=612, RTX5070=838, RX7700XT=200, RX9060XT=350, RX9070=480

GPU Memory bandwidth GB/s:
GTX1080Ti=484, RTX3050=224, RTX3060=360, RTX3060Ti=448, RTX3070=448, RTX3080=760
RTX4060=272, RTX4060Ti=288, RTX4070=504, RTX4070Ti=672, RTX4080=717, RTX4090=1008
RTX5060Ti=480, RTX5070=672, RX7700XT=432, RX9060XT=384, RX9070=576

VRAM GB: GTX1080Ti=11, RTX3050=8, RTX3060=12, RTX3060Ti=8, RTX3070=8, RTX3080=10
RTX4060=8, RTX4060Ti=8or16, RTX4070=12, RTX4070Ti=12, RTX4080=16, RTX4090=24
RTX5060Ti=16, RTX5070=12, RX7700XT=12, RX9060XT=16, RX9070=16

Cyberpunk 1440p ≈ 65% of 1080p. Elden Ring 1080p ≈ 1.7×Cyberpunk. Fortnite ≈ 3×Cyberpunk. Warzone ≈ 2.2×Cyberpunk. RDR2 ≈ 1.4×Cyberpunk. Hogwarts≈1.1×Cyberpunk. BG3≈1.5×Cyberpunk. Starfield≈0.85×Cyberpunk.

LLM 7B tok/s: GTX1080Ti≈4(CUDA only), RTX3050≈8, RTX3060≈18, RTX3070≈28, RTX3080≈38, RTX4060Ti≈22, RTX4070≈45, RTX4080≈55, RTX5060Ti≈62, RTX5070≈85, RX9070≈42. OOM if VRAM<4GB for 7B quantised.
LLM 13B needs 8GB+ VRAM. SD1.5 img/s: GTX1080Ti≈1.8, RTX3050≈4, RTX3080≈10, RTX4070≈12, RTX5060Ti≈14, RTX5070≈19.
AnimateDiff needs 6GB+ VRAM. CogVideoX-5B needs 12GB+ VRAM.

Blender Classroom (GPU Cycles render, seconds lower=better): GTX1080Ti≈420, RTX3060≈280, RTX3070≈200, RTX4060Ti≈195, RTX4070≈145, RTX4080≈95, RTX5060Ti≈130, RTX5070≈90, RX9070≈120.
4K H.265 Export (seconds, 1min clip): GTX1080Ti≈180(CPU only), RTX3060≈55, RTX3070≈42, RTX4060Ti≈38, RTX4070≈30, RTX5060Ti≈28, RTX5070≈22. NVENC quality: Turing=good, Ampere=great, Ada/Blackwell=best.
DaVinci Resolve 4K timeline FPS: GTX1080Ti≈24, RTX3060≈45, RTX4060Ti≈55, RTX4070≈65, RTX5060Ti≈60, RTX5070≈75.
OBS streaming FPS overhead (1080p60 NVENC): ~2-5% with Turing+, ~15-20% without NVENC. x264 medium uses ~4 CPU threads.

System price_kr: full desktop system price in SEK at launch/peak. peak_year: year that GPU/CPU combo was considered best value.
GTX1080Ti systems≈20000-25000kr in 2017. RTX3080 systems≈25000-35000kr in 2021. RTX4070Ti systems≈25000-30000kr in 2023.

--- OUTPUT FORMAT (fill every 0 with a real number, all labels ≤12 chars ALL CAPS) ---

{"systems":{"a":{"label":"CURRENT","cpu":"exact model","gpu":"exact model","ram":"XGB DDRx","vram":"XGB","price_kr":0,"peak_year":0},"b":{"label":"UPGRADE","cpu":"exact model","gpu":"exact model","ram":"XGB DDRx","vram":"XGB","price_kr":0,"peak_year":0},"c":{"label":"REFERENCE","cpu":"exact model","gpu":"exact model","ram":"XGB DDRx","vram":"XGB","price_kr":0,"peak_year":0}},"fps_1080p":[{"game":"Cyberpunk 2077","a":0,"b":0,"c":0},{"game":"Elden Ring","a":0,"b":0,"c":0},{"game":"Fortnite","a":0,"b":0,"c":0},{"game":"CoD Warzone","a":0,"b":0,"c":0},{"game":"RDR2","a":0,"b":0,"c":0},{"game":"Hogwarts Legacy","a":0,"b":0,"c":0},{"game":"BG3","a":0,"b":0,"c":0},{"game":"Starfield","a":0,"b":0,"c":0}],"fps_1440p":[{"game":"Cyberpunk 2077","a":0,"b":0,"c":0},{"game":"Elden Ring","a":0,"b":0,"c":0},{"game":"Fortnite","a":0,"b":0,"c":0},{"game":"CoD Warzone","a":0,"b":0,"c":0},{"game":"RDR2","a":0,"b":0,"c":0},{"game":"Hogwarts Legacy","a":0,"b":0,"c":0},{"game":"BG3","a":0,"b":0,"c":0},{"game":"Starfield","a":0,"b":0,"c":0}],"benchmarks":[{"metric":"Cinebench R23 MT","unit":"pts","a":0,"b":0,"c":0,"max":20000},{"metric":"3DMark TimeSpy","unit":"pts","a":0,"b":0,"c":0,"max":25000},{"metric":"AI TOPS (INT8)","unit":"TOPS","a":0,"b":0,"c":0,"max":1000},{"metric":"VRAM","unit":"GB","a":0,"b":0,"c":0,"max":24},{"metric":"Mem Bandwidth","unit":"GB/s","a":0,"b":0,"c":0,"max":1100},{"metric":"Blender Render","unit":"sec","a":0,"b":0,"c":0,"max":500},{"metric":"4K H.265 Export","unit":"sec","a":0,"b":0,"c":0,"max":200},{"metric":"Handbrake 4K","unit":"sec","a":0,"b":0,"c":0,"max":300}],"radar":[{"subject":"1080p FPS","a":0,"b":0,"c":100},{"subject":"1440p FPS","a":0,"b":0,"c":100},{"subject":"CPU Score","a":0,"b":0,"c":100},{"subject":"GPU Score","a":0,"b":0,"c":100},{"subject":"AI Perf","a":0,"b":0,"c":100},{"subject":"VRAM","a":0,"b":0,"c":100},{"subject":"Memory BW","a":0,"b":0,"c":100}],"ai_workloads":[{"task":"LLM 7B (tok/s)","cat":"AI","a":"~0","b":"~0","c":"~0","aRaw":0,"bRaw":0,"cRaw":0,"max":100},{"task":"SD 1.5 (img/s)","cat":"AI","a":"0","b":"0","c":"0","aRaw":0,"bRaw":0,"cRaw":0,"max":20},{"task":"SDXL (img/s)","cat":"AI","a":"0","b":"0","c":"0","aRaw":0,"bRaw":0,"cRaw":0,"max":7},{"task":"AnimateDiff (f/min)","cat":"AI","a":"N/A","b":"0","c":"0","aRaw":0,"bRaw":0,"cRaw":0,"max":40},{"task":"CogVideoX-5B","cat":"AI","a":"OOM","b":"0","c":"0","aRaw":0,"bRaw":0,"cRaw":0,"max":100},{"task":"DaVinci 4K (FPS)","cat":"VIDEO","a":"0","b":"0","c":"0","aRaw":0,"bRaw":0,"cRaw":0,"max":80},{"task":"Premiere Export","cat":"VIDEO","a":"0","b":"0","c":"0","aRaw":0,"bRaw":0,"cRaw":0,"max":200},{"task":"Blender Cycles (s)","cat":"3D","a":"0","b":"0","c":"0","aRaw":0,"bRaw":0,"cRaw":0,"max":500},{"task":"OBS+Game FPS%","cat":"STREAM","a":"0","b":"0","c":"0","aRaw":0,"bRaw":0,"cRaw":0,"max":100}],"summary":"2-3 sentence verdict covering gaming, content creation, and value."}

Use N/A if a workload cannot run due to insufficient VRAM. Use OOM if VRAM is too small. radar values are 0-100 relative scores where system C=100 for each axis. All FPS values must be positive integers. For time-based metrics (Blender, Export, Handbrake), lower is better — set max to a reasonable ceiling. cat field groups workloads by category for display.`;

// Grouped bar chart for custom comparison FPS data (reused for 1080p and 1440p sub-tabs)
const CCustomFpsChart = ({ data, labels }) => (
  <ResponsiveContainer width="100%" height={340}>
    <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 56 }} barGap={3} barCategoryGap="25%">
      <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
      <XAxis dataKey="game" tick={{ fill: "#555", fontSize: 10, fontFamily: "monospace" }} angle={-35} textAnchor="end" interval={0} />
      <YAxis tick={{ fill: "#555", fontSize: 10, fontFamily: "monospace" }} label={{ value: "FPS", angle: -90, position: "insideLeft", fill: "#444", fontSize: 10, fontFamily: "monospace" }} />
      <Tooltip content={<CustomTooltip />} cursor={{ fill: "#ffffff08" }} />
      <Bar dataKey="a" name={labels.a} fill={C_COLORS[0]} radius={[2,2,0,0]} />
      <Bar dataKey="b" name={labels.b} fill={C_COLORS[1]} radius={[2,2,0,0]} />
      <Bar dataKey="c" name={labels.c} fill={C_COLORS[2]} radius={[2,2,0,0]} />
    </BarChart>
  </ResponsiveContainer>
);

// Spider/radar chart for custom comparison — shows relative scores across multiple axes
const CCustomRadar = ({ data, labels }) => (
  <ResponsiveContainer width="100%" height={380}>
    <RadarChart data={data} margin={{ top: 16, right: 40, bottom: 16, left: 40 }}>
      <PolarGrid stroke="#222" />
      <PolarAngleAxis dataKey="subject" tick={{ fill: "#666", fontSize: 11, fontFamily: "monospace" }} />
      <Radar name={labels.a} dataKey="a" stroke={C_COLORS[0]} fill={C_COLORS[0]} fillOpacity={0.12} strokeWidth={2} />
      <Radar name={labels.b} dataKey="b" stroke={C_COLORS[1]} fill={C_COLORS[1]} fillOpacity={0.15} strokeWidth={2} />
      <Radar name={labels.c} dataKey="c" stroke={C_COLORS[2]} fill={C_COLORS[2]} fillOpacity={0.12} strokeWidth={2} />
    </RadarChart>
  </ResponsiveContainer>
);

// Error Boundary: catches any React render crash in custom results and shows a
// styled error message instead of a black screen. React requires a class component for this.
class ResultsErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ marginTop: 28, padding: "16px 20px", background: "#1a0a0a", border: "1px solid #F59E0B44", borderRadius: 2, fontFamily: "monospace" }}>
          <div style={{ fontSize: 12, color: "#F59E0B", marginBottom: 6 }}>⚠ Comparison rendering failed</div>
          <div style={{ fontSize: 11, color: "#888", marginBottom: 10 }}>The AI response was incomplete or malformed. This usually happens with the free API.</div>
          <button onClick={() => this.setState({ hasError: false, error: null })} style={{ padding: "6px 14px", background: "#1a1a1a", border: "1px solid #333", color: "#aaa", fontFamily: "monospace", fontSize: 11, cursor: "pointer", borderRadius: 2 }}>
            ↻ Dismiss
          </button>
          <div style={{ fontSize: 9, color: "#333", marginTop: 8 }}>{this.state.error?.message}</div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Renders the AI-generated comparison results across all sub-tabs (FPS, Radar, Benchmarks, AI)
// Guard: returns error message if AI response was malformed instead of crashing to black screen
const CustomResults = ({ result }) => {
  const [sub, setSub] = useState("fps1080");
  // Destructure with empty-array fallbacks so partial AI responses don't crash the render
  const { systems, fps_1080p = [], fps_1440p = [], benchmarks = [], radar = [], ai_workloads = [], summary = "No summary available.", _meta } = result;
  // Safety check: if AI response is missing system data, show error instead of crashing
  if (!systems?.a?.label || !systems?.b?.label || !systems?.c?.label) {
    return (
      <div style={{ marginTop: 28, padding: "16px 20px", background: "#1a0a0a", border: "1px solid #F59E0B44", borderRadius: 2, fontFamily: "monospace" }}>
        <div style={{ fontSize: 12, color: "#F59E0B", marginBottom: 6 }}>⚠ Incomplete AI response</div>
        <div style={{ fontSize: 11, color: "#888" }}>The comparison data is missing or malformed. Please try running the comparison again.</div>
      </div>
    );
  }
  const labels = { a: systems.a.label, b: systems.b.label, c: systems.c.label };
  const sysArr = [
    { ...systems.a, color: C_COLORS[0], glow: C_GLOWS[0] },
    { ...systems.b, color: C_COLORS[1], glow: C_GLOWS[1] },
    { ...systems.c, color: C_COLORS[2], glow: C_GLOWS[2] },
  ];
  const subTabs = [
    { id: "fps1080", label: "1080p" }, { id: "fps1440", label: "1440p" },
    { id: "radar", label: "RADAR" }, { id: "bench", label: "BENCHMARKS" },
    { id: "ai", label: "WORKLOADS" }, { id: "value", label: "VALUE" },
  ];

  // Calculate price-per-performance for VALUE tab
  const getPrice = (key, i) => Number(_meta?.[i]?.price || result.systems[key]?.price_kr) || 0;
  const avgFps = (arr, key) => arr?.length ? Math.round(arr.reduce((s, r) => s + (r[key] || 0), 0) / arr.length) : 0;

  return (
    <div style={{ marginTop: 28, borderTop: "1px solid #1a1a1a", paddingTop: 24 }}>
      <div style={{ fontSize: 10, color: "#444", fontFamily: "monospace", letterSpacing: 3, marginBottom: 16 }}>// AI ANALYSIS RESULT</div>

      {/* Legend (system cards are now shown at the top of the page) */}
      <div style={{ display: "flex", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
        {sysArr.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontFamily: "monospace", color: s.color }}>
            <div style={{ width: 10, height: 10, background: s.color, borderRadius: 1 }} />
            {s.label}
          </div>
        ))}
      </div>

      {/* Sub-tabs */}
      <div style={{ display: "flex", gap: 2, marginBottom: 20, borderBottom: "1px solid #161616", flexWrap: "wrap" }}>
        {subTabs.map(t => {
          const active = sub === t.id;
          return (
            <button key={t.id} onClick={() => setSub(t.id)} style={{
              padding: "8px 16px", background: active ? "#111" : "transparent", border: "none",
              borderBottom: active ? `2px solid ${C_COLORS[1]}` : "2px solid transparent",
              color: active ? C_COLORS[1] : "#444", fontFamily: "monospace", fontSize: 10,
              letterSpacing: 2, cursor: "pointer", transition: "all 0.15s", outline: "none",
            }}
            onMouseEnter={e => { if (!active) e.currentTarget.style.color = "#888"; }}
            onMouseLeave={e => { if (!active) e.currentTarget.style.color = "#444"; }}>
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Sub-tab content */}
      {sub === "fps1080" && <CCustomFpsChart data={fps_1080p} labels={labels} />}
      {sub === "fps1440" && <CCustomFpsChart data={fps_1440p} labels={labels} />}
      {sub === "radar"   && <CCustomRadar data={radar} labels={labels} />}
      {sub === "bench"   && (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {benchmarks.map(b => {
            const maxVal = Math.max(b.a, b.b, b.c);
            return (
              <div key={b.metric}>
                <div style={{ fontSize: 10, color: "#555", fontFamily: "monospace", letterSpacing: 2, marginBottom: 8 }}>// {b.metric}</div>
                {sysArr.map((s, i) => {
                  const key = ["a","b","c"][i];
                  return <GlowBar key={i} label={s.label} value={b[key]} max={b.max} color={s.color} glow={s.glow} unit={` ${b.unit}`} isWinner={b[key] === maxVal} />;
                })}
              </div>
            );
          })}
        </div>
      )}
      {sub === "ai" && (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "monospace", fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #222" }}>
                <th style={{ textAlign: "left", color: "#444", padding: "6px 12px", fontWeight: 400, fontSize: 10, letterSpacing: 2 }}>WORKLOAD</th>
                {sysArr.map((s, i) => <th key={i} style={{ textAlign: "center", color: s.color, padding: "6px 12px", fontWeight: 400, fontSize: 10, letterSpacing: 2 }}>{s.label}</th>)}
              </tr>
            </thead>
            <tbody>
              {/* Group workloads by category (cat field) with section headers */}
              {ai_workloads.map((row, i) => {
                const maxRaw = Math.max(row.aRaw || 0, row.bRaw || 0, row.cRaw || 0);
                const prevCat = i > 0 ? ai_workloads[i - 1]?.cat : null;
                const showCatHeader = row.cat && row.cat !== prevCat;
                return (
                  <React.Fragment key={i}>
                    {showCatHeader && (
                      <tr>
                        <td colSpan={4} style={{ padding: "10px 12px 4px", fontSize: 9, color: "#555", letterSpacing: 3, fontFamily: "monospace", borderBottom: "1px solid #1a1a1a" }}>
                          // {row.cat}
                        </td>
                      </tr>
                    )}
                    <tr style={{ borderBottom: "1px solid #111" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#ffffff06"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <td style={{ padding: "10px 12px", color: "#888", fontSize: 11 }}>{row.task}</td>
                      {[{val:row.a,raw:row.aRaw,s:sysArr[0]},{val:row.b,raw:row.bRaw,s:sysArr[1]},{val:row.c,raw:row.cRaw,s:sysArr[2]}].map(({val,raw,s},j) => {
                        const isNA = val === "N/A" || val === "OOM";
                        const isMax = raw === maxRaw && raw > 0;
                        return (
                          <td key={j} style={{ padding: "10px 12px", textAlign: "center" }}>
                            <span style={{ color: isNA ? "#333" : s.color, fontWeight: isMax ? 700 : 400, fontSize: 13, textShadow: isMax ? `0 0 10px ${s.glow}` : "none" }}>
                              {val}{isMax && <span style={{ fontSize: 8, marginLeft: 4, color: "#FFD700" }}>▲</span>}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* VALUE tab — price/performance comparison */}
      {sub === "value" && (() => {
        const prices = ["a","b","c"].map((k, i) => getPrice(k, i));
        const fpsAvg = ["a","b","c"].map(k => avgFps(fps_1080p, k));
        const tscore = benchmarks?.find(b => b.metric?.includes("TimeSpy"));
        const metrics = [
          { label: "Avg 1080p FPS", values: fpsAvg, unit: "FPS" },
          { label: "3DMark TimeSpy", values: ["a","b","c"].map(k => tscore?.[k] || 0), unit: "pts" },
          { label: "FPS per 1000 kr", values: fpsAvg.map((f, i) => prices[i] > 0 ? Math.round(f / (prices[i] / 1000)) : 0), unit: "FPS/kkr" },
          { label: "TimeSpy per 1000 kr", values: ["a","b","c"].map((k, i) => prices[i] > 0 ? Math.round((tscore?.[k] || 0) / (prices[i] / 1000)) : 0), unit: "pts/kkr" },
        ];
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {metrics.map(m => {
              const maxVal = Math.max(...m.values);
              return (
                <div key={m.label}>
                  <div style={{ fontSize: 10, color: "#555", fontFamily: "monospace", letterSpacing: 2, marginBottom: 8 }}>// {m.label}</div>
                  {sysArr.map((s, i) => (
                    <GlowBar key={i} label={s.label} value={m.values[i]} max={maxVal * 1.2 || 1} color={s.color} glow={s.glow} unit={` ${m.unit}`} isWinner={m.values[i] === maxVal && maxVal > 0} />
                  ))}
                </div>
              );
            })}
            {prices.some(p => p === 0) && (
              <div style={{ fontSize: 10, color: "#444", fontFamily: "monospace" }}>
                ⚠ Some prices missing — fill in price fields for accurate value comparison
              </div>
            )}
          </div>
        );
      })()}

      {/* Summary */}
      <div style={{ marginTop: 24, padding: "14px 16px", background: "#0d0d0d", border: `1px solid ${C_COLORS[1]}22`, borderLeft: `3px solid ${C_COLORS[1]}`, borderRadius: 2 }}>
        <div style={{ fontSize: 10, color: C_COLORS[1], fontFamily: "monospace", letterSpacing: 2, marginBottom: 8 }}>// VERDICT</div>
        <div style={{ fontSize: 12, color: "#aaa", fontFamily: "monospace", lineHeight: 1.8 }}>{summary}</div>
      </div>
    </div>
  );
};

// ── SPEC EXTRACTION HELPERS ──────────────────────────────────────────────────
// ── URL & SPEC EXTRACTION UTILITIES ──────────────────────────────────────────
const isUrl = (s) => /^https?:\/\//i.test(s.trim());

// Known GPU VRAM specs — avoids needing to follow links to component pages
// VRAM size and type are fixed per GPU model, so we can look them up directly
const GPU_VRAM = {
  "GTX 1050": "2GB GDDR5", "GTX 1050 TI": "4GB GDDR5", "GTX 1060": "6GB GDDR5",
  "GTX 1070": "8GB GDDR5", "GTX 1070 TI": "8GB GDDR5", "GTX 1080": "8GB GDDR5X",
  "GTX 1080 TI": "11GB GDDR5X", "GTX 1650": "4GB GDDR6", "GTX 1660": "6GB GDDR5",
  "GTX 1660 SUPER": "6GB GDDR6", "GTX 1660 TI": "6GB GDDR6",
  "RTX 2060": "6GB GDDR6", "RTX 2060 SUPER": "8GB GDDR6", "RTX 2070": "8GB GDDR6",
  "RTX 2070 SUPER": "8GB GDDR6", "RTX 2080": "8GB GDDR6", "RTX 2080 SUPER": "8GB GDDR6",
  "RTX 2080 TI": "11GB GDDR6",
  "RTX 3050": "8GB GDDR6", "RTX 3060": "12GB GDDR6", "RTX 3060 TI": "8GB GDDR6",
  "RTX 3070": "8GB GDDR6", "RTX 3070 TI": "8GB GDDR6X", "RTX 3080": "10GB GDDR6X",
  "RTX 3080 TI": "12GB GDDR6X", "RTX 3090": "24GB GDDR6X", "RTX 3090 TI": "24GB GDDR6X",
  "RTX 4060": "8GB GDDR6", "RTX 4060 TI": "8GB GDDR6", "RTX 4070": "12GB GDDR6X",
  "RTX 4070 SUPER": "12GB GDDR6X", "RTX 4070 TI": "12GB GDDR6X",
  "RTX 4070 TI SUPER": "16GB GDDR6X", "RTX 4080": "16GB GDDR6X",
  "RTX 4080 SUPER": "16GB GDDR6X", "RTX 4090": "24GB GDDR6X",
  "RTX 5060": "8GB GDDR7", "RTX 5060 TI": "16GB GDDR7", "RTX 5070": "12GB GDDR7",
  "RTX 5070 TI": "16GB GDDR7", "RTX 5080": "16GB GDDR7", "RTX 5090": "32GB GDDR7",
  "RX 6600": "8GB GDDR6", "RX 6600 XT": "8GB GDDR6", "RX 6700 XT": "12GB GDDR6",
  "RX 6800": "16GB GDDR6", "RX 6800 XT": "16GB GDDR6", "RX 6900 XT": "16GB GDDR6",
  "RX 7600": "8GB GDDR6", "RX 7700 XT": "12GB GDDR6", "RX 7800 XT": "16GB GDDR6",
  "RX 7900 XT": "20GB GDDR6", "RX 7900 XTX": "24GB GDDR6",
  "RX 9060 XT": "16GB GDDR6", "RX 9070": "16GB GDDR6", "RX 9070 XT": "16GB GDDR6",
};

// Looks up VRAM from the GPU_VRAM table by matching the GPU model name
// Normalizes variants like "5070TI" → "5070 TI" and strips brand prefixes
const lookupVram = (gpuName) => {
  if (!gpuName) return null;
  const name = gpuName.toUpperCase()
    .replace(/GEFORCE\s*/i, "").replace(/RADEON\s*/i, "").replace(/ASUS|PRIME|MSI|GIGABYTE|EVGA|ZOTAC|INNO3D|OC\b/gi, "")
    .replace(/(\d)(TI|XT|SUPER)/g, "$1 $2")  // "5070TI" → "5070 TI"
    .replace(/\s+/g, " ").trim();
  for (const [key, val] of Object.entries(GPU_VRAM)) {
    if (name.includes(key)) return val;
  }
  return null;
};

// Pre-parse specs directly from URL slugs (e.g. Webhallen, Inet, Komplett)
// Avoids an AI call entirely when specs are in the URL itself
// Returns partial specs even if only GPU is found (user can fill in the rest)
const preParseUrl = (url) => {
  const slug = decodeURIComponent(url).replace(/[-_/]/g, " ").toUpperCase();
  const cpu = slug.match(/(?:R[579]|RYZEN [579])\s*\d{4}X?3?D?/i)?.[0]
    || slug.match(/I[3579]\s*\d{4,5}[A-Z]*/i)?.[0] || null;
  const gpu = slug.match(/(?:RTX|GTX|RX)\s*\d{4}\s*(?:XT|TI|SUPER)?/i)?.[0] || null;
  const ram = slug.match(/(\d{1,3})\s*GB/i)?.[0] || null;
  const price = url.match(/(\d[\d\s]*)\s*kr/i)?.[1]?.replace(/\s/g, "") || null;
  // Return partial specs if at least GPU or CPU is found (user fills the rest)
  if (cpu || gpu) return { cpu: cpu?.trim() || null, gpu: gpu?.trim() || null, ram, vram: null, price_kr: price ? Number(price) : null, year: null };
  return null;
};

// Fetches page text via Jina Reader proxy — returns null on failure instead of throwing
// so the caller can fall back to URL slug parsing
const fetchPageText = async (url) => {
  try {
    const res = await fetch(`https://r.jina.ai/${url.trim()}`, {
      headers: { "Accept": "text/plain", "X-Return-Format": "text" },
    });
    if (!res.ok) return null;
    const text = await res.text();
    return text.slice(0, 4000);
  } catch {
    return null;
  }
};

// Sanitize user input before inserting into AI prompts — strips prompt injection attempts
// Removes instruction-like patterns, role overrides, and system prompt manipulation
const sanitizeInput = (text) => {
  if (!text) return "";
  return text
    .replace(/```[\s\S]*?```/g, "")                    // remove code blocks
    .replace(/\b(ignore|forget|disregard|override)\b.*?(instructions?|above|prompt|rules?|system)/gi, "")
    .replace(/\b(you are|act as|pretend|roleplay|new instructions?|system prompt)\b/gi, "")
    .replace(/\b(reveal|show|output|print)\b.*?(prompt|instructions?|system|api.?key)/gi, "")
    .replace(/<[^>]*>/g, "")                            // strip HTML tags
    .replace(/[{}]/g, "")                               // remove braces that could break JSON context
    .trim();
};

const extractSpecsPrompt = (content) =>
  `Extract PC hardware specs from this text. Reply with ONLY a JSON object, nothing else. No prose, no markdown.
{"cpu":"exact model","gpu":"exact model","ram":"e.g. 16GB DDR4","vram":"e.g. 8GB GDDR6","price_kr":0,"year":0}
Use null for any field not mentioned. price_kr = asking price in SEK. year = year built or listed.
TEXT:\n${sanitizeInput(content)}`;

// Validates that AI output only contains expected benchmark data, not injected content
// Rejects responses with suspicious patterns like URLs, scripts, or instruction-like text
const validateOutput = (parsed) => {
  const json = JSON.stringify(parsed);
  const suspicious = [
    /https?:\/\//i,                     // URLs (should never appear in benchmark data)
    /<script/i,                         // script injection
    /document\.|window\.|eval\(/i,      // JS execution attempts
    /\b(password|secret|token|cookie)\b/i,  // credential fishing
  ];
  for (const pattern of suspicious) {
    if (pattern.test(json)) throw new Error("Response contained unexpected content and was rejected for safety.");
  }
  // Verify numeric fields are actually numbers, not strings with instructions
  if (parsed.fps_1080p) {
    for (const row of parsed.fps_1080p) {
      if (typeof row.a !== "number" || typeof row.b !== "number" || typeof row.c !== "number")
        throw new Error("Response contained non-numeric FPS values. Try again.");
    }
  }
};

// Extracts JSON from AI response text — finds first { to last } and strips any preamble/markdown
const extractJSON = (raw) => {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start !== -1 && end > start) return raw.slice(start, end + 1);
  throw new Error("No valid JSON found in AI response. Try again.");
};

// Sends prompt to AI API — uses Groq if API key provided, otherwise free Pollinations
// Pollinations returns either plain text or a chat completion JSON envelope — we handle both
// Retries once on 429 (rate limit) with a 3-second delay
const runAI = async (prompt, apiKey) => {
  // API priority: 1) User-provided key (Groq)  2) Built-in OpenRouter key  3) Free Pollinations
  const orKey = import.meta.env.VITE_OPENROUTER_KEY;
  let endpoint, model, authHeader;
  if (apiKey) {
    endpoint = "https://api.groq.com/openai/v1/chat/completions";
    model = "llama-3.3-70b-versatile";
    authHeader = `Bearer ${apiKey}`;
  } else if (orKey) {
    endpoint = "https://openrouter.ai/api/v1/chat/completions";
    model = "google/gemini-2.0-flash-lite-001"; // fast + cheap via OpenRouter
    authHeader = `Bearer ${orKey}`;
  } else {
    endpoint = "https://text.pollinations.ai/openai";
    model = "openai";
    authHeader = null;
  }
  const headers = { "Content-Type": "application/json" };
  if (authHeader) headers["Authorization"] = authHeader;
  const doFetch = () => fetch(endpoint, {
    method: "POST", headers,
    body: JSON.stringify({ model, temperature: 0.05, max_tokens: 4096, messages: [{ role: "user", content: prompt }] }),
  });
  let res = await doFetch();
  // Auto-retry once on rate limit (429) after a short wait
  if (res.status === 429) {
    await new Promise(r => setTimeout(r, 3000));
    res = await doFetch();
  }
  if (!res.ok) throw new Error(`API error ${res.status}. ${res.status === 429 ? "Rate limited — wait a minute and try again." : "Try again shortly."}`);
  // All three APIs return OpenAI chat completion format
  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
};

// Extracts hardware specs from text or URL input
// Priority: 1) Pre-parse URL slug  2) Fetch page via Jina + AI  3) Fall back to slug partial
// Auto-fills VRAM from GPU_VRAM lookup table if missing (avoids needing subcomponent pages)
const extractSpecs = async (input, apiKey) => {
  if (!input?.trim()) return null;
  let content = input.trim();
  if (isUrl(content)) {
    // Try to parse specs directly from URL slug (e.g. Webhallen product URLs)
    const preParsed = preParseUrl(content);
    if (preParsed) {
      if (!preParsed.vram) preParsed.vram = lookupVram(preParsed.gpu);
      return preParsed;
    }
    // URL didn't have recognizable specs — try fetching the page
    const pageText = await fetchPageText(content);
    if (pageText) {
      content = pageText;
    } else {
      // Jina failed — use the URL itself as text input for AI
      content = decodeURIComponent(content).replace(/[-_/]/g, " ");
    }
  }
  const raw = await runAI(extractSpecsPrompt(content.slice(0, 3000)), apiKey);
  const specs = JSON.parse(extractJSON(raw));
  // Auto-fill VRAM from known GPU specs if AI didn't extract it
  if (!specs.vram && specs.gpu) specs.vram = lookupVram(specs.gpu);
  return specs;
};

// Converts extracted specs object to a readable string for the comparison prompt
const specsToString = (s) => {
  if (!s) return null;
  const parts = [s.cpu, s.gpu, s.ram, s.vram && `${s.vram} VRAM`].filter(Boolean);
  if (s.price_kr) parts.push(`${Number(s.price_kr).toLocaleString()} kr`);
  if (s.year) parts.push(String(s.year));
  return parts.join(", ");
};

// Price threshold for auto-selecting high-end reference tier from refs.json
const TEMPLATE_HIGH_END_PRICE = 21000;

// Auto-selects a high-end reference system based on planned purchase price
// Uses tiers from refs.json (updated monthly): tier1 <16k, tier2 <22k, tier3 <30k
const getHighEndRef = (plannedPrice) => {
  const p = Number(plannedPrice) || 0;
  const targetKr = p >= TEMPLATE_HIGH_END_PRICE ? p + 5000 : 15000;
  if (targetKr <= 16000) return REFS.tier1;
  if (targetKr <= 22000) return REFS.tier2;
  if (targetKr <= 30000) return REFS.tier3;
  const yr = (REFS.updated || "2025").slice(0, 4);
  return `AMD Ryzen 7 9800X3D, RTX 5080 16GB GDDR7, 32GB DDR5, 2TB NVMe SSD, Windows 11, ~${targetKr} kr, ${yr}`;
};

// ─────────────────────────────────────────────────────────────────────────────
// onResult callback: notifies parent App when comparison completes, so top cards can update
const CustomTab = ({ defaultOldSpec = "", onResult = null }) => {
  const [systems, setSystems] = useState([
    { text: "", price: "", year: "" },
    { text: "", price: "", year: "" },
    { text: "", price: "", year: "" },
  ]);
  const updateSys = (i, field, val) => setSystems(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: val } : s));
  const [apiKey, setApiKey] = useState(() => { try { return localStorage.getItem("gemini_key") || ""; } catch { return ""; } });
  const [showKeyField, setShowKeyField] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  // Progress bar: 0-100, advances through stages as extraction/comparison progresses
  // Uses a simulated tick that slowly fills during API waits to show activity
  const [progress, setProgress] = useState(0);
  const [progressTimer, setProgressTimer] = useState(null);
  // Starts a slow animated fill from current to target (never reaches target — waits for real update)
  const simulateProgress = (from, ceiling) => {
    if (progressTimer) clearInterval(progressTimer);
    let val = from;
    const id = setInterval(() => {
      val += (ceiling - val) * 0.03; // exponential slowdown — approaches but never reaches ceiling
      setProgress(Math.round(val));
    }, 200);
    setProgressTimer(id);
  };
  const stopSimulation = () => { if (progressTimer) { clearInterval(progressTimer); setProgressTimer(null); } };
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  // Debug mode: shows raw AI responses and parsing details when toggled on
  const [debug, setDebug] = useState(false);
  const [debugLog, setDebugLog] = useState([]);
  const addDebug = (msg) => setDebugLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  // Extracted specs preview state
  const [extracted, setExtracted] = useState(null); // [{cpu,gpu,ram,vram,price_kr,year}, ...]
  const [editedSpecs, setEditedSpecs] = useState(null); // user-edited version

  const saveKey = (v) => { setApiKey(v); try { localStorage.setItem("gemini_key", v); } catch {} };

  const REQUIRED = ["cpu", "gpu"];

  const hasMissing = (specs) => specs?.some(s => s && REQUIRED.some(f => !s[f]));

  const [highEndRef, setHighEndRef] = useState("");

  const handleExtract = async () => {
    if (!systems[1].text.trim()) { setError("Enter your planned purchase."); return; }
    setLoading(true); setError(null); setResult(null); setExtracted(null); setDebugLog([]); setProgress(0);
    const key = apiKey.trim();
    const sysAInput = systems[0].text.trim() || defaultOldSpec;
    try {
      setLoadingMsg("Extracting specs...");
      setProgress(5); simulateProgress(5, 35);
      addDebug(`Extracting System A: "${sysAInput.slice(0, 80)}..."`);
      addDebug(`Extracting System B: "${systems[1].text.slice(0, 80)}..."`);
      const [specsA, specsB] = await Promise.all([
        extractSpecs(sysAInput, key),
        extractSpecs(systems[1].text, key),
      ]);
      stopSimulation(); setProgress(25); simulateProgress(25, 40);
      addDebug(`System A specs: ${JSON.stringify(specsA)}`);
      addDebug(`System B specs: ${JSON.stringify(specsB)}`);

      const sysCText = getHighEndRef(systems[1].price || specsB?.price_kr);
      setHighEndRef(sysCText);
      addDebug(`System C auto-ref: "${sysCText}"`);
      const specsC = await extractSpecs(sysCText, key);
      stopSimulation(); setProgress(40);
      addDebug(`System C specs: ${JSON.stringify(specsC)}`);

      const specs = [specsA, specsB, specsC];
      setExtracted(specs);
      setEditedSpecs(specs.map(s => ({ cpu: "", gpu: "", ram: "", vram: "", price_kr: "", year: "", ...s })));
      addDebug("Extraction complete — ready for comparison");
    } catch (e) {
      addDebug(`EXTRACT ERROR: ${e.message}`);
      setError(e.message);
    } finally {
      stopSimulation();
      setLoading(false);
      setLoadingMsg("");
    }
  };

  const handleCompare = async () => {
    setLoading(true); setError(null); stopSimulation(); setProgress(50);
    const key = apiKey.trim();
    try {
      const mergedMeta = editedSpecs.map((s, i) => ({
        price: systems[i].price || s?.price_kr,
        year:  systems[i].year  || s?.year,
      }));
      const cleanA = sanitizeInput(specsToString(editedSpecs[0]) || systems[0].text.trim() || defaultOldSpec);
      const cleanB = sanitizeInput(specsToString(editedSpecs[1]) || systems[1].text);
      const cleanC = editedSpecs[2] ? sanitizeInput(specsToString(editedSpecs[2])) : null;
      addDebug(`Compare inputs — A: "${cleanA}" | B: "${cleanB}" | C: "${cleanC}"`);
      setProgress(60); simulateProgress(60, 95); // slow fill during API wait
      // Try up to 2 times — free API sometimes truncates the large JSON response
      let parsed = null;
      for (let attempt = 1; attempt <= 2; attempt++) {
        setLoadingMsg(attempt === 1 ? "Running benchmark comparison..." : "Response was incomplete, retrying...");
        addDebug(`Comparison attempt ${attempt}...`);
        const raw = await runAI(buildPrompt(cleanA, cleanB, cleanC), key);
        addDebug(`Raw response length: ${raw.length} chars`);
        addDebug(`Response starts: ${raw.slice(0, 100)}...`);
        addDebug(`Response ends: ...${raw.slice(-100)}`);
        try {
          const json = extractJSON(raw);
          addDebug(`Extracted JSON length: ${json.length} chars`);
          parsed = JSON.parse(json);
          // Validate AI response has required structure before rendering
          if (parsed.systems?.a?.label && parsed.systems?.b?.label && parsed.systems?.c?.label) {
            validateOutput(parsed);  // reject suspicious/injected content
            addDebug(`Validation passed — systems: ${parsed.systems.a.label}, ${parsed.systems.b.label}, ${parsed.systems.c.label}`);
            break;
          }
          addDebug(`Validation FAILED — missing system labels`);
          parsed = null; // incomplete, retry
        } catch (parseErr) {
          addDebug(`JSON parse error: ${parseErr.message}`);
          parsed = null;
        }
        if (attempt === 2 && !parsed)
          throw new Error("AI returned incomplete data after 2 attempts. Try again, or use a Groq API key for more reliable results.");
      }
      stopSimulation(); setProgress(100);
      parsed._meta = mergedMeta;
      setResult(parsed);
      if (onResult) onResult(parsed); // notify parent to update top cards
    } catch (e) {
      setError(e.message);
    } finally {
      stopSimulation();
      setLoading(false);
      setLoadingMsg("");
    }
  };

  const updateExtracted = (i, field, val) =>
    setEditedSpecs(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: val } : s));

  const inputStyle = {
    width: "100%", background: "#0d0d0d", border: "1px solid #2a2a2a", color: "#ccc",
    fontFamily: "monospace", fontSize: 12, padding: "10px 12px", borderRadius: 2, resize: "vertical", outline: "none",
  };
  const labelStyle = { fontSize: 10, color: "#555", fontFamily: "monospace", letterSpacing: 2, marginBottom: 6, display: "block" };

  return (
    <div>
      <div style={{ fontSize: 11, color: "#555", fontFamily: "monospace", marginBottom: 20, lineHeight: 1.8 }}>
        Just enter what you're planning to buy — the AI handles the rest. Paste a product link, a name, or any description. No account or API key required.
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

        {/* System B — required, most prominent */}
        <div>
          <label style={{ ...labelStyle, color: C_COLORS[1], fontSize: 11 }}>
            WHAT ARE YOU PLANNING TO BUY? <span style={{ color: C_COLORS[1] }}>*</span>
          </label>
          <textarea rows={3} value={systems[1].text} onChange={e => updateSys(1, "text", e.target.value)}
            placeholder="Paste specs, product name, or a link — e.g. https://www.blocket.se/... or 'RTX 4070, Ryzen 5 7600X, 32GB DDR5'"
            style={{ ...inputStyle, borderColor: systems[1].text ? `${C_COLORS[1]}66` : "#2a2a2a", fontSize: 12 }}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey && !loading && !extracted) { e.preventDefault(); handleExtract(); } }}
            onFocus={e => e.target.style.borderColor = `${C_COLORS[1]}99`}
            onBlur={e => e.target.style.borderColor = systems[1].text ? `${C_COLORS[1]}66` : "#2a2a2a"}
          />
          <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
            <input type="number" value={systems[1].price} onChange={e => updateSys(1, "price", e.target.value)}
              placeholder="Price (kr) — optional" style={{ ...inputStyle, flex: 2, resize: "none", fontSize: 11, padding: "6px 10px" }} />
            <input type="number" value={systems[1].year} onChange={e => updateSys(1, "year", e.target.value)}
              placeholder="Year — optional" style={{ ...inputStyle, flex: 1, resize: "none", fontSize: 11, padding: "6px 10px" }} />
          </div>
        </div>

        {/* System A — optional */}
        <div>
          <label style={{ ...labelStyle, color: C_COLORS[0], textShadow: `0 0 8px ${C_GLOWS[0]}` }}>CURRENT SETUP  (optional — leave blank to use template baseline)</label>
          <textarea rows={2} value={systems[0].text} onChange={e => updateSys(0, "text", e.target.value)}
            placeholder={`Leave blank to compare against: ${defaultOldSpec || "default baseline"}`}
            style={{ ...inputStyle, borderColor: systems[0].text ? `${C_COLORS[0]}33` : "#1a1a1a", fontSize: 11 }}
            onFocus={e => e.target.style.borderColor = `${C_COLORS[0]}66`}
            onBlur={e => e.target.style.borderColor = systems[0].text ? `${C_COLORS[0]}33` : "#1a1a1a"}
          />
          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            <input type="number" value={systems[0].price} onChange={e => updateSys(0, "price", e.target.value)}
              placeholder="Price (kr)" style={{ ...inputStyle, flex: 2, resize: "none", fontSize: 10, padding: "5px 8px" }} />
            <input type="number" value={systems[0].year} onChange={e => updateSys(0, "year", e.target.value)}
              placeholder="Year" style={{ ...inputStyle, flex: 1, resize: "none", fontSize: 10, padding: "5px 8px" }} />
          </div>
        </div>

        {/* API Key — optional override */}
        <div>
          <button onClick={() => setShowKeyField(v => !v)} style={{ background: "none", border: "none", color: "#333", fontFamily: "monospace", fontSize: 10, cursor: "pointer", letterSpacing: 2, padding: 0 }}>
            {showKeyField ? "▼" : "▶"} USE YOUR OWN API KEY (optional — faster / higher limits)
          </button>
          {showKeyField && (
            <div style={{ marginTop: 8 }}>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type={showKey ? "text" : "password"}
                  value={apiKey}
                  onChange={e => saveKey(e.target.value)}
                  placeholder="AIza... — overrides built-in key"
                  style={{ ...inputStyle, flex: 1, resize: "none" }}
                />
                <button onClick={() => setShowKey(v => !v)} style={{ padding: "0 14px", background: "#111", border: "1px solid #2a2a2a", color: "#555", fontFamily: "monospace", fontSize: 11, cursor: "pointer", borderRadius: 2 }}>
                  {showKey ? "HIDE" : "SHOW"}
                </button>
              </div>
              <div style={{ fontSize: 10, color: "#333", fontFamily: "monospace", marginTop: 4 }}>
                Groq key (no credit card) — &nbsp;
                <a href="https://console.groq.com" target="_blank" rel="noreferrer" style={{ color: C_COLORS[1], textDecoration: "none" }}>
                  ↗ console.groq.com
                </a>
                &nbsp; · Stored in browser only.
              </div>
            </div>
          )}
        </div>

        {/* Prompt preview + Debug toggle */}
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          <button onClick={() => setShowPrompt(v => !v)} style={{ background: "none", border: "none", color: "#444", fontFamily: "monospace", fontSize: 10, cursor: "pointer", letterSpacing: 2, padding: 0 }}>
            {showPrompt ? "▼" : "▶"} VIEW AI PROMPT TEMPLATE
          </button>
          <button onClick={() => setDebug(v => !v)} style={{ background: "none", border: "none", color: debug ? "#F59E0B" : "#333", fontFamily: "monospace", fontSize: 10, cursor: "pointer", letterSpacing: 2, padding: 0 }}>
            {debug ? "▼" : "▶"} DEBUG MODE
          </button>
        </div>
          {showPrompt && (
            <pre style={{ marginTop: 10, padding: "12px 14px", background: "#080808", border: "1px solid #1a1a1a", borderRadius: 2, fontSize: 10, color: "#444", fontFamily: "monospace", whiteSpace: "pre-wrap", lineHeight: 1.6, maxHeight: 240, overflowY: "auto" }}>
              {buildPrompt("[SYSTEM A]", "[SYSTEM B]", "[SYSTEM C]")}
            </pre>
          )}
        </div>

        {/* Step 1 button */}
        {!extracted && (
          <button onClick={handleExtract} disabled={loading} style={{
            padding: "12px 24px", background: loading ? "#111" : `linear-gradient(135deg, ${C_COLORS[1]}22, ${C_COLORS[1]}11)`,
            border: `1px solid ${C_COLORS[1]}${loading ? "22" : "66"}`, color: loading ? "#444" : C_COLORS[1],
            fontFamily: "monospace", fontSize: 12, letterSpacing: 3, cursor: loading ? "not-allowed" : "pointer",
            borderRadius: 2, transition: "all 0.2s", alignSelf: "flex-start",
          }}>
            {loading ? (loadingMsg || "▸ EXTRACTING...") : "▸ EXTRACT SPECS"}
          </button>
        )}

        {/* Battery-style progress bar — green fill that advances through stages */}
        {loading && progress > 0 && (
          <div style={{ width: "100%", marginTop: 4 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                flex: 1, height: 18, background: "#0a0a0a", border: "2px solid #2a2a2a",
                borderRadius: 3, overflow: "hidden", position: "relative",
              }}>
                {/* Battery terminal nub */}
                <div style={{ position: "absolute", right: -6, top: 4, width: 4, height: 10, background: "#2a2a2a", borderRadius: "0 2px 2px 0" }} />
                {/* Segmented battery cells */}
                <div style={{ display: "flex", gap: 2, padding: 2, height: "100%" }}>
                  {Array.from({ length: 10 }, (_, i) => {
                    const filled = progress >= (i + 1) * 10;
                    const partial = !filled && progress > i * 10;
                    const green = progress < 30 ? "#F59E0B" : progress < 70 ? "#84CC16" : "#22C55E";
                    return (
                      <div key={i} style={{
                        flex: 1, borderRadius: 1,
                        background: filled ? green : partial ? `${green}66` : "#111",
                        boxShadow: filled ? `0 0 6px ${green}44` : "none",
                        transition: "background 0.3s, box-shadow 0.3s",
                      }} />
                    );
                  })}
                </div>
              </div>
              <span style={{ fontSize: 10, color: "#555", fontFamily: "monospace", minWidth: 36 }}>{progress}%</span>
            </div>
            <div style={{ fontSize: 9, color: "#444", fontFamily: "monospace", letterSpacing: 2, marginTop: 4 }}>
              {loadingMsg}
            </div>
          </div>
        )}

        {/* Step 2: Extracted specs preview + missing field prompts */}
        {extracted && editedSpecs && !result && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ fontSize: 10, color: C_COLORS[1], fontFamily: "monospace", letterSpacing: 3 }}>
              // EXTRACTED SPECS — fill in any missing fields marked ⚠
            </div>
            {highEndRef && (
              <div style={{ padding: "8px 12px", background: `${C_COLORS[2]}11`, border: `1px solid ${C_COLORS[2]}33`, borderRadius: 2, fontSize: 11, color: C_COLORS[2], fontFamily: "monospace" }}>
                ✦ HIGH-END REFERENCE AUTO-ADDED: {highEndRef}
              </div>
            )}
            {editedSpecs.map((s, i) => {
              if (!s && i === 2) return null;
              const sysLabel = ["A — CURRENT", "B — PLANNED", "C — REFERENCE"][i];
              const color = C_COLORS[i];
              const fields = [
                { key: "cpu",  label: "CPU"  },
                { key: "gpu",  label: "GPU"  },
                { key: "ram",  label: "RAM"  },
                { key: "vram", label: "VRAM" },
              ];
              return (
                <div key={i} style={{ padding: "14px 16px", background: "#0d0d0d", border: `1px solid ${color}33`, borderLeft: `3px solid ${color}`, borderRadius: 2 }}>
                  <div style={{ fontSize: 10, color, fontFamily: "monospace", letterSpacing: 2, marginBottom: 10 }}>{sysLabel}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {fields.map(({ key, label }) => {
                      const missing = !s?.[key];
                      return (
                        <div key={key} style={{ flex: "1 1 160px" }}>
                          <div style={{ fontSize: 9, color: missing ? "#F59E0B" : "#444", fontFamily: "monospace", marginBottom: 3 }}>
                            {missing ? `⚠ ${label} — please fill in` : label}
                          </div>
                          <input
                            value={editedSpecs[i]?.[key] || ""}
                            onChange={e => updateExtracted(i, key, e.target.value)}
                            placeholder={missing ? `Enter ${label}...` : ""}
                            style={{
                              width: "100%", background: missing ? "#1a0f00" : "#111",
                              border: `1px solid ${missing ? "#F59E0B44" : "#222"}`,
                              color: missing ? "#F59E0B" : "#aaa",
                              fontFamily: "monospace", fontSize: 11, padding: "5px 8px", borderRadius: 2, outline: "none",
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                  {(s?.price_kr || s?.year) && (
                    <div style={{ fontSize: 10, color: "#444", fontFamily: "monospace", marginTop: 8 }}>
                      {s.price_kr && `≈${Number(s.price_kr).toLocaleString()} kr`}{s.price_kr && s.year && " · "}{s.year && String(s.year)}
                    </div>
                  )}
                </div>
              );
            })}
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={handleCompare} disabled={loading} style={{
                padding: "12px 24px", background: loading ? "#111" : `linear-gradient(135deg, ${C_COLORS[1]}22, ${C_COLORS[1]}11)`,
                border: `1px solid ${C_COLORS[1]}${loading ? "22" : "66"}`, color: loading ? "#444" : C_COLORS[1],
                fontFamily: "monospace", fontSize: 12, letterSpacing: 3, cursor: loading ? "not-allowed" : "pointer",
                borderRadius: 2, transition: "all 0.2s",
              }}>
                {loading ? (loadingMsg || "▸ COMPARING...") : "▸ RUN COMPARISON"}
              </button>
              <button onClick={() => { setExtracted(null); setEditedSpecs(null); }} style={{
                padding: "12px 16px", background: "transparent", border: "1px solid #2a2a2a",
                color: "#444", fontFamily: "monospace", fontSize: 11, cursor: "pointer", borderRadius: 2,
              }}>
                ← BACK
              </button>
            </div>
          </div>
        )}

        {error && (
          <div style={{ padding: "10px 14px", background: "#1a0a0a", border: "1px solid #F59E0B44", borderRadius: 2, fontSize: 11, color: "#F59E0B", fontFamily: "monospace" }}>
            ⚠ {error}
          </div>
        )}

        {result && <ResultsErrorBoundary><CustomResults result={result} /></ResultsErrorBoundary>}

        {/* Debug panel: shows raw AI responses, parsing steps, and errors */}
        {debug && debugLog.length > 0 && (
          <div style={{ marginTop: 16, padding: "12px 14px", background: "#0a0a00", border: "1px solid #F59E0B22", borderRadius: 2 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 10, color: "#F59E0B", fontFamily: "monospace", letterSpacing: 2 }}>// DEBUG LOG</span>
              <button onClick={() => setDebugLog([])} style={{ background: "none", border: "1px solid #333", color: "#555", fontFamily: "monospace", fontSize: 9, cursor: "pointer", padding: "2px 8px", borderRadius: 2 }}>CLEAR</button>
            </div>
            <pre style={{ fontSize: 10, color: "#888", fontFamily: "monospace", whiteSpace: "pre-wrap", lineHeight: 1.6, maxHeight: 300, overflowY: "auto", margin: 0 }}>
              {debugLog.join("\n")}
            </pre>
          </div>
        )}
    </div>
  );
};

// ── TABS CONFIG ───────────────────────────────────────────────────────────────
const TABS = [
  { id: "fps1080", label: "1080p FPS",  icon: "◈" },
  { id: "fps1440", label: "1440p FPS",  icon: "◈" },
  { id: "radar",   label: "RADAR",      icon: "◉" },
  { id: "bench",   label: "BENCHMARKS", icon: "▣" },
  { id: "ai",      label: "AI MATRIX",  icon: "◆" },
  { id: "power",   label: "POWER",      icon: "⚡" },
  { id: "value",   label: "VALUE",      icon: "◎" },
];

// ── SCANLINE OVERLAY ──────────────────────────────────────────────────────────
const Scanlines = () => (
  <div style={{
    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
    backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)",
    pointerEvents: "none", zIndex: 9999,
  }} />
);

// ── MAIN DASHBOARD ────────────────────────────────────────────────────────────
const OLD_BEAST_SPEC = `Intel Core i7-7700K, NVIDIA GeForce GTX 1080 Ti 11GB, 16GB DDR4, purchased 2017 for 21,990 kr`;

export default function App() {
  const [tab, setTab] = useState("fps1080");
  const [tick, setTick] = useState(0);
  const [showCustom, setShowCustom] = useState(false);
  // When a custom comparison completes, this holds the result — top cards switch to show it
  const [customResult, setCustomResult] = useState(null);

  useEffect(() => {
    const t = setInterval(() => setTick(x => (x + 1) % 100), 50);
    return () => clearInterval(t);
  }, []);

  const renderContent = () => {
    switch (tab) {
      case "fps1080": return <FpsTab data={FPS_1080P} />;
      case "fps1440": return <FpsTab data={FPS_1440P} />;
      case "radar":   return <RadarTab />;
      case "bench":   return <BenchmarksTab />;
      case "ai":      return <AiTab />;
      case "power":   return <PowerTab />;
      case "value":   return <ValueTab />;
      default:        return null;
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#060606", color: "#ccc", fontFamily: "monospace" }}>
      <Scanlines />

      {/* ── HEADER ── */}
      <div style={{
        borderBottom: "1px solid #1a1a1a",
        padding: "20px 32px",
        background: "linear-gradient(180deg, #0d0d0d 0%, #060606 100%)",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontSize: 10, color: "#333", letterSpacing: 4, marginBottom: 4 }}>
              HARDWARE INTELLIGENCE TERMINAL v2.5.0
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#fff", letterSpacing: 2 }}>
              <span style={{ color: customResult ? C_COLORS[0] : SYSTEMS.old.color }}>{customResult?.systems?.a?.label || "OLD"}</span>
              <span style={{ color: "#222", margin: "0 10px" }}>vs</span>
              <span style={{ color: customResult ? C_COLORS[1] : SYSTEMS.mine.color }}>{customResult?.systems?.b?.label || "PLANNED"}</span>
              <span style={{ color: "#222", margin: "0 10px" }}>vs</span>
              <span style={{ color: customResult ? C_COLORS[2] : SYSTEMS.high.color }}>{customResult?.systems?.c?.label || "HIGH-END"}</span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ display: "flex", gap: 8 }}>
              {[SYSTEMS.old.color, SYSTEMS.mine.color, SYSTEMS.high.color].map((c, i) => (
                <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: c, boxShadow: `0 0 6px ${c}`, opacity: 0.8 + Math.sin((tick + i * 33) * 0.2) * 0.2 }} />
              ))}
            </div>
            <div style={{ fontSize: 10, color: "#333", letterSpacing: 2 }}>
              {new Date().toISOString().slice(0, 19).replace("T", " ")} UTC
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 24px" }}>

        {/* ── SYSTEM CARDS — show custom comparison results if available, otherwise template ── */}
        <div style={{ display: "flex", gap: 16, marginBottom: 28, flexWrap: "wrap" }}>
          {customResult?.systems ? (
            ["a", "b", "c"].map((key, i) => {
              const s = customResult.systems[key];
              const color = C_COLORS[i];
              const glow = C_GLOWS[i];
              const meta = customResult._meta?.[i];
              return (
                <div key={key} style={{
                  border: `1px solid ${color}44`, borderTop: `3px solid ${color}`,
                  background: `linear-gradient(135deg, #0d0d0d 0%, ${color}15 100%)`,
                  padding: "16px 20px", borderRadius: 2, flex: 1, minWidth: 200, position: "relative", overflow: "hidden",
                }}>
                  <div style={{ position: "absolute", top: 0, right: 0, width: 60, height: 60, background: `radial-gradient(circle at top right, ${glow}, transparent 70%)`, pointerEvents: "none" }} />
                  <div style={{ fontSize: 10, color, letterSpacing: 4, marginBottom: 6, fontFamily: "monospace" }}>SYS::{key.toUpperCase()}</div>
                  <div style={{ fontSize: 16, color: "#fff", fontFamily: "monospace", fontWeight: 700, marginBottom: 10, textShadow: `0 0 12px ${glow}` }}>{s.label}</div>
                  {[["CPU", s.cpu], ["GPU", s.gpu], ["RAM", s.ram], ["VRAM", s.vram]].map(([k, v]) => (
                    <div key={k} style={{ display: "flex", gap: 8, fontSize: 11, fontFamily: "monospace", marginBottom: 3 }}>
                      <span style={{ color, minWidth: 40 }}>{k}</span>
                      <span style={{ color: "#ccc" }}>{v}</span>
                    </div>
                  ))}
                  {(meta?.price || s.price_kr || meta?.year || s.peak_year) && (
                    <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #1a1a1a", fontSize: 10, fontFamily: "monospace", color: "#555" }}>
                      {(meta?.price || s.price_kr) && `≈${Number(meta?.price || s.price_kr).toLocaleString()} kr`}
                      {(meta?.price || s.price_kr) && (meta?.year || s.peak_year) && " · "}
                      {(meta?.year || s.peak_year) && `${meta?.year || s.peak_year}`}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            Object.entries(SYSTEMS).map(([k, s]) => <SystemCard key={k} id={k} sys={s} />)
          )}
        </div>
        {/* Reset button: restore template cards */}
        {customResult && (
          <button onClick={() => setCustomResult(null)} style={{
            marginBottom: 16, padding: "6px 14px", background: "transparent", border: "1px solid #333",
            color: "#555", fontFamily: "monospace", fontSize: 10, cursor: "pointer", borderRadius: 2, letterSpacing: 2,
          }}>↻ RESET TO TEMPLATE</button>
        )}

        {/* ── CUSTOM COMPARE CTA ── */}
        <div style={{ marginBottom: 24 }}>
          <button
            onClick={() => setShowCustom(v => !v)}
            style={{
              width: "100%", padding: "18px 24px",
              background: showCustom ? "#0d0d0d" : `linear-gradient(135deg, #0d0d0d 0%, ${SYSTEMS.mine.color}11 100%)`,
              border: `1px solid ${SYSTEMS.mine.color}${showCustom ? "66" : "33"}`,
              borderLeft: `4px solid ${SYSTEMS.mine.color}`,
              color: SYSTEMS.mine.color, fontFamily: "monospace", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              transition: "all 0.2s", outline: "none", borderRadius: 2,
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = SYSTEMS.mine.color}
            onMouseLeave={e => e.currentTarget.style.borderColor = `${SYSTEMS.mine.color}${showCustom ? "66" : "33"}`}
          >
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 4 }}>
              <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: 3 }}>✦ COMPARE YOUR OWN SETUP</span>
              <span style={{ fontSize: 10, color: "#555", letterSpacing: 2 }}>
                Enter any specs or link — AI generates a full performance comparison
              </span>
            </div>
            <span style={{ fontSize: 18, transition: "transform 0.2s", transform: showCustom ? "rotate(90deg)" : "none" }}>▶</span>
          </button>

          {showCustom && (
            <div style={{
              marginTop: 2, padding: "24px",
              background: "#0a0a0a", border: `1px solid ${SYSTEMS.mine.color}22`,
              borderTop: "none", borderRadius: "0 0 2px 2px",
            }}>
              <CustomTab defaultOldSpec={OLD_BEAST_SPEC} onResult={setCustomResult} />
            </div>
          )}
        </div>

        {/* ── TAB NAV + CONTENT — hidden when custom comparison replaces template data ── */}
        {!customResult && <React.Fragment>
        <div style={{ display: "flex", gap: 2, marginBottom: 24, borderBottom: "1px solid #161616", flexWrap: "wrap" }}>
          {TABS.map((t) => {
            const active = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                padding: "10px 18px",
                background: active ? "#111" : "transparent",
                border: "none",
                borderBottom: active ? `2px solid ${SYSTEMS.mine.color}` : "2px solid transparent",
                color: active ? SYSTEMS.mine.color : "#444",
                fontFamily: "monospace",
                fontSize: 11,
                letterSpacing: 2,
                cursor: "pointer",
                transition: "all 0.15s",
                outline: "none",
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.color = "#888"; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.color = "#444"; }}>
                {t.icon} {t.label}
              </button>
            );
          })}
        </div>

        {/* ── CONTENT PANEL ── */}
        <div style={{
          background: "#0a0a0a",
          border: "1px solid #161616",
          borderRadius: 2,
          padding: "24px",
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: 0, left: 0, width: 20, height: 20, borderTop: `1px solid ${SYSTEMS.mine.color}44`, borderLeft: `1px solid ${SYSTEMS.mine.color}44` }} />
          <div style={{ position: "absolute", top: 0, right: 0, width: 20, height: 20, borderTop: `1px solid ${SYSTEMS.mine.color}44`, borderRight: `1px solid ${SYSTEMS.mine.color}44` }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, width: 20, height: 20, borderBottom: `1px solid ${SYSTEMS.mine.color}44`, borderLeft: `1px solid ${SYSTEMS.mine.color}44` }} />
          <div style={{ position: "absolute", bottom: 0, right: 0, width: 20, height: 20, borderBottom: `1px solid ${SYSTEMS.mine.color}44`, borderRight: `1px solid ${SYSTEMS.mine.color}44` }} />

          <div style={{ fontSize: 10, color: "#333", letterSpacing: 3, marginBottom: 20 }}>
            // OUTPUT :: {TABS.find(t => t.id === tab)?.label}
          </div>

          {renderContent()}
        </div>
        </React.Fragment>}

        {/* ── FOOTER ── */}
        <div style={{ marginTop: 20, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <div style={{ fontSize: 10, color: "#2a2a2a", fontFamily: "monospace", letterSpacing: 2 }}>
            DATA: Techpowerup · UserBenchmark · TechRadar · Manual Estimates · Webhallen
          </div>
          <div style={{ fontSize: 10, color: "#2a2a2a", fontFamily: "monospace", letterSpacing: 2 }}>
            RTX 5060 Ti / RTX 5070 — BLACKWELL ARCH · PROJECTED SPECS · PRICES APPROXIMATE
          </div>
        </div>
      </div>
    </div>
  );
}
