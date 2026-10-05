import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/require-auth";
// Combos CRUD (minimal): POST { name, versions: [...] } — owner/manager only
export async function GET() {
  const { error } = await requireUser();
  if (error) return error;
  const combos = await prisma.combo.findMany({ include: { versions: { include: { lines: true } } }, take: 50 });
  // attach live availability + cost using current costs
  const items = await prisma.item.findMany();
  const cost = new Map(items.map(i => [i.id, i.currentCost]));
  const out = combos.map(c => ({ ...c, versions: c.versions.map(v => ({
    ...v,
    costKobo: Math.round(v.lines.reduce((s, l) => s + l.qtyBase * (cost.get(l.itemId) ?? 0), 0)),
  }))}));
  return Response.json({ combos: out });
}
export async function POST(req: Request) {
  const { error } = await requireUser(["owner", "manager"]);
  if (error) return error;
  const b = await req.json();
  if (!b.name || !b.versions?.length) return Response.json({ error: "name, versions required" }, { status: 400 });
  const c = await prisma.combo.create({ data: { name: b.name } });
  for (const v of b.versions) {
    const ver = await prisma.comboVersion.create({ data: { comboId: c.id, sizeLabel: v.sizeLabel, priceKobo: v.priceKobo, instructions: v.instructions } });
    for (const l of v.lines ?? []) await prisma.comboLine.create({ data: { versionId: ver.id, itemId: l.itemId, qtyBase: l.qtyBase } });
  }
  return Response.json({ comboId: c.id }, { status: 201 });
}
