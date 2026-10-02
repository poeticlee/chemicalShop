"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export default function Signup() {
  const r = useRouter(); const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [pw, setPw] = useState(""); const [role, setRole] = useState("owner"); const [msg, setMsg] = useState("");
  const go = async () => {
    setMsg("Creating…");
    const res = await fetch("/api/auth/signup", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ name, email, password: pw, role }) });
    const d = await res.json().catch(()=>({}));
    if (!res.ok) { setMsg(d.error ?? "failed"); return; }
    localStorage.setItem("chem_user", JSON.stringify(d.user)); localStorage.setItem("chem_token", d.token);
    r.push(d.user.role === "sales" ? "/pos" : "/dashboard");
  };
  return (
    <main className="max-w-md mx-auto p-6 space-y-3">
      <h1 className="font-extrabold text-2xl">Create account</h1>
      <p className="text-sm text-stone-500">First account should be Owner/Admin. Then create Staff per location.</p>
      <input value={name} onChange={e=>setName(e.target.value)} placeholder="Full name" className="w-full px-4 py-3 rounded-xl border-2 border-stone-200" />
      <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="w-full px-4 py-3 rounded-xl border-2 border-stone-200" />
      <input value={pw} onChange={e=>setPw(e.target.value)} type="password" placeholder="Password" className="w-full px-4 py-3 rounded-xl border-2 border-stone-200" />
      <select value={role} onChange={e=>setRole(e.target.value)} className="w-full px-4 py-3 rounded-xl border-2 border-stone-200">
        <option value="owner">Admin / Owner — all locations, stock + all sales</option>
        <option value="manager">Manager — one location, approve + cash-up</option>
        <option value="sales">Staff / Sales — record sales only</option>
        <option value="store_keeper">Store keeper — receive/repack/count</option>
      </select>
      <button onClick={go} className="w-full px-5 py-3 rounded-xl bg-brand-700 text-white font-bold">Create account</button>
      {msg && <p className="text-sm">{msg}</p>}
    </main>
  );
}
