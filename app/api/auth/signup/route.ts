import { prisma } from "@/lib/db";
import { hashPassword, makeToken } from "@/lib/simple-auth";
// POST { name, email, password, role: owner|manager|sales|store_keeper, locationId? }
export async function POST(req: Request) {
  const b = await req.json();
  if (!b.email || !b.password || !b.name) return Response.json({ error: "name, email, password required" }, { status: 400 });
  const role = ["owner","manager","sales","store_keeper"].includes(b.role) ? b.role : "sales";
  try {
    const u = await prisma.user.create({ data: {
      email: b.email, name: b.name, role,
      locationIds: JSON.stringify(b.locationId ? [b.locationId] : []),
      passwordHash: hashPassword(b.password),
    }});
    return Response.json({ token: makeToken(u.id), user: { id: u.id, name: u.name, email: u.email, role: u.role } }, { status: 201 });
  } catch (e: any) {
    if (String(e?.code) === "P2002") return Response.json({ error: "email already registered" }, { status: 409 });
    throw e;
  }
}
