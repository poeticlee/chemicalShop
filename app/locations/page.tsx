"use client";
import { useEffect, useState } from "react";
export default function Locations() {
  const [locs, setLocs] = useState<any[]>([]); const [name, setName] = useState(""); const [kind, setKind] = useState("mini");
  const load = () => fetch("/api/locations").then(r=>r.json()).then(d=>setLocs(d.locations ?? [])).catch(()=>{});
  useEffect(()=>{ load(); },[]);
  const add = async () => {
    const r = await fetch("/api/locations", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ name, kind }) });
    if (r.ok) { setName(""); load(); } else alert(await r.text());
  };
  return (
    <main className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="font-extrabold text-2xl">Locations — main + minis</h1>
      <p className="text-sm text-stone-600">Main receives from suppliers AND sells in bits. Minis receive from Main via transfers AND sell. Add new minis as you expand.</p>
      <div className="flex gap-2">
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="New location e.g. Mini - Lekki" className="flex-1 px-4 py-3 rounded-xl border-2 border-stone-200" />
        <select value={kind} onChange={e=>setKind(e.target.value)} className="px-3 py-2 rounded-xl border-2 border-stone-200"><option value="main">main</option><option value="mini">mini</option></select>
        <button onClick={add} className="px-5 py-3 rounded-xl bg-stone-900 text-white font-bold">Add</button>
      </div>
      <div className="bg-white rounded-2xl shadow-sm divide-y">{locs.map((l:any)=>(<div key={l.id} className="p-3 flex justify-between text-sm"><span className="font-bold">{l.name}</span><span className="text-stone-500">{l.address} • {l.id.slice(0,8)}</span></div>))}</div>
      <div className="text-sm bg-white rounded-2xl p-4 shadow-sm space-y-1">
        <div className="font-bold">Flows</div>
        <div>1. Main: Receive from supplier → <span className="font-mono">POST /api/receive</span></div>
        <div>2. Main → Mini: <span className="font-mono">POST /api/transfers {"{action:create→dispatch→receive}"}</span></div>
        <div>3. Main AND minis sell bits: <span className="font-mono">POST /api/sales</span> or <span className="font-mono">/api/combos/sell</span> + <span className="font-mono">/pos</span></div>
      </div>
    </main>
  );
}
