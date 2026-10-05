import { prisma } from "@/lib/db";
import { requireUser, canSeeLocation } from "@/lib/require-auth";
// GET /api/reports/summary?locationId=xxx — manager/owner/accountant, location-scoped
export async function GET(req: Request) {
  const { user, error } = await requireUser(["owner", "manager", "accountant"]);
  if (error) return error;
  const { searchParams } = new URL(req.url);
  const locationId = searchParams.get("locationId") ?? "";
  if (!locationId) return Response.json({ error: "locationId required" }, { status: 400 });
  if (!canSeeLocation(user!, locationId)) return Response.json({ error: "not your location" }, { status: 403 });
  const [sales, payAgg, movAgg, items, cashups, exps] = await Promise.all([
    prisma.sale.aggregate({ _sum: { totalKobo: true }, _count: true, where: { locationId, status: "paid" } }),
    prisma.payment.groupBy({ by: ["method"], _sum: { amountKobo: true }, where: { sale: { locationId } } }),
    prisma.stockMovement.groupBy({ by: ["itemId"], where: { locationId }, _sum: { qtyBase: true } }),
    prisma.item.findMany(),
    prisma.cashUp.findMany({ where: { locationId }, take: 7, orderBy: { createdAt: "desc" } }),
    prisma.expense.aggregate({ _sum: { amountKobo: true }, where: { locationId } }),
  ]);
  const cost = new Map(items.map(i => [i.id, i]));
  let valuation = 0;
  const stock = movAgg.map(s => {
    const it = cost.get(s.itemId); const qty = s._sum.qtyBase ?? 0;
    const val = Math.round(qty * (it?.currentCost ?? 0)); valuation += val;
    return { code: it?.code, name: it?.name, qty, val };
  });
  return Response.json({
    salesTotalKobo: sales._sum.totalKobo ?? 0, salesCount: sales._count,
    byMethod: payAgg, stockValuationKobo: valuation, stock,
    cashups, expensesKobo: exps._sum.amountKobo ?? 0,
  });
}
