"use client";
import { useState } from "react";
import { fmtQty } from "@/lib/money";
export default function Stock() {
  const [loc, setLoc] = useState(""); const [rows, setRows] = useState<any[]>([]);
  const load = async () => {
    const r = await fetch(`/api/stock?locationId=${loc}`); const d = await r.json(); setRows(d.stock ?? []);
  };
  return (
    <main className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="font-extrabold text-2xl">Stock by location</h1>
      <div className="flex gap-2"><input value={loc} onChange={e=>setLoc(e.target.value)} placeholder="locationId" className="flex-1 px-4 py-3 rounded-xl border-2 border-stone-200" /><button onClick={load} className="px-5 py-3 rounded-xl bg-brand-700 text-white font-bold">Load</button></div>
      <div className="bg-white rounded-2xl shadow-sm divide-y">{rows.map((s:any)=>(<div key={s.itemId} className="p-3 flex justify-between text-sm"><span className="font-bold">{s.code} — {s.name}</span><span className={s.low?"text-amber-700 font-bold":""}>{fmtQty(s.qty, s.baseUnit)}{s.low?" • LOW":""}</span></div>))}</div>
    </main>
  );
}
