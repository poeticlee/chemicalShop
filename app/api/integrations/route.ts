import { r2Status } from "@/lib/r2";
export async function GET() { return Response.json({ r2: r2Status(), resend: !!process.env.RESEND_API_KEY, paystack: !!process.env.PAYSTACK_SECRET_KEY }); }
