import { r2Status } from "@/lib/r2";
import { requireUser } from "@/lib/require-auth";
export async function GET() {
  const { error } = await requireUser(["owner", "manager"]);
  if (error) return error;
  return Response.json({ r2: r2Status(), resend: !!process.env.RESEND_API_KEY, paystack: !!process.env.PAYSTACK_SECRET_KEY });
}
