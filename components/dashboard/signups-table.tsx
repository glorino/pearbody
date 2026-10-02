"use client";

import { useMemo, useState } from "react";
import type { SignupRow } from "@/lib/db";

type Row = Omit<SignupRow, "id">;

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Lagos",
  });
}

function csvCell(value: string): string {
  return `"${value.replaceAll('"', '""')}"`;
}

export default function SignupsTable({ rows }: { rows: Row[] }) {
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (row) =>
        row.email.toLowerCase().includes(q) ||
        (row.name ?? "").toLowerCase().includes(q) ||
        (row.source ?? "").toLowerCase().includes(q),
    );
  }, [rows, query]);

  async function copyEmails() {
    const list = filtered.map((row) => row.email).join(", ");
    if (!list) return;
    try {
      await navigator.clipboard.writeText(list);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  function downloadCsv() {
    const header = ["email", "name", "source", "joined"];
    const lines = [
      header.map(csvCell).join(","),
      ...filtered.map((row) =>
        [row.email, row.name ?? "", row.source ?? "", row.created_at]
          .map(csvCell)
          .join(","),
      ),
    ];
    const blob = new Blob([lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pearlbody-signups-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="border border-ivory/10 bg-onyx-800/70">
      <div className="flex flex-col gap-4 border-b border-ivory/10 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-center gap-4">
          <h2 className="font-display text-2xl font-light text-ivory">Signups</h2>
          <span className="rounded-full border border-gold-500/40 px-3 py-0.5 text-[0.62rem] font-bold uppercase tracking-[0.2em] text-gold-300">
            {filtered.length}
            {query.trim() ? ` of ${rows.length}` : ""}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search email, name, source…"
            className="w-full min-w-0 border border-ivory/15 bg-onyx-700 px-3 py-2 text-sm text-ivory placeholder:text-ivory/30 focus:border-gold-500 focus:outline-none sm:w-64"
          />
          <button
            type="button"
            onClick={copyEmails}
            className="border border-ivory/15 px-4 py-2 text-[0.62rem] font-bold uppercase tracking-[0.2em] text-ivory/70 transition-colors hover:border-gold-500 hover:text-gold-300"
          >
            {copied ? "Copied ✓" : "Copy emails"}
          </button>
          <button
            type="button"
            onClick={downloadCsv}
            className="border border-gold-500/50 bg-gold-500/10 px-4 py-2 text-[0.62rem] font-bold uppercase tracking-[0.2em] text-gold-300 transition-colors hover:bg-gold-500/20"
          >
            Export CSV
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="p-10 text-center text-sm text-ivory/45">
          {rows.length === 0
            ? "No signups yet — the notify form is live on the landing page."
            : "Nothing matches that search."}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-ivory/10 text-[0.6rem] uppercase tracking-[0.24em] text-ivory/40">
                <th className="px-6 py-4 font-semibold">Email</th>
                <th className="px-6 py-4 font-semibold">Name</th>
                <th className="px-6 py-4 font-semibold">Source</th>
                <th className="px-6 py-4 font-semibold">Joined (WAT)</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr
                  key={row.email}
                  className="border-b border-ivory/5 transition-colors last:border-b-0 hover:bg-onyx-700/60"
                >
                  <td className="px-6 py-4 text-gold-200">{row.email}</td>
                  <td className="px-6 py-4 text-ivory/80">{row.name || <span className="text-ivory/30">—</span>}</td>
                  <td className="px-6 py-4 text-ivory/50">
                    <span className="text-[0.62rem] uppercase tracking-[0.14em]">
                      {row.source || "—"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-ivory/60">{formatDate(row.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
