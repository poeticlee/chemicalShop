import { prisma } from "@/lib/db";
// POST { saleId, userId, locationId } — combo-aware return: restocks each ingredient pro-rata, packaging NOT restocked.
export async function POST(req: Request) {
  const b = await req.json();
  if (!b.saleId || !b.userId || !b.locationId) return Response.json({ error: "saleId, userId, locationId required" }, { status: 400 });
  const lines = await prisma.saleLine.findMany({ where: { saleId: b.saleId } });
  if (!lines.length) return Response.json({ error: "sale not found" }, { status: 404 });
  await prisma.$transaction(async (tx) => {
    for (const l of lines) {
      await tx.stockMovement.create({ data: { itemId: l.itemId, locationId: b.locationId, qtyBase: l.qtyBase, type: "return", referenceId: b.saleId, userId: b.userId, deviceId: "web" } });
    }
    await tx.sale.update({ where: { id: b.saleId }, data: { status: "voided" } });
    await tx.auditLog.create({ data: { userId: b.userId, action: "return", entity: "sale", entityId: b.saleId, locationId: b.locationId } });
  });
  return Response.json({ returned: lines.length });
}
