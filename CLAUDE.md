# PC Purchase Comparisson — Hardware Dashboard

## Project Overview

A single-file React dashboard (`app.jsx`) that compares three PC builds across gaming FPS, benchmarks, radar charts, and AI workload performance. Uses a dark terminal/cyberpunk aesthetic with monospace fonts and glow effects.

## Architecture

- **Single file app:** All components, data, and logic live in `app.jsx`
- **No routing** — tab state managed locally with `useState`
- **Charting:** [Recharts](https://recharts.org/) — `BarChart`, `RadarChart`, `ResponsiveContainer`
- **No CSS files** — all styling is inline via `style` props

## The Three Systems

| Key    | Label     | CPU              | GPU               | Color   |
|--------|-----------|------------------|-------------------|---------|
| `old`  | OLD BEAST | i7-7700K         | GTX 1080 Ti       | Amber  | 21,990 kr |
| `mine` | MY BUILD  | Ryzen 5 7600X    | RTX 5060 Ti 16GB  | Cyan   | 12,000 kr |
| `high` | HIGH-END  | Ryzen 7 7800X3D  | RTX 5070          | Purple | 21,000 kr |

## Data

All data is hardcoded at the top of `app.jsx`:

- `FPS_1080P` / `FPS_1440P` — per-game FPS for 8 titles
- `RADAR_DATA` — normalized 0–100 scores across 7 axes
- `BENCHMARKS` — Cinebench, 3DMark, AI TOPS, VRAM, Memory BW
- `AI_WORKLOADS` — LLM, Stable Diffusion, Whisper, YOLO, etc.

## Tabs

| Tab ID     | Label       | Component       |
|------------|-------------|-----------------|
| `fps1080`  | 1080p FPS   | `<FpsTab>`      |
| `fps1440`  | 1440p FPS   | `<FpsTab>`      |
| `radar`    | RADAR       | `<RadarTab>`    |
| `bench`    | BENCHMARKS  | `<BenchmarksTab>` |
| `ai`       | AI MATRIX   | `<AiTab>`       |

## Key Components

- `SystemCard` — hardware spec card per build
- `GlowBar` — animated progress bar with glow shadow
- `FpsTab` — grouped bar chart using Recharts
- `RadarTab` — radar/spider chart
- `BenchmarksTab` — stacked `GlowBar` rows per benchmark
- `AiTab` — table with mini progress bars per workload
- `Scanlines` — fixed overlay for CRT scanline effect
- `CustomTooltip` — dark-themed chart tooltip

## Style Conventions

- Background: `#060606` (page), `#0a0a0a` (panels), `#0d0d0d` (cards)
- Font: `monospace` everywhere
- Borders: `1px solid #161616` / `#1a1a1a` for subtle separations
- Active tab accent: always `SYSTEMS.mine.color` (cyan `#06B6D4`)
- Glow effect pattern: `boxShadow: \`0 0 8px ${glow}\``
- Color opacity variants: `44` (border), `88` (gradient start), full for text/glow

## Adding New Data

To add a game to FPS charts, append to both `FPS_1080P` and `FPS_1440P`:

```js
{ game: "Game Name", old: 60, mine: 95, high: 120 }
```

To add a benchmark row, append to `BENCHMARKS`:

```js
{ metric: "Label", unit: "pts", old: 0, mine: 0, high: 0, max: 0 }
```
