"use client";

import { AnimatePresence, MotionConfig } from "framer-motion";
import { useCallback, useState } from "react";
import Countdown from "./countdown";
import Footer from "./footer";
import Hero from "./hero";
import IntroLoader from "./intro-loader";
import Marquee from "./marquee";
import Notify from "./notify";
import SiteHeader from "./site-header";

export default function ComingSoon() {
  const [ready, setReady] = useState(false);
  const handleLoaderComplete = useCallback(() => setReady(true), []);

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence>
        {!ready && <IntroLoader key="loader" onComplete={handleLoaderComplete} />}
      </AnimatePresence>

      <SiteHeader ready={ready} />

      <main className="flex-1">
        <Hero ready={ready} />
        <Countdown />
        <Marquee />
        <Notify />
      </main>

      <Footer />
    </MotionConfig>
  );
}
