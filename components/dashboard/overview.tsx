"use client";

import { motion } from "framer-motion";
import { AreaChart, SourceBars, Sparkline } from "./charts";
import { dailySeries, daysUntilLaunch, launchProgress, sourceBreakdown, timeAgo, weekStats } from "@/lib/metrics";
import { LAUNCH_DATE_LABEL } from "@/lib/brand";
import type { SignupRow } from "@/lib/db";

const EASE = [0.22, 1, 0.36, 1] as const;

function KpiCard({
  label,
  value,
  note,
  accent = false,
  children,
  delay = 0,
}: {
  label: string;
  value: string | number;
  note?: React.ReactNode;
  accent?: boolean;
  children?: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: EASE }}
      className={`plate-corner relative border p-5 sm:p-6 ${
        accent ? "border-gold-500/40 bg-gold-500/[0.06]" : "border-ivory/10 bg-onyx-800/70"
      }`}
    >
      <p className="text-[0.58rem] font-bold uppercase tracking-[0.26em] text-ivory/40">{label}</p>
      <p className={`mt-3 font-display text-4xl font-light ${accent ? "text-gold-200" : "text-gold-300"}`}>
        {value}
      </p>
      {note && <div className="mt-2 text-xs text-ivory/45">{note}</div>}
      {children && <div className="mt-4 text-gold-500/70">{children}</div>}
    </motion.div>
  );
}

export default function Overview({ rows }: { rows: SignupRow[] }) {
  const series30 = dailySeries(rows, 30);
  const series14 = dailySeries(rows, 14);
  const week = weekStats(rows);
  const sources = sourceBreakdown(rows);
  const days = daysUntilLaunch();
  const progress = launchProgress();
  const recent = rows.slice(0, 5);

  const deltaLabel =
    week.delta === null
      ? "first signups"
      : week.delta > 0
        ? `↑ ${week.delta}% vs last week`
        : week.delta < 0
          ? `↓ ${Math.abs(week.delta)}% vs last week`
          : "steady vs last week";

  return (
    <div className="flex flex-col gap-6">
      {/* KPI row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          label="Total subscribers"
          value={rows.length}
          note={`+${week.thisWeek} in the last 7 days`}
          delay={0}
        >
          <Sparkline values={series14.map((p) => p.value)} />
        </KpiCard>
        <KpiCard
          label="This week"
          value={week.thisWeek}
          note={deltaLabel}
          delay={0.08}
        >
          <Sparkline values={series14.slice(-7).map((p) => p.value)} />
        </KpiCard>
        <KpiCard label="Days to launch" value={days} note={LAUNCH_DATE_LABEL} accent delay={0.16}>
          <div className="h-1.5 w-full overflow-hidden bg-onyx-600">
            <motion.div
              className="h-full bg-gradient-to-r from-gold-700 to-gold-300"
              initial={{ width: 0 }}
              animate={{ width: `${Math.round(progress * 100)}%` }}
              transition={{ duration: 1.3, delay: 0.5, ease: EASE }}
            />
          </div>
          <p className="mt-2 text-[0.6rem] uppercase tracking-[0.2em] text-ivory/35">
            {Math.round(progress * 100)}% of the wait is over
          </p>
        </KpiCard>
        <KpiCard label="Sources" value={sources.length} note="where signups came from" delay={0.24} />
      </div>

      {/* Growth chart */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.3, ease: EASE }}
        className="border border-ivory/10 bg-onyx-800/70 p-5 sm:p-7"
      >
        <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-light text-ivory">Growth</h2>
            <p className="mt-1 text-xs text-ivory/45">Daily signups — last 30 days</p>
          </div>
          <span className="text-[0.62rem] font-bold uppercase tracking-[0.24em] text-gold-400">
            {series30.reduce((n, p) => n + p.value, 0)} total
          </span>
        </div>
        <AreaChart data={series30} />
      </motion.section>

      {/* Sources + recent */}
      <div className="grid gap-6 lg:grid-cols-2">
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.38, ease: EASE }}
          className="border border-ivory/10 bg-onyx-800/70 p-5 sm:p-7"
        >
          <h2 className="font-display text-2xl font-light text-ivory">Sources</h2>
          <p className="mb-6 mt-1 text-xs text-ivory/45">Share of all signups</p>
          <SourceBars stats={sources} />
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.46, ease: EASE }}
          className="border border-ivory/10 bg-onyx-800/70 p-5 sm:p-7"
        >
          <h2 className="font-display text-2xl font-light text-ivory">Recent activity</h2>
          <p className="mb-5 mt-1 text-xs text-ivory/45">The latest to join the inner circle</p>
          {recent.length === 0 ? (
            <p className="py-6 text-center text-sm text-ivory/40">No signups yet.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-ivory/5">
              {recent.map((row) => (
                <li key={row.email} className="flex items-center justify-between gap-4 py-3.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm text-gold-200">{row.email}</p>
                    <p className="mt-0.5 truncate text-[0.68rem] uppercase tracking-[0.16em] text-ivory/35">
                      {row.name || row.source || "—"}
                    </p>
                  </div>
                  <span className="shrink-0 text-[0.68rem] text-ivory/45">{timeAgo(row.created_at)}</span>
                </li>
              ))}
            </ul>
          )}
        </motion.section>
      </div>
    </div>
  );
}
