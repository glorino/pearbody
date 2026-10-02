"use client";

import { useState } from "react";
import Shell, { type Panel } from "@/components/dashboard/shell";
import Overview from "@/components/dashboard/overview";
import Subscribers from "@/components/dashboard/subscribers";
import SyncPanel from "@/components/dashboard/sync";
import type { SignupRow } from "@/lib/db";

export default function DashboardClient({
  rows,
  dbError,
}: {
  rows: SignupRow[];
  dbError: string | null;
}) {
  const [panel, setPanel] = useState<Panel>("overview");

  return (
    <Shell
      panel={panel}
      onPanelChange={setPanel}
      badge={
        <span className="hidden rounded-full border border-ivory/15 px-4 py-1.5 text-[0.6rem] font-bold uppercase tracking-[0.2em] text-ivory/50 sm:inline-block">
          {rows.length} subscriber{rows.length === 1 ? "" : "s"}
        </span>
      }
    >
      {dbError && (
        <p
          role="alert"
          className="mb-6 border border-[#e07a5f]/40 bg-[#e07a5f]/10 px-5 py-4 text-sm text-[#e07a5f]"
        >
          Database issue: {dbError}
        </p>
      )}
      {panel === "overview" && <Overview rows={rows} />}
      {panel === "subscribers" && <Subscribers rows={rows} />}
      {panel === "sync" && <SyncPanel />}
    </Shell>
  );
}
