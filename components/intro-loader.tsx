"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Monogram } from "./ui";

const WORD = "PEARLBODY.NG".split("");

export default function IntroLoader({ onComplete }: { onComplete: () => void }) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t1 = window.setTimeout(() => setLeaving(true), 2100);
    const t2 = window.setTimeout(() => onComplete(), 3000);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      document.body.style.overflow = prev;
    };
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] grid place-items-center bg-onyx"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.6, ease: [0.65, 0, 0.35, 1] } }}
      aria-hidden="true"
    >
      <div className="grain absolute inset-0" />

      <div className="relative flex flex-col items-center gap-7 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.86 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="text-ivory"
        >
          <Monogram className="h-24 w-24 sm:h-28 sm:w-28" />
        </motion.div>

        <div className="flex overflow-hidden">
          {WORD.map((ch, i) => (
            <motion.span
              key={`${ch}-${i}`}
              className="font-display text-lg font-medium tracking-[0.4em] text-ivory sm:text-xl"
              initial={{ y: "110%" }}
              animate={{ y: 0 }}
              transition={{
                delay: 0.35 + i * 0.045,
                duration: 0.7,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              {ch}
            </motion.span>
          ))}
        </div>

        <div className="h-px w-56 overflow-hidden bg-onyx-600 sm:w-72">
          <motion.div
            className="h-full w-full origin-left hairline-gold"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.4, duration: 1.5, ease: [0.65, 0, 0.35, 1] }}
          />
        </div>

        <motion.p
          className="font-script text-base text-gold-300 sm:text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: leaving ? 0 : 1 }}
          transition={{ delay: 1, duration: 0.8 }}
        >
          ...looks beyond words
        </motion.p>
      </div>

      <motion.div
        className="absolute inset-x-0 bottom-8 flex justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3, duration: 0.6 }}
      >
        <span className="text-[0.6rem] uppercase tracking-[0.5em] text-gold-500">
          Loading the atelier
        </span>
      </motion.div>
    </motion.div>
  );
}
