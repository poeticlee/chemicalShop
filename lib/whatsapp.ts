// WhatsApp receipts: build wa.me share link from sale. No API key needed.
export function receiptText(sale: { id: string; totalKobo: number; lines: { name: string; qty: string; priceKobo: number }[] }) {
  const naira = (k: number) => "₦" + (k/100).toLocaleString("en-NG");
  const lines = sale.lines.map(l => `• ${l.name} ${l.qty} — ${naira(l.priceKobo)}`).join("\n");
  return `Chemical Shop receipt ${sale.id.slice(0,8)}\n${lines}\nTotal: ${naira(sale.totalKobo)}\nThank you!`;
}
export function whatsappLink(phone: string, text: string) {
  const p = phone.replace(/[^0-9]/g, "");
  return `https://wa.me/${p}?text=${encodeURIComponent(text)}`;
}
