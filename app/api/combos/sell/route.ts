import { prisma } from "@/lib/db";
import { requireUser, canSeeLocation } from "@/lib/require-auth";
// POST { locationId, deviceId, versionId, payments: [...] } — any staff within their location
export async function POST(req: Request) {
  const { user, error } = await requireUser();
  if (error) return error;
  const b = await req.json();
  if (!b.locationId || !b.versionId || !b.payments?.length) return Response.json({ error: "locationId, versionId, payments required" }, { status: 400 });
  if (!canSeeLocation(user!, b.locationId)) return Response.json({ error: "not your location" }, { status: 403 });
  const uid = user!.id;
  const v = await prisma.comboVersion.findUniqueOrThrow({ where: { id: b.versionId }, include: { lines: true } });
  const total = v.priceKobo;
  const paid = b.payments.reduce((s: number, p: any) => s + (p.amountKobo || 0), 0);
  if (paid !== total) return Response.json({ error: `Full payment required: total ${total}, paid ${paid}` }, { status: 400 });
  // availability check
  const sums = await prisma.stockMovement.groupBy({ by: ["itemId"], where: { locationId: b.locationId }, _sum: { qtyBase: true } });
  const have = new Map(sums.map(s => [s.itemId, s._sum.qtyBase ?? 0]));
  const short = v.lines.filter(l => (have.get(l.itemId) ?? 0) < l.qtyBase);
  if (short.length) return Response.json({ error: "Insufficient stock", short }, { status: 409 });
  const saleId = crypto.randomUUID();
  const perLine = Math.floor(total / v.lines.length); let rest = total - perLine * v.lines.length;
  await prisma.$transaction(async (tx) => {
    await tx.sale.create({ data: { id: saleId, locationId: b.locationId, userId: uid, status: "paid", subtotalKobo: total, totalKobo: total, deviceId: b.deviceId ?? "web" } });
    for (const l of v.lines) {
      const item = await tx.item.findUniqueOrThrow({ where: { id: l.itemId } });
      const share = perLine + (rest > 0 ? 1 : 0); if (rest > 0) rest--;
      await tx.saleLine.create({ data: { saleId, itemId: l.itemId, qtyBase: l.qtyBase, unitName: item.baseUnit, priceKobo: 0, costKobo: l.qtyBase * item.currentCost, comboVersionId: v.id, comboShareKobo: share } });
      await tx.stockMovement.create({ data: { itemId: l.itemId, locationId: b.locationId, qtyBase: -l.qtyBase, type: "sale", referenceId: saleId, userId: uid, deviceId: b.deviceId ?? "web" } });
    }
    for (const p of b.payments) await tx.payment.create({ data: { saleId, method: p.method, amountKobo: p.amountKobo, reference: p.reference } });
  });
  return Response.json({ saleId, total }, { status: 201 });
}
