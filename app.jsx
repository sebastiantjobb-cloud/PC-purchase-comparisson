import { useState, useEffect } from "react";
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
    tdp: 421, price: 21990, mult: null,
  },
  mine: {
    label: "MY BUILD",   color: "#06B6D4", glow: "rgba(6,182,212,0.4)",   dim: "rgba(6,182,212,0.15)",
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
  { label: "MY BUILD",   watts: 330, fpsW: 37.6, aiW: 185,  monthlykr: 71  },
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
      <span style={{ color: "#666" }}>≈{sys.price.toLocaleString()} kr</span>
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
        <Bar dataKey="mine" name="MY BUILD"  fill={SYSTEMS.mine.color} radius={[2,2,0,0]} />
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
        <Radar name="MY BUILD"  dataKey="mine" stroke={SYSTEMS.mine.color} fill={SYSTEMS.mine.color} fillOpacity={0.15} strokeWidth={2} />
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
          <div>▸ LLM 13B: MY BUILD wins on VRAM (16GB) — HIGH-END limited to 12GB GDDR7</div>
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
    { label: "MY BUILD",  fpsW: 37.6, aiW: 185    },
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
          ▸ MY BUILD draws 91W less than OLD BEAST at peak — saves heat and noise
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
          ▸ MY BUILD saves ~{Math.round(SYSTEMS.old.tdp / 1000 * 4 * 30 * 1.8) - Math.round(SYSTEMS.mine.tdp / 1000 * 4 * 30 * 1.8)} kr/month vs OLD BEAST — ~{Math.round((Math.round(SYSTEMS.old.tdp / 1000 * 4 * 30 * 1.8) - Math.round(SYSTEMS.mine.tdp / 1000 * 4 * 30 * 1.8)) * 12)} kr/year
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
          <div style={{ color: SYSTEMS.mine.color }}>▸ MY BUILD delivers the best FPS-per-kr and TOPS-per-kr — highest value system</div>
          <div style={{ color: SYSTEMS.high.color }}>▸ HIGH-END is fastest overall but costs ~1.75× more than MY BUILD for ~20% more FPS</div>
          <div style={{ color: SYSTEMS.old.color  }}>▸ OLD BEAST was solid for its time — MY BUILD is faster in every metric for similar price</div>
          <div style={{ color: "#555"             }}>▸ OLD BEAST: 21,990 kr (Webhallen). MY BUILD: 12,000 kr (parts). HIGH-END: 21,000 kr (Webhallen Config).</div>
        </div>
      </div>
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
export default function App() {
  const [tab, setTab] = useState("fps1080");
  const [tick, setTick] = useState(0);

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
              <span style={{ color: SYSTEMS.old.color  }}>OLD</span>
              <span style={{ color: "#222", margin: "0 10px" }}>vs</span>
              <span style={{ color: SYSTEMS.mine.color }}>MINE</span>
              <span style={{ color: "#222", margin: "0 10px" }}>vs</span>
              <span style={{ color: SYSTEMS.high.color }}>HIGH-END</span>
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

        {/* ── SYSTEM CARDS ── */}
        <div style={{ display: "flex", gap: 16, marginBottom: 28, flexWrap: "wrap" }}>
          {Object.entries(SYSTEMS).map(([k, s]) => <SystemCard key={k} id={k} sys={s} />)}
        </div>

        {/* ── TAB NAV ── */}
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
