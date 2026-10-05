import { prisma } from "@/lib/db";
import { requireUser, canSeeLocation } from "@/lib/require-auth";
// POST { saleId, locationId } — manager/owner only. Restocks ingredients, packaging NOT restocked.
export async function POST(req: Request) {
  const { user, error } = await requireUser(["owner", "manager"]);
  if (error) return error;
  const b = await req.json();
  if (!b.saleId || !b.locationId) return Response.json({ error: "saleId, locationId required" }, { status: 400 });
  if (!canSeeLocation(user!, b.locationId)) return Response.json({ error: "not your location" }, { status: 403 });
  const uid = user!.id;
  const lines = await prisma.saleLine.findMany({ where: { saleId: b.saleId } });
  if (!lines.length) return Response.json({ error: "sale not found" }, { status: 404 });
  await prisma.$transaction(async (tx) => {
    for (const l of lines) {
      await tx.stockMovement.create({ data: { itemId: l.itemId, locationId: b.locationId, qtyBase: l.qtyBase, type: "return", referenceId: b.saleId, userId: uid, deviceId: "web" } });
    }
    await tx.sale.update({ where: { id: b.saleId }, data: { status: "voided" } });
    await tx.auditLog.create({ data: { userId: uid, action: "return", entity: "sale", entityId: b.saleId, locationId: b.locationId } });
  });
  return Response.json({ returned: lines.length });
}
