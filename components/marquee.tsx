"use client";

import { BRAND_VALUES, SERVICES } from "@/lib/brand";

function Row({
  items,
  className,
  animationClass,
  separator,
}: {
  items: string[];
  className: string;
  animationClass: string;
  separator: string;
}) {
  const doubled = [...items, ...items];
  return (
    <div className={`relative flex overflow-hidden py-4 ${className}`}>
      <div className={`flex min-w-max shrink-0 items-center ${animationClass}`}>
        {doubled.map((item, i) => (
          <span key={`${item}-${i}`} className="flex items-center">
            <span className="whitespace-nowrap px-6 text-[0.7rem] font-bold uppercase tracking-[0.4em] sm:px-8 sm:text-[0.78rem]">
              {item}
            </span>
            <span className="text-[0.55rem] opacity-70">{separator}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Marquee() {
  return (
    <div className="relative select-none border-y border-gold-700/40 bg-gradient-to-r from-gold-700 via-gold-500 to-gold-700 text-onyx">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.28),transparent)] opacity-40" />
      <Row
        items={BRAND_VALUES}
        className="relative"
        animationClass="animate-marquee"
        separator="◆"
      />
      <div className="relative h-px w-full bg-onyx/25" />
      <Row
        items={SERVICES}
        className="relative bg-onyx-900 text-gold-200"
        animationClass="animate-marquee-slow"
        separator="✦"
      />
    </div>
  );
}
