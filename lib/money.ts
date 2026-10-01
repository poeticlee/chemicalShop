// Money in kobo (INTEGER), qty in base units ml/g/pc (INTEGER).
export const toBase = (qty: number, factor: number) => Math.round(qty * factor);
export const landedPerBase = (priceKobo: number, extrasKobo: number, qtyBase: number) =>
  qtyBase > 0 ? (priceKobo + extrasKobo) / qtyBase : 0;
export const naira = (kobo: number) =>
  "₦" + (kobo / 100).toLocaleString("en-NG", { maximumFractionDigits: 2 });
export const fmtQty = (base: number, baseUnit: string) => {
  if (baseUnit === "ml") return base >= 1000 ? `${(base/1000).toFixed(base%1000?1:0)} L` : `${base} ml`;
  if (baseUnit === "g") return base >= 1000 ? `${(base/1000).toFixed(base%1000?1:0)} kg` : `${base} g`;
  return `${base} pcs`;
};
