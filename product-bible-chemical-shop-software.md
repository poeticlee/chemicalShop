# Product Bible: Chemical Shop Inventory & Sales Software

**Version 1.1 | Status: Ready for Phase 1 spec**
**Changelog V1.0 → V1.1:** clarified landed cost, customer vs supplier credit, per-location pricing foundation, added `item_bom`, `customers`, `supplier_payments` tables, defined expiry/FIFO rule, combo-return rule, offline idempotency (UUID), encryption at rest, simplified FR-5.8 / FR-6.10.

## 1. Purpose

One system that lets a multi-location chemical shop buy in bulk, repack into smaller portions, sell single items and fixed combos, and always know exactly what stock and money each location holds, even without internet.

## 2. Business context

- Buys **liquids** in drums and kegs (sold in ml/liters) and **solids** in sacks (sold in g/kg).
- Repacks bulk into smaller portions for sale.
- Sells **plastics** (bottles, jerrycans, caps, etc.) in different sizes.
- Sells **single items** and **combos** (e.g. a 25 L liquid soap kit: caustic soda, soda ash, perfume, texapon, sulphonic acid, STPP, SLS, pigment, etc.).
- Operates from **multiple locations**.

## 3. Decisions

### Confirmed
| Topic | Decision |
|---|---|
| Costing | **Landed cost (last purchase):** `(line price + apportioned extras) / qty_base`. `items.current_cost` = last landed cost per base unit. Full purchase cost history is still stored |
| Bulk tracking | Total bulk quantity per item per location only. No individual drum/sack serial tracking — confirmed not needed. Supplier disputes use purchase lot (supplier, date, batch, qty) |
| Offline | Mandatory. Every location must sell and record stock without internet |
| Customer credit | None. Goods leave only on full payment. Deposits allowed (see FR-6.10) but balance must be paid before pickup |
| Supplier credit | Allowed. Record supplier payments and balances owed (FR-2.6) |
| Combos | Fixed recipes that rarely change. Ingredient removal is OFF by default, V2 only (FR-5.8) |
| Single-item sales | Supported alongside combos |
| Pricing | Prices **can differ per location** (transport cost). Data model supports `location_id` on prices; UI can start with “same everywhere, override per location” |
| VAT/tax | Excluded for V1. Store `tax_rate = 0` + `price_includes_tax` flag for future enablement |
| Locations | Independent cash + stock per location, Owner sees consolidated view. Central item master, local prices/stock |

### Open
None — all settled. Drum/sack serial tracking explicitly excluded from V1 (see Out of scope).

## 4. Users and roles

| Role | Can do |
|---|---|
| Owner | Everything, all locations, all reports, price and cost visibility |
| Manager | Run one location: approve adjustments, discounts, transfers, cash-up |
| Sales staff | Make sales, print receipts. No cost prices, no stock adjustments |
| Store keeper | Receive stock, repack, transfer, count stock |
| Accountant | View reports and expenses, export data. No stock changes |

Each staff member has their own login. Sensitive actions (void sale, discount above limit, stock adjustment, price change) require Manager approval or are limited to Manager/Owner.

## 5. Core design principles

1. **Base unit storage.** Store every quantity in the smallest unit: ml for liquids, g for solids, pieces for plastics. Display in convenient units (L, kg, drum, sack).
2. **Stock is a ledger.** Never overwrite a quantity. Record movements (received, sold, repacked, transferred, adjusted, wasted). Current stock is the sum of movements. This makes offline sync safe.
3. **Combos hold no stock.** A combo is a list of items with a bundled price. Selling one deducts each ingredient.
4. **Every item is sellable on its own.**
5. **Everything is auditable.** Who, what, when, where, for every change.
6. **Offline first.** The local device is the working copy; the server is the sync and reporting hub. All records use client-generated UUIDs; sync is idempotent merge by UUID.

## 6. Functional requirements

