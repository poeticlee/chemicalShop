import { prisma } from "@/lib/db";
import { receiptText, whatsappLink } from "@/lib/whatsapp";
// GET /api/receipts/:saleId?phone=234... — receipt JSON + WhatsApp share link
export async function GET(_: Request, { params }: { params: { saleId: string } }) {
  const sale = await prisma.sale.findUniqueOrThrow({ where: { id: params.saleId }, include: { lines: true, payments: true } });
  const items = await prisma.item.findMany({ where: { id: { in: sale.lines.map(l => l.itemId) } } });
  const byId = new Map(items.map(i => [i.id, i]));
  const lines = sale.lines.map(l => ({ name: byId.get(l.itemId)?.name ?? l.itemId, qty: `${l.qtyBase}`, priceKobo: l.priceKobo + l.comboShareKobo }));
  const text = receiptText({ id: sale.id, totalKobo: sale.totalKobo, lines });
  return Response.json({ sale, lines, text, whatsapp: `https://wa.me/?text=${encodeURIComponent(text)}`, whatsappDirect: "" , hint: "GET with ?phone=234801... for direct link" });
}
