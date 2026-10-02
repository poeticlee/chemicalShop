import Link from "next/link";
export default function Home() {
  return (
    <main className="max-w-6xl mx-auto px-6 py-10 space-y-10">
      <section className="grid md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <div className="text-xs font-extrabold tracking-widest text-brand-700">MULTI-LOCATION CHEMICAL SHOP • OFFLINE-FIRST</div>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">Sell in bits. Track every ml. Never lose a sale — even offline.</h1>
          <p className="text-stone-600">Buy drums and sacks in bulk, repack into 250 ml – 25 L, sell singles and 25 L soap-kit combos across Main + minis. Every location knows its stock and cash, with or without internet.</p>
          <div className="flex flex-wrap gap-2">
            <Link href="/signup" className="px-6 py-3 rounded-xl bg-brand-700 text-white font-bold">Create account</Link>
            <Link href="/login" className="px-6 py-3 rounded-xl bg-stone-900 text-white font-semibold">Log in</Link>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-sm">
            <div className="bg-white rounded-xl p-3 shadow-sm"><div className="font-extrabold">30s</div><div className="text-stone-500 text-xs">sale at till</div></div>
            <div className="bg-white rounded-xl p-3 shadow-sm"><div className="font-extrabold">ml/g/pc</div><div className="text-stone-500 text-xs">exact ledger</div></div>
            <div className="bg-white rounded-xl p-3 shadow-sm"><div className="font-extrabold">0</div><div className="text-stone-500 text-xs">lost offline sales</div></div>
          </div>
        </div>
        <div className="bg-stone-900 text-white rounded-2xl p-6 space-y-3">
          <div className="font-bold">Who logs in?</div>
          <div className="bg-stone-800 rounded-xl p-3 text-sm"><span className="font-bold text-green-400">Admin / Owner / Manager:</span> enters new stock, sets prices, approves discounts/voids, sees ALL sales from every location, cash-ups, transfers Main → minis.</div>
          <div className="bg-stone-800 rounded-xl p-3 text-sm"><span className="font-bold text-amber-400">Staff / Sales:</span> only records sales they made at their location. No costs, no stock edits, no other locations.</div>
          <div className="text-xs text-stone-400">First account: sign up as Owner. Then create staff accounts per location.</div>
        </div>
      </section>
      <section className="grid md:grid-cols-3 gap-4">
        {[["Buy bulk, sell bits","Drums→ml, sacks→g. Landed cost with transport auto."],["Combos that deduct right","25 L kit explodes to every ingredient, same offline."],["Main + minis","Main receives + sells. Minis get transfers. Add locations anytime."]].map(([t,d])=>(
          <div key={t} className="bg-white rounded-2xl p-5 shadow-sm"><div className="font-bold">{t}</div><div className="text-sm text-stone-500">{d}</div></div>
        ))}
      </section>
    </main>
  );
}
