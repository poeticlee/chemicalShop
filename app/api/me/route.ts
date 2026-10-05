import { sessionUser } from "@/lib/require-auth";
export async function GET() {
  const u = await sessionUser();
  if (!u) return Response.json({ user: null }, { status: 401 });
  return Response.json({ user: u });
}
