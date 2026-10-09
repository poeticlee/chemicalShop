import Link from "next/link";

function Flask({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 80" fill="none" className={className} aria-hidden>
      <path d="M24 6h16v6l12 26v30a6 6 0 0 1-6 6H18a6 6 0 0 1-6-6V38L24 12V6z" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" />
      <path d="M18 52h28v16a6 6 0 0 1-6 6H24a6 6 0 0 1-6-6V52z" fill="currentColor" opacity="0.35" />
      <circle cx="26" cy="60" r="2.4" fill="currentColor" />
      <circle cx="34" cy="64" r="3.2" fill="currentColor" />
      <circle cx="40" cy="58" r="1.8" fill="currentColor" />
      <circle cx="32" cy="20" r="2.4" fill="currentColor" opacity="0.7" />
      <circle cx="38" cy="12" r="3" fill="currentColor" opacity="0.5" />
    </svg>
  );
}

function Bubbles({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 120" fill="none" className={className} aria-hidden>
      {[[20, 90, 8], [55, 60, 5], [90, 95, 10], [125, 55, 6], [160, 85, 9], [185, 45, 5], [70, 30, 4], [140, 25, 7]].map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} stroke="currentColor" strokeWidth="2" opacity={0.25 + (i % 3) * 0.2} />
      ))}
    </svg>
  );
}

export default function Home() {
  return (
    <main className="max-w-6xl mx-auto px-6 py-10 space-y-10">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-900 via-brand-700 to-leaf-600 text-white">
        <Bubbles className="absolute inset-x-0 top-0 h-28 w-full text-white" />
        <Flask className="absolute -right-4 -bottom-8 h-64 w-52 text-white/20" />
        <div className="relative grid md:grid-cols-2 gap-8 items-center p-6 md:p-10">
          <div className="space-y-4">
            <img src="/logo.png" alt="Spikenish Chemicals — Quality Chemicals for a Cleaner, Brighter Future" className="w-64 max-w-full rounded-2xl bg-white p-3 shadow-lg" />
            <p className="text-sm font-semibold text-white/85">Quality Chemicals for a Cleaner, Brighter Future</p>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">Sell in bits. Track every ml. Never lose a sale — even offline.</h1>
            <p className="text-white/80">Buy drums and sacks in bulk, repack into 250 ml – 25 L, sell singles and 25 L soap-kit combos across Main + minis. Every location knows its stock and cash, with or without internet.</p>
            <div className="flex flex-wrap gap-2">
              <Link href="/signup" className="px-6 py-3 rounded-xl bg-white text-brand-900 font-bold">Create account</Link>
              <Link href="/login" className="px-6 py-3 rounded-xl bg-black/25 border border-white/40 text-white font-semibold">Log in</Link>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-sm max-w-md">
              <div className="bg-white/15 rounded-xl p-3"><div className="font-extrabold">30s</div><div className="text-white/75 text-xs">sale at till</div></div>
              <div className="bg-white/15 rounded-xl p-3"><div className="font-extrabold">ml/g/pc</div><div className="text-white/75 text-xs">exact ledger</div></div>
              <div className="bg-white/15 rounded-xl p-3"><div className="font-extrabold">0</div><div className="text-white/75 text-xs">lost offline sales</div></div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="font-bold">Who logs in?</div>
            <div className="bg-white/10 rounded-xl p-3 text-sm"><span className="font-bold text-green-300">Admin / Owner / Manager:</span> enters new stock, sets prices, approves discounts/voids, sees ALL sales from every location, cash-ups, transfers Main → minis.</div>
            <div className="bg-white/10 rounded-xl p-3 text-sm"><span className="font-bold text-amber-300">Staff / Sales:</span> only records sales they made at their location. No costs, no stock edits, no other locations.</div>
            <div className="text-xs text-white/70">First account: sign up as Owner. Then create staff accounts per location.</div>
          </div>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-4">
        {[
          ["Buy bulk, sell bits", "Drums→ml, sacks→g. Landed cost with transport auto.", "text-brand-600", "M8 44h48M14 44V20h36v24M20 20v-8h24v8"],
          ["Combos that deduct right", "25 L kit explodes to every ingredient, same offline.", "text-leaf-600", "M32 8v48M16 24h32M20 48h24"],
          ["Main + minis", "Main receives + sells. Minis get transfers. Add locations anytime.", "text-brand-600", "M10 54h44M16 54V30h14v24M34 54V18h14v36"],
        ].map(([t, d, color, _path]) => (
          <div key={t as string} className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="h-36 bg-gradient-to-br from-brand-50 to-leaf-500/10 grid place-items-center relative overflow-hidden">
              <Bubbles className={`absolute inset-0 h-full w-full ${color as string}`} />
              <Flask className={`h-24 w-20 ${color as string}`} />
            </div>
            <div className="p-5"><div className="font-bold">{t}</div><div className="text-sm text-stone-500">{d}</div></div>
          </div>
        ))}
      </section>

      <section className="relative overflow-hidden rounded-3xl bg-stone-900 text-white">
        <Flask className="absolute -left-6 -top-6 h-48 w-40 text-white/10" />
        <Bubbles className="absolute inset-x-0 bottom-0 h-24 w-full text-leaf-500/40" />
        <div className="relative flex flex-col justify-center p-6 md:p-10 gap-3">
          <div className="font-extrabold text-2xl md:text-3xl max-w-xl">One till for singles, kits, and plastics — receipts in seconds, cash-ups that balance.</div>
          <div className="flex gap-2">
            <Link href="/pos" className="px-5 py-3 rounded-xl bg-white text-stone-900 font-bold">Open POS</Link>
            <Link href="/dashboard" className="px-5 py-3 rounded-xl bg-white/15 border border-white/30 font-semibold">Owner view</Link>
          </div>
        </div>
      </section>

      <footer className="flex items-center gap-3 text-xs text-stone-500 pb-4">
        <img src="/logo.png" alt="Spikenish" className="h-8 w-auto rounded bg-white px-1" />
        <span>Spikenish Chemicals — Quality Chemicals for a Cleaner, Brighter Future.</span>
      </footer>
    </main>
  );
}
