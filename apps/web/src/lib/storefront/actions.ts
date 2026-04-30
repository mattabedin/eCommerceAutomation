'use server';

import { and, eq, inArray, isNotNull } from 'drizzle-orm';
import { z } from 'zod';

import {
  brands,
  db,
  productVariants,
  products,
} from '@forge/db';
import { createCheckoutSession } from '@forge/stripe';

const cartItemSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().min(1).nullable(),
  quantity: z.number().int().min(1).max(99),
});

export type EnrichedItem = {
  productId: string;
  variantId: string | null;
  name: string;
  variantLabel: string | null;
  unitPrice: number; // cents — what the customer pays per unit (sale price wins)
  unitRegular: number; // cents — what we strike through (only when on sale)
  quantity: number;
  stock: number | null;
  tone: string | null;
  available: boolean;
};

export type EnrichedCart = {
  ok: true;
  brandId: string;
  brandSlug: string;
  brandName: string;
  currency: string;
  items: EnrichedItem[];
  subtotal: number; // cents
};

// Re-reads each cart item from the DB so prices, names, and stock are
// authoritative. Callers can rely on this for both display and totals; the
// Stripe Checkout session is built from the same enriched data.
export async function enrichCart(input: {
  slug: string;
  items: { productId: string; variantId: string | null; quantity: number }[];
}): Promise<EnrichedCart | { ok: false; error: string }> {
  const slug = input.slug.trim();
  if (!slug) return { ok: false, error: 'Missing brand slug.' };

  const parsed = z.array(cartItemSchema).safeParse(input.items);
  if (!parsed.success) return { ok: false, error: 'Invalid cart payload.' };

  const brand = await db.query.brands.findFirst({
    where: and(eq(brands.slug, slug), isNotNull(brands.publishedAt)),
  });
  if (!brand) return { ok: false, error: 'Store not found.' };

  if (parsed.data.length === 0) {
    return {
      ok: true,
      brandId: brand.id,
      brandSlug: brand.slug,
      brandName: brand.name,
      currency: 'usd',
      items: [],
      subtotal: 0,
    };
  }

  const productIds = Array.from(new Set(parsed.data.map(i => i.productId)));
  const productRows = await db.query.products.findMany({
    where: and(
      inArray(products.id, productIds),
      eq(products.brandId, brand.id),
    ),
  });
  const productById = new Map(productRows.map(p => [p.id, p]));

  const variantIds = parsed.data
    .map(i => i.variantId)
    .filter((id): id is string => !!id);
  const variantRows = variantIds.length
    ? await db.query.productVariants.findMany({
        where: inArray(productVariants.id, variantIds),
      })
    : [];
  const variantById = new Map(variantRows.map(v => [v.id, v]));

  const items: EnrichedItem[] = [];
  for (const i of parsed.data) {
    const p = productById.get(i.productId);
    if (!p) continue; // silently drop stale rows
    const v = i.variantId ? variantById.get(i.variantId) ?? null : null;

    const regular = v?.priceOverride ?? p.price;
    const sale = v?.salePrice ?? p.salePrice ?? null;
    const unitPrice = sale ?? regular;
    const stock = v ? v.stock : null;

    const variantLabel = v
      ? [v.size, v.color].filter(Boolean).join(' / ') || null
      : null;

    items.push({
      productId: p.id,
      variantId: v?.id ?? null,
      name: p.name,
      variantLabel,
      unitPrice,
      unitRegular: regular,
      quantity: i.quantity,
      stock,
      tone: p.tone,
      available: stock == null ? true : stock >= i.quantity,
    });
  }

  const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);

  return {
    ok: true,
    brandId: brand.id,
    brandSlug: brand.slug,
    brandName: brand.name,
    currency: 'usd',
    items,
    subtotal,
  };
}

// Builds a Stripe Checkout Session and returns the URL the client should
// redirect to. Prices are recomputed server-side from the DB so the client
// can't tamper. Empty / unavailable carts are rejected.
export async function createCheckout(input: {
  slug: string;
  items: { productId: string; variantId: string | null; quantity: number }[];
}): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  const enriched = await enrichCart(input);
  if (!enriched.ok) return enriched;
  if (enriched.items.length === 0) {
    return { ok: false, error: 'Your cart is empty.' };
  }
  const unavailable = enriched.items.filter(i => !i.available);
  if (unavailable.length > 0) {
    return {
      ok: false,
      error: `Out of stock: ${unavailable.map(i => i.name).join(', ')}`,
    };
  }

  // Stripe needs absolute URLs; derive from request env. We rely on
  // NEXT_PUBLIC_APP_URL or VERCEL_URL.
  const origin =
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null);
  if (!origin) {
    return {
      ok: false,
      error:
        'NEXT_PUBLIC_APP_URL is not set. Add the deployed origin so Stripe can redirect back.',
    };
  }

  try {
    const session = await createCheckoutSession({
      brandId: enriched.brandId,
      brandName: enriched.brandName,
      successUrl: `${origin}/s/${enriched.brandSlug}/cart/success?sid={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${origin}/s/${enriched.brandSlug}/cart`,
      currency: enriched.currency,
      lineItems: enriched.items.map(i => ({
        name: i.name,
        description: i.variantLabel ?? undefined,
        unitAmount: i.unitPrice,
        quantity: i.quantity,
        metadata: {
          productId: i.productId,
          variantId: i.variantId ?? '',
        },
      })),
    });
    return { ok: true, url: session.url };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Checkout failed.';
    return { ok: false, error: msg };
  }
}
