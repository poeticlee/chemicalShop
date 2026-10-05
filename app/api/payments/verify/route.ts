import { verifyPaystack } from "@/lib/paystack";
import { requireUser } from "@/lib/require-auth";
// GET /api/payments/verify?reference=xxx — any logged-in staff (till use)
export async function GET(req: Request) {
  const { error } = await requireUser();
  if (error) return error;
  const { searchParams } = new URL(req.url);
  const ref = searchParams.get("reference") ?? "";
  if (!ref) return Response.json({ error: "reference required" }, { status: 400 });
  return Response.json(await verifyPaystack(ref));
}
