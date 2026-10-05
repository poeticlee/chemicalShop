import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/require-auth";
// GET /api/sync/pull?since=ISO — master data LWW. Costs stripped for sales role.
export async function GET(req: Request) {
  const { user, error } = await requireUser();
  if (error) return error;
  const { searchParams } = new URL(req.url);
  const since = searchParams.get("since");
  const where = since ? { updatedAt: { gt: new Date(since) } } : {};
  const [itemsRaw, units] = await Promise.all([
    prisma.item.findMany({ where, take: 500, orderBy: { updatedAt: "asc" } }),
    prisma.itemUnit.findMany({ take: 1000 }),
  ]);
  const items = user!.role === "sales" ? itemsRaw.map(({ currentCost, ...rest }) => rest) : itemsRaw;
  return Response.json({ items, units, serverTime: new Date().toISOString() });
}
