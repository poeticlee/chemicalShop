# Implementation Plan — Chemical Shop Software (PRD V1.1)

Source: `product-bible-chemical-shop-software.md` V1.1

## 0. Architecture baseline (all phases) — LOCKED STACK

- **App:** Next.js 14+ App Router + Tailwind CSS. PWA installable (laptop/tablet/Android). No Supabase.
- **DB central:** PostgreSQL 16 (direct, Prisma). Local offline: IndexedDB via Dexie + outbox queue + Service Worker background sync. Every op commits locally first, syncs when online.
- **Auth:** BetterAuth (email+password + PIN fast-switch at till, 5 roles, location lock, idle auto-lock, login throttling).
- **Files:** Cloudflare R2 (S3-compatible) for item photos, receipt PDFs, CSV imports/exports, DB backups. Signed URLs, per-location prefixes.
- **Payments:** Paystack for bank transfer / POS verification (initialize → verify webhook, split payment supported). Cash = manual count. No customer credit per PRD.
- **Email:** Resend for low-stock, expiry 90/30d, negative-stock review, cash-up difference, transfer variance alerts.
- **Docker:** yes — one-command setup. `docker compose up` runs Next.js app + PostgreSQL 16 + migrations. Same setup for your laptop and live server, fewer errors.
- **Conventions:** `qty_base INTEGER` (ml/g/pc), money kobo `INTEGER`, cost per base `REAL`. All records UUIDv7 client-generated.
- **Ledger:** insert-only `stock_movements`. One local txn per business op (sale + lines + payments + movements). Sync `POST /api/sync/push` idempotent `INSERT ON CONFLICT DO NOTHING`; `GET /api/sync/pull?since=` for master. Master LWW by `version + updated_at`.
- **RBAC:** Owner > Manager > Store keeper > Sales > Accountant. Staff: no costs, no adjust. All sensitive actions → `audit_log`.

## Phase 0 — Foundation (1 week)

**Build:**
- Docker files: `Dockerfile` for app + `docker-compose.yml` (app + Postgres + auto-migrate). `docker compose up` = everything running.
- BetterAuth setup: 5 roles, location lock, PIN switch, idle lock, throttling; `locations`, `users`, `audit_log` (append-only)
- Sync skeleton: Dexie outbox, push/pull, pending count badge, `device_id`
- R2 buckets + prefixes (`photos/`, `receipts/`, `exports/`, `backups/`), Resend sender + templates, Paystack test keys + webhook route
- Backup: central Postgres daily → R2, local IndexedDB export per device

**Exit:** role logins work offline; staff cost-hidden (API strips); audit immutable; R2/Resend/Paystack sandbox verified.

## Phase 1 — Core trade (3 weeks)

**Scope:** item master + location pricing, purchasing landed cost, ledger, POS singles, customers-lite, cash-up.

**Build:**
1. Items/units: types liquid/solid/plastic/service, base units, `factor_to_base`, retail/wholesale per location (`location_id NULL`=global, else override), CSV import via R2 upload, photos → R2
2. Suppliers + receiving: purchase units → auto convert to base, extras apportioned pro-rata by line value, `landed_cost_per_base = (price+extras)/qty_base` immutable, update `items.current_cost`, `supplier_payments`, derived balance
3. Ledger: purchase/sale/adjustment/return/wastage, real-time stock = `SUM(qty)`, counts (draft→submitted→approved), low-stock alerts via Resend
4. POS: search/code/scan + quick-pick, sell-by-measure (750g/1.5L), mixed singles+plastics cart, cash + Paystack-verified transfer/POS + split, staff discount limit + Manager override, print/PDF to R2 (WhatsApp = Phase 4), void + return-singles (Manager, logged)
5. Customers-lite: optional name/phone, history. No balances.
6. Cash-up/expenses: `expected = opening + sales_paid - refunds - expenses`, counted vs expected + diff, expenses by category, daily summary by pay type

**Pre-build fixes required:**
- Add `lot_id/batch/expiry` to `stock_movements` for FIFO/expiry block (FR-2.7)
- Move `review_queue` (negative_stock, expiry_override, count_variance) from Phase 3 to Phase 1
- `cash_ups`: allow N per day (remove UNIQUE(location,day))
- Add `sale_lines.cost_snapshot` for historic margin

**Acceptance:** 1.5L sale = -1500ml + correct profit; ₦5k extras apportion; offline 10 sales → sync once, replay = still 10; Location B override isolated; staff blocked 403; power-cut = all-or-nothing.

## Phase 2 — Repack + Combos (2-3 weeks)

**Pre-fix:** `item_bom` is 1→1, need `item_bom_lines` for 1→N (40L → 30×1L + 20×500ml).

**Build:**
- BOM CRUD + versioning, repack: bulk out + packaging out + packed in, expected vs actual → wastage, packed cost = bulk landed + packaging, who/when
- Combos: name + size variants (5/10/25/50L) as separate versions, ingredient qty_base, combo price, live availability + short-ingredient name, cost/margin/savings, mixing instructions print, recipe version pinned on sale
- Returns-combo: restock ingredients pro-rata, packaging NOT restocked, refund = paid - packaging if packed
- Deposits behind flag: `status=deposit`, no release until `paid in full`
- Reports: wastage by item/staff/location, combo vs singles

**Acceptance:** 40L repack deducts 40L + 40 bottles/caps via BOM; 25L combo deducts all ingredients offline = online; deposit holds stock.

## Phase 3 — Multi-location + Full reports (2 weeks)

**Build:**
- Transfers: draft→sent→received, sender deducts on dispatch, receiver adds on confirm (same transfer_id + line UUIDs), sent vs received variance → review_queue, in-transit view + timeout
- Owner consolidated dashboard (Next.js + Tailwind), location-scoped staff/manager
- Full 12 reports + Excel/CSV/PDF export via R2 signed URLs, expiry 90/30d alerts via Resend, reorder suggestions
- Price-list staleness: warn >7d, Manager override

**Acceptance:** 10 sent / 9 received → visible discrepancy; 2 locations offline day → sync no loss/dupe.

## Phase 4 — Polish (1-2 weeks)

- Barcode label printing, WhatsApp receipts/orders, mobile stock counting, combo ingredient-removal V2 (OFF default, fixed deduction table, margin floor, logged)
- Scale hardware: still out of scope

## Out of scope V1

Customer credit/debtors, custom one-off combos, drum serial tracking, forecasting, ordering portal, full accounting, scale integration.

## Risks

1. Lot/FIFO without lot-aware ledger → enforce in Phase 1 model
2. BOM 1→N → fix before Phase 2
3. In-transit stock invisible if receiver never confirms → timeout + report
4. Price staleness blocking rural sales → warning + override, not hard block
