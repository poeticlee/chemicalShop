import { prisma } from "@/lib/db";
import { hashPassword, makeToken } from "@/lib/simple-auth";
// POST { email, password } → { token, user, redirect }
export async function POST(req: Request) {
  const b = await req.json();
  const u = await prisma.user.findUnique({ where: { email: b.email } });
  if (!u || u.passwordHash !== hashPassword(b.password ?? "")) return Response.json({ error: "invalid login" }, { status: 401 });
  const admin = ["owner","manager","accountant"].includes(u.role);
  return Response.json({ token: makeToken(u.id), user: { id: u.id, name: u.name, email: u.email, role: u.role }, redirect: admin ? "/dashboard" : "/pos" });
}
