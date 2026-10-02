import type { Metadata } from "next";
import { redirect } from "next/navigation";
import DashboardClient from "@/components/dashboard/dashboard-client";
import { isAuthed } from "@/lib/auth";
import { getPool, listSignups, type SignupRow } from "@/lib/db";

export const metadata: Metadata = {
  title: "Dashboard — Pearlbody.NG",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

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

  return <DashboardClient rows={rows} dbError={dbError} />;
}
