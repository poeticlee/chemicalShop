import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/require-auth";

const ROLES = ["owner", "manager", "sales", "store_keeper", "accountant"];

// GET /api/users — owner/manager see all staff
export async function GET() {
  const { error } = await requireUser(["owner", "manager"]);
  if (error) return error;
  const users = await prisma.user.findMany({ take: 200, orderBy: { createdAt: "asc" } });
  return Response.json({ users: users.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role, locationIds: u.locationIds })) });
}

// POST /api/users { userId, role?, locationIds? } — owner only. This is how new admins are made.
export async function POST(req: Request) {
  const { user, error } = await requireUser(["owner"]);
  if (error) return error;
  const b = await req.json();
  if (!b.userId) return Response.json({ error: "userId required" }, { status: 400 });
  if (b.userId === user!.id && b.role && b.role !== "owner")
    return Response.json({ error: "cannot demote yourself" }, { status: 400 });
  const data: Record<string, string> = {};
  if (b.role) {
    if (!ROLES.includes(b.role)) return Response.json({ error: "unknown role" }, { status: 400 });
    data.role = b.role;
  }
  if (b.locationIds) data.locationIds = typeof b.locationIds === "string" ? b.locationIds : JSON.stringify(b.locationIds);
  const updated = await prisma.user.update({ where: { id: b.userId }, data });
  await prisma.auditLog.create({ data: { userId: user!.id, action: "user_role_change", entity: "user", entityId: updated.id, afterJson: JSON.stringify({ role: updated.role, locationIds: updated.locationIds }) } });
  return Response.json({ user: { id: updated.id, email: updated.email, role: updated.role, locationIds: updated.locationIds } });
}
