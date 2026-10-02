"use client";

import { AnimatePresence, motion, useInView } from "framer-motion";
import { useRef, useState, type FormEvent } from "react";
import { TIKTOK_HANDLE, TIKTOK_URL } from "@/lib/brand";
import { Magnetic, TikTokIcon } from "./ui";

const EASE = [0.22, 1, 0.36, 1] as const;

type Status = "idle" | "loading" | "success" | "already" | "error";

export default function Notify() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const formRef = useRef<HTMLDivElement>(null);
  const inView = useInView(formRef, { once: true, amount: 0.4 });

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "loading") return;
    if (honeypot) return;

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, source: "coming-soon-landing" }),
      });
      const data = (await res.json()) as { ok: boolean; already?: boolean; error?: string };

      if (data.ok) {
        setStatus(data.already ? "already" : "success");
        setMessage(
          data.already
            ? "You're already on the list — we'll be in touch."
            : "You're on the list. Watch your inbox for the private preview.",
        );
        setEmail("");
        setName("");
      } else {
        setStatus("error");
        setMessage(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Network hiccup — please try again.");
    }
  }

  const busy = status === "loading";
  const done = status === "success" || status === "already";

  return (
    <section
      id="notify"
      className="relative overflow-hidden bg-ivory py-24 text-onyx sm:py-32"
    >
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gold-400/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 -left-20 h-80 w-80 rounded-full bg-gold-600/20 blur-3xl" />
      <div className="pointer-events-none absolute inset-x-6 inset-y-6 border border-gold-600/25 sm:inset-x-10 sm:inset-y-10" />

      <div className="relative mx-auto grid max-w-6xl gap-14 px-8 sm:px-14 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.9, ease: EASE }}
        >
          <span className="inline-flex items-center gap-4 text-[0.65rem] font-semibold uppercase tracking-[0.42em] text-gold-700">
            <span className="hairline-gold h-px w-10" />
            The inner circle
          </span>

          <h2 className="mt-6 font-display text-[clamp(2.3rem,5.6vw,4.2rem)] font-light leading-[1.02]">
            Be first through
            <br />
            <span className="italic text-gold-gradient">the doors.</span>
          </h2>

          <p className="mt-6 max-w-md text-sm leading-relaxed text-onyx/65 sm:text-base">
            Launch-day invitations, private previews of the atelier, and early
            access to bespoke bookings — delivered before the world steps in.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-[0.62rem] font-bold uppercase tracking-[0.3em] text-onyx/50">
            <span>Quality</span>
            <span className="text-gold-600">◆</span>
            <span>Professionalism</span>
            <span className="text-gold-600">◆</span>
            <span>Reliability</span>
          </div>
        </motion.div>

        <motion.div
          ref={formRef}
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, delay: 0.15, ease: EASE }}
          className="border border-onyx/10 bg-white/70 p-7 shadow-[0_40px_90px_-50px_rgba(11,11,11,0.55)] backdrop-blur-sm sm:p-9"
        >
          <AnimatePresence mode="wait">
            {done ? (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.55, ease: EASE }}
                className="flex flex-col items-center gap-5 py-6 text-center"
              >
                <svg viewBox="0 0 52 52" className="h-14 w-14">
                  <motion.circle
                    cx="26"
                    cy="26"
                    r="24"
                    fill="none"
                    stroke="#c9962f"
                    strokeWidth="2"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.7, ease: EASE }}
                  />
                  <motion.path
                    d="M15 27l8 8 15-16"
                    fill="none"
                    stroke="#0b0b0b"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5, delay: 0.5, ease: EASE }}
                  />
                </svg>
                <p className="font-display text-2xl font-medium">{message}</p>
                <p className="text-[0.62rem] font-semibold uppercase tracking-[0.3em] text-onyx/45">
                  Pearlbody.NG · Inner circle
                </p>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                initial={false}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35 }}
                className="flex flex-col gap-6"
                noValidate
              >
                <div>
                  <label
                    htmlFor="notify-name"
                    className="block text-[0.6rem] font-bold uppercase tracking-[0.32em] text-onyx/50"
                  >
                    First name{" "}
                    <span className="font-medium normal-case tracking-normal text-onyx/35">
                      (optional)
                    </span>
                  </label>
                  <input
                    id="notify-name"
                    type="text"
                    autoComplete="given-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Amara"
                    maxLength={60}
                    className="mt-2 w-full border-b border-onyx/20 bg-transparent pb-2 font-display text-xl text-onyx placeholder:text-onyx/25 focus:border-gold-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="notify-email"
                    className="block text-[0.6rem] font-bold uppercase tracking-[0.32em] text-onyx/50"
                  >
                    Email address
                  </label>
                  <input
                    id="notify-email"
                    type="email"
                    required
                    autoComplete="email"
                    inputMode="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@house.com"
                    className="mt-2 w-full border-b border-onyx/20 bg-transparent pb-2 font-display text-xl text-onyx placeholder:text-onyx/25 focus:border-gold-600 focus:outline-none"
                  />
                </div>

                <input
                  type="text"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  className="absolute -left-[9999px] h-0 w-0 opacity-0"
                />

                <AnimatePresence>
                  {status === "error" && (
                    <motion.p
                      key="err"
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-sm font-medium text-red-700"
                      role="alert"
                    >
                      {message}
                    </motion.p>
                  )}
                </AnimatePresence>

                <Magnetic className="w-full" strength={0.18}>
                  <button
                    type="submit"
                    disabled={busy}
                    className="group relative flex w-full items-center justify-center gap-3 overflow-hidden bg-onyx px-8 py-4 text-[0.7rem] font-extrabold uppercase tracking-[0.3em] text-ivory transition-colors duration-300 hover:text-gold-200 disabled:cursor-wait disabled:opacity-70"
                  >
                    {busy ? (
                      <motion.span
                        className="h-4 w-4 rounded-full border-2 border-gold-400 border-t-transparent"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
                      />
                    ) : (
                      <>
                        Notify me
                        <span className="transition-transform duration-300 group-hover:translate-x-1.5">
                          →
                        </span>
                      </>
                    )}
                  </button>
                </Magnetic>

                <p className="text-center text-[0.62rem] uppercase tracking-[0.22em] text-onyx/40">
                  No spam — only atelier news. Unsubscribe anytime.
                </p>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="mt-7 border-t border-onyx/10 pt-6">
            <a
              href={TIKTOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between gap-4 text-onyx transition-colors hover:text-gold-700"
            >
              <span className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full border border-onyx/15 transition-colors group-hover:border-gold-600 group-hover:bg-gold-500 group-hover:text-white">
                  <TikTokIcon className="h-4 w-4" />
                </span>
                <span className="text-[0.64rem] font-bold uppercase tracking-[0.26em]">
                  Follow the journey
                </span>
              </span>
              <span className="font-display text-lg italic text-gold-700">
                {TIKTOK_HANDLE}
              </span>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
