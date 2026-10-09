--
-- PostgreSQL database dump
--


-- Dumped from database version 17.7
-- Dumped by pg_dump version 17.7

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- *not* creating schema, since initdb creates it


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS '';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Account; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Account" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "accountId" text NOT NULL,
    "providerId" text NOT NULL,
    "accessToken" text,
    "refreshToken" text,
    "accessTokenExpiresAt" timestamp(3) without time zone,
    "refreshTokenExpiresAt" timestamp(3) without time zone,
    scope text,
    "idToken" text,
    password text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: AuditLog; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."AuditLog" (
    id text NOT NULL,
    "userId" text NOT NULL,
    action text NOT NULL,
    entity text NOT NULL,
    "entityId" text NOT NULL,
    "beforeJson" text,
    "afterJson" text,
    "locationId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Bom; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Bom" (
    id text NOT NULL,
    "outputItemId" text NOT NULL,
    "bulkItemId" text NOT NULL,
    "bulkQtyBase" integer NOT NULL,
    "packagingJson" text DEFAULT '[]'::text NOT NULL,
    version integer DEFAULT 1 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: CashUp; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."CashUp" (
    id text NOT NULL,
    "locationId" text NOT NULL,
    "userId" text NOT NULL,
    day text NOT NULL,
    "expectedKobo" integer NOT NULL,
    "countedKobo" integer NOT NULL,
    "differenceKobo" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Combo; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Combo" (
    id text NOT NULL,
    name text NOT NULL,
    active boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: ComboLine; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ComboLine" (
    id text NOT NULL,
    "versionId" text NOT NULL,
    "itemId" text NOT NULL,
    "qtyBase" integer NOT NULL
);


--
-- Name: ComboVersion; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ComboVersion" (
    id text NOT NULL,
    "comboId" text NOT NULL,
    "sizeLabel" text NOT NULL,
    "priceKobo" integer NOT NULL,
    instructions text,
    version integer DEFAULT 1 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: CountLine; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."CountLine" (
    id text NOT NULL,
    "countId" text NOT NULL,
    "itemId" text NOT NULL,
    "systemQty" integer NOT NULL,
    "countedQty" integer NOT NULL
);


--
-- Name: Customer; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Customer" (
    id text NOT NULL,
    name text,
    phone text,
    "locationId" text,
    "totalSpentKobo" integer DEFAULT 0 NOT NULL,
    "lastSeen" timestamp(3) without time zone
);


--
-- Name: Expense; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Expense" (
    id text NOT NULL,
    "locationId" text NOT NULL,
    category text NOT NULL,
    "amountKobo" integer NOT NULL,
    note text,
    "userId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Item; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Item" (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    type text NOT NULL,
    category text,
    "baseUnit" text NOT NULL,
    "currentCost" double precision DEFAULT 0 NOT NULL,
    "reorderLevel" integer DEFAULT 0 NOT NULL,
    "safetyNote" text,
    "hazardLabel" text,
    "trackExpiry" boolean DEFAULT false NOT NULL,
    active boolean DEFAULT true NOT NULL,
    version integer DEFAULT 1 NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: ItemUnit; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ItemUnit" (
    id text NOT NULL,
    "itemId" text NOT NULL,
    "unitName" text NOT NULL,
    "factorToBase" integer NOT NULL,
    "locationId" text,
    "priceRetail" integer DEFAULT 0 NOT NULL,
    "priceWholesale" integer DEFAULT 0 NOT NULL,
    "isPurchaseUnit" boolean DEFAULT false NOT NULL,
    "isSaleUnit" boolean DEFAULT true NOT NULL
);


--
-- Name: Location; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Location" (
    id text NOT NULL,
    name text NOT NULL,
    address text
);


--
-- Name: Payment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Payment" (
    id text NOT NULL,
    "saleId" text NOT NULL,
    method text NOT NULL,
    "amountKobo" integer NOT NULL,
    reference text
);


--
-- Name: Purchase; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Purchase" (
    id text NOT NULL,
    "supplierId" text NOT NULL,
    "locationId" text NOT NULL,
    "userId" text NOT NULL,
    "deviceId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: PurchaseLine; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."PurchaseLine" (
    id text NOT NULL,
    "purchaseId" text NOT NULL,
    "itemId" text NOT NULL,
    "qtyBase" integer NOT NULL,
    "priceKobo" integer NOT NULL,
    "extrasShareKobo" integer DEFAULT 0 NOT NULL,
    "landedCostPerBase" double precision NOT NULL,
    batch text,
    expiry timestamp(3) without time zone
);


