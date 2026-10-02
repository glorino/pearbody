import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/dashboard/logout-button";
import SignupsTable from "@/components/dashboard/signups-table";
import { Monogram } from "@/components/ui";
import { isAuthed } from "@/lib/auth";
import { LAUNCH_DATE, LAUNCH_DATE_LABEL } from "@/lib/brand";
import { getPool, listSignups, type SignupRow } from "@/lib/db";

export const metadata: Metadata = {
  title: "Dashboard — Pearlbody.NG",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function daysUntilLaunch(): number {
  return Math.max(0, Math.ceil((LAUNCH_DATE.getTime() - Date.now()) / 86_400_000));
}

function countSince(rows: SignupRow[], windowMs: number): number {
  const cutoff = Date.now() - windowMs;
  return rows.filter((row) => Date.parse(row.created_at) >= cutoff).length;
}

export default async function DashboardPage() {
  if (!(await isAuthed())) redirect("/login");

  const pool = getPool();
  let rows: SignupRow[] = [];
  let dbError: string | null = null;

  if (!pool) {
    dbError = "POSTGRES_URL is not configured — signups cannot be loaded.";
  } else {
    try {
      rows = await listSignups(pool);
    } catch (error) {
      dbError = error instanceof Error ? error.message : "Database unreachable.";
    }
  }

  const thisWeek = countSince(rows, 7 * 86_400_000);
  const named = rows.filter((row) => row.name).length;
  const stats = [
    { label: "Total signups", value: rows.length },
    { label: "Last 7 days", value: thisWeek },
    { label: "With a name", value: named },
    { label: "Days to launch", value: daysUntilLaunch() },
  ];

  return (
    <main className="relative min-h-dvh bg-onyx pb-20">
      <div className="silk pointer-events-none fixed inset-0" aria-hidden="true" />

      <header className="relative border-b border-ivory/10 bg-onyx-900/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-5 sm:px-10">
          <div className="flex items-center gap-4">
            <Monogram className="h-9 w-auto text-ivory" />
            <div>
              <p className="font-display text-xl leading-none text-ivory">
                Pearlbody<span className="text-gold-400">.NG</span>
              </p>
              <p className="mt-1 text-[0.58rem] font-bold uppercase tracking-[0.3em] text-ivory/40">
                Dashboard
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="hidden border border-ivory/15 px-5 py-2.5 text-[0.62rem] font-bold uppercase tracking-[0.24em] text-ivory/70 transition-colors hover:border-gold-500 hover:text-gold-300 sm:inline-block"
            >
              View site
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="relative mx-auto max-w-6xl px-6 pt-10 sm:px-10">
        <span className="inline-flex items-center gap-4 text-[0.62rem] font-semibold uppercase tracking-[0.4em] text-gold-400">
          <span className="hairline-gold h-px w-8" />
          The list
        </span>
        <h1 className="mt-4 font-display text-[clamp(2rem,5vw,3.2rem)] font-light text-ivory">
          Inner circle <span className="italic text-gold-300">signups</span>
        </h1>
        <p className="mt-3 text-sm text-ivory/50">
          Launching {LAUNCH_DATE_LABEL} — notify-form subscribers from Neon Postgres
          (synced to Mailchimp).
        </p>

        {dbError && (
          <p
            role="alert"
            className="mt-6 border border-[#e07a5f]/40 bg-[#e07a5f]/10 px-5 py-4 text-sm text-[#e07a5f]"
          >
            Database issue: {dbError}
          </p>
        )}

        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="border border-ivory/10 bg-onyx-800/70 p-5 sm:p-6"
            >
              <p className="text-[0.58rem] font-bold uppercase tracking-[0.26em] text-ivory/40">
                {stat.label}
              </p>
              <p className="mt-3 font-display text-4xl font-light text-gold-300">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <SignupsTable rows={rows} />
        </div>

        <p className="mt-10 text-center text-[0.6rem] uppercase tracking-[0.3em] text-ivory/25">
          Pearlbody.NG — ...looks beyond words
        </p>
      </div>
    </main>
  );
}
