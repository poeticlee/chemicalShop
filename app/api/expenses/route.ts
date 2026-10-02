import { prisma } from "@/lib/db";
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const locationId = searchParams.get("locationId") ?? "";
  const list = await prisma.expense.findMany({ where: locationId ? { locationId } : {}, take: 100, orderBy: { createdAt: "desc" } });
  return Response.json({ expenses: list });
}
export async function POST(req: Request) {
  const b = await req.json();
  if (!b.locationId || !b.userId || !b.category || b.amountKobo == null) return Response.json({ error: "locationId, userId, category, amountKobo required" }, { status: 400 });
  const e = await prisma.expense.create({ data: { locationId: b.locationId, category: b.category, amountKobo: b.amountKobo, note: b.note, userId: b.userId } });
  return Response.json({ expense: e }, { status: 201 });
}
