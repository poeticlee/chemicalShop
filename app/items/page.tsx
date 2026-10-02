"use client";
import { useEffect, useState } from "react";
export default function Items() {
  const [items, setItems] = useState<any[]>([]);
  const [code, setCode] = useState(""); const [name, setName] = useState(""); const [baseUnit, setBaseUnit] = useState("ml");
  const load = () => fetch("/api/items").then(r=>r.json()).then(d=>setItems(d.items ?? [])).catch(()=>{});
  useEffect(()=>{ load(); },[]);
  const add = async () => {
    const r = await fetch("/api/items", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ code, name, baseUnit, type: baseUnit==="ml"?"liquid":baseUnit==="g"?"solid":"plastic" }) });
    if (r.ok) { setCode(""); setName(""); load(); } else alert(await r.text());
  };
  return (
    <main className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="font-extrabold text-2xl">Items</h1>
      <div className="grid grid-cols-4 gap-2">
        <input value={code} onChange={e=>setCode(e.target.value)} placeholder="SKU" className="px-3 py-2 rounded-xl border-2 border-stone-200" />
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Name" className="px-3 py-2 rounded-xl border-2 border-stone-200 col-span-2" />
        <select value={baseUnit} onChange={e=>setBaseUnit(e.target.value)} className="px-3 py-2 rounded-xl border-2 border-stone-200"><option value="ml">ml</option><option value="g">g</option><option value="pc">pc</option></select>
      </div>
      <button onClick={add} className="px-5 py-3 rounded-xl bg-brand-700 text-white font-bold">Add item</button>
      <div className="bg-white rounded-2xl shadow-sm divide-y">{items.map((i:any)=>(<div key={i.id} className="p-3 flex justify-between text-sm"><span className="font-bold">{i.code} — {i.name}</span><span className="text-stone-500">{i.baseUnit}</span></div>))}</div>
    </main>
  );
}
