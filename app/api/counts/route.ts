import { prisma } from "@/lib/db";
import { requireUser, canSeeLocation } from "@/lib/require-auth";
// Submit: store_keeper/manager/owner. Approve: manager/owner only.
export async function POST(req: Request) {
  const b = await req.json();
  if (b.approve) {
    const { user, error } = await requireUser(["owner", "manager"]);
    if (error) return error;
    const uid = user!.id;
    const lines = await prisma.countLine.findMany({ where: { countId: b.countId } });
    const count = await prisma.stockCount.findUniqueOrThrow({ where: { id: b.countId } });
    if (!canSeeLocation(user!, count.locationId)) return Response.json({ error: "not your location" }, { status: 403 });
    await prisma.$transaction(async (tx) => {
      for (const l of lines) {
        const diff = l.countedQty - l.systemQty;
        if (diff !== 0) {
          await tx.stockMovement.create({ data: { itemId: l.itemId, locationId: count.locationId, qtyBase: diff, type: "count_fix", referenceId: count.id, userId: uid, deviceId: "web" } });
          await tx.reviewQueue.create({ data: { type: "count_variance", refId: count.id, locationId: count.locationId, assignedTo: "manager" } });
        }
      }
      await tx.stockCount.update({ where: { id: count.id }, data: { status: "approved", approvedBy: uid } });
    });
    return Response.json({ approved: true });
  }
  const { user: u2, error: e2 } = await requireUser(["owner", "manager", "store_keeper"]);
  if (e2) return e2;
  if (!b.locationId || !b.lines?.length) return Response.json({ error: "locationId, lines required" }, { status: 400 });
  if (!canSeeLocation(u2!, b.locationId)) return Response.json({ error: "not your location" }, { status: 403 });
  const c = await prisma.stockCount.create({ data: { locationId: b.locationId, startedBy: u2!.id, status: "submitted" } });
  for (const l of b.lines) await prisma.countLine.create({ data: { countId: c.id, itemId: l.itemId, systemQty: l.systemQty, countedQty: l.countedQty } });
  return Response.json({ countId: c.id }, { status: 201 });
}
