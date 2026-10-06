"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";

const ALL = [
  { t: "Home", h: "/", roles: ["owner", "manager", "sales", "store_keeper", "accountant"] },
  { t: "POS", h: "/pos", roles: ["owner", "manager", "sales", "store_keeper"] },
  { t: "Items", h: "/items", roles: ["owner", "manager", "store_keeper"] },
  { t: "Combos", h: "/combos", roles: ["owner", "manager", "store_keeper"] },
  { t: "Receive", h: "/receive", roles: ["owner", "manager", "store_keeper"] },
  { t: "Stock", h: "/stock", roles: ["owner", "manager", "store_keeper", "accountant"] },
  { t: "Locations", h: "/locations", roles: ["owner"] },
  { t: "Dashboard", h: "/dashboard", roles: ["owner", "manager", "accountant"] },
  { t: "Staff", h: "/users", roles: ["owner"] },
];

export default function UserNav() {
  const path = usePathname(); const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  useEffect(() => {
    fetch("/api/me").then(r => r.json()).then(d => {
      if (d?.user) { setRole(d.user.role); setName(d.user.name ?? d.user.email); }
      else {
        try { const u = JSON.parse(localStorage.getItem("chem_user") ?? "null"); if (u) { setRole(u.role); setName(u.name ?? u.email); } } catch { /* logged out */ }
      }
    }).catch(() => {});
  }, [path]);
  const out = async () => {
    await authClient.signOut().catch(() => {});
    try { localStorage.removeItem("chem_user"); localStorage.removeItem("chem_token"); } catch { /* noop */ }
    setRole(null); setName(null); router.push("/login");
  };
  const links = role ? ALL.filter(l => l.roles.includes(role)) : [{ t: "Home", h: "/", roles: [] }];
  return (
    <nav className="sticky top-0 z-10 bg-stone-900 text-white">
      <div className="max-w-6xl mx-auto px-4 py-2 flex items-center gap-1 overflow-x-auto">
        <span className="font-extrabold mr-1 whitespace-nowrap">Chemical Shop</span>
        {links.map(l => (
          <Link key={l.h} href={l.h} className={`px-3 py-2 rounded-lg text-sm font-semibold whitespace-nowrap ${path === l.h ? "bg-stone-700" : "hover:bg-stone-700"}`}>{l.t}</Link>
        ))}
        <span className="flex-1" />
        {role ? (<>
          <span className="text-xs text-stone-300 whitespace-nowrap px-2">{name} • {role}</span>
          <button onClick={out} className="px-3 py-2 rounded-lg text-sm font-bold bg-white/10 border border-white/20 hover:bg-white/20 whitespace-nowrap">Sign out</button>
        </>) : (<>
          <Link href="/login" className="px-3 py-2 rounded-lg text-sm font-semibold hover:bg-stone-700 whitespace-nowrap">Log in</Link>
          <Link href="/signup" className="px-3 py-2 rounded-lg text-sm font-bold bg-brand-700 whitespace-nowrap">Sign up</Link>
        </>)}
      </div>
    </nav>
  );
}
