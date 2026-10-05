import { prisma } from "@/lib/db";
import { requireUser, canSeeLocation } from "@/lib/require-auth";
// POST { locationId, sourceItemId, qtyUsedBase, outputs, packaging } — store_keeper/manager/owner
export async function POST(req: Request) {
  const { user, error } = await requireUser(["owner", "manager", "store_keeper"]);
  if (error) return error;
  const b = await req.json();
  if (!b.locationId || !b.sourceItemId || !b.qtyUsedBase || !b.outputs?.length)
    return Response.json({ error: "locationId, sourceItemId, qtyUsedBase, outputs required" }, { status: 400 });
  if (!canSeeLocation(user!, b.locationId)) return Response.json({ error: "not your location" }, { status: 403 });
  const uid = user!.id;
  const repackId = crypto.randomUUID();
  await prisma.$transaction(async (tx) => {
    await tx.repack.create({ data: { id: repackId, locationId: b.locationId, userId: uid, sourceItemId: b.sourceItemId, qtyUsedBase: b.qtyUsedBase,
      outputs: { create: b.outputs.map((o: any) => ({ itemId: o.itemId, qtyBase: o.qtyBase })) } } });
    await tx.stockMovement.create({ data: { itemId: b.sourceItemId, locationId: b.locationId, qtyBase: -b.qtyUsedBase, type: "repack_out", referenceId: repackId, userId: uid, deviceId: "web" } });
    for (const p of b.packaging ?? []) {
      await tx.stockMovement.create({ data: { itemId: p.itemId, locationId: b.locationId, qtyBase: -p.qtyBase, type: "repack_out", referenceId: repackId, userId: uid, deviceId: "web" } });
    }
    for (const o of b.outputs) {
      await tx.stockMovement.create({ data: { itemId: o.itemId, locationId: b.locationId, qtyBase: o.qtyBase, type: "repack_in", referenceId: repackId, userId: uid, deviceId: "web" } });
    }
  });
  return Response.json({ repackId }, { status: 201 });
}
