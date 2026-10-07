import { prisma } from "@/lib/db";
import { requireUser, canSeeLocation } from "@/lib/require-auth";

// Mixed cart: several singles + several combos in ONE sale, ONE receipt.
// POST { locationId, deviceId?, customerPhone?, discountKobo?, lines: [{ itemId, unitName, qtyUnits? , qtyBase? }], combos: [{ versionId, qty? }], payments: [{ method, amountKobo, reference? }] }
// Singles are priced server-side from item_units (location override wins). Combos use version price.
export async function POST(req: Request) {
  const { user, error } = await requireUser();
  if (error) return error;
  const b = await req.json();
  const lines = b.lines ?? [];
  const combos = b.combos ?? [];
  const payments = b.payments ?? [];
  if (!b.locationId || (lines.length === 0 && combos.length === 0) || payments.length === 0)
    return Response.json({ error: "locationId, lines/combos, payments required" }, { status: 400 });
  if (!canSeeLocation(user!, b.locationId)) return Response.json({ error: "not your location" }, { status: 403 });
  const uid = user!.id;

  const units = await prisma.itemUnit.findMany({ where: { OR: [{ locationId: b.locationId }, { locationId: null }] } });
  const priceFor = (itemId: string, unitName: string) => {
    const u = units.find(x => x.itemId === itemId && x.unitName === unitName && x.locationId === b.locationId)
      ?? units.find(x => x.itemId === itemId && x.unitName === unitName && x.locationId === null);
    return u ?? null;
  };

  let subtotal = 0;
  const pricedSingles: { itemId: string; qtyBase: number; unitName: string; priceKobo: number }[] = [];
  for (const l of lines) {
    const u = priceFor(l.itemId, l.unitName);
    if (!u) return Response.json({ error: `no price for unit ${l.unitName}` }, { status: 400 });
    const qtyBase = l.qtyBase ?? Math.round((l.qtyUnits ?? 1) * u.factorToBase);
    const price = Math.round((u.priceRetail * qtyBase) / u.factorToBase);
    subtotal += price;
    pricedSingles.push({ itemId: l.itemId, qtyBase, unitName: l.unitName, priceKobo: price });
  }

  const versions = await prisma.comboVersion.findMany({ where: { id: { in: combos.map((c: { versionId: string }) => c.versionId) } }, include: { lines: true } });
  const byId = new Map(versions.map(v => [v.id, v]));
  for (const c of combos) {
    const v = byId.get(c.versionId);
    if (!v) return Response.json({ error: "combo version not found" }, { status: 400 });
    subtotal += v.priceKobo * (c.qty ?? 1);
  }

  const discount = b.discountKobo ?? 0;
  const total = subtotal - discount;
  const paid = payments.reduce((s: number, p: { amountKobo?: number }) => s + (p.amountKobo || 0), 0);
  if (paid !== total) return Response.json({ error: `Full payment required: total ${total}, paid ${paid}` }, { status: 400 });

  // Availability across singles + combos
  const need = new Map<string, number>();
  for (const l of pricedSingles) need.set(l.itemId, (need.get(l.itemId) ?? 0) + l.qtyBase);
  for (const c of combos) {
    const v = byId.get(c.versionId)!;
    for (const ing of v.lines) need.set(ing.itemId, (need.get(ing.itemId) ?? 0) + ing.qtyBase * (c.qty ?? 1));
  }
  const sums = await prisma.stockMovement.groupBy({ by: ["itemId"], where: { locationId: b.locationId }, _sum: { qtyBase: true } });
  const have = new Map(sums.map(s => [s.itemId, s._sum.qtyBase ?? 0]));
  const short = Array.from(need.entries()).filter(([id, q]) => (have.get(id) ?? 0) < q);
  if (short.length) return Response.json({ error: "Insufficient stock", short }, { status: 409 });

  const saleId = crypto.randomUUID();
  let customerId: string | undefined;
  if (b.customerPhone) {
    const c = await prisma.customer.upsert({
      where: { id: b.customerPhone }, update: { lastSeen: new Date(), totalSpentKobo: { increment: total } },
      create: { id: b.customerPhone, phone: b.customerPhone, locationId: b.locationId, totalSpentKobo: total, lastSeen: new Date() },
    });
    customerId = c.id;
  }

  await prisma.$transaction(async (tx) => {
    await tx.sale.create({ data: { id: saleId, locationId: b.locationId, userId: uid, customerId, status: "paid", subtotalKobo: subtotal, discountKobo: discount, totalKobo: total, deviceId: b.deviceId ?? "web" } });
    for (const l of pricedSingles) {
      const item = await tx.item.findUniqueOrThrow({ where: { id: l.itemId } });
      await tx.saleLine.create({ data: { saleId, itemId: l.itemId, qtyBase: l.qtyBase, unitName: l.unitName, priceKobo: l.priceKobo, costKobo: l.qtyBase * item.currentCost } });
      await tx.stockMovement.create({ data: { itemId: l.itemId, locationId: b.locationId, qtyBase: -l.qtyBase, type: "sale", referenceId: saleId, userId: uid, deviceId: b.deviceId ?? "web" } });
    }
    for (const c of combos) {
      const v = byId.get(c.versionId)!;
      const qty = c.qty ?? 1;
      const perLine = Math.floor((v.priceKobo * qty) / v.lines.length);
      let rest = v.priceKobo * qty - perLine * v.lines.length;
      for (const ing of v.lines) {
        const item = await tx.item.findUniqueOrThrow({ where: { id: ing.itemId } });
        const share = perLine + (rest > 0 ? 1 : 0); if (rest > 0) rest--;
        await tx.saleLine.create({ data: { saleId, itemId: ing.itemId, qtyBase: ing.qtyBase * qty, unitName: item.baseUnit, priceKobo: 0, costKobo: ing.qtyBase * qty * item.currentCost, comboVersionId: v.id, comboShareKobo: share } });
        await tx.stockMovement.create({ data: { itemId: ing.itemId, locationId: b.locationId, qtyBase: -ing.qtyBase * qty, type: "sale", referenceId: saleId, userId: uid, deviceId: b.deviceId ?? "web" } });
      }
    }
    for (const p of payments) await tx.payment.create({ data: { saleId, method: p.method, amountKobo: p.amountKobo, reference: p.reference } });
    const after = await tx.stockMovement.groupBy({ by: ["itemId"], where: { locationId: b.locationId, itemId: { in: Array.from(need.keys()) } }, _sum: { qtyBase: true } });
    if (after.some(s => (s._sum.qtyBase ?? 0) < 0)) {
      await tx.reviewQueue.create({ data: { type: "negative_stock", refId: saleId, locationId: b.locationId, assignedTo: "manager" } });
    }
  });
  return Response.json({ saleId, total }, { status: 201 });
}
