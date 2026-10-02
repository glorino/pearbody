"use client";

import Image from "next/image";
import {
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { useEffect, useRef } from "react";
import { LAUNCH_DATE_LABEL, TIKTOK_URL } from "@/lib/brand";
import { Magnetic, Monogram, Overline, TikTokIcon } from "./ui";

const EASE = [0.22, 1, 0.36, 1] as const;

function MaskedWord({
  text,
  ready,
  delayBase,
  className = "",
}: {
  text: string;
  ready: boolean;
  delayBase: number;
  className?: string;
}) {
  return (
    <span className={className} aria-hidden="true">
      {text.split("").map((ch, i) => (
        <span
          key={`${ch}-${i}`}
          className="inline-block overflow-hidden pb-[0.06em] align-bottom"
        >
          <motion.span
            className="inline-block"
            initial={{ y: "115%" }}
            animate={ready ? { y: "0%" } : { y: "115%" }}
            transition={{ delay: delayBase + i * 0.055, duration: 0.95, ease: EASE }}
          >
            {ch}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

export default function Hero({ ready }: { ready: boolean }) {
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const watermarkY = useTransform(scrollYProgress, [0, 1], ["0%", "42%"]);
  const watermarkOpacity = useTransform(scrollYProgress, [0, 1], [0.07, 0]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "-14%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const cueOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0]);

  const spotX = useMotionValue(0);
  const spotY = useMotionValue(0);
  const sx = useSpring(spotX, { stiffness: 60, damping: 20, mass: 0.6 });
  const sy = useSpring(spotY, { stiffness: 60, damping: 20, mass: 0.6 });

  useEffect(() => {
    spotX.set(window.innerWidth / 2);
    spotY.set(320);
  }, [spotX, spotY]);

  return (
    <section
      id="top"
      ref={sectionRef}
      className="grain relative isolate flex min-h-[100svh] flex-col justify-center overflow-hidden"
    >
      <div className="silk absolute inset-0 -z-20" />
      <div className="absolute -left-40 top-1/3 -z-10 hidden h-[420px] w-[420px] rounded-full bg-gold-700/10 blur-[120px] sm:block" />
      <div className="absolute -right-32 bottom-0 -z-10 hidden h-[380px] w-[380px] rounded-full bg-gold-500/10 blur-[110px] sm:block" />

      <motion.div
        aria-hidden="true"
        style={{ left: sx, top: sy }}
        className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
      >
        <div className="h-[640px] w-[640px] rounded-full bg-[radial-gradient(circle,rgba(233,200,126,0.085),transparent_62%)]" />
      </motion.div>

      <motion.div
        aria-hidden="true"
        style={{ y: watermarkY, opacity: watermarkOpacity }}
        className="pointer-events-none absolute -right-[12vmin] top-1/2 -z-10 -translate-y-1/2 text-gold-500"
      >
        <Monogram className="h-[78vmin] w-[78vmin]" strokeWidth={10} />
      </motion.div>

      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center gap-6 px-5 pb-32 pt-28 text-center sm:gap-7 sm:pb-36 sm:pt-32"
      >
        <motion.div
          initial={{ opacity: 0, y: 26, filter: "blur(10px)" }}
          animate={
            ready
              ? { opacity: 1, y: 0, filter: "blur(0px)" }
              : { opacity: 0, y: 26, filter: "blur(10px)" }
          }
          transition={{ duration: 1.1, ease: EASE }}
          className="relative"
        >
          <div className="rounded-[2px] bg-ivory p-2 shadow-[0_30px_80px_-30px_rgba(201,150,47,0.55)] ring-1 ring-gold-500/50 sm:p-2.5">
            <Image
              src="/brand/pearl-logo.jpeg"
              alt="Pearlbody.NG — ...looks beyond words"
              width={1080}
              height={687}
              priority
              className="h-auto w-[196px] sm:w-[240px]"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
          transition={{ duration: 0.9, delay: 0.25, ease: EASE }}
        >
          <Overline>Benin City · Nigeria</Overline>
        </motion.div>

        <h1 className="font-display font-medium uppercase leading-[0.86] text-ivory">
          <span className="sr-only">Pearlbody.NG — coming soon</span>
          <span className="block text-[clamp(3.1rem,13.5vw,8.8rem)] tracking-[0.08em]">
            <MaskedWord text="COMING" ready={ready} delayBase={0.45} />
          </span>
          <span className="mt-1 block text-[clamp(3.4rem,15vw,9.6rem)] tracking-[0.14em] text-gold-gradient sm:mt-2">
            <MaskedWord text="SOON" ready={ready} delayBase={0.8} />
          </span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          transition={{ duration: 0.9, delay: 1.15, ease: EASE }}
          className="font-script text-2xl text-gold-200 sm:text-3xl"
        >
          ...looks beyond words
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          transition={{ duration: 0.9, delay: 1.3, ease: EASE }}
          className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2"
        >
          <span className="hairline-gold h-px w-10 sm:w-20" />
          <span className="text-[0.66rem] font-bold uppercase tracking-[0.34em] text-ivory/80 sm:text-[0.72rem]">
            The atelier opens
          </span>
          <span className="font-display text-lg font-semibold tracking-[0.16em] text-gold-gradient sm:text-xl">
            {LAUNCH_DATE_LABEL.toUpperCase()}
          </span>
          <span className="hairline-gold h-px w-10 sm:w-20" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.9, delay: 1.45, ease: EASE }}
          className="mt-1 flex flex-col items-center gap-4 sm:flex-row sm:gap-6"
        >
          <Magnetic>
            <a
              href="#notify"
              className="group relative inline-flex items-center gap-3 overflow-hidden bg-gradient-to-r from-gold-600 via-gold-500 to-gold-400 px-8 py-4 text-[0.7rem] font-extrabold uppercase tracking-[0.28em] text-onyx shadow-[0_18px_45px_-18px_rgba(201,150,47,0.8)] transition-transform duration-300 hover:-translate-y-0.5"
            >
              <span className="relative z-10">Notify me</span>
              <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/45 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            </a>
          </Magnetic>

          <Magnetic strength={0.25}>
            <a
              href={TIKTOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 border border-ivory/25 px-7 py-4 text-[0.7rem] font-bold uppercase tracking-[0.28em] text-ivory transition-colors duration-300 hover:border-gold-400 hover:text-gold-200"
            >
              <TikTokIcon className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
              @pearlbody.ng
            </a>
          </Magnetic>
        </motion.div>
      </motion.div>

      <motion.div
        style={{ opacity: cueOpacity }}
        className="absolute inset-x-0 bottom-6 z-10 flex flex-col items-center gap-3"
      >
        <span className="text-[0.58rem] font-semibold uppercase tracking-[0.45em] text-gold-500/90">
          Scroll
        </span>
        <div className="relative h-12 w-px overflow-hidden bg-ivory/15">
          <span className="scroll-cue-dot absolute inset-x-0 top-0 h-4 bg-gold-400" />
        </div>
      </motion.div>
    </section>
  );
}
