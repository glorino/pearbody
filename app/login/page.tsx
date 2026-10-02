import type { Metadata } from "next";
import { redirect } from "next/navigation";
import LoginForm from "@/components/dashboard/login-form";
import { Monogram } from "@/components/ui";
import { isAuthed } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Dashboard Login — Pearlbody.NG",
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  if (await isAuthed()) redirect("/dashboard");

  return (
    <main className="relative grain flex min-h-dvh items-center justify-center overflow-hidden bg-onyx px-6 py-16">
      <div className="silk pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-gold-700/15 blur-[120px]" />

      <div className="relative w-full max-w-md">
        <div className="mb-10 flex flex-col items-center text-center">
          <Monogram className="h-14 w-auto text-ivory" />
          <span className="mt-6 inline-flex items-center gap-4 text-[0.6rem] font-semibold uppercase tracking-[0.42em] text-gold-400">
            <span className="hairline-gold h-px w-8" />
            Pearlbody.NG
            <span className="hairline-gold h-px w-8" />
          </span>
          <h1 className="mt-4 font-display text-4xl font-light text-ivory">
            Atelier <span className="italic text-gold-300">dashboard</span>
          </h1>
          <p className="mt-3 text-xs uppercase tracking-[0.28em] text-ivory/40">
            Staff access only
          </p>
        </div>

        <div className="plate-corner relative border border-ivory/10 bg-onyx-800/90 p-8 sm:p-10">
          <LoginForm />
        </div>

        <p className="mt-8 text-center text-[0.6rem] uppercase tracking-[0.3em] text-ivory/30">
          ...looks beyond words
        </p>
      </div>
    </main>
  );
}
