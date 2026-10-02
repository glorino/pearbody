"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export default function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = (await res.json().catch(() => null)) as {
        ok?: boolean;
        error?: string;
      };

      if (res.ok && data?.ok) {
        router.push("/dashboard");
        return;
      }
      setError(data?.error || "Something went wrong. Please try again.");
    } catch {
      setError("Network hiccup — please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-7" noValidate>
      <div>
        <label
          htmlFor="login-username"
          className="block text-[0.6rem] font-bold uppercase tracking-[0.32em] text-ivory/45"
        >
          Username
        </label>
        <input
          id="login-username"
          type="text"
          required
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="pearlbody"
          maxLength={128}
          className="mt-2 w-full border-b border-ivory/20 bg-transparent pb-2 font-display text-xl text-ivory placeholder:text-ivory/25 focus:border-gold-500 focus:outline-none"
        />
      </div>

      <div>
        <label
          htmlFor="login-password"
          className="block text-[0.6rem] font-bold uppercase tracking-[0.32em] text-ivory/45"
        >
          Password
        </label>
        <input
          id="login-password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          maxLength={256}
          className="mt-2 w-full border-b border-ivory/20 bg-transparent pb-2 font-display text-xl text-ivory placeholder:text-ivory/25 focus:border-gold-500 focus:outline-none"
        />
      </div>

      {error && (
        <p role="alert" className="text-sm font-medium text-[#e07a5f]">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="group relative mt-1 flex w-full items-center justify-center gap-3 overflow-hidden bg-gradient-to-r from-gold-700 via-gold-500 to-gold-300 px-8 py-4 text-[0.7rem] font-extrabold uppercase tracking-[0.3em] text-onyx transition-opacity duration-300 hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
      >
        {busy ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-onyx border-t-transparent" />
        ) : (
          <>
            Sign in
            <span className="transition-transform duration-300 group-hover:translate-x-1.5">
              →
            </span>
          </>
        )}
      </button>
    </form>
  );
}
