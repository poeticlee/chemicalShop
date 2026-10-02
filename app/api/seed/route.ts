import { prisma } from "@/lib/db";
// POST /api/seed (dev only) — 1 location, 1 manager, 3 items (Texapon liquid, Caustic solid, Bottle plastic)
export async function POST() {
  if (process.env.ALLOW_SEED !== "1") return Response.json({ error: "seed disabled" }, { status: 403 });
  const loc = await prisma.location.create({ data: { name: "Main Shop", address: "Lagos" } });
  const user = await prisma.user.create({ data: { email: "manager@shop.ng", name: "Manager", role: "manager", locationIds: JSON.stringify([loc.id]) } });
  const tex = await prisma.item.create({ data: { code: "TEX-001", name: "Texapon", type: "liquid", baseUnit: "ml", reorderLevel: 5000, currentCost: 2.5 } });
  await prisma.itemUnit.createMany({ data: [
    { itemId: tex.id, unitName: "500 ml", factorToBase: 500, priceRetail: 150000 },
    { itemId: tex.id, unitName: "1 L", factorToBase: 1000, priceRetail: 240000 },
  ]});
  const caus = await prisma.item.create({ data: { code: "CAU-001", name: "Caustic Soda", type: "solid", baseUnit: "g", reorderLevel: 2000, currentCost: 1.8 } });
  const bot = await prisma.item.create({ data: { code: "BOT-1L", name: "Bottle 1L + cap", type: "plastic", baseUnit: "pc", reorderLevel: 50, currentCost: 15000 } });
  return Response.json({ locationId: loc.id, userId: user.id, items: [tex.id, caus.id, bot.id] }, { status: 201 });
}
