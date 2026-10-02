import { prisma } from "@/lib/db";
// POST { locationId, userId, day, countedKobo } — expected computed: sales paid - refunds - expenses (+ opening 0 for now)
export async function POST(req: Request) {
  const b = await req.json();
  if (!b.locationId || !b.userId || !b.day || b.countedKobo == null) return Response.json({ error: "locationId, userId, day, countedKobo required" }, { status: 400 });
  const sales = await prisma.sale.aggregate({ _sum: { totalKobo: true }, where: { locationId: b.locationId } });
  const exps = await prisma.expense.aggregate({ _sum: { amountKobo: true }, where: { locationId: b.locationId } });
  const expected = (sales._sum.totalKobo ?? 0) - (exps._sum.amountKobo ?? 0);
  const counted = b.countedKobo;
  const row = await prisma.cashUp.create({ data: { locationId: b.locationId, userId: b.userId, day: b.day, expectedKobo: expected, countedKobo: counted, differenceKobo: counted - expected } });
  return Response.json({ cashUp: row }, { status: 201 });
}
