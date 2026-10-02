"use client";
import Dexie, { Table } from "dexie";
export interface OutboxMovement { id: string; itemId: string; locationId: string; qtyBase: number; type: string; referenceId: string; userId: string; deviceId: string; createdAt: string; synced?: number; }
class ShopDB extends Dexie {
  outbox!: Table<OutboxMovement, string>;
  constructor() { super("chemical-shop"); this.version(1).stores({ outbox: "id, locationId, synced" }); }
}
export const db = new ShopDB();
export const queueMovement = (m: OutboxMovement) => db.outbox.put({ ...m, synced: 0 });
export const pendingCount = () => db.outbox.where("synced").equals(0).count();
export async function flushOutbox() {
  const pending = await db.outbox.where("synced").equals(0).toArray();
  if (!pending.length) return { pushed: 0 };
  const r = await fetch("/api/sync/push", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ movements: pending }) });
  const d = await r.json();
  if (r.ok) await db.outbox.bulkDelete(pending.map(p => p.id));
  return d;
}
