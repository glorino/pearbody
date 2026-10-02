"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useRef, type ReactNode } from "react";

export function Monogram({
  className = "",
  strokeWidth = 18,
}: {
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      viewBox="0 0 150 140"
      className={className}
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="pb-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8b5a2b" />
          <stop offset="45%" stopColor="#c9962f" />
          <stop offset="100%" stopColor="#e9c87e" />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="13" height="132" rx="3" fill="currentColor" />
      <rect x="31" y="4" width="7" height="132" rx="3" fill="currentColor" opacity="0.55" />
      <circle
        cx="97"
        cy="70"
        r="46"
        stroke="url(#pb-gold)"
        strokeWidth={strokeWidth}
      />
      <circle cx="97" cy="70" r="19" fill="currentColor" />
    </svg>
  );
}

export function TikTokIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 0 1-2.59 2.5 2.59 2.59 0 1 1 .77-5.06v-3.1a5.66 5.66 0 0 0-.77-.05A5.66 5.66 0 1 0 15.54 15V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3a4.28 4.28 0 0 1-3.24-1.48Z" />
    </svg>
  );
}

export function Overline({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-4 text-[0.65rem] font-semibold uppercase tracking-[0.42em] text-gold-400 ${className}`}
    >
      <span className="hairline-gold h-px w-10 sm:w-16" />
      {children}
      <span className="hairline-gold h-px w-10 sm:w-16" />
    </span>
  );
}

export function Magnetic({
  children,
  className = "",
  strength = 0.35,
}: {
  children: ReactNode;
  className?: string;
  strength?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 16, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 16, mass: 0.4 });

  return (
    <motion.div
      ref={ref}
      style={{ x: sx, y: sy }}
      className={className}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        x.set((e.clientX - (r.left + r.width / 2)) * strength);
        y.set((e.clientY - (r.top + r.height / 2)) * strength);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}
