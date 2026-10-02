import { prisma } from "@/lib/db";
import { landedPerBase } from "@/lib/money";

// POST { supplierId, locationId, userId, deviceId, extrasKobo, lines: [{ itemId, qtyBase, priceKobo, batch?, expiry? }] }
// Apportions extras pro-rata by line value. Creates purchase + lines + movements, updates currentCost.
export async function POST(req: Request) {
  const b = await req.json();
  const lines = b.lines ?? [];
  if (!b.supplierId || !b.locationId || !b.userId || lines.length === 0)
    return Response.json({ error: "supplierId, locationId, userId, lines required" }, { status: 400 });
  const totalValue = lines.reduce((s: number, l: any) => s + (l.priceKobo || 0), 0);
  const extras = b.extrasKobo ?? 0;
  const purchaseId = crypto.randomUUID();
  await prisma.$transaction(async (tx) => {
    await tx.purchase.create({ data: { id: purchaseId, supplierId: b.supplierId, locationId: b.locationId, userId: b.userId, deviceId: b.deviceId ?? "web" } });
    for (const l of lines) {
      const share = totalValue > 0 ? Math.round((extras * (l.priceKobo || 0)) / totalValue) : Math.round(extras / lines.length);
      const landed = landedPerBase(l.priceKobo || 0, share, l.qtyBase);
      await tx.purchaseLine.create({ data: {
        purchaseId, itemId: l.itemId, qtyBase: l.qtyBase, priceKobo: l.priceKobo || 0,
        extrasShareKobo: share, landedCostPerBase: landed, batch: l.batch,
        expiry: l.expiry ? new Date(l.expiry) : undefined,
      }});
      await tx.stockMovement.create({ data: {
        itemId: l.itemId, locationId: b.locationId, qtyBase: l.qtyBase, type: "purchase",
        referenceId: purchaseId, userId: b.userId, deviceId: b.deviceId ?? "web",
      }});
      await tx.item.update({ where: { id: l.itemId }, data: { currentCost: landed } });
    }
  });
  return Response.json({ purchaseId }, { status: 201 });
}
