// Resend email alerts: low-stock, expiry, negative-stock review, cash-up diff.
export async function sendEmail(to: string, subject: string, html: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key) { console.log(`[resend:disabled] to=${to} subject=${subject}`); return { queued: false, disabled: true }; }
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: "Chemical Shop <alerts@chemicalshop.ng>", to, subject, html }),
  });
  if (!r.ok) throw new Error(`resend ${r.status}: ${await r.text()}`);
  return { queued: true, ...(await r.json()) };
}
