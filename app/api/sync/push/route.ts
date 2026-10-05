import { prisma } from "@/lib/db";
import { requireUser, canSeeLocation } from "@/lib/require-auth";

// Idempotent push: client-generated UUIDs. Movements are stamped with the session user and scope-checked.
export async function POST(req: Request) {
  const { user, error } = await requireUser();
  if (error) return error;
  const body = await req.json().catch(() => ({}));
  const movements: any[] = body.movements ?? [];
  let accepted = 0, duplicates = 0;
  for (const m of movements) {
    if (!canSeeLocation(user!, m.locationId)) continue;
    try {
      await prisma.stockMovement.create({ data: {
        id: m.id, itemId: m.itemId, locationId: m.locationId,
        qtyBase: m.qtyBase, type: m.type, referenceId: m.referenceId,
        userId: user!.id, deviceId: m.deviceId ?? "web",
      }});
      accepted++;
    } catch (e: any) {
      if (String(e?.code) === "P2002") duplicates++; else throw e;
    }
  }
  return Response.json({ accepted, duplicates });
}
