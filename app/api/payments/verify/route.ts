import { verifyPaystack } from "@/lib/paystack";
// GET /api/payments/verify?reference=xxx
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const ref = searchParams.get("reference") ?? "";
  if (!ref) return Response.json({ error: "reference required" }, { status: 400 });
  return Response.json(await verifyPaystack(ref));
}
