import { prisma } from "@/lib/db";
import { receiptText } from "@/lib/whatsapp";
import { requireUser, canSeeLocation } from "@/lib/require-auth";
export async function GET(req: Request, { params }: { params: { saleId: string } }) {
  const { user, error } = await requireUser();
  if (error) return error;
  const sale = await prisma.sale.findUniqueOrThrow({ where: { id: params.saleId }, include: { lines: true, payments: true } });
  if (!canSeeLocation(user!, sale.locationId)) return Response.json({ error: "not your location" }, { status: 403 });
  const items = await prisma.item.findMany({ where: { id: { in: sale.lines.map(l => l.itemId) } } });
  const byId = new Map(items.map(i => [i.id, i]));
  const lines = sale.lines.map(l => ({ name: byId.get(l.itemId)?.name ?? l.itemId, qty: `${l.qtyBase}`, priceKobo: l.priceKobo + l.comboShareKobo }));
  const text = receiptText({ id: sale.id, totalKobo: sale.totalKobo, lines });
  return Response.json({ sale, lines, text, whatsapp: `https://wa.me/?text=${encodeURIComponent(text)}`, whatsappDirect: "" , hint: "GET with ?phone=234801... for direct link" });
}
