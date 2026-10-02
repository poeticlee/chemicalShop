import { prisma } from "@/lib/db";
export async function GET() {
  const items = await prisma.item.findMany({ include: { units: true }, take: 100, orderBy: { name: "asc" } });
  return Response.json({ items });
}
export async function POST(req: Request) {
  const b = await req.json();
  if (!b.code || !b.name || !b.baseUnit) return Response.json({ error: "code, name, baseUnit required" }, { status: 400 });
  const item = await prisma.item.create({ data: {
    code: b.code, name: b.name, type: b.type ?? "liquid", category: b.category,
    baseUnit: b.baseUnit, reorderLevel: b.reorderLevel ?? 0,
    safetyNote: b.safetyNote, hazardLabel: b.hazardLabel, trackExpiry: !!b.trackExpiry,
  }});
  return Response.json({ item }, { status: 201 });
}
