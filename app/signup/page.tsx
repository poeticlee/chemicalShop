"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
export default function Signup() {
  const r = useRouter(); const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [pw, setPw] = useState(""); const [role, setRole] = useState("owner"); const [msg, setMsg] = useState("");
  const go = async () => {
    setMsg("Creating…");
    const { data, error } = await authClient.signUp.email({ email, password: pw, name, role } as unknown as { email: string; password: string; name: string });
    if (error) { setMsg(error.message ?? "failed"); return; }
    const me = await fetch("/api/me").then(x=>x.json()).catch(()=>null);
    const rr = me?.user?.role ?? role;
    r.push(rr === "sales" ? "/pos" : "/dashboard");
  };
  return (
    <main className="max-w-md mx-auto p-6 space-y-3">
      <h1 className="font-extrabold text-2xl">Create account</h1>
      <p className="text-sm text-stone-500">First account should be Owner/Admin. Then create Staff per location.</p>
      <input value={name} onChange={e=>setName(e.target.value)} placeholder="Full name" className="w-full px-4 py-3 rounded-xl border-2 border-stone-200" />
      <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="w-full px-4 py-3 rounded-xl border-2 border-stone-200" />
      <input value={pw} onChange={e=>setPw(e.target.value)} type="password" placeholder="Password (min 8)" className="w-full px-4 py-3 rounded-xl border-2 border-stone-200" />
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
