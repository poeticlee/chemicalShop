"use client";
import { useState } from "react";
export default function Receive() {
  const [msg, setMsg] = useState("");
  const submit = async () => {
    setMsg("Use API: POST /api/receive with supplierId, locationId, userId, lines[{itemId,qtyBase,priceKobo}], extrasKobo. See implementation-plan Phase 1.");
  };
  return (
    <main className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="font-extrabold text-2xl">Receive stock</h1>
      <p className="text-sm text-stone-600">Enter supplier, lines in purchase units (auto-converted to ml/g/pc), price + extras → landed cost preview.</p>
      <button onClick={submit} className="px-5 py-3 rounded-xl bg-stone-900 text-white font-bold">Show API contract</button>
      {msg && <p className="text-sm bg-white rounded-xl p-3 shadow-sm">{msg}</p>}
    </main>
  );
}
