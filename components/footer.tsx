"use client";

import { motion } from "framer-motion";
import {
  ADDRESS_LINES,
  BRAND_VALUES,
  LAUNCH_DATE_SHORT,
  PHONE_ONE,
  PHONE_TWO,
  TIKTOK_HANDLE,
  TIKTOK_URL,
} from "@/lib/brand";
import { Monogram, TikTokIcon } from "./ui";

const EASE = [0.22, 1, 0.36, 1] as const;

export default function Footer() {
  return (
    <footer className="grain relative overflow-hidden border-t border-gold-500/20 bg-onyx-900 pt-16 pb-8">
      <div className="pointer-events-none absolute -right-16 top-6 text-gold-500 opacity-[0.05]">
        <Monogram className="h-[340px] w-[340px]" strokeWidth={8} />
      </div>

      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.9, ease: EASE }}
          className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4"
        >
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3">
              <Monogram className="h-9 w-9 text-ivory" />
              <span className="font-display text-base font-semibold uppercase tracking-[0.28em] text-ivory">
                <span className="text-gold-gradient">Pearl</span> Body.NG
              </span>
            </div>
            <p className="mt-4 font-script text-xl text-gold-300">
              ...looks beyond words
            </p>
            <p className="mt-5 text-xs leading-relaxed text-ivory/45">
              A house of fashion, bespoke tailoring, bridal wears & silk,
              skincare and all-round wellness.
            </p>
          </div>

          <div>
            <h3 className="text-[0.62rem] font-bold uppercase tracking-[0.34em] text-gold-500">
              The Atelier
            </h3>
            <address className="mt-5 space-y-1 text-sm not-italic leading-relaxed text-ivory/60">
              {ADDRESS_LINES.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </address>
            <div className="mt-5 space-y-1.5 text-sm text-ivory/60">
              <a
                href={`tel:${PHONE_ONE.replace(/\s/g, "")}`}
                className="block transition-colors hover:text-gold-300"
              >
                {PHONE_ONE}
              </a>
              <a
                href={`tel:${PHONE_TWO.replace(/\s/g, "")}`}
                className="block transition-colors hover:text-gold-300"
              >
                {PHONE_TWO}
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-[0.62rem] font-bold uppercase tracking-[0.34em] text-gold-500">
              Follow
            </h3>
            <a
              href={TIKTOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group mt-5 inline-flex items-center gap-3 border border-ivory/15 px-4 py-3 text-ivory/80 transition-colors duration-300 hover:border-gold-400 hover:text-gold-200"
            >
              <TikTokIcon className="h-4 w-4" />
              <span className="text-[0.66rem] font-bold uppercase tracking-[0.24em]">
                {TIKTOK_HANDLE}
              </span>
            </a>
            <p className="mt-4 text-xs text-ivory/40">
              Fashion · Lifestyle · Skincare · Mini vlogs
            </p>
          </div>

          <div>
            <h3 className="text-[0.62rem] font-bold uppercase tracking-[0.34em] text-gold-500">
              Launching
            </h3>
            <p className="mt-5 font-display text-3xl text-gold-gradient">
              {LAUNCH_DATE_SHORT}
            </p>
            <p className="mt-2 text-xs uppercase tracking-[0.26em] text-ivory/45">
              00:00 WAT · Benin City
            </p>
            <a
              href="#countdown"
              className="mt-5 inline-block text-[0.64rem] font-bold uppercase tracking-[0.28em] text-gold-400 transition-colors hover:text-gold-200"
            >
              View countdown ↑
            </a>
          </div>
        </motion.div>

        <div className="mt-14 h-px w-full hairline-gold opacity-50" />

        <div className="mt-6 flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
          <p className="text-[0.62rem] uppercase tracking-[0.26em] text-ivory/35">
            © {new Date().getFullYear()} Pearlbody.NG — All rights reserved
          </p>
          <p className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[0.62rem] font-semibold uppercase tracking-[0.3em] text-ivory/45">
            {BRAND_VALUES.map((v, i) => (
              <span key={v} className="flex items-center gap-4">
                {i > 0 && <span className="text-gold-700">|</span>}
                {v}
              </span>
            ))}
          </p>
        </div>
      </div>
    </footer>
  );
}
