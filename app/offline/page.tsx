"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

export default function Offline() {
  const [outbox, setOutbox] = useState<number | null>(null);
  useEffect(() => {
    import("@/lib/offline").then(async (m) => {
      try { setOutbox(await m.pendingCount()); } catch { setOutbox(null); }
    }).catch(() => {});
  }, []);
  const out = async () => {
    await authClient.signOut().catch(() => {});
    try { localStorage.removeItem("chem_user"); localStorage.removeItem("chem_token"); } catch { /* noop */ }
    window.location.href = "/login";
  };
  return (
    <main className="max-w-md mx-auto p-6 space-y-4 text-center">
      <h1 className="font-extrabold text-2xl">You are offline</h1>
      <p className="text-sm text-stone-500">Sales made offline stay queued on this device and sync when the network returns. Nothing is lost.</p>
      {outbox !== null && <p className="text-sm font-bold">Queued movements: {outbox}</p>}
      <div className="grid gap-2">
        <Link href="/pos" className="px-5 py-3 rounded-xl bg-brand-700 text-white font-bold">Back to till</Link>
        <button onClick={out} className="px-5 py-3 rounded-xl bg-white border-2 border-stone-200 font-bold">Sign out</button>
      </div>
    </main>
  );
}
