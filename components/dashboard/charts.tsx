"use client";

import { motion } from "framer-motion";
import { useId, useState, type PointerEvent } from "react";
import type { SeriesPoint, SourceStat } from "@/lib/metrics";

const EASE = [0.22, 1, 0.36, 1] as const;

/* ------------------------------------------------------------------ */
/* Sparkline — tiny trend line for KPI cards                           */
/* ------------------------------------------------------------------ */

export function Sparkline({ values, className = "" }: { values: number[]; className?: string }) {
  const w = 100;
  const h = 28;
  const max = Math.max(1, ...values);
  const points = values
    .map((v, i) => {
      const x = values.length > 1 ? (i / (values.length - 1)) * w : w / 2;
      const y = h - 2 - (v / max) * (h - 6);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      className={`h-7 w-full ${className}`}
      aria-hidden="true"
    >
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* AreaChart — signups per day over the last N days                    */
/* ------------------------------------------------------------------ */

const VIEW_W = 640;
const VIEW_H = 220;
const PAD = { top: 14, right: 10, bottom: 26, left: 30 };

export function AreaChart({ data }: { data: SeriesPoint[] }) {
  const gradientId = useId();
  const [hover, setHover] = useState<number | null>(null);

  const innerW = VIEW_W - PAD.left - PAD.right;
  const innerH = VIEW_H - PAD.top - PAD.bottom;
  const max = Math.max(1, ...data.map((d) => d.value));
  const stepX = data.length > 1 ? innerW / (data.length - 1) : 0;

  const xAt = (i: number) => PAD.left + i * stepX;
  const yAt = (v: number) => PAD.top + innerH - (v / max) * innerH;

  const line = data.map((d, i) => `${i === 0 ? "M" : "L"}${xAt(i)},${yAt(d.value)}`).join(" ");
  const area = `${line} L${xAt(data.length - 1)},${PAD.top + innerH} L${xAt(0)},${PAD.top + innerH} Z`;

  const gridValues = [...new Set([max, Math.round(max / 2), 0])].sort((a, b) => b - a);

  function handlePointerMove(e: PointerEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const rel = ((e.clientX - rect.left) / rect.width) * VIEW_W;
    const idx = Math.round((rel - PAD.left) / (stepX || 1));
    setHover(Math.min(data.length - 1, Math.max(0, idx)));
  }

  const hovered = hover !== null ? data[hover] : null;

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="w-full"
        onPointerMove={handlePointerMove}
        onPointerLeave={() => setHover(null)}
        role="img"
        aria-label="Signups per day chart"
      >
        <defs>
          <linearGradient id={`${gradientId}-fill`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c9962f" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#c9962f" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={`${gradientId}-stroke`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#8b5a2b" />
            <stop offset="50%" stopColor="#c9962f" />
            <stop offset="100%" stopColor="#e9c87e" />
          </linearGradient>
        </defs>

        {gridValues.map((v) => (
          <g key={v}>
            <line
              x1={PAD.left}
              x2={VIEW_W - PAD.right}
              y1={yAt(v)}
              y2={yAt(v)}
              stroke="rgba(247,243,236,0.08)"
              strokeDasharray="3 5"
            />
            <text
              x={PAD.left - 8}
              y={yAt(v) + 3}
              textAnchor="end"
              fontSize="10"
              fill="rgba(247,243,236,0.35)"
            >
              {v}
            </text>
          </g>
        ))}

        <motion.path
          d={area}
          fill={`url(#${gradientId}-fill)`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.1, delay: 0.35, ease: EASE }}
        />
        <motion.path
          d={line}
          fill="none"
          stroke={`url(#${gradientId}-stroke)`}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.4, ease: EASE }}
        />

        {hover !== null && (
          <g>
            <line
              x1={xAt(hover)}
              x2={xAt(hover)}
              y1={PAD.top}
              y2={PAD.top + innerH}
              stroke="rgba(233,200,126,0.4)"
            />
            <circle cx={xAt(hover)} cy={yAt(data[hover].value)} r="4" fill="#e9c87e" />
          </g>
        )}

        {data.map((d, i) =>
          i % Math.ceil(data.length / 8) === 0 ? (
            <text
              key={i}
              x={xAt(i)}
              y={VIEW_H - 8}
              textAnchor="middle"
              fontSize="10"
              fill="rgba(247,243,236,0.35)"
            >
              {d.label}
            </text>
          ) : null,
        )}
      </svg>

      {hovered && hover !== null && (
        <div
          className="pointer-events-none absolute -top-1 z-10 -translate-x-1/2 border border-gold-500/40 bg-onyx-700 px-3 py-1.5 text-center"
          style={{
            left: `${(xAt(hover) / VIEW_W) * 100}%`,
          }}
        >
          <p className="text-[0.62rem] uppercase tracking-[0.18em] text-ivory/45">{hovered.full}</p>
          <p className="font-display text-lg leading-tight text-gold-300">
            {hovered.value} signup{hovered.value === 1 ? "" : "s"}
          </p>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* SourceBars — horizontal share breakdown                             */
/* ------------------------------------------------------------------ */

export function SourceBars({ stats }: { stats: SourceStat[] }) {
  if (stats.length === 0) {
    return <p className="text-sm text-ivory/40">No sources recorded yet.</p>;
  }
  const max = Math.max(...stats.map((s) => s.count));

  return (
    <ul className="flex flex-col gap-5">
      {stats.map((stat, i) => (
        <li key={stat.label}>
          <div className="mb-2 flex items-baseline justify-between gap-4">
            <span className="text-[0.64rem] font-bold uppercase tracking-[0.22em] text-ivory/60">
              {stat.label.replaceAll("-", " ")}
            </span>
            <span className="font-display text-lg text-gold-300">
              {stat.count}
              <span className="ml-2 text-xs text-ivory/40">{stat.pct}%</span>
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden bg-onyx-600">
            <motion.div
              className="h-full bg-gradient-to-r from-gold-700 via-gold-500 to-gold-300"
              initial={{ width: 0 }}
              animate={{ width: `${(stat.count / max) * 100}%` }}
              transition={{ duration: 1, delay: 0.2 + i * 0.12, ease: EASE }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