--
-- Name: Repack; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Repack" (
    id text NOT NULL,
    "locationId" text NOT NULL,
    "userId" text NOT NULL,
    "sourceItemId" text NOT NULL,
    "qtyUsedBase" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: RepackOutput; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."RepackOutput" (
    id text NOT NULL,
    "repackId" text NOT NULL,
    "itemId" text NOT NULL,
    "qtyBase" integer NOT NULL
);


--
-- Name: ReviewQueue; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ReviewQueue" (
    id text NOT NULL,
    type text NOT NULL,
    "refId" text NOT NULL,
    "locationId" text NOT NULL,
    "assignedTo" text,
    resolved boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Sale; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Sale" (
    id text NOT NULL,
    "locationId" text NOT NULL,
    "userId" text NOT NULL,
    "customerId" text,
    status text DEFAULT 'paid'::text NOT NULL,
    "subtotalKobo" integer DEFAULT 0 NOT NULL,
    "discountKobo" integer DEFAULT 0 NOT NULL,
    "totalKobo" integer DEFAULT 0 NOT NULL,
    "deviceId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: SaleLine; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."SaleLine" (
    id text NOT NULL,
    "saleId" text NOT NULL,
    "itemId" text NOT NULL,
    "qtyBase" integer NOT NULL,
    "unitName" text NOT NULL,
    "priceKobo" integer NOT NULL,
    "costKobo" double precision DEFAULT 0 NOT NULL,
    "discountKobo" integer DEFAULT 0 NOT NULL,
    "comboVersionId" text,
    "comboShareKobo" integer DEFAULT 0 NOT NULL
);


