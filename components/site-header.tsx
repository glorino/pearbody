"use client";

import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useState } from "react";
import { TIKTOK_URL } from "@/lib/brand";
import { Magnetic, Monogram, TikTokIcon } from "./ui";

export default function SiteHeader({ ready }: { ready: boolean }) {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);

  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 40));

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={ready ? { y: 0, opacity: 1 } : {}}
      transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500 ${
        scrolled
          ? "border-b border-gold-500/20 bg-onyx backdrop-blur-none sm:bg-onyx/80 sm:backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 sm:h-20 sm:px-8">
        <a href="#top" className="group flex items-center gap-3" aria-label="Pearlbody.NG home">
          <Monogram className="h-7 w-7 text-ivory transition-transform duration-500 group-hover:rotate-[8deg] sm:h-8 sm:w-8" />
          <span className="font-display text-sm font-semibold uppercase tracking-[0.32em] text-ivory sm:text-base">
            <span className="text-gold-gradient">Pearl</span>
            <span className="tracking-[0.2em]"> Body.NG</span>
          </span>
        </a>

        <nav className="flex items-center gap-3 sm:gap-6">
          <a
            href="#countdown"
            className="hidden text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-ivory/70 transition-colors hover:text-gold-300 sm:block"
          >
            Countdown
          </a>
          <a
            href="#notify"
            className="hidden text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-ivory/70 transition-colors hover:text-gold-300 sm:block"
          >
            Notify me
          </a>
          <Magnetic strength={0.25}>
            <a
              href={TIKTOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Follow Pearlbody.NG on TikTok`}
              className="flex items-center gap-2 border border-gold-500/40 bg-onyx-700/60 px-3 py-2 text-gold-200 transition-colors duration-300 hover:border-gold-400 hover:bg-gold-500 hover:text-onyx sm:px-4"
            >
              <TikTokIcon className="h-4 w-4" />
              <span className="text-[0.62rem] font-bold uppercase tracking-[0.24em]">
                Follow
              </span>
            </a>
          </Magnetic>
        </nav>
      </div>
    </motion.header>
  );
}
