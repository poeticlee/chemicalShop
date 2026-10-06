"use client";
import { useEffect, useState } from "react";
const ROLES = ["owner", "manager", "sales", "store_keeper", "accountant"];
export default function Users() {
  const [users, setUsers] = useState<any[]>([]); const [locs, setLocs] = useState<any[]>([]); const [msg, setMsg] = useState("");
  const load = () => {
    fetch("/api/users").then(r=>r.json()).then(d=>setUsers(d.users ?? [])).catch(()=>setMsg("Owner only."));
    fetch("/api/locations").then(r=>r.json()).then(d=>setLocs(d.locations ?? [])).catch(()=>{});
  };
  useEffect(()=>{ load(); },[]);
  const save = async (u: any, patch: object) => {
    setMsg("Saving…");
    const r = await fetch("/api/users", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ userId: u.id, ...patch }) });
    const d = await r.json().catch(()=>({}));
    setMsg(r.ok ? `Updated ${d.user.email} → ${d.user.role}` : (d.error ?? "failed"));
    if (r.ok) load();
  };
  return (
    <main className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="font-extrabold text-2xl">Staff & admins (Owner)</h1>
      <p className="text-sm text-stone-500">New signups always start as Staff. Promote trusted people here and assign their location.</p>
      <div className="bg-white rounded-2xl shadow-sm divide-y">
        {users.map((u:any)=>(
          <div key={u.id} className="p-3 flex flex-col md:flex-row md:items-center gap-2 text-sm">
            <div className="flex-1"><span className="font-bold">{u.name ?? u.email}</span><div className="text-stone-500">{u.email}</div></div>
            <select value={u.role} onChange={e=>save(u,{role:e.target.value})} className="px-3 py-2 rounded-xl border-2 border-stone-200">
              {ROLES.map(r=>(<option key={r} value={r}>{r}</option>))}
            </select>
            <select value={(()=>{ try { return JSON.parse(u.locationIds||"[]")[0] ?? ""; } catch { return ""; } })()} onChange={e=>save(u,{locationIds:[e.target.value]})} className="px-3 py-2 rounded-xl border-2 border-stone-200">
              <option value="">All locations</option>{locs.map((l:any)=>(<option key={l.id} value={l.id}>{l.name}</option>))}
            </select>
          </div>
        ))}
      </div>
      {msg && <p className="text-sm">{msg}</p>}
    </main>
  );
}
