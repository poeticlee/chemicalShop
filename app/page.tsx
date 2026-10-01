import Link from "next/link";
export default function Home() {
  return (
    <main className="max-w-6xl mx-auto p-6 space-y-6">
      <header className="flex items-center justify-between bg-white rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-700 text-white grid place-items-center font-extrabold">C</div>
          <div><div className="font-bold">Chemical Shop</div><div className="text-xs text-stone-500">Phase 1 — offline POS + ledger</div></div>
        </div>
        <Link href="/pos" className="px-5 py-3 rounded-xl bg-brand-700 text-white font-bold">Open POS</Link>
      </header>
      <div className="grid md:grid-cols-3 gap-4">
        {[["Items & prices","/items","Master + location overrides"],["Receive stock","/receive","Landed cost + lots"],["Stock","/stock","Ledger + counts"]].map(([t,h,d])=>(
          <Link key={h} href={h} className="bg-white rounded-2xl p-5 shadow-sm"><div className="font-bold">{t}</div><div className="text-sm text-stone-500">{d}</div></Link>
        ))}
      </div>
      <p className="text-xs text-stone-500">Next.js + Tailwind + BetterAuth + Postgres + R2 + Paystack + Resend. Offline via IndexedDB outbox.</p>
    </main>
  );
}
