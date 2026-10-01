export async function GET() {
  return Response.json({ ok: true, app: "chemical-shop", time: new Date().toISOString() });
}
