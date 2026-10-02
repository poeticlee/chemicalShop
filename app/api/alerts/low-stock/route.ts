import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email";
// GET /api/alerts/low-stock?locationId=xxx&to=owner@shop.ng — lists low items + emails summary
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const locationId = searchParams.get("locationId") ?? "";
  const to = searchParams.get("to") ?? "";
  if (!locationId) return Response.json({ error: "locationId required" }, { status: 400 });
  const sums = await prisma.stockMovement.groupBy({ by: ["itemId"], where: { locationId }, _sum: { qtyBase: true } });
  const items = await prisma.item.findMany({ where: { id: { in: sums.map(s => s.itemId) } } });
  const byId = new Map(items.map(i => [i.id, i]));
  const low = sums.filter(s => { const it = byId.get(s.itemId); return it && (s._sum.qtyBase ?? 0) <= it.reorderLevel; })
    .map(s => ({ ...s, item: byId.get(s.itemId), qty: s._sum.qtyBase ?? 0 }));
  if (to && low.length) {
    await sendEmail(to, `Low stock (${low.length} items)`, `<ul>${low.map(l=>`<li>${l.item?.code} — ${l.item?.name}: ${l.qty}</li>`).join("")}</ul>`);
  }
  return Response.json({ low: low.length, items: low.map(l => ({ code: l.item?.code, name: l.item?.name, qty: l.qty })) });
}
