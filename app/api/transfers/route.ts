import { prisma } from "@/lib/db";
import { requireUser, canSeeLocation } from "@/lib/require-auth";
// Manager/owner only. userId comes from session.
export async function POST(req: Request) {
  const { user, error } = await requireUser(["owner", "manager"]);
  if (error) return error;
  const uid = user!.id;
  const b = await req.json();
  if (b.action === "create") {
    if (!canSeeLocation(user!, b.fromLocationId)) return Response.json({ error: "not your location" }, { status: 403 });
    const t = await prisma.transfer.create({ data: { fromLocationId: b.fromLocationId, toLocationId: b.toLocationId, createdBy: uid, status: "draft",
      lines: { create: b.lines.map((l: any) => ({ itemId: l.itemId, sentQty: l.sentQty })) } } });
    return Response.json({ transferId: t.id }, { status: 201 });
  }
  if (b.action === "dispatch") {
    const t = await prisma.transfer.findUniqueOrThrow({ where: { id: b.transferId }, include: { lines: true } });
    if (!canSeeLocation(user!, t.fromLocationId)) return Response.json({ error: "not your location" }, { status: 403 });
    await prisma.$transaction(async (tx) => {
      for (const l of t.lines) {
        await tx.stockMovement.create({ data: { itemId: l.itemId, locationId: t.fromLocationId, qtyBase: -l.sentQty, type: "transfer_out", referenceId: t.id, userId: uid, deviceId: "web" } });
      }
      await tx.transfer.update({ where: { id: t.id }, data: { status: "sent" } });
    });
    return Response.json({ dispatched: true });
  }
  if (b.action === "receive") {
    const t = await prisma.transfer.findUniqueOrThrow({ where: { id: b.transferId }, include: { lines: true } });
    if (!canSeeLocation(user!, t.toLocationId)) return Response.json({ error: "not your location" }, { status: 403 });
    const recv = new Map<string, number>((b.lines ?? []).map((l: any) => [l.itemId, l.receivedQty]));
    await prisma.$transaction(async (tx) => {
      for (const l of t.lines) {
        const rq: number = recv.get(l.itemId) ?? l.sentQty;
        await tx.stockMovement.create({ data: { itemId: l.itemId, locationId: t.toLocationId, qtyBase: rq, type: "transfer_in", referenceId: t.id, userId: uid, deviceId: "web" } });
        await tx.transferLine.update({ where: { id: l.id }, data: { receivedQty: rq } });
        if (rq !== l.sentQty) {
          await tx.reviewQueue.create({ data: { type: "transfer_variance", refId: t.id, locationId: t.toLocationId, assignedTo: "manager" } });
        }
      }
      await tx.transfer.update({ where: { id: t.id }, data: { status: "received" } });
    });
    return Response.json({ received: true });
  }
  return Response.json({ error: "unknown action" }, { status: 400 });
}
export async function GET() {
  const { error } = await requireUser();
  if (error) return error;
  const list = await prisma.transfer.findMany({ include: { lines: true }, take: 50, orderBy: { createdAt: "desc" } });
  return Response.json({ transfers: list });
}
