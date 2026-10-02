"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { copyText } from "@/lib/export";
import { formatJoined, timeAgo } from "@/lib/metrics";
import type { SignupRow } from "@/lib/db";

const EASE = [0.22, 1, 0.36, 1] as const;

type McStatus = string | null;

interface SyncItem extends Pick<SignupRow, "email" | "name" | "source" | "created_at"> {
  mailchimp: McStatus;
}

interface SyncStats {
  total: number;
  synced: number;
  missing: number;
  inMailchimp: number;
}

const STATUS_STYLES: Record<string, string> = {
  subscribed: "border-emerald-500/40 text-emerald-300 bg-emerald-500/10",
  pending: "border-amber-500/40 text-amber-300 bg-amber-500/10",
  unsubscribed: "border-red-500/40 text-red-300 bg-red-500/10",
  cleaned: "border-red-500/40 text-red-300 bg-red-500/10",
};

function StatusBadge({ status }: { status: McStatus }) {
  if (!status) {
    return (
      <span className="border border-gold-500/50 bg-gold-500/10 px-2.5 py-1 text-[0.58rem] font-bold uppercase tracking-[0.16em] text-gold-300">
        Missing
      </span>
    );
  }
  return (
    <span
      className={`border px-2.5 py-1 text-[0.58rem] font-bold uppercase tracking-[0.16em] ${
        STATUS_STYLES[status] ?? "border-ivory/20 text-ivory/60"
      }`}
    >
      {status}
    </span>
  );
}

