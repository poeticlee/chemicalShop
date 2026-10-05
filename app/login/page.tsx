"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
export default function Login() {
  const r = useRouter(); const [email, setEmail] = useState(""); const [pw, setPw] = useState(""); const [msg, setMsg] = useState("");
  const go = async () => {
    setMsg("Logging in…");
    const { error } = await authClient.signIn.email({ email, password: pw });
    if (error) { setMsg(error.message ?? "invalid login"); return; }
    const me = await fetch("/api/me").then(x=>x.json()).catch(()=>null);
    const role = me?.user?.role;
    r.push(role === "sales" ? "/pos" : "/dashboard");
  };
  return (
    <main className="max-w-md mx-auto p-6 space-y-3">
      <h1 className="font-extrabold text-2xl">Log in</h1>
      <p className="text-sm text-stone-500">Admins land on Dashboard (all sales). Staff land on POS (record sales only).</p>
      <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="w-full px-4 py-3 rounded-xl border-2 border-stone-200" />
      <input value={pw} onChange={e=>setPw(e.target.value)} type="password" placeholder="Password" className="w-full px-4 py-3 rounded-xl border-2 border-stone-200" />
      <button onClick={go} className="w-full px-5 py-3 rounded-xl bg-stone-900 text-white font-bold">Log in</button>
      {msg && <p className="text-sm">{msg}</p>}
    </main>
  );
}
