import { prisma } from "@/lib/db";
// GET /api/stock?locationId=xxx → [{ itemId, code, name, baseUnit, qty, low }]
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const locationId = searchParams.get("locationId");
  if (!locationId) return Response.json({ error: "locationId required" }, { status: 400 });
  const sums = await prisma.stockMovement.groupBy({ by: ["itemId"], where: { locationId }, _sum: { qtyBase: true } });
  const items = await prisma.item.findMany({ where: { id: { in: sums.map(s => s.itemId) } } });
  const byId = new Map(items.map(i => [i.id, i]));
  return Response.json({ stock: sums.map(s => {
    const it = byId.get(s.itemId);
    const qty = s._sum.qtyBase ?? 0;
    return { itemId: s.itemId, code: it?.code, name: it?.name, baseUnit: it?.baseUnit, qty, low: it ? qty <= it.reorderLevel : false };
  })});
}
