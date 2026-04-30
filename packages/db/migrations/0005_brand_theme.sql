-- Phase 6 — storefront theme picker.
-- Adds a `theme` column on brand. Stored as text (no enum) so adding a
-- new theme is a code-only change.

ALTER TABLE "brand"
  ADD COLUMN IF NOT EXISTS "theme" text NOT NULL DEFAULT 'editorial';