### 6.1 Item master
- FR-1.1 Item types: liquid, solid, plastic/packaging, service.
- FR-1.2 Each item has a base unit and conversion table (e.g. 1 L = 1000 ml; 1 drum = 200 L; 1 sack = 25 kg). Conversions are set per item.
- FR-1.3 Multiple selling units per item, each with its own price (e.g. 250 ml, 500 ml, 1 L, 5 L, 25 L).
- FR-1.4 Price tiers: retail, wholesale, **per location**. `item_units.location_id` nullable = global default; row with `location_id` overrides it. V1 UI may show one price with “override per location” toggle.
- FR-1.5 Fields: code/SKU, name, category, supplier, photo, reorder level, storage/safety notes, active flag.
- FR-1.6 Safety fields: hazard label and "do not store with" note, shown on the item screen.
- FR-1.7 Bulk import of items and prices from Excel/CSV.
- FR-1.8 **Packed-item BOM (new):** any sellable packed SKU (e.g. “Texapon 1 L packed”) links to `bulk_item + bulk_qty + packaging lines`. Used by repack to auto-deduct. Bulk items themselves have no BOM.

### 6.2 Purchasing and receiving
- FR-2.1 Supplier records with contact details and purchase history.
- FR-2.2 Purchase orders (optional) and direct receiving.
- FR-2.3 Receive in purchase units (drums, kegs, sacks) and convert to base units automatically.
- FR-2.4 Record purchase price and extra costs (transport, loading); **landed cost per base = (line_price + apportioned extras) / qty_base**. Apportion extras pro-rata by line value unless user overrides.
- FR-2.5 Update the item's `current_cost` to the last landed cost, and keep a cost history (`purchase_lines.landed_cost_per_base` is immutable).
- FR-2.6 Record supplier payments and balances owed. Supplier buying on credit is allowed. Needs `supplier_payments` table; `suppliers.balance` is derived, never hand-edited.
- FR-2.7 Batch/lot number and expiry date per receipt (optional per item, required if `items.track_expiry = true`). **Rule: FIFO issue by expiry; block sale of expired lot with Manager override logged; expiry alert at 90/30 days.**

### 6.3 Stock ledger and control
- FR-3.1 Real-time stock per item per location, shown in any unit.
- FR-3.2 Movement types: purchase, sale, repack out/in, transfer out/in, adjustment, wastage, return.
- FR-3.3 Adjustments require a reason and approval; all are logged.
- FR-3.4 Stock counts: start a count, enter physical quantities, review variance, approve to post an adjustment.
- FR-3.5 Low-stock alerts against reorder levels, per location.
- FR-3.6 Negative stock is allowed only through offline sales and is flagged for review. **Rule: auto-creates `review_queue` entry assigned to Manager; must be cleared by recount or adjustment within 24h; negative-stock report is mandatory.**

### 6.4 Repackaging
- FR-4.1 Repack record: source bulk item, quantity used, output items and quantities (e.g. 40 L → 30 × 1 L + 20 × 500 ml). Outputs must match `item_bom` unless Manager overrides with reason.
- FR-4.2 Automatically deduct bulk + packaging per BOM and add the packed items to stock.
- FR-4.3 Record expected vs actual yield and log the difference as wastage.
- FR-4.4 Calculate cost per packed unit (bulk landed cost + packaging cost from `current_cost`).
- FR-4.5 Record who repacked and when.
- FR-4.6 Wastage report by item, staff and location.

### 6.5 Combos
- FR-5.1 Combo = name, size variant, list of ingredients with quantities and units, and a combo price.
- FR-5.2 Size variants (5 L, 10 L, 25 L, 50 L) each have their own ingredient quantities (= separate `combo_versions` row).
- FR-5.3 Selling a combo deducts every ingredient from the selling location's stock.
- FR-5.4 Live availability: show whether a combo can be sold now, and name any short ingredient.
- FR-5.5 Show cost, price and margin per combo, and savings vs buying items separately. Cost uses current landed costs.
- FR-5.6 Attach mixing instructions that can print with the receipt.
- FR-5.7 Recipe edits are versioned; past sales keep `recipe_version` they used.
- FR-5.8 **Ingredient removal (V2, OFF by default):** disabled in V1. When enabled later: Manager-configurable, deduction = fixed per-ingredient discount table (not live single price), logged, margin floor enforced. Do not build for Phase 1 beyond the flag.

