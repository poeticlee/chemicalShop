"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

function PasswordInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input value={value} onChange={e => onChange(e.target.value)} type={show ? "text" : "password"} placeholder={placeholder} className="w-full px-4 py-3 pr-16 rounded-xl border-2 border-stone-200" />
      <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Hide password" : "Show password"} className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-sm font-bold text-brand-700 hover:underline">
        {show ? "Hide" : "Show"}
      </button>
    </div>
  );
}

export default function Login() {
  const r = useRouter(); const [email, setEmail] = useState(""); const [pw, setPw] = useState(""); const [msg, setMsg] = useState("");
  const go = async () => {
    setMsg("Logging in…");
    const { error } = await authClient.signIn.email({ email, password: pw });
    if (error) { setMsg(error.message ?? "invalid login"); return; }
    const me = await fetch("/api/me").then(x => x.json()).catch(() => null);
    const role = me?.user?.role;
    r.push(role === "sales" ? "/pos" : "/dashboard");
  };
  return (
    <main className="max-w-md mx-auto p-6 space-y-3">
      <img src="/logo.png" alt="Spikenish Chemicals" className="w-48 rounded-2xl bg-white p-2 shadow-sm" />
      <h1 className="font-extrabold text-2xl">Log in</h1>
      <p className="text-sm text-stone-500">Admins land on Dashboard (all sales). Staff land on POS (record sales only).</p>
      <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full px-4 py-3 rounded-xl border-2 border-stone-200" />
      <PasswordInput value={pw} onChange={setPw} placeholder="Password" />
      <button onClick={go} className="w-full px-5 py-3 rounded-xl bg-brand-700 text-white font-bold">Log in</button>
      {msg && <p className="text-sm">{msg}</p>}
    </main>
  );
}
