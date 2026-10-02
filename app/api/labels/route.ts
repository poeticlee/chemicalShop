import { prisma } from "@/lib/db";
// GET /api/labels?code=TEX-001 — printable barcode-label payload (Code128 via frontend font/lib)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code") ?? "";
  if (!code) return Response.json({ error: "code required" }, { status: 400 });
  const item = await prisma.item.findUnique({ where: { code }, include: { units: true } });
  if (!item) return Response.json({ error: "not found" }, { status: 404 });
  return Response.json({ labels: item.units.filter(u => u.isSaleUnit).map(u => ({ code: `${item.code}-${u.unitName}`, name: `${item.name} ${u.unitName}`, priceKobo: u.priceRetail, barcode: `${item.code}-${u.unitName}` })) });
}