### 6.6 Point of sale
- FR-6.1 Fast search by name/code, barcode scan, and a quick-pick grid for top sellers.
- FR-6.2 Sell by measure: enter "750 g" or "1.5 L" and price calculates. Manual entry for V1; scale integration out of scope.
- FR-6.3 Mixed cart: combos, single items and plastics in one sale.
- FR-6.4 Payments: cash, bank transfer, POS terminal, split payment. No customer credit.
- FR-6.5 Discounts with a staff limit; above the limit needs Manager approval.
- FR-6.6 Receipts: print, PDF, share via WhatsApp.
- FR-6.7 Returns and refunds with reason and approval, stock restored where applicable. **Combo returns: restock each ingredient pro-rata; packaging consumed is NOT restocked; refund = price paid minus packaging cost if already packed.**
- FR-6.8 Void a sale (Manager only, logged).
- FR-6.9 Customer master (new): optional name + phone per sale; `customers` table with repeat-buyer history. No customer balances in V1.
- FR-6.10 Pre-order/deposit (optional, constrained): deposit recorded as liability (`sales.status = deposit`, `payments` linked). Goods are NOT released until `status = paid in full`. No partial handover. If unwanted for launch, hide behind feature flag.
- FR-6.11 Works fully offline (see section 8).

### 6.7 Multi-location and transfers
- FR-7.1 Stock, sales and cash are recorded per location.
- FR-7.2 Transfers: create, send, in transit, received. Sender deducts on dispatch (`transfer_out`), receiver adds on confirm (`transfer_in`). Both entries carry the same `transfer_id` + line UUIDs for idempotent sync. The receiving location confirms quantities.
- FR-7.3 Flag any difference between sent and received quantity as wastage/variance assigned to transit.
- FR-7.4 Owner sees a consolidated view across locations.
- FR-7.5 Staff and managers only see their assigned location.

### 6.8 Cash and expenses
- FR-8.1 Daily cash-up per location: expected vs counted, with difference logged.
- FR-8.2 Expense recording (transport, rent, salaries, utilities) with category.
- FR-8.3 Daily sales summary by payment type.

## 7. Reports

- Daily sales by location, product, category, staff, and payment type
- Combo vs single-item sales
- Quantity sold per ingredient (across combos and singles) for reordering
- Profit and margin per item, per combo, per location (using last landed cost)
- Stock levels and stock valuation per location and combined
- Stock movement history for any item
- Wastage and variance report (repacking, counts, transfers)
- Low-stock and reorder suggestions
- Transfer report with discrepancies
- Cash-up report and expense summary
- Audit log (price changes, adjustments, voids, discounts)
- All reports exportable to Excel/CSV and PDF

## 8. Non-functional requirements

### Offline and sync
- NFR-1 Each location works with no internet: sales, receiving, repacking, transfers (send/receive), stock counts.
- NFR-2 Local data syncs automatically to the server when a connection returns; sync status is visible to the user.
- NFR-3 Sync merges ledger entries rather than overwriting quantities. **Merge key = UUID. Retries are safe (idempotent). Last-write-wins only for master data (`items`, `item_units`, `combos`) with `updated_at + version`. Ledger tables are insert-only, never updated.**
- NFR-4 Conflict rules: sales are never rejected offline; any resulting negative stock creates a review entry (FR-3.6).
- NFR-5 Price and item changes made centrally reach locations on next sync, with the effective time recorded. Devices reject sales using a price list older than X days (configurable, default 7) with Manager override.

### Security and reliability
- NFR-6 Role-based access; individual logins; optional PIN for quick staff switching at the till.
- NFR-7 Full audit trail that users cannot edit or delete.
- NFR-8 Automatic daily backup of the central data, and local backup on each device.
- NFR-9 Data encrypted in transit (TLS); **local DB encrypted at rest (e.g. SQLCipher); auto-lock on idle; failed-login throttling.**

### Usability and performance
- NFR-10 A sale can be completed in under 30 seconds for a typical cart.
- NFR-11 Works on a low-end laptop, tablet or Android phone; works with power interruptions (no data loss on sudden shutdown — write-ahead log + atomic ledger insert).
- NFR-12 Prices in naira; clear number and unit formatting (e.g. "2.5 L", "750 g").
- NFR-13 Simple screens; minimal typing for common actions.

## 9. Data model (main tables)

