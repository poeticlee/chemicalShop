"use client";
import { useEffect, useMemo, useState } from "react";
import { naira } from "@/lib/money";

type CartLine = { key: string; kind: "item" | "combo"; name: string; detail: string; priceKobo: number; payload: Record<string, number | string> };

export default function POS() {
  const [locs, setLocs] = useState<any[]>([]); const [loc, setLoc] = useState("");
  const [items, setItems] = useState<any[]>([]); const [combos, setCombos] = useState<any[]>([]);
  const [itemId, setItemId] = useState(""); const [unit, setUnit] = useState(""); const [qtyU, setQtyU] = useState("1");
  const [verId, setVerId] = useState(""); const [comboQty, setComboQty] = useState("1");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [discount, setDiscount] = useState("0"); const [phone, setPhone] = useState("");
  const [pays, setPays] = useState<{ method: string; amount: string }[]>([{ method: "cash", amount: "" }]);
  const [msg, setMsg] = useState(""); const [receipt, setReceipt] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/me").then(r => r.json()).then(async (me) => {
      const ls = await fetch("/api/locations").then(r => r.json()).then(d => d.locations ?? []).catch(() => []);
      const mine = me?.user?.role === "owner" ? ls : ls.filter((l: any) => (me?.user?.locationIds ?? []).includes(l.id));
      setLocs(mine.length ? mine : ls); if (mine[0] ?? ls[0]) setLoc((mine[0] ?? ls[0]).id);
    }).catch(() => {});
    fetch("/api/items").then(r => r.json()).then(d => { setItems(d.items ?? []); if (d.items?.[0]) { setItemId(d.items[0].id); setUnit(d.items[0].units?.find((u: any) => u.isSaleUnit)?.unitName ?? ""); } }).catch(() => {});
    fetch("/api/combos").then(r => r.json()).then(d => {
      const cs = d.combos ?? []; setCombos(cs);
      if (cs[0]?.versions?.[0]) setVerId(cs[0].versions[0].id);
    }).catch(() => {});
  }, []);

  const item = items.find(i => i.id === itemId);
  const unitObj = item?.units?.find((u: any) => u.unitName === unit);
  const singlePrice = unitObj ? Math.round(unitObj.priceRetail * (parseFloat(qtyU) || 0)) : 0;
  const ver = combos.flatMap((c: any) => c.versions.map((v: any) => ({ ...v, combo: c.name }))).find((v: any) => v.id === verId);
  const subtotal = cart.reduce((s, l) => s + l.priceKobo, 0);
  const total = subtotal - Math.round(parseFloat(discount || "0") * 100);
  const paid = useMemo(() => pays.reduce((s, p) => s + Math.round(parseFloat(p.amount || "0") * 100), 0), [pays]);

  const addSingle = () => {
    if (!item || !unitObj) return;
    const q = parseFloat(qtyU) || 0;
    setCart([...cart, { key: crypto.randomUUID(), kind: "item", name: `${item.name} ${q} ${unit}`, detail: `${Math.round(q * unitObj.factorToBase).toLocaleString()} ${item.baseUnit}`, priceKobo: singlePrice, payload: { itemId: item.id, unitName: unit, qtyUnits: q } }]);
  };
  const addCombo = () => {
    if (!ver) return;
    const q = parseInt(comboQty) || 1;
    setCart([...cart, { key: crypto.randomUUID(), kind: "combo", name: `${ver.combo} ${ver.sizeLabel} ×${q}`, detail: ver.lines.map((l: any) => l.qtyBase).join("+") + " base", priceKobo: ver.priceKobo * q, payload: { versionId: ver.id, qty: q } }]);
  };
  const checkout = async () => {
    setMsg("Charging…"); setReceipt(null);
    const body = {
      locationId: loc, discountKobo: Math.round(parseFloat(discount || "0") * 100), customerPhone: phone || undefined,
      lines: cart.filter(c => c.kind === "item").map(c => c.payload),
      combos: cart.filter(c => c.kind === "combo").map(c => c.payload),
      payments: pays.filter(p => p.amount).map(p => ({ method: p.method, amountKobo: Math.round(parseFloat(p.amount) * 100) })),
    };
    const r = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) { setMsg(`Failed: ${d.error ?? r.statusText}${d.short ? " — short: " + JSON.stringify(d.short) : ""}`); return; }
    setCart([]); setPays([{ method: "cash", amount: "" }]);
    const text = `Chemical Shop receipt ${d.saleId.slice(0, 8)}\nTotal: ${naira(d.total)}`;
    setReceipt(text); setMsg(`Paid ${naira(d.total)} — sale ${d.saleId.slice(0, 8)}`);
  };

  return (
    <main className="max-w-5xl mx-auto p-4 md:p-6 space-y-4">
      <div className="flex items-center gap-2">
        <h1 className="font-extrabold text-2xl flex-1">Till</h1>
        <select value={loc} onChange={e => setLoc(e.target.value)} className="px-3 py-2 rounded-xl border-2 border-stone-200">{locs.map((l: any) => (<option key={l.id} value={l.id}>{l.name}</option>))}</select>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="bg-white rounded-2xl p-4 shadow-sm space-y-2">
            <div className="font-bold">Single item</div>
            <select value={itemId} onChange={e => { setItemId(e.target.value); const it = items.find(i => i.id === e.target.value); setUnit(it?.units?.find((u: any) => u.isSaleUnit)?.unitName ?? ""); }} className="w-full px-3 py-2 rounded-xl border-2 border-stone-200">{items.map((i: any) => (<option key={i.id} value={i.id}>{i.code} — {i.name}</option>))}</select>
            <div className="grid grid-cols-2 gap-2">
              <select value={unit} onChange={e => setUnit(e.target.value)} className="px-3 py-2 rounded-xl border-2 border-stone-200">{(item?.units ?? []).filter((u: any) => u.isSaleUnit).map((u: any) => (<option key={u.id} value={u.unitName}>{u.unitName} — ₦{(u.priceRetail / 100).toLocaleString()}</option>))}</select>
              <input value={qtyU} onChange={e => setQtyU(e.target.value)} inputMode="decimal" placeholder="Qty e.g. 1.5" className="px-3 py-2 rounded-xl border-2 border-stone-200" />
            </div>
            <button onClick={addSingle} className="w-full px-4 py-2 rounded-xl bg-stone-900 text-white font-bold">Add — {naira(singlePrice)}</button>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm space-y-2">
            <div className="font-bold">Combo kit</div>
            <select value={verId} onChange={e => setVerId(e.target.value)} className="w-full px-3 py-2 rounded-xl border-2 border-stone-200">
              {combos.flatMap((c: any) => c.versions.map((v: any) => (<option key={v.id} value={v.id}>{c.name} {v.sizeLabel} — ₦{(v.priceKobo / 100).toLocaleString()}</option>)))}
            </select>
            <div className="grid grid-cols-2 gap-2">
              <input value={comboQty} onChange={e => setComboQty(e.target.value)} inputMode="numeric" placeholder="Qty" className="px-3 py-2 rounded-xl border-2 border-stone-200" />
              <button onClick={addCombo} className="px-4 py-2 rounded-xl bg-brand-700 text-white font-bold">Add kit</button>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-2 h-fit">
          <div className="font-bold">Cart ({cart.length})</div>
          {cart.length === 0 && <p className="text-sm text-stone-500">Add singles and kits — one customer, one payment, one receipt.</p>}
          {cart.map(l => (
            <div key={l.key} className="flex justify-between text-sm gap-2">
              <span><span className={`text-xs font-bold px-2 py-0.5 rounded-full mr-1 ${l.kind === "combo" ? "bg-brand-100 text-brand-700" : "bg-stone-200"}`}>{l.kind}</span>{l.name}</span>
              <span className="font-bold whitespace-nowrap">{naira(l.priceKobo)} <button onClick={() => setCart(cart.filter(c => c.key !== l.key))} className="text-red-600 ml-1">✕</button></span>
            </div>
          ))}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <input value={discount} onChange={e => setDiscount(e.target.value)} inputMode="decimal" placeholder="Discount ₦" className="px-3 py-2 rounded-xl border-2 border-stone-200" />
            <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Customer phone" className="px-3 py-2 rounded-xl border-2 border-stone-200" />
          </div>
          {pays.map((p, i) => (
            <div key={i} className="grid grid-cols-2 gap-2">
              <select value={p.method} onChange={e => { const c = [...pays]; c[i].method = e.target.value; setPays(c); }} className="px-3 py-2 rounded-xl border-2 border-stone-200"><option value="cash">Cash</option><option value="transfer">Transfer</option><option value="pos">POS</option></select>
              <input value={p.amount} onChange={e => { const c = [...pays]; c[i].amount = e.target.value; setPays(c); }} inputMode="decimal" placeholder="Amount ₦" className="px-3 py-2 rounded-xl border-2 border-stone-200" />
            </div>
          ))}
          <button onClick={() => setPays([...pays, { method: "transfer", amount: "" }])} className="text-sm font-bold text-stone-600">+ split payment</button>
          <div className="flex justify-between font-extrabold text-lg pt-1"><span>Total</span><span>{naira(total)} {paid !== total && <span className="text-xs text-amber-700">paid {naira(paid)}</span>}</span></div>
          <button onClick={checkout} disabled={!cart.length} className="w-full px-5 py-3 rounded-xl bg-brand-700 text-white font-bold disabled:opacity-40">Charge {naira(total)}</button>
          {msg && <p className="text-sm">{msg}</p>}
          {receipt && <button onClick={() => window.open(`https://wa.me/${phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(receipt)}`, "_blank")} className="w-full px-4 py-2 rounded-xl bg-green-600 text-white font-bold">WhatsApp receipt</button>}
        </div>
      </div>
    </main>
  );
}
