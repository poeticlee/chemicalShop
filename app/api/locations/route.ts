import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/require-auth";
export async function GET() {
  const { error } = await requireUser();
  if (error) return error;
  const locs = await prisma.location.findMany({ take: 100, orderBy: { name: "asc" } });
  return Response.json({ locations: locs });
}
export async function POST(req: Request) {
  const { error } = await requireUser(["owner"]);
  if (error) return error;
  const b = await req.json();
  if (!b.name) return Response.json({ error: "name required" }, { status: 400 });
  const loc = await prisma.location.create({ data: { name: b.name, address: b.address ?? (b.kind === "mini" ? "mini" : "main") } });
  return Response.json({ location: loc }, { status: 201 });
}
