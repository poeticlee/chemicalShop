"use client";
import { useEffect, useState } from "react";
export default function Receive() {
  const [items, setItems] = useState<any[]>([]); const [locs, setLocs] = useState<any[]>([]);
  const [locationId, setLocationId] = useState(""); const [supplierId, setSupplierId] = useState("");
  const [itemId, setItemId] = useState(""); const [qty, setQty] = useState("1"); const [unit, setUnit] = useState("");
  const [price, setPrice] = useState(""); const [extras, setExtras] = useState("0"); const [batch, setBatch] = useState("");
  const [msg, setMsg] = useState("");
  useEffect(()=>{
    fetch("/api/items").then(r=>r.json()).then(d=>{ setItems(d.items ?? []); if (d.items?.[0]) { setItemId(d.items[0].id); setUnit(d.items[0].units?.[0]?.unitName ?? ""); } }).catch(()=>{});
    fetch("/api/locations").then(r=>r.json()).then(d=>{ setLocs(d.locations ?? []); if (d.locations?.[0]) setLocationId(d.locations[0].id); }).catch(()=>{});
  },[]);
  const item = items.find(i=>i.id===itemId);
  const factor = item?.units?.find((u:any)=>u.unitName===unit)?.factorToBase ?? 1;
  const qtyBase = Math.round((parseFloat(qty)||0) * factor);
  const submit = async () => {
    setMsg("Saving…");
    const r = await fetch("/api/receive", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({
      supplierId: supplierId || "supplier-demo", locationId, userId: "me", extrasKobo: Math.round((parseFloat(extras)||0)*100),
      lines: [{ itemId, qtyBase, priceKobo: Math.round((parseFloat(price)||0)*100), batch: batch || undefined }],
    })});
    const d = await r.json().catch(()=>({}));
    setMsg(r.ok ? `Saved: ${d.purchaseId} (+${qtyBase.toLocaleString()} base units)` : `Failed: ${d.error ?? await r.text()}`);
  };
  return (
    <main className="max-w-2xl mx-auto p-6 space-y-3">
      <h1 className="font-extrabold text-2xl">Receive stock</h1>
      <label className="text-sm font-bold">Location (Main receives from supplier)<select value={locationId} onChange={e=>setLocationId(e.target.value)} className="mt-1 w-full px-4 py-3 rounded-xl border-2 border-stone-200">{locs.map((l:any)=>(<option key={l.id} value={l.id}>{l.name}</option>))}</select></label>
      <label className="text-sm font-bold">Supplier ID<input value={supplierId} onChange={e=>setSupplierId(e.target.value)} placeholder="supplier id (free text for now)" className="mt-1 w-full px-4 py-3 rounded-xl border-2 border-stone-200" /></label>
      <div className="grid grid-cols-2 gap-2">
        <label className="text-sm font-bold">Item<select value={itemId} onChange={e=>{ setItemId(e.target.value); const it = items.find(i=>i.id===e.target.value); setUnit(it?.units?.[0]?.unitName ?? ""); }} className="mt-1 w-full px-4 py-3 rounded-xl border-2 border-stone-200">{items.map((i:any)=>(<option key={i.id} value={i.id}>{i.code} — {i.name}</option>))}</select></label>
        <label className="text-sm font-bold">Unit<select value={unit} onChange={e=>setUnit(e.target.value)} className="mt-1 w-full px-4 py-3 rounded-xl border-2 border-stone-200">{(item?.units ?? []).map((u:any)=>(<option key={u.id} value={u.unitName}>{u.unitName} (×{u.factorToBase})</option>))}</select></label>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <label className="text-sm font-bold">Qty (in unit)<input value={qty} onChange={e=>setQty(e.target.value)} inputMode="decimal" className="mt-1 w-full px-4 py-3 rounded-xl border-2 border-stone-200" /></label>
        <label className="text-sm font-bold">Price ₦ (line)<input value={price} onChange={e=>setPrice(e.target.value)} inputMode="decimal" className="mt-1 w-full px-4 py-3 rounded-xl border-2 border-stone-200" /></label>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <label className="text-sm font-bold">Extras ₦ transport/loading<input value={extras} onChange={e=>setExtras(e.target.value)} inputMode="decimal" className="mt-1 w-full px-4 py-3 rounded-xl border-2 border-stone-200" /></label>
        <label className="text-sm font-bold">Batch/lot (optional)<input value={batch} onChange={e=>setBatch(e.target.value)} className="mt-1 w-full px-4 py-3 rounded-xl border-2 border-stone-200" /></label>
      </div>
      <div className="text-sm bg-stone-100 rounded-xl p-3">→ {qtyBase.toLocaleString()} base units ({item?.baseUnit ?? ""}). Landed cost auto = (price + extras share) ÷ qty.</div>
      <button onClick={submit} className="w-full px-5 py-3 rounded-xl bg-brand-700 text-white font-bold">Save stock in</button>
      {msg && <p className="text-sm bg-white rounded-xl p-3 shadow-sm">{msg}</p>}
    </main>
  );
}
