import { prisma } from "@/lib/db";
// GET /api/sync/pull?since=ISO&locationId= — master data LWW
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const since = searchParams.get("since");
  const where = since ? { updatedAt: { gt: new Date(since) } } : {};
  const [items, units] = await Promise.all([
    prisma.item.findMany({ where, take: 500, orderBy: { updatedAt: "asc" } }),
    prisma.itemUnit.findMany({ take: 1000 }),
  ]);
  return Response.json({ items, units, serverTime: new Date().toISOString() });
}
