"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import LogoutButton from "./logout-button";
import { Monogram } from "@/components/ui";
import { LAUNCH_DATE_LABEL, TIKTOK_URL } from "@/lib/brand";

const EASE = [0.22, 1, 0.36, 1] as const;

export type Panel = "overview" | "subscribers" | "sync";

const NAV: { id: Panel; label: string; icon: ReactNode }[] = [
  {
    id: "overview",
    label: "Overview",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="3" y="3" width="7" height="9" rx="1" />
        <rect x="14" y="3" width="7" height="5" rx="1" />
        <rect x="14" y="12" width="7" height="9" rx="1" />
        <rect x="3" y="16" width="7" height="5" rx="1" />
      </svg>
    ),
  },
  {
    id: "subscribers",
    label: "Subscribers",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    id: "sync",
    label: "Mailchimp sync",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M21 12a9 9 0 0 1-9 9 9 9 0 0 1-6.36-2.64L3 16" />
        <path d="M3 12a9 9 0 0 1 9-9 9 9 0 0 1 6.36 2.64L21 8" />
        <path d="M21 3v5h-5M3 21v-5h5" />
      </svg>
    ),
  },
];

const TITLES: Record<Panel, { title: string; subtitle: string }> = {
  overview: {
    title: "Overview",
    subtitle: "Growth, sources and launch readiness at a glance",
  },
  subscribers: {
    title: "Subscribers",
    subtitle: "Everyone who asked to be first through the doors",
  },
  sync: {
    title: "Mailchimp sync",
    subtitle: "Reconcile the Neon list with your Mailchimp audience",
  },
};

export default function Shell({
  panel,
  onPanelChange,
  badge,
  children,
}: {
  panel: Panel;
  onPanelChange: (p: Panel) => void;
  badge?: ReactNode;
  children: ReactNode;
}) {
  const [drawer, setDrawer] = useState(false);

  function selectPanel(next: Panel) {
    setDrawer(false);
    onPanelChange(next);
  }

  const meta = TITLES[panel];

  const navList = (
    <nav className="flex flex-col gap-1">
      {NAV.map((item) => {
        const active = item.id === panel;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => selectPanel(item.id)}
            aria-current={active ? "page" : undefined}
            className={`relative flex items-center gap-3 px-4 py-3 text-left text-[0.68rem] font-bold uppercase tracking-[0.22em] transition-colors ${
              active ? "text-gold-200" : "text-ivory/50 hover:text-ivory/90"
            }`}
          >
            {active && (
              <motion.span
                layoutId="nav-active"
                className="absolute inset-0 border border-gold-500/40 bg-gold-500/10"
                transition={{ duration: 0.35, ease: EASE }}
              />
            )}
            <span className="relative">{item.icon}</span>
            <span className="relative">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );

  const sidebarInner = (
    <div className="flex h-full flex-col">
      <div className="border-b border-ivory/10 px-6 py-6">
        <Link href="/" className="flex items-center gap-4">
          <Monogram className="h-9 w-auto text-ivory" />
          <span className="font-display text-xl leading-none text-ivory">
            Pearlbody<span className="text-gold-400">.NG</span>
          </span>
        </Link>
        <p className="mt-3 text-[0.56rem] font-bold uppercase tracking-[0.3em] text-ivory/35">
          Atelier dashboard
        </p>
      </div>

      <div className="flex-1 overflow-y-auto py-6">{navList}</div>

      <div className="border-t border-ivory/10 px-6 py-5">
        <div className="mb-4 border border-gold-500/25 bg-gold-500/5 p-4">
          <p className="text-[0.56rem] font-bold uppercase tracking-[0.26em] text-gold-400">
            Launch
          </p>
          <p className="mt-1.5 font-display text-lg leading-tight text-ivory">
            {LAUNCH_DATE_LABEL}
          </p>
          <div className="mt-3 h-1 w-full overflow-hidden bg-onyx-600">
            <div className="h-full w-[72%] bg-gradient-to-r from-gold-700 to-gold-300" />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <a
            href={TIKTOK_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[0.6rem] font-bold uppercase tracking-[0.22em] text-ivory/40 transition-colors hover:text-gold-300"
          >
            View TikTok →
          </a>
          <LogoutButton />
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative min-h-dvh bg-onyx">
      <div className="silk pointer-events-none fixed inset-0" aria-hidden="true" />

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-ivory/10 bg-onyx-900/95 lg:block">
        {sidebarInner}
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 border-b border-ivory/10 bg-onyx-900/95 backdrop-blur-sm lg:hidden">
        <div className="flex items-center justify-between px-4 py-3.5">
          <Link href="/" className="flex items-center gap-3">
            <Monogram className="h-8 w-auto text-ivory" />
            <span className="font-display text-lg leading-none text-ivory">
              Pearlbody<span className="text-gold-400">.NG</span>
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setDrawer(true)}
            aria-label="Open navigation"
            className="grid h-10 w-10 place-items-center border border-ivory/15 text-ivory/70"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
        </div>
        <div className="flex gap-1 overflow-x-auto px-3 pb-2">
          {NAV.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => selectPanel(item.id)}
              className={`shrink-0 border px-3.5 py-2 text-[0.6rem] font-bold uppercase tracking-[0.2em] transition-colors ${
                item.id === panel
                  ? "border-gold-500/50 bg-gold-500/10 text-gold-200"
                  : "border-ivory/10 text-ivory/45"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {drawer && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-onyx/80 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawer(false)}
            />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 w-72 border-r border-ivory/10 bg-onyx-900 lg:hidden"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.4, ease: EASE }}
            >
              <button
                type="button"
                onClick={() => setDrawer(false)}
                aria-label="Close navigation"
                className="absolute right-3 top-4 z-10 grid h-9 w-9 place-items-center text-ivory/60"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
              {sidebarInner}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="relative lg:pl-72">
        <div className="mx-auto max-w-6xl px-5 pb-20 pt-8 sm:px-8">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-3 text-[0.6rem] font-semibold uppercase tracking-[0.4em] text-gold-400">
                <span className="hairline-gold h-px w-6" />
                Pearlbody.NG
              </span>
              <h1 className="mt-3 font-display text-[clamp(1.9rem,4vw,2.8rem)] font-light text-ivory">
                {meta.title}
              </h1>
              <p className="mt-1.5 text-sm text-ivory/45">{meta.subtitle}</p>
            </div>
            <div className="flex items-center gap-3">{badge}</div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={panel}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease: EASE }}
            >
              {children}
            </motion.div>
          </AnimatePresence>

          <p className="mt-14 text-center text-[0.58rem] uppercase tracking-[0.3em] text-ivory/25">
            Pearlbody.NG — ...looks beyond words
          </p>
        </div>
      </div>
    </div>
  );
}
