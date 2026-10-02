import { prisma } from "@/lib/db";
export async function GET() {
  const locs = await prisma.location.findMany({ take: 100, orderBy: { name: "asc" } });
  return Response.json({ locations: locs });
}
export async function POST(req: Request) {
  const b = await req.json();
  if (!b.name) return Response.json({ error: "name required" }, { status: 400 });
  const loc = await prisma.location.create({ data: { name: b.name, address: b.address ?? (b.kind === "mini" ? "mini" : "main") } });
  return Response.json({ location: loc }, { status: 201 });
}
