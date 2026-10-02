"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { copyText, downloadCsv } from "@/lib/export";
import { formatJoined, initialsOf, timeAgo } from "@/lib/metrics";
import type { SignupRow } from "@/lib/db";

const EASE = [0.22, 1, 0.36, 1] as const;
const PAGE_SIZE = 10;

type SortKey = "created_at" | "email" | "name" | "source";

function Th({
  label,
  sortKey,
  active,
  dir,
  onSort,
  className = "",
}: {
  label: string;
  sortKey: SortKey;
  active: boolean;
  dir: "asc" | "desc";
  onSort: (k: SortKey) => void;
  className?: string;
}) {
  return (
    <th className={`px-6 py-4 font-semibold ${className}`}>
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={`inline-flex items-center gap-1.5 uppercase tracking-[0.2em] transition-colors ${
          active ? "text-gold-300" : "text-ivory/40 hover:text-ivory/70"
        }`}
      >
        {label}
        <span className={`text-[0.7em] ${active ? "opacity-100" : "opacity-25"}`}>
          {active && dir === "asc" ? "▲" : "▼"}
        </span>
      </button>
    </th>
  );
}

export default function Subscribers({ rows }: { rows: SignupRow[] }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({
    key: "created_at",
    dir: "desc",
  });
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [detail, setDetail] = useState<SignupRow | null>(null);
  const [toast, setToast] = useState("");

  function flash(message: string) {
    setToast(message);
    setTimeout(() => setToast(""), 2200);
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? rows.filter(
          (r) =>
            r.email.toLowerCase().includes(q) ||
            (r.name ?? "").toLowerCase().includes(q) ||
            (r.source ?? "").toLowerCase().includes(q),
        )
      : rows;

    const sorted = [...list].sort((a, b) => {
      const dir = sort.dir === "asc" ? 1 : -1;
      if (sort.key === "created_at") return (Date.parse(a.created_at) - Date.parse(b.created_at)) * dir;
      return String(a[sort.key] ?? "").localeCompare(String(b[sort.key] ?? "")) * dir;
    });
    return sorted;
  }, [rows, query, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const pageEmails = pageRows.map((r) => r.email);
  const allPageSelected = pageEmails.length > 0 && pageEmails.every((e) => selected.has(e));
  const selectedRows = rows.filter((r) => selected.has(r.email));

  function toggleSort(key: SortKey) {
    setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "desc" }));
    setPage(1);
  }

  function toggleOne(email: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(email)) next.delete(email);
      else next.add(email);
      return next;
    });
  }

  function togglePage() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allPageSelected) pageEmails.forEach((e) => next.delete(e));
      else pageEmails.forEach((e) => next.add(e));
      return next;
    });
  }

  async function copyEmails(list: SignupRow[], label: string) {
    if (list.length === 0) return;
    const ok = await copyText(list.map((r) => r.email).join(", "));
    flash(ok ? `Copied ${list.length} ${label}` : "Clipboard unavailable");
  }

  return (
    <div className="relative">
      {/* Toolbar */}
      <div className="border border-ivory/10 bg-onyx-800/70 p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <h2 className="font-display text-2xl font-light text-ivory">Subscribers</h2>
            <span className="rounded-full border border-gold-500/40 px-3 py-0.5 text-[0.62rem] font-bold uppercase tracking-[0.2em] text-gold-300">
              {filtered.length}
              {query.trim() ? ` of ${rows.length}` : ""}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <input
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search email, name, source…"
              className="w-full min-w-0 border border-ivory/15 bg-onyx-700 px-3.5 py-2.5 text-sm text-ivory placeholder:text-ivory/30 focus:border-gold-500 focus:outline-none sm:w-72"
            />
            <button
              type="button"
              onClick={() => copyEmails(filtered, "emails")}
              className="border border-ivory/15 px-4 py-2.5 text-[0.62rem] font-bold uppercase tracking-[0.2em] text-ivory/70 transition-colors hover:border-gold-500 hover:text-gold-300"
            >
              Copy all
            </button>
            <button
              type="button"
              onClick={() => downloadCsv(`pearlbody-signups-${new Date().toISOString().slice(0, 10)}.csv`, filtered)}
              className="border border-gold-500/50 bg-gold-500/10 px-4 py-2.5 text-[0.62rem] font-bold uppercase tracking-[0.2em] text-gold-300 transition-colors hover:bg-gold-500/20"
            >
              Export CSV
            </button>
          </div>
        </div>

        {/* Bulk bar */}
        <AnimatePresence>
          {selected.size > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 flex flex-wrap items-center gap-3 border border-gold-500/40 bg-gold-500/[0.07] px-4 py-3">
                <span className="text-[0.64rem] font-bold uppercase tracking-[0.2em] text-gold-200">
                  {selected.size} selected
                </span>
                <button
                  type="button"
                  onClick={() => copyEmails(selectedRows, "selected emails")}
                  className="border border-gold-500/50 px-3 py-1.5 text-[0.6rem] font-bold uppercase tracking-[0.18em] text-gold-300 hover:bg-gold-500/15"
                >
                  Copy emails
                </button>
                <button
                  type="button"
                  onClick={() => downloadCsv(`pearlbody-selection-${new Date().toISOString().slice(0, 10)}.csv`, selectedRows)}
                  className="border border-gold-500/50 px-3 py-1.5 text-[0.6rem] font-bold uppercase tracking-[0.18em] text-gold-300 hover:bg-gold-500/15"
                >
                  Export selection
                </button>
                <button
                  type="button"
                  onClick={() => setSelected(new Set())}
                  className="ml-auto text-[0.6rem] font-bold uppercase tracking-[0.18em] text-ivory/45 hover:text-ivory"
                >
                  Clear
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Table */}
      <div className="mt-6 border border-ivory/10 bg-onyx-800/70">
        {filtered.length === 0 ? (
          <p className="p-12 text-center text-sm text-ivory/45">
            {rows.length === 0
              ? "No signups yet — the notify form is live on the landing page."
              : "Nothing matches that search."}
          </p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead>
                  <tr className="border-b border-ivory/10">
                    <th className="w-12 px-6 py-4">
                      <input
                        type="checkbox"
                        checked={allPageSelected}
                        onChange={togglePage}
                        aria-label="Select page"
                        className="h-4 w-4 accent-[#c9962f]"
                      />
                    </th>
                    <Th label="Email" sortKey="email" active={sort.key === "email"} dir={sort.dir} onSort={toggleSort} />
                    <Th label="Name" sortKey="name" active={sort.key === "name"} dir={sort.dir} onSort={toggleSort} />
                    <Th label="Source" sortKey="source" active={sort.key === "source"} dir={sort.dir} onSort={toggleSort} />
                    <Th
                      label="Joined"
                      sortKey="created_at"
                      active={sort.key === "created_at"}
                      dir={sort.dir}
                      onSort={toggleSort}
                    />
                    <th className="px-6 py-4 text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-ivory/40">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((row) => (
                    <tr
                      key={row.email}
                      className="group cursor-pointer border-b border-ivory/5 transition-colors last:border-b-0 hover:bg-onyx-700/60"
                      onClick={() => setDetail(row)}
                    >
                      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selected.has(row.email)}
                          onChange={() => toggleOne(row.email)}
                          aria-label={`Select ${row.email}`}
                          className="h-4 w-4 accent-[#c9962f]"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-3">
                          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-gold-500/40 bg-gold-500/10 font-display text-xs text-gold-300">
                            {initialsOf(row)}
                          </span>
                          <span className="text-gold-200">{row.email}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-ivory/80">
                        {row.name || <span className="text-ivory/30">—</span>}
                      </td>
                      <td className="px-6 py-4 text-ivory/50">
                        <span className="border border-ivory/15 px-2 py-0.5 text-[0.58rem] uppercase tracking-[0.16em]">
                          {(row.source || "unknown").replaceAll("-", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-ivory/60" title={formatJoined(row.created_at)}>
                        {timeAgo(row.created_at)}
                      </td>
                      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                        <span className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={async () => {
                              const ok = await copyText(row.email);
                              flash(ok ? "Email copied" : "Clipboard unavailable");
                            }}
                            title="Copy email"
                            className="grid h-8 w-8 place-items-center border border-ivory/15 text-ivory/50 transition-colors hover:border-gold-500 hover:text-gold-300"
                          >
                            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.7">
                              <rect x="9" y="9" width="11" height="11" rx="2" />
                              <path d="M5 15V5a2 2 0 0 1 2-2h10" />
                            </svg>
                          </button>
                          <a
                            href={`mailto:${row.email}`}
                            title="Email"
                            className="grid h-8 w-8 place-items-center border border-ivory/15 text-ivory/50 transition-colors hover:border-gold-500 hover:text-gold-300"
                          >
                            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.7">
                              <rect x="3" y="5" width="18" height="14" rx="2" />
                              <path d="m3 7 9 6 9-6" />
                            </svg>
                          </a>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-ivory/10 px-6 py-4">
              <p className="text-[0.66rem] uppercase tracking-[0.2em] text-ivory/40">
                Showing {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} of{" "}
                {filtered.length}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={safePage <= 1}
                  onClick={() => setPage(safePage - 1)}
                  className="border border-ivory/15 px-4 py-2 text-[0.62rem] font-bold uppercase tracking-[0.18em] text-ivory/60 transition-colors hover:border-gold-500 hover:text-gold-300 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  Prev
                </button>
                <span className="px-2 text-[0.66rem] tracking-[0.2em] text-ivory/50">
                  {safePage} / {pageCount}
                </span>
                <button
                  type="button"
                  disabled={safePage >= pageCount}
                  onClick={() => setPage(safePage + 1)}
                  className="border border-ivory/15 px-4 py-2 text-[0.62rem] font-bold uppercase tracking-[0.18em] text-ivory/60 transition-colors hover:border-gold-500 hover:text-gold-300 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Detail drawer */}
      <AnimatePresence>
        {detail && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-onyx/80"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDetail(null)}
            />
            <motion.aside
              className="fixed inset-y-0 right-0 z-50 w-full max-w-md overflow-y-auto border-l border-gold-500/25 bg-onyx-900 p-6 sm:p-8"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.4, ease: EASE }}
            >
              <div className="flex items-start justify-between gap-4">
                <span className="grid h-14 w-14 place-items-center rounded-full border border-gold-500/40 bg-gold-500/10 font-display text-xl text-gold-300">
                  {initialsOf(detail)}
                </span>
                <button
                  type="button"
                  onClick={() => setDetail(null)}
                  aria-label="Close details"
                  className="grid h-9 w-9 place-items-center border border-ivory/15 text-ivory/60 hover:border-gold-500 hover:text-gold-300"
                >
                  <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              </div>

              <p className="mt-6 break-all font-display text-2xl font-light text-ivory">{detail.email}</p>
              <p className="mt-1 text-sm text-ivory/50">{detail.name || "No name provided"}</p>

              <dl className="mt-8 flex flex-col divide-y divide-ivory/10 border-y border-ivory/10">
                <div className="flex items-center justify-between gap-4 py-4">
                  <dt className="text-[0.6rem] font-bold uppercase tracking-[0.26em] text-ivory/40">Source</dt>
                  <dd className="text-sm text-gold-300">{(detail.source || "unknown").replaceAll("-", " ")}</dd>
                </div>
                <div className="flex items-center justify-between gap-4 py-4">
                  <dt className="text-[0.6rem] font-bold uppercase tracking-[0.26em] text-ivory/40">Joined</dt>
                  <dd className="text-sm text-ivory/70">{formatJoined(detail.created_at)}</dd>
                </div>
                <div className="flex items-center justify-between gap-4 py-4">
                  <dt className="text-[0.6rem] font-bold uppercase tracking-[0.26em] text-ivory/40">Relative</dt>
                  <dd className="text-sm text-ivory/70">{timeAgo(detail.created_at)}</dd>
                </div>
              </dl>

              <div className="mt-8 flex flex-col gap-3">
                <a
                  href={`mailto:${detail.email}?subject=${encodeURIComponent("Pearlbody.NG — you're on the list")}`}
                  className="flex items-center justify-center gap-3 bg-gradient-to-r from-gold-700 via-gold-500 to-gold-300 px-6 py-3.5 text-[0.66rem] font-extrabold uppercase tracking-[0.26em] text-onyx transition-opacity hover:opacity-90"
                >
                  Send email →
                </a>
                <button
                  type="button"
                  onClick={async () => {
                    const ok = await copyText(detail.email);
                    flash(ok ? "Email copied" : "Clipboard unavailable");
                  }}
                  className="border border-ivory/15 px-6 py-3.5 text-[0.66rem] font-bold uppercase tracking-[0.24em] text-ivory/70 transition-colors hover:border-gold-500 hover:text-gold-300"
                >
                  Copy email
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 border border-gold-500/40 bg-onyx-700 px-5 py-3 text-[0.68rem] font-bold uppercase tracking-[0.2em] text-gold-200"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
