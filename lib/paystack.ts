// Paystack: verify bank transfer / POS payments. No customer credit per PRD.
export async function verifyPaystack(reference: string) {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) return { verified: false, sandbox: true, reference, reason: "PAYSTACK_SECRET_KEY missing" };
  const r = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${key}` },
  });
  if (!r.ok) return { verified: false, reference, reason: `paystack ${r.status}` };
  const d = await r.json();
  const ok = d?.data?.status === "success";
  return { verified: ok, reference, amountKobo: Math.round((d?.data?.amount ?? 0)), currency: d?.data?.currency ?? "NGN", raw: d?.data };
}
