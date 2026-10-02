"use client";
import { useState } from "react";
import { naira } from "@/lib/money";
export default function Dashboard() {
  const [loc, setLoc] = useState(""); const [d, setD] = useState<any>(null);
  const load = async () => { const r = await fetch(`/api/reports/summary?locationId=${loc}`); setD(await r.json()); };
  return (
    <main className="max-w-4xl mx-auto p-6 space-y-4">
      <h1 className="font-extrabold text-2xl">Owner dashboard</h1>
      <div className="flex gap-2"><input value={loc} onChange={e=>setLoc(e.target.value)} placeholder="locationId" className="flex-1 px-4 py-3 rounded-xl border-2 border-stone-200" /><button onClick={load} className="px-5 py-3 rounded-xl bg-stone-900 text-white font-bold">Load</button></div>
      {d && (
        <div className="grid md:grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl p-4 shadow-sm"><div className="text-xs text-stone-500">Sales</div><div className="font-extrabold text-xl">{naira(d.salesTotalKobo)} <span className="text-xs font-medium">({d.salesCount} sales)</span></div></div>
          <div className="bg-white rounded-2xl p-4 shadow-sm"><div className="text-xs text-stone-500">Stock value</div><div className="font-extrabold text-xl">{naira(d.stockValuationKobo)}</div></div>
          <div className="bg-white rounded-2xl p-4 shadow-sm"><div className="text-xs text-stone-500">Expenses</div><div className="font-extrabold text-xl">{naira(d.expensesKobo)}</div></div>
        </div>
      )}
    </main>
  );
}