| Table | Key fields |
|---|---|
| items | id (uuid), code, name, type, category, base_unit, current_cost (last landed), reorder_level, safety_note, track_expiry bool, active, version, updated_at |
| item_units | id, item_id, unit_name, factor_to_base, location_id nullable (null=global), price_retail, price_wholesale, is_purchase_unit, is_sale_unit |
| item_bom **(new)** | id, output_item_id, bulk_item_id, bulk_qty_base, packaging_lines [{plastic_item_id, qty}], version |
| locations | id, name, address |
| suppliers | id, name, phone, balance_derived |
| supplier_payments **(new)** | id (uuid), supplier_id, location_id, amount, method, date, user, reference |
| customers **(new)** | id (uuid), name, phone unique, location_id, total_spent, last_seen |
| purchases / purchase_lines | id (uuid), supplier, location, date, item, qty_base, price, extras_apportioned, landed_cost_per_base immutable, batch, expiry, user |
| stock_movements (ledger, insert-only) | id (uuid), item_id, location_id, qty_base signed, type, reference_id (sale/purchase/transfer/repack id), user, timestamp, device_id |
| repacks / repack_lines | id (uuid), source item, qty_used_base, outputs [{item, qty_base}], packaging_used, expected vs actual, user, location |
| combos / combo_versions / combo_lines | combo id, version, size, price, location_override nullable, ingredient item, qty_base, mixing_instructions |
| sales / sale_lines | id (uuid), location, user, time, customer_id nullable, line type (item/combo/plastic), item_id or combo_version, qty_base, unit, price, discount, recipe_version, status (paid/deposit/voided) |
| payments | id (uuid), sale_id, method (cash/transfer/POS), amount, reference |
| transfers / transfer_lines | id (uuid), from, to, status (draft/sent/received), sent_qty_base, received_qty_base, variance, users, times |
| stock_counts / count_lines | location, item, system qty, counted qty, variance, approved by |
| review_queue **(new)** | id, type (negative_stock/expiry/transfer_variance), ref_id, location, assigned_to, resolved bool |
| cash_ups | location, date, expected, counted, difference, user |
| expenses | location, category, amount, date, user |
| users / roles | login, role, location access, pin_hash |
| audit_log | id, user, action, entity, before, after, timestamp, location |

## 10. Key workflows

**Receive stock:** select supplier → enter items in purchase units → enter price and extra costs → confirm → ledger entries created (UUID), current cost updated to landed cost.

**Repack:** choose bulk item → enter quantity used → BOM pre-fills packed outputs + packaging → confirm → system deducts bulk and packaging, adds packed stock → difference logged as wastage.

**Sell a combo plus extras:** add combo (availability checked) → add single items → apply discount if allowed → take payment (full payment only) → print/share receipt → ledger deducts every ingredient (one movement per ingredient, same `sale_id`).

**Return combo:** select sale → reason + approval → restock ingredients pro-rata, packaging not restocked → refund logged.

**Transfer:** create transfer (UUID) → sender confirms dispatch (stock leaves sender immediately) → receiver confirms quantities offline-capable (stock enters receiver) → differences flagged to review_queue.

**Close the day:** count cash → system compares to expected → record difference → sync (show pending count).

## 11. Release plan

| Phase | Scope |
|---|---|
| 1 | Item master with unit conversions + per-location price foundation, purchasing/receiving (landed cost), stock ledger (UUID), basic POS with offline mode, customers-lite, cash-up |
| 2 | Repackaging via BOM, wastage tracking, combos (no removal), deposits-behind-flag |
| 3 | Multi-location transfers, consolidated owner dashboard, full reports, review_queue |
| 4 | Barcode label printing, WhatsApp receipts and orders, mobile stock counting, combo-edit (FR-5.8) |

## 12. Out of scope for version 1

Customer credit and debtors, custom one-off combos / ingredient substitution-removal (moved to V2), individual drum tracking, demand forecasting, customer ordering portal, full accounting ledger, scale hardware integration.

## 13. Acceptance checks

- Selling 1.5 L from a drum reduces stock by exactly 1500 ml and shows correct landed cost and profit.
- Receiving with ₦5,000 transport on 2 lines apportions correctly and updates `current_cost` to landed cost, history preserved.
- Repacking 40 L into 40 × 1 L bottles reduces bulk by 40 L, packaging by 40 bottles and 40 caps via BOM.
- Selling a 25 L soap combo deducts every ingredient and shows the same result offline and after sync (no dupes on retry).
- Two locations selling offline for a day sync with no lost or duplicated sales (UUID idempotency test: replay same payload twice = 1 record).
- A transfer with 10 units sent and 9 received creates a visible discrepancy in review_queue.
- A staff login cannot see cost prices or adjust stock.
- Expired lot is blocked at POS unless Manager overrides (logged).
- Location B price override does not affect Location A.
- Negative stock from offline sale appears in Manager review queue.
- Deposit order does not release stock until paid in full.
