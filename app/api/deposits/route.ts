import { prisma } from "@/lib/db";
import { requireUser, canSeeLocation } from "@/lib/require-auth";
// Deposits: create holds payment WITHOUT releasing stock; finalize deducts stock.
export async function POST(req: Request) {
  const { user, error } = await requireUser();
  if (error) return error;
  const uid = user!.id;
  const b = await req.json();
  if (b.action === "create") {
    if (!b.locationId || b.amountKobo == null) return Response.json({ error: "locationId, amountKobo required" }, { status: 400 });
    if (!canSeeLocation(user!, b.locationId)) return Response.json({ error: "not your location" }, { status: 403 });
    const s = await prisma.sale.create({ data: { locationId: b.locationId, userId: uid, status: "deposit", subtotalKobo: b.amountKobo, totalKobo: b.amountKobo, deviceId: "web" } });
    await prisma.payment.create({ data: { saleId: s.id, method: b.method ?? "transfer", amountKobo: b.amountKobo, reference: b.reference } });
    return Response.json({ saleId: s.id, status: "deposit" }, { status: 201 });
  }
  if (b.action === "finalize") {
    const s = await prisma.sale.findUniqueOrThrow({ where: { id: b.saleId } });
    if (s.status !== "deposit") return Response.json({ error: "not a deposit" }, { status: 400 });
    await prisma.$transaction(async (tx) => {
      for (const l of b.lines ?? []) {
        await tx.saleLine.create({ data: { saleId: s.id, itemId: l.itemId, qtyBase: l.qtyBase, unitName: l.unitName ?? "pc", priceKobo: l.priceKobo || 0, costKobo: 0 } });
        await tx.stockMovement.create({ data: { itemId: l.itemId, locationId: b.locationId, qtyBase: -l.qtyBase, type: "sale", referenceId: s.id, userId: uid, deviceId: "web" } });
      }
      await tx.sale.update({ where: { id: s.id }, data: { status: "paid" } });
    });
    return Response.json({ finalized: true });
  }
  return Response.json({ error: "unknown action" }, { status: 400 });
}
