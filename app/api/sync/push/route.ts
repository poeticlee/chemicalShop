import { prisma } from "@/lib/db";

// Idempotent push: client-generated UUIDs, INSERT ... ON CONFLICT DO NOTHING equivalent via upsert-skip.
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const movements: any[] = body.movements ?? [];
  let accepted = 0, duplicates = 0;
  for (const m of movements) {
    try {
      await prisma.stockMovement.create({ data: {
        id: m.id, itemId: m.itemId, locationId: m.locationId,
        qtyBase: m.qtyBase, type: m.type, referenceId: m.referenceId,
        userId: m.userId, deviceId: m.deviceId ?? "web",
      }});
      accepted++;
    } catch (e: any) {
      if (String(e?.code) === "P2002") duplicates++; else throw e;
    }
  }
  return Response.json({ accepted, duplicates });
}
