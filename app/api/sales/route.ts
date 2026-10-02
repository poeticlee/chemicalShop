import { prisma } from "@/lib/db";

// POST { locationId, userId, deviceId, customerPhone?, lines: [{ itemId, qtyBase, unitName, priceKobo }], payments: [{ method, amountKobo }], discountKobo? }
// Rule: full payment only — sum(payments) must equal total. Single txn: sale + lines + payments + movements.
export async function POST(req: Request) {
  const b = await req.json();
  const lines = b.lines ?? [];
  const payments = b.payments ?? [];
  if (!b.locationId || !b.userId || lines.length === 0 || payments.length === 0)
    return Response.json({ error: "locationId, userId, lines, payments required" }, { status: 400 });
  const subtotal = lines.reduce((s: number, l: any) => s + (l.priceKobo || 0), 0);
  const discount = b.discountKobo ?? 0;
  const total = subtotal - discount;
  const paid = payments.reduce((s: number, p: any) => s + (p.amountKobo || 0), 0);
  if (paid !== total) return Response.json({ error: `Full payment required: total ${total}, paid ${paid}` }, { status: 400 });
  const saleId = crypto.randomUUID();
  let customerId: string | undefined;
  if (b.customerPhone) {
    const c = await prisma.customer.upsert({
      where: { id: b.customerPhone }, update: { lastSeen: new Date(), totalSpentKobo: { increment: total } },
      create: { id: b.customerPhone, phone: b.customerPhone, locationId: b.locationId, totalSpentKobo: total, lastSeen: new Date() },
    });
    customerId = c.id;
  }
  await prisma.$transaction(async (tx) => {
    await tx.sale.create({ data: { id: saleId, locationId: b.locationId, userId: b.userId, customerId, status: "paid", subtotalKobo: subtotal, discountKobo: discount, totalKobo: total, deviceId: b.deviceId ?? "web" } });
    for (const l of lines) {
      const item = await tx.item.findUniqueOrThrow({ where: { id: l.itemId } });
      await tx.saleLine.create({ data: { saleId, itemId: l.itemId, qtyBase: l.qtyBase, unitName: l.unitName ?? item.baseUnit, priceKobo: l.priceKobo || 0, costKobo: (l.qtyBase || 0) * item.currentCost, discountKobo: 0 } });
      await tx.stockMovement.create({ data: { itemId: l.itemId, locationId: b.locationId, qtyBase: -(l.qtyBase || 0), type: "sale", referenceId: saleId, userId: b.userId, deviceId: b.deviceId ?? "web" } });
      const neg = await tx.stockMovement.groupBy({ by: ["itemId"], where: { itemId: l.itemId, locationId: b.locationId }, _sum: { qtyBase: true } });
      if ((neg[0]?._sum.qtyBase ?? 0) < 0) {
        await tx.reviewQueue.create({ data: { type: "negative_stock", refId: saleId, locationId: b.locationId, assignedTo: "manager" } });
      }
    }
    for (const p of payments) {
      await tx.payment.create({ data: { saleId, method: p.method, amountKobo: p.amountKobo, reference: p.reference } });
    }
  });
  return Response.json({ saleId, total }, { status: 201 });
}