--
-- Name: Session; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Session" (
    id text NOT NULL,
    "userId" text NOT NULL,
    token text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "ipAddress" text,
    "userAgent" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: StockCount; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."StockCount" (
    id text NOT NULL,
    "locationId" text NOT NULL,
    "startedBy" text NOT NULL,
    "approvedBy" text,
    status text DEFAULT 'draft'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: StockMovement; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."StockMovement" (
    id text NOT NULL,
    "itemId" text NOT NULL,
    "locationId" text NOT NULL,
    "qtyBase" integer NOT NULL,
    type text NOT NULL,
    "referenceId" text NOT NULL,
    "userId" text NOT NULL,
    "deviceId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Supplier; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Supplier" (
    id text NOT NULL,
    name text NOT NULL,
    phone text
);


--
-- Name: SupplierPayment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."SupplierPayment" (
    id text NOT NULL,
    "supplierId" text NOT NULL,
    "locationId" text NOT NULL,
    "amountKobo" integer NOT NULL,
    method text DEFAULT 'cash'::text NOT NULL,
    "userId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Transfer; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Transfer" (
    id text NOT NULL,
    "fromLocationId" text NOT NULL,
    "toLocationId" text NOT NULL,
    status text DEFAULT 'draft'::text NOT NULL,
    "createdBy" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: TransferLine; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."TransferLine" (
    id text NOT NULL,
    "transferId" text NOT NULL,
    "itemId" text NOT NULL,
    "sentQty" integer DEFAULT 0 NOT NULL,
    "receivedQty" integer
);


--
-- Name: User; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."User" (
    id text NOT NULL,
    name text,
    email text NOT NULL,
    "emailVerified" boolean DEFAULT false NOT NULL,
    image text,
    role text DEFAULT 'sales'::text NOT NULL,
    "locationIds" text DEFAULT '[]'::text NOT NULL,
    "pinHash" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Verification; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Verification" (
    id text NOT NULL,
    identifier text NOT NULL,
    value text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Account Account_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Account"
    ADD CONSTRAINT "Account_pkey" PRIMARY KEY (id);


--
-- Name: AuditLog AuditLog_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AuditLog"
    ADD CONSTRAINT "AuditLog_pkey" PRIMARY KEY (id);


--
-- Name: Bom Bom_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Bom"
    ADD CONSTRAINT "Bom_pkey" PRIMARY KEY (id);


--
-- Name: CashUp CashUp_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CashUp"
    ADD CONSTRAINT "CashUp_pkey" PRIMARY KEY (id);


--
-- Name: ComboLine ComboLine_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ComboLine"
    ADD CONSTRAINT "ComboLine_pkey" PRIMARY KEY (id);


--
-- Name: ComboVersion ComboVersion_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ComboVersion"
    ADD CONSTRAINT "ComboVersion_pkey" PRIMARY KEY (id);


--
-- Name: Combo Combo_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Combo"
    ADD CONSTRAINT "Combo_pkey" PRIMARY KEY (id);


--
-- Name: CountLine CountLine_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CountLine"
    ADD CONSTRAINT "CountLine_pkey" PRIMARY KEY (id);


--
-- Name: Customer Customer_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Customer"
    ADD CONSTRAINT "Customer_pkey" PRIMARY KEY (id);


--
-- Name: Expense Expense_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Expense"
    ADD CONSTRAINT "Expense_pkey" PRIMARY KEY (id);


--
-- Name: ItemUnit ItemUnit_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ItemUnit"
    ADD CONSTRAINT "ItemUnit_pkey" PRIMARY KEY (id);


--
-- Name: Item Item_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Item"
    ADD CONSTRAINT "Item_pkey" PRIMARY KEY (id);


--
-- Name: Location Location_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Location"
    ADD CONSTRAINT "Location_pkey" PRIMARY KEY (id);


--
-- Name: Payment Payment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_pkey" PRIMARY KEY (id);


--
-- Name: PurchaseLine PurchaseLine_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PurchaseLine"
    ADD CONSTRAINT "PurchaseLine_pkey" PRIMARY KEY (id);


--
-- Name: Purchase Purchase_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Purchase"
    ADD CONSTRAINT "Purchase_pkey" PRIMARY KEY (id);


--
-- Name: RepackOutput RepackOutput_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."RepackOutput"
    ADD CONSTRAINT "RepackOutput_pkey" PRIMARY KEY (id);


--
-- Name: Repack Repack_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Repack"
    ADD CONSTRAINT "Repack_pkey" PRIMARY KEY (id);


--
-- Name: ReviewQueue ReviewQueue_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ReviewQueue"
    ADD CONSTRAINT "ReviewQueue_pkey" PRIMARY KEY (id);


--
-- Name: SaleLine SaleLine_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SaleLine"
    ADD CONSTRAINT "SaleLine_pkey" PRIMARY KEY (id);


--
-- Name: Sale Sale_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Sale"
    ADD CONSTRAINT "Sale_pkey" PRIMARY KEY (id);


--
-- Name: Session Session_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_pkey" PRIMARY KEY (id);


--
-- Name: StockCount StockCount_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."StockCount"
    ADD CONSTRAINT "StockCount_pkey" PRIMARY KEY (id);


--
-- Name: StockMovement StockMovement_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."StockMovement"
    ADD CONSTRAINT "StockMovement_pkey" PRIMARY KEY (id);


--
-- Name: SupplierPayment SupplierPayment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SupplierPayment"
    ADD CONSTRAINT "SupplierPayment_pkey" PRIMARY KEY (id);


--
-- Name: Supplier Supplier_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Supplier"
    ADD CONSTRAINT "Supplier_pkey" PRIMARY KEY (id);


--
-- Name: TransferLine TransferLine_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TransferLine"
    ADD CONSTRAINT "TransferLine_pkey" PRIMARY KEY (id);


--
-- Name: Transfer Transfer_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Transfer"
    ADD CONSTRAINT "Transfer_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: Verification Verification_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Verification"
    ADD CONSTRAINT "Verification_pkey" PRIMARY KEY (id);


--
-- Name: ItemUnit_itemId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ItemUnit_itemId_idx" ON public."ItemUnit" USING btree ("itemId");


--
-- Name: Item_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Item_code_key" ON public."Item" USING btree (code);


--
-- Name: Session_token_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Session_token_key" ON public."Session" USING btree (token);


--
-- Name: StockMovement_itemId_locationId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "StockMovement_itemId_locationId_idx" ON public."StockMovement" USING btree ("itemId", "locationId");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: Account Account_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Account"
    ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ComboLine ComboLine_versionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ComboLine"
    ADD CONSTRAINT "ComboLine_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES public."ComboVersion"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ComboVersion ComboVersion_comboId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ComboVersion"
    ADD CONSTRAINT "ComboVersion_comboId_fkey" FOREIGN KEY ("comboId") REFERENCES public."Combo"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ItemUnit ItemUnit_itemId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ItemUnit"
    ADD CONSTRAINT "ItemUnit_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES public."Item"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Payment Payment_saleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES public."Sale"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: PurchaseLine PurchaseLine_purchaseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PurchaseLine"
    ADD CONSTRAINT "PurchaseLine_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES public."Purchase"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: RepackOutput RepackOutput_repackId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."RepackOutput"
    ADD CONSTRAINT "RepackOutput_repackId_fkey" FOREIGN KEY ("repackId") REFERENCES public."Repack"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SaleLine SaleLine_saleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SaleLine"
    ADD CONSTRAINT "SaleLine_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES public."Sale"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Session Session_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TransferLine TransferLine_transferId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TransferLine"
    ADD CONSTRAINT "TransferLine_transferId_fkey" FOREIGN KEY ("transferId") REFERENCES public."Transfer"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: -
--



--
-- PostgreSQL database dump complete
--


