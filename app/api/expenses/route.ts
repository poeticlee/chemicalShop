import { prisma } from "@/lib/db";
import { requireUser, canSeeLocation } from "@/lib/require-auth";
export async function GET(req: Request) {
  const { user, error } = await requireUser();
  if (error) return error;
  const { searchParams } = new URL(req.url);
  const locationId = searchParams.get("locationId") ?? "";
  if (locationId && !canSeeLocation(user!, locationId)) return Response.json({ error: "not your location" }, { status: 403 });
  const list = await prisma.expense.findMany({ where: locationId ? { locationId } : {}, take: 100, orderBy: { createdAt: "desc" } });
  return Response.json({ expenses: list });
}
export async function POST(req: Request) {
  const { user, error } = await requireUser(["owner", "manager", "accountant"]);
  if (error) return error;
  const b = await req.json();
  if (!b.locationId || !b.category || b.amountKobo == null) return Response.json({ error: "locationId, category, amountKobo required" }, { status: 400 });
  if (!canSeeLocation(user!, b.locationId)) return Response.json({ error: "not your location" }, { status: 403 });
  const e = await prisma.expense.create({ data: { locationId: b.locationId, category: b.category, amountKobo: b.amountKobo, note: b.note, userId: user!.id } });
  return Response.json({ expense: e }, { status: 201 });
}
