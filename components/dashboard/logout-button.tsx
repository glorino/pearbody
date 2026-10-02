"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LogoutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function logout() {
    if (busy) return;
    setBusy(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Even if the request fails, drop local navigation to the login screen.
    }
    router.push("/login");
  }

  return (
    <button
      type="button"
      onClick={logout}
      disabled={busy}
      className="border border-ivory/15 px-5 py-2.5 text-[0.62rem] font-bold uppercase tracking-[0.24em] text-ivory/70 transition-colors hover:border-gold-500 hover:text-gold-300 disabled:opacity-60"
    >
      {busy ? "Signing out…" : "Sign out"}
    </button>
  );
}
