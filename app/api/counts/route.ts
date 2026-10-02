import { prisma } from "@/lib/db";
// POST { locationId, startedBy, lines: [{ itemId, systemQty, countedQty }] } → creates count + review entries for variances + posts count_fix movements on approve
// POST { approve: true, countId, approvedBy } → posts adjustments
export async function POST(req: Request) {
  const b = await req.json();
  if (b.approve) {
    const lines = await prisma.countLine.findMany({ where: { countId: b.countId } });
    const count = await prisma.stockCount.findUniqueOrThrow({ where: { id: b.countId } });
    await prisma.$transaction(async (tx) => {
      for (const l of lines) {
        const diff = l.countedQty - l.systemQty;
        if (diff !== 0) {
          await tx.stockMovement.create({ data: { itemId: l.itemId, locationId: count.locationId, qtyBase: diff, type: "count_fix", referenceId: count.id, userId: b.approvedBy, deviceId: "web" } });
          await tx.reviewQueue.create({ data: { type: "count_variance", refId: count.id, locationId: count.locationId, assignedTo: "manager" } });
        }
      }
      await tx.stockCount.update({ where: { id: count.id }, data: { status: "approved", approvedBy: b.approvedBy } });
    });
    return Response.json({ approved: true });
  }
  if (!b.locationId || !b.startedBy || !b.lines?.length) return Response.json({ error: "locationId, startedBy, lines required" }, { status: 400 });
  const c = await prisma.stockCount.create({ data: { locationId: b.locationId, startedBy: b.startedBy, status: "submitted" } });
  for (const l of b.lines) await prisma.countLine.create({ data: { countId: c.id, itemId: l.itemId, systemQty: l.systemQty, countedQty: l.countedQty } });
  return Response.json({ countId: c.id }, { status: 201 });
}
