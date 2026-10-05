import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/require-auth";
// GET /api/labels?code=TEX-001 — any logged-in staff
export async function GET(req: Request) {
  const { error } = await requireUser();
  if (error) return error;
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code") ?? "";
  if (!code) return Response.json({ error: "code required" }, { status: 400 });
  const item = await prisma.item.findUnique({ where: { code }, include: { units: true } });
  if (!item) return Response.json({ error: "not found" }, { status: 404 });
  return Response.json({ labels: item.units.filter(u => u.isSaleUnit).map(u => ({ code: `${item.code}-${u.unitName}`, name: `${item.name} ${u.unitName}`, priceKobo: u.priceRetail, barcode: `${item.code}-${u.unitName}` })) });
}
