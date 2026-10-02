"use client";
import { useEffect, useState } from "react";
export default function Combos() {
  const [items, setItems] = useState<any[]>([]); const [combos, setCombos] = useState<any[]>([]);
  const [name, setName] = useState("Liquid Soap Kit"); const [size, setSize] = useState("25 L"); const [price, setPrice] = useState("38500");
  const [lines, setLines] = useState<{itemId:string;qty:string}[]>([{ itemId: "", qty: "1000" }]);
  const load = () => {
    fetch("/api/combos").then(r=>r.json()).then(d=>setCombos(d.combos ?? [])).catch(()=>{});
    fetch("/api/items").then(r=>r.json()).then(d=>setItems(d.items ?? [])).catch(()=>{});
  };
  useEffect(()=>{ load(); },[]);
  const add = async () => {
    const r = await fetch("/api/combos", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({
      name, versions: [{ sizeLabel: size, priceKobo: Math.round(parseFloat(price||"0")*100), lines: lines.filter(l=>l.itemId).map(l=>({ itemId: l.itemId, qtyBase: parseInt(l.qty)||0 })) }],
    })});
    if (r.ok) { load(); } else alert(await r.text());
  };
  return (
    <main className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="font-extrabold text-2xl">Combos — fixed kits</h1>
      <p className="text-sm text-stone-500">Selling a combo deducts every ingredient. Size variants (5/10/25/50 L) are separate versions.</p>
      <input value={name} onChange={e=>setName(e.target.value)} placeholder="Combo name" className="w-full px-4 py-3 rounded-xl border-2 border-stone-200" />
      <div className="grid grid-cols-2 gap-2">
        <input value={size} onChange={e=>setSize(e.target.value)} placeholder="Size e.g. 25 L" className="px-4 py-3 rounded-xl border-2 border-stone-200" />
        <input value={price} onChange={e=>setPrice(e.target.value)} placeholder="Price ₦" inputMode="decimal" className="px-4 py-3 rounded-xl border-2 border-stone-200" />
      </div>
      {lines.map((l,i)=>(
        <div key={i} className="grid grid-cols-3 gap-2">
          <select value={l.itemId} onChange={e=>{ const c=[...lines]; c[i].itemId=e.target.value; setLines(c); }} className="col-span-2 px-3 py-2 rounded-xl border-2 border-stone-200">
            <option value="">Ingredient…</option>{items.map((it:any)=>(<option key={it.id} value={it.id}>{it.code} — {it.name} ({it.baseUnit})</option>))}
          </select>
          <input value={l.qty} onChange={e=>{ const c=[...lines]; c[i].qty=e.target.value; setLines(c); }} placeholder="qty base" inputMode="numeric" className="px-3 py-2 rounded-xl border-2 border-stone-200" />
        </div>
      ))}
      <div className="flex gap-2">
        <button onClick={()=>setLines([...lines,{itemId:"",qty:"1000"}])} className="px-4 py-2 rounded-xl bg-white border-2 border-stone-200 font-bold">+ ingredient</button>
        <button onClick={add} className="px-5 py-3 rounded-xl bg-stone-900 text-white font-bold">Save combo</button>
      </div>
      <div className="bg-white rounded-2xl shadow-sm divide-y">{combos.map((c:any)=>(<div key={c.id} className="p-3 text-sm"><span className="font-bold">{c.name}</span><span className="text-stone-500"> — {c.versions?.map((v:any)=>`${v.sizeLabel} ₦${(v.priceKobo/100).toLocaleString()}`).join(" • ")}</span></div>))}</div>
    </main>
  );
}
