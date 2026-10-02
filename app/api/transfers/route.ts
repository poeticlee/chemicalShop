import { prisma } from "@/lib/db";
// POST { action: "create"|"dispatch"|"receive", ... }
// create: { fromLocationId, toLocationId, createdBy, lines: [{ itemId, sentQty }] }
// dispatch: { transferId, userId } — deducts sender now (transfer_out)
// receive: { transferId, userId, lines: [{ itemId, receivedQty }] } — adds receiver, variance → review_queue
export async function POST(req: Request) {
  const b = await req.json();
  if (b.action === "create") {
    const t = await prisma.transfer.create({ data: { fromLocationId: b.fromLocationId, toLocationId: b.toLocationId, createdBy: b.createdBy, status: "draft",
      lines: { create: b.lines.map((l: any) => ({ itemId: l.itemId, sentQty: l.sentQty })) } } });
    return Response.json({ transferId: t.id }, { status: 201 });
  }
  if (b.action === "dispatch") {
    const t = await prisma.transfer.findUniqueOrThrow({ where: { id: b.transferId }, include: { lines: true } });
    await prisma.$transaction(async (tx) => {
      for (const l of t.lines) {
        await tx.stockMovement.create({ data: { itemId: l.itemId, locationId: t.fromLocationId, qtyBase: -l.sentQty, type: "transfer_out", referenceId: t.id, userId: b.userId, deviceId: "web" } });
      }
      await tx.transfer.update({ where: { id: t.id }, data: { status: "sent" } });
    });
    return Response.json({ dispatched: true });
  }
  if (b.action === "receive") {
    const t = await prisma.transfer.findUniqueOrThrow({ where: { id: b.transferId }, include: { lines: true } });
    const recv = new Map<string, number>((b.lines ?? []).map((l: any) => [l.itemId, l.receivedQty]));
    await prisma.$transaction(async (tx) => {
      for (const l of t.lines) {
        const rq: number = recv.get(l.itemId) ?? l.sentQty;
        await tx.stockMovement.create({ data: { itemId: l.itemId, locationId: t.toLocationId, qtyBase: rq, type: "transfer_in", referenceId: t.id, userId: b.userId, deviceId: "web" } });
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
  const list = await prisma.transfer.findMany({ include: { lines: true }, take: 50, orderBy: { createdAt: "desc" } });
  return Response.json({ transfers: list });
}
