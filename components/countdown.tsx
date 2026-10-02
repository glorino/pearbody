"use client";

import { AnimatePresence, motion, useScroll, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { COUNTDOWN_START_ISO, LAUNCH_DATE, LAUNCH_DATE_LABEL, LAUNCH_DATE_SHORT } from "@/lib/brand";
import { Overline } from "./ui";

const EASE = [0.22, 1, 0.36, 1] as const;
const START = new Date(COUNTDOWN_START_ISO).getTime();

type Remaining = { days: number; hours: number; minutes: number; seconds: number };

function computeRemaining(): Remaining {
  const diff = Math.max(0, LAUNCH_DATE.getTime() - Date.now());
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff / 3_600_000) % 24),
    minutes: Math.floor((diff / 60_000) % 60),
    seconds: Math.floor((diff / 1_000) % 60),
  };
}

function RollingDigit({ value }: { value: number }) {
  return (
    <span className="relative inline-block h-[1.05em] w-[0.6em] overflow-hidden align-baseline">
      <AnimatePresence initial={false}>
        <motion.span
          key={value}
          initial={{ y: "100%" }}
          animate={{ y: "0%" }}
          exit={{ y: "-100%" }}
          transition={{ duration: 0.6, ease: EASE }}
          className="absolute inset-0 flex items-center justify-center text-gold-static"
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function Digits({ value, pad = 2 }: { value: number; pad?: number }) {
  const str = String(value).padStart(pad, "0");
  return (
    <span className="tabular-nums" aria-label={String(value)}>
      {str.split("").map((ch, i) => (
        <RollingDigit key={i} value={Number(ch)} />
      ))}
    </span>
  );
}

const UNITS: { key: keyof Remaining; label: string }[] = [
  { key: "days", label: "Days" },
  { key: "hours", label: "Hours" },
  { key: "minutes", label: "Minutes" },
  { key: "seconds", label: "Seconds" },
];

export default function Countdown() {
  const [remaining, setRemaining] = useState<Remaining | null>(null);
  const [pct, setPct] = useState<number | null>(null);
  const launched = remaining !== null && remaining.days + remaining.hours + remaining.minutes + remaining.seconds === 0;

  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const frameY = useTransform(scrollYProgress, [0, 1], [40, -40]);

  const barWidth = useSpring(0, { stiffness: 30, damping: 22 });
  const barWidthPct = useTransform(barWidth, (v) => `${v}%`);

  useEffect(() => {
    const tick = () => {
      setRemaining(computeRemaining());
      setPct(
        Math.min(
          100,
          Math.max(0, ((Date.now() - START) / (LAUNCH_DATE.getTime() - START)) * 100),
        ),
      );
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (pct === null) return;
    const t = window.setTimeout(() => barWidth.set(pct), 350);
    return () => window.clearTimeout(t);
  }, [barWidth, pct]);

  return (
    <section
      id="countdown"
      ref={sectionRef}
      className="grain relative overflow-hidden border-t border-gold-500/15 bg-onyx-800 py-24 sm:py-32"
    >
      <div className="absolute inset-x-0 top-0 h-px hairline-gold opacity-60" />
      <div className="absolute left-1/2 top-1/2 -z-0 hidden h-[520px] w-[820px] max-w-[120vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold-700/10 blur-[140px] sm:block" />

      <motion.div
        style={{ y: frameY }}
        className="relative z-10 mx-auto flex max-w-6xl flex-col items-center px-5 text-center sm:px-8"
      >
        <Overline>The doors open in</Overline>

        <h2 className="mt-7 max-w-3xl font-display text-[clamp(2.2rem,5.4vw,4rem)] font-light leading-[1.05] text-ivory">
          A moment worth{" "}
          <span className="italic text-gold-gradient">the wait</span>
        </h2>

        <p className="mt-5 max-w-xl text-sm leading-relaxed text-ivory/55 sm:text-base">
          Every stitch, every ritual, every silhouette — perfected before the
          house reveals its digital doors on{" "}
          <span className="text-gold-300">{LAUNCH_DATE_LABEL}</span>.
        </p>

        <AnimatePresence mode="wait">
          {launched ? (
            <motion.div
              key="live"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7, ease: EASE }}
              className="mt-12 border border-gold-400/50 bg-onyx-700/70 px-10 py-8"
            >
              <p className="font-display text-4xl text-gold-gradient sm:text-5xl">
                We are live
              </p>
              <p className="mt-3 text-xs uppercase tracking-[0.3em] text-ivory/60">
                Welcome to Pearlbody.NG
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="countdown"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.9, ease: EASE }}
              className="mt-12 w-full"
            >
              <div className="mx-auto grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-5">
                {UNITS.map(({ key, label }, idx) => (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, y: 34 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{ duration: 0.8, delay: 0.12 * idx, ease: EASE }}
                    className="plate-corner group relative border border-gold-500/25 bg-linear-135 from-onyx-700 to-onyx-900 px-2 py-7 shadow-[inset_0_1px_0_rgba(233,200,126,0.12)] transition-colors duration-500 hover:border-gold-400/60 sm:py-9"
                  >
                    <div className="font-display text-[clamp(2.6rem,7vw,4.4rem)] font-medium leading-none text-gold-gradient">
                      {remaining === null ? (
                        <span className="opacity-0">00</span>
                      ) : (
                        <Digits value={remaining[key]} />
                      )}
                    </div>
                    <div className="mt-4 text-[0.58rem] font-bold uppercase tracking-[0.34em] text-ivory/55 sm:text-[0.64rem]">
                      {label}
                    </div>
                    <div className="absolute inset-x-6 bottom-0 h-px origin-left scale-x-0 bg-linear-90/from-gold-500 to-gold-200 transition-transform duration-500 group-hover:scale-x-100" />
                  </motion.div>
                ))}
              </div>

              <div className="mx-auto mt-12 max-w-3xl">
                <div className="mb-3 flex items-end justify-between text-[0.58rem] font-semibold uppercase tracking-[0.3em] text-ivory/45">
                  <span>Journey to launch</span>
                  <span className="text-gold-400">
                    {pct === null ? "—" : `${Math.round(pct)}%`}
                  </span>
                </div>
                <div className="relative h-[3px] w-full overflow-hidden bg-onyx-600">
                  <motion.div
                    style={{ width: barWidthPct }}
                    className="h-full bg-linear-90 from-gold-700 via-gold-500 to-gold-200 shadow-[0_0_14px_rgba(233,200,126,0.6)]"
                  />
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[0.6rem] uppercase tracking-[0.3em] text-ivory/45">
                  <span>Benin City · Nigeria</span>
                  <span className="text-gold-600">◆</span>
                  <span className="text-gold-300">{LAUNCH_DATE_SHORT}</span>
                  <span className="text-gold-600">◆</span>
                  <span>00:00 WAT</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
