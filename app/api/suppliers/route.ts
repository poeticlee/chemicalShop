import { prisma } from "@/lib/db";
import { requireUser, canSeeLocation } from "@/lib/require-auth";
// Suppliers + payments (supplier credit allowed per PRD). Balances derived.
export async function GET() {
  const { error } = await requireUser(["owner", "manager", "accountant", "store_keeper"]);
  if (error) return error;
  const suppliers = await prisma.supplier.findMany({ take: 100, orderBy: { name: "asc" } });
  return Response.json({ suppliers });
}
export async function POST(req: Request) {
  const { user, error } = await requireUser(["owner", "manager"]);
  if (error) return error;
  const b = await req.json();
  if (b.action === "pay") {
    if (!b.supplierId || !b.locationId || b.amountKobo == null) return Response.json({ error: "supplierId, locationId, amountKobo required" }, { status: 400 });
    if (!canSeeLocation(user!, b.locationId)) return Response.json({ error: "not your location" }, { status: 403 });
    const p = await prisma.supplierPayment.create({ data: { supplierId: b.supplierId, locationId: b.locationId, amountKobo: b.amountKobo, method: b.method ?? "cash", userId: user!.id } });
    return Response.json({ payment: p }, { status: 201 });
  }
  if (!b.name) return Response.json({ error: "name required" }, { status: 400 });
  const s = await prisma.supplier.create({ data: { name: b.name, phone: b.phone } });
  return Response.json({ supplier: s }, { status: 201 });
}
