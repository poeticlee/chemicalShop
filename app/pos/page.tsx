"use client";
import { useEffect, useState } from "react";
import { naira } from "@/lib/money";
import { db, pendingCount, flushOutbox, queueMovement } from "@/lib/offline";
export default function POS() {
  const [qty, setQty] = useState("1.5 L");
  const [total] = useState(3600_00);
  const [pending, setPending] = useState(0);
  const [phone, setPhone] = useState("");
  useEffect(()=>{ pendingCount().catch(()=>0).then(setPending); },[]);
  const sellOffline = async () => {
    await queueMovement({ id: crypto.randomUUID(), itemId: "demo", locationId: "demo", qtyBase: 1500, type: "sale", referenceId: crypto.randomUUID(), userId: "demo", deviceId: "web", createdAt: new Date().toISOString() });
    setPending(await pendingCount().catch(()=>0));
  };
  const sync = async () => { const r = await flushOutbox().catch(()=>({pushed:0})); alert(`Synced: ${JSON.stringify(r)}`); setPending(await pendingCount().catch(()=>0)); };
  const share = () => {
    const text = `Chemical Shop receipt\nTexapon ${qty} — ${naira(total)}\nTotal: ${naira(total)}`;
    window.open(`https://wa.me/${phone.replace(/[^0-9]/g,"")}?text=${encodeURIComponent(text)}`, "_blank");
  };
  return (
    <main className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="font-extrabold text-2xl">POS — singles (Phase 1) + offline</h1>
      <div className="text-xs font-bold px-3 py-1 rounded-full bg-stone-200 inline-block">SYNC PENDING • {pending} {typeof navigator !== "undefined" && !navigator.onLine ? "(OFFLINE)" : ""}</div>
      <input value={qty} onChange={e=>setQty(e.target.value)} placeholder="Qty e.g. 1.5 L or 750 g" className="w-full px-4 py-3 rounded-xl border-2 border-stone-200" />
      <div className="bg-white rounded-2xl p-4 shadow-sm flex justify-between items-center">
        <span>Texapon {qty}</span><span className="font-extrabold">{naira(total)}</span>
      </div>
      <div className="grid grid-cols-3 gap-2 text-sm font-bold">
        <button className="bg-stone-900 text-white rounded-xl py-3">Cash</button>
        <button className="bg-stone-200 rounded-xl py-3">Transfer (Paystack)</button>
        <button className="bg-stone-200 rounded-xl py-3">POS</button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button onClick={sellOffline} className="px-4 py-3 rounded-xl bg-white border-2 border-stone-200 font-bold">Queue offline sale</button>
        <button onClick={sync} className="px-4 py-3 rounded-xl bg-brand-700 text-white font-bold">Sync now</button>
      </div>
      <div className="flex gap-2"><input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="WhatsApp phone e.g. 234801..." className="flex-1 px-4 py-3 rounded-xl border-2 border-stone-200" /><button onClick={share} className="px-5 py-3 rounded-xl bg-green-600 text-white font-bold">WhatsApp receipt</button></div>
      <p className="text-xs text-stone-500">Full payment only. Split supported. No customer credit.</p>
    </main>
  );
}
