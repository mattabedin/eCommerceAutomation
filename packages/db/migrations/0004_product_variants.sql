-- Phase 4C — variants, sale price, multi-category tags.
-- Idempotent: safe to re-run on a partially-migrated DB.

ALTER TABLE "product"
  ADD COLUMN IF NOT EXISTS "categories" text[] NOT NULL DEFAULT '{}'::text[];
--> statement-breakpoint
ALTER TABLE "product"
  ADD COLUMN IF NOT EXISTS "salePrice" integer;
--> statement-breakpoint
-- Backfill categories[] from the existing single category column on rows
-- that haven't been edited yet.
UPDATE "product"
SET "categories" = ARRAY["category"]
WHERE COALESCE(array_length("categories", 1), 0) = 0
  AND "category" IS NOT NULL
  AND "category" <> '';
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "product_variant" (
	"id" text PRIMARY KEY NOT NULL,
	"productId" text NOT NULL,
	"size" text,
	"color" text,
	"colorHex" text,
	"priceOverride" integer,
	"salePrice" integer,
	"stock" integer DEFAULT 0 NOT NULL,
	"sku" text,
	"position" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product_variant" ADD CONSTRAINT "product_variant_productId_product_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
