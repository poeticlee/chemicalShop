"use client";
import { useState } from "react";
import { naira } from "@/lib/money";
export default function POS() {
  const [qty, setQty] = useState("1.5 L");
  const [total] = useState(3600_00);
  return (
    <main className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="font-extrabold text-2xl">POS — singles (Phase 1)</h1>
      <input value={qty} onChange={e=>setQty(e.target.value)} placeholder="Qty e.g. 1.5 L or 750 g" className="w-full px-4 py-3 rounded-xl border-2 border-stone-200" />
      <div className="bg-white rounded-2xl p-4 shadow-sm flex justify-between items-center">
        <span>Texapon {qty}</span><span className="font-extrabold">{naira(total)}</span>
      </div>
      <div className="grid grid-cols-3 gap-2 text-sm font-bold">
        <button className="bg-stone-900 text-white rounded-xl py-3">Cash</button>
        <button className="bg-stone-200 rounded-xl py-3">Transfer (Paystack)</button>
        <button className="bg-stone-200 rounded-xl py-3">POS</button>
      </div>
      <p className="text-xs text-stone-500">Full payment only. Split supported. No customer credit.</p>
    </main>
  );
}
