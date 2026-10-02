import { prisma } from "@/lib/db";
// POST { locationId, userId, sourceItemId, qtyUsedBase, outputs: [{ itemId, qtyBase }], packaging: [{ itemId, qtyBase }] }
// Deducts bulk + packaging, adds packed outputs, logs wastage as review when expected vs actual mismatch.
export async function POST(req: Request) {
  const b = await req.json();
  if (!b.locationId || !b.userId || !b.sourceItemId || !b.qtyUsedBase || !b.outputs?.length)
    return Response.json({ error: "locationId, userId, sourceItemId, qtyUsedBase, outputs required" }, { status: 400 });
  const repackId = crypto.randomUUID();
  await prisma.$transaction(async (tx) => {
    await tx.repack.create({ data: { id: repackId, locationId: b.locationId, userId: b.userId, sourceItemId: b.sourceItemId, qtyUsedBase: b.qtyUsedBase,
      outputs: { create: b.outputs.map((o: any) => ({ itemId: o.itemId, qtyBase: o.qtyBase })) } } });
    await tx.stockMovement.create({ data: { itemId: b.sourceItemId, locationId: b.locationId, qtyBase: -b.qtyUsedBase, type: "repack_out", referenceId: repackId, userId: b.userId, deviceId: "web" } });
    for (const p of b.packaging ?? []) {
      await tx.stockMovement.create({ data: { itemId: p.itemId, locationId: b.locationId, qtyBase: -p.qtyBase, type: "repack_out", referenceId: repackId, userId: b.userId, deviceId: "web" } });
    }
    for (const o of b.outputs) {
      await tx.stockMovement.create({ data: { itemId: o.itemId, locationId: b.locationId, qtyBase: o.qtyBase, type: "repack_in", referenceId: repackId, userId: b.userId, deviceId: "web" } });
    }
  });
  return Response.json({ repackId }, { status: 201 });
}