export default function SyncPanel() {
  const [items, setItems] = useState<SyncItem[] | null>(null);
  const [stats, setStats] = useState<SyncStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState("");
  const [report, setReport] = useState("");
  const [toast, setToast] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard/mailchimp", { cache: "no-store" });
      const data = (await res.json().catch(() => null)) as
        | { ok: boolean; error?: string; items?: SyncItem[]; stats?: SyncStats }
        | null;
      if (!res.ok || !data?.ok) {
        setItems(null);
        setStats(null);
        setError(data?.error || `Check failed (HTTP ${res.status}).`);
      } else {
        setError("");
        setItems(data.items ?? []);
        setStats(data.stats ?? null);
      }
    } catch {
      setItems(null);
      setStats(null);
      setError("Network error while contacting Mailchimp.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Defer to a macrotask so no setState runs synchronously in the effect body.
    const id = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(id);
  }, [load]);

  async function syncMissing() {
    if (syncing || !stats || stats.missing === 0) return;
    setSyncing(true);
    setReport("");
    try {
      const res = await fetch("/api/dashboard/mailchimp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = (await res.json().catch(() => null)) as
        | { ok: boolean; error?: string; synced?: number; failed?: number; errors?: { email: string; error: string }[] }
        | null;
      if (!res.ok || !data?.ok) {
        setReport(data?.error || `Sync failed (HTTP ${res.status}).`);
      } else {
        setReport(`Synced ${data.synced ?? 0}${data.failed ? `, ${data.failed} failed` : ""}.`);
        await load();
      }
    } catch {
      setReport("Network error — please try again.");
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Status cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "In Neon", value: stats?.total ?? "—" },
          { label: "Synced", value: stats?.synced ?? "—" },
          { label: "Missing", value: stats?.missing ?? "—", warn: true },
          { label: "Mailchimp audience", value: stats?.inMailchimp ?? "—" },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: i * 0.07, ease: EASE }}
            className={`border p-5 ${
              card.warn && stats && stats.missing > 0
                ? "border-gold-500/40 bg-gold-500/[0.06]"
                : "border-ivory/10 bg-onyx-800/70"
            }`}
          >
            <p className="text-[0.56rem] font-bold uppercase tracking-[0.26em] text-ivory/40">{card.label}</p>
            <p className="mt-2.5 font-display text-4xl font-light text-gold-300">{card.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-4 border border-ivory/10 bg-onyx-800/70 p-5 sm:p-6">
        <div className="flex-1 min-w-52">
          <h2 className="font-display text-2xl font-light text-ivory">Reconcile lists</h2>
          <p className="mt-1 text-xs text-ivory/45">
            Push every Neon signup that is missing from Mailchimp into your audience as
            <span className="text-gold-300"> subscribed</span> (tagged for the launch campaign).
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setLoading(true);
            void load();
          }}
          disabled={loading}
          className="border border-ivory/15 px-5 py-3 text-[0.62rem] font-bold uppercase tracking-[0.2em] text-ivory/70 transition-colors hover:border-gold-500 hover:text-gold-300 disabled:opacity-50"
        >
          {loading ? "Checking…" : "Refresh"}
        </button>
        <button
          type="button"
          onClick={() => void syncMissing()}
          disabled={syncing || loading || !stats || stats.missing === 0}
          className="flex items-center gap-3 bg-gradient-to-r from-gold-700 via-gold-500 to-gold-300 px-6 py-3 text-[0.64rem] font-extrabold uppercase tracking-[0.24em] text-onyx transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {syncing && (
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-onyx border-t-transparent" />
          )}
          {syncing ? "Syncing…" : `Sync ${stats?.missing ?? 0} missing`}
        </button>
      </div>

      {error && (
        <p role="alert" className="border border-[#e07a5f]/40 bg-[#e07a5f]/10 px-5 py-4 text-sm text-[#e07a5f]">
          {error}
        </p>
      )}
      {report && (
        <p className="border border-gold-500/40 bg-gold-500/[0.07] px-5 py-4 text-sm text-gold-200">{report}</p>
      )}

      {/* Reconciliation table */}
      <div className="border border-ivory/10 bg-onyx-800/70">
        <div className="border-b border-ivory/10 px-6 py-5">
          <h2 className="font-display text-2xl font-light text-ivory">Status by subscriber</h2>
          <p className="mt-1 text-xs text-ivory/45">Neon source of truth vs Mailchimp audience</p>
        </div>

        {loading ? (
          <p className="p-12 text-center text-sm text-ivory/45">Loading Mailchimp state…</p>
        ) : !items || items.length === 0 ? (
          <p className="p-12 text-center text-sm text-ivory/45">Nothing to reconcile.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead>
                <tr className="border-b border-ivory/10 text-[0.62rem] uppercase tracking-[0.2em] text-ivory/40">
                  <th className="px-6 py-4 font-semibold">Email</th>
                  <th className="px-6 py-4 font-semibold">Source</th>
                  <th className="px-6 py-4 font-semibold">Added</th>
                  <th className="px-6 py-4 font-semibold">Mailchimp</th>
                  <th className="px-6 py-4 font-semibold" />
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr
                    key={item.email}
                    className="border-b border-ivory/5 transition-colors last:border-b-0 hover:bg-onyx-700/60"
                  >
                    <td className="px-6 py-4">
                      <p className="text-gold-200">{item.email}</p>
                      {item.name && <p className="mt-0.5 text-xs text-ivory/40">{item.name}</p>}
                    </td>
                    <td className="px-6 py-4 text-ivory/50">
                      <span className="text-[0.6rem] uppercase tracking-[0.16em]">
                        {(item.source || "unknown").replaceAll("-", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-ivory/55" title={formatJoined(item.created_at)}>
                      {timeAgo(item.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={item.mailchimp} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={async () => {
                          const ok = await copyText(item.email);
                          setToast(ok ? "Email copied" : "Clipboard unavailable");
                          setTimeout(() => setToast(""), 2000);
                        }}
                        className="text-[0.6rem] font-bold uppercase tracking-[0.16em] text-ivory/40 transition-colors hover:text-gold-300"
                      >
                        Copy
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 border border-gold-500/40 bg-onyx-700 px-5 py-3 text-[0.68rem] font-bold uppercase tracking-[0.2em] text-gold-200">
          {toast}
        </div>
      )}
    </div>
  );
}
