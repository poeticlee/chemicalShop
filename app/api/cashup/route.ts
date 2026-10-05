import { prisma } from "@/lib/db";
import { requireUser, canSeeLocation } from "@/lib/require-auth";
// POST { locationId, day, countedKobo } — manager/owner. Expected = sales paid − expenses.
export async function POST(req: Request) {
  const { user, error } = await requireUser(["owner", "manager"]);
  if (error) return error;
  const b = await req.json();
  if (!b.locationId || !b.day || b.countedKobo == null) return Response.json({ error: "locationId, day, countedKobo required" }, { status: 400 });
  if (!canSeeLocation(user!, b.locationId)) return Response.json({ error: "not your location" }, { status: 403 });
  const sales = await prisma.sale.aggregate({ _sum: { totalKobo: true }, where: { locationId: b.locationId } });
  const exps = await prisma.expense.aggregate({ _sum: { amountKobo: true }, where: { locationId: b.locationId } });
  const expected = (sales._sum.totalKobo ?? 0) - (exps._sum.amountKobo ?? 0);
  const counted = b.countedKobo;
  const row = await prisma.cashUp.create({ data: { locationId: b.locationId, userId: user!.id, day: b.day, expectedKobo: expected, countedKobo: counted, differenceKobo: counted - expected } });
  return Response.json({ cashUp: row }, { status: 201 });
}
