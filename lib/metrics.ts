import { COUNTDOWN_START_ISO, LAUNCH_DATE } from "@/lib/brand";
import type { SignupRow } from "@/lib/db";

export const DAY_MS = 86_400_000;

export interface SeriesPoint {
  /** Short axis label, e.g. "12" */
  label: string;
  /** Full label for tooltips, e.g. "Thu, 12 Sep" */
  full: string;
  value: number;
}

export function dailySeries(rows: SignupRow[], days = 30): SeriesPoint[] {
  const now = Date.now();
  const today = new Date(now);
  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  ).getTime();

  const out: SeriesPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const start = todayStart - i * DAY_MS;
    const end = start + DAY_MS;
    const d = new Date(start);
    let value = 0;
    for (const row of rows) {
      const t = Date.parse(row.created_at);
      if (t >= start && t < end) value++;
    }
    out.push({
      label: String(d.getDate()),
      full: d.toLocaleDateString("en-NG", {
        weekday: "short",
        day: "numeric",
        month: "short",
      }),
      value,
    });
  }
  return out;
}

export interface WeekStats {
  thisWeek: number;
  lastWeek: number;
  /** Percentage change vs previous week, null when there is no baseline. */
  delta: number | null;
}

export function weekStats(rows: SignupRow[]): WeekStats {
  const now = Date.now();
  let thisWeek = 0;
  let lastWeek = 0;
  for (const row of rows) {
    const t = Date.parse(row.created_at);
    if (t >= now - 7 * DAY_MS) thisWeek++;
    else if (t >= now - 14 * DAY_MS) lastWeek++;
  }
  const delta =
    lastWeek === 0 ? (thisWeek > 0 ? null : 0) : Math.round(((thisWeek - lastWeek) / lastWeek) * 100);
  return { thisWeek, lastWeek, delta };
}

export interface SourceStat {
  label: string;
  count: number;
  pct: number;
}

export function sourceBreakdown(rows: SignupRow[]): SourceStat[] {
  const map = new Map<string, number>();
  for (const row of rows) {
    const key = (row.source || "unknown").toLowerCase();
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  const total = rows.length || 1;
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([label, count]) => ({ label, count, pct: Math.round((count / total) * 100) }));
}

export function daysUntilLaunch(now = Date.now()): number {
  return Math.max(0, Math.ceil((LAUNCH_DATE.getTime() - now) / DAY_MS));
}

export function launchProgress(now = Date.now()): number {
  const start = Date.parse(COUNTDOWN_START_ISO);
  const end = LAUNCH_DATE.getTime();
  if (end <= start) return 1;
  return Math.min(1, Math.max(0, (now - start) / (end - start)));
}

export function timeAgo(iso: string, now = Date.now()): string {
  const diff = Math.max(0, now - Date.parse(iso));
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "short" });
}

export function formatJoined(iso: string): string {
  return new Date(iso).toLocaleString("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Lagos",
  });
}

export function todayLabel(now = Date.now()): string {
  return new Date(now).toLocaleDateString("en-NG", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function initialsOf(row: SignupRow): string {
  const source = row.name?.trim() || row.email.split("@")[0];
  const parts = source.split(/[\s._-]+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "?";
  const second = parts[1]?.[0] ?? "";
  return (first + second).toUpperCase();
}
