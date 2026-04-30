'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { and, eq, inArray, max } from 'drizzle-orm';
import { z } from 'zod';

import { auth } from '@/lib/auth';
import {
  brands,
  db,
  products,
  productVariants,
  workspaceMembers,
} from '@forge/db';

export type ActionResult = { ok: true } | { ok: false; error: string };

// ---------- helpers ---------------------------------------------------------

async function userWorkspaceIds(userId: string): Promise<string[]> {
  const rows = await db.query.workspaceMembers.findMany({
    where: eq(workspaceMembers.userId, userId),
  });
  return rows.map(r => r.workspaceId);
}

// Ensure the brand belongs to one of the signed-in user's workspaces.
async function loadOwnedBrand(userId: string, brandId: string) {
  const wsIds = await userWorkspaceIds(userId);
  if (wsIds.length === 0) return null;
  return db.query.brands.findFirst({
    where: and(eq(brands.id, brandId), inArray(brands.workspaceId, wsIds)),
  });
}

async function loadOwnedProduct(userId: string, productId: string) {
  const wsIds = await userWorkspaceIds(userId);
  if (wsIds.length === 0) return null;
  const row = await db.query.products.findFirst({
    where: eq(products.id, productId),
  });
  if (!row) return null;
  const brand = await db.query.brands.findFirst({
    where: and(eq(brands.id, row.brandId), inArray(brands.workspaceId, wsIds)),
  });
  return brand ? row : null;
}

async function loadOwnedVariant(userId: string, variantId: string) {
  const variant = await db.query.productVariants.findFirst({
    where: eq(productVariants.id, variantId),
  });
  if (!variant) return null;
  const product = await loadOwnedProduct(userId, variant.productId);
  return product ? variant : null;
}

// ---------- schemas ---------------------------------------------------------

const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Hex like #112233');

const brandUpdateSchema = z.object({
  brandId: z.string().min(1),
  name: z.string().min(1).max(120),
  tagline: z.string().min(1).max(200),
  domain: z
    .string()
    .min(3)
    .regex(/^[a-z0-9-]+\.forge\.shop$/, 'Lowercase letters, digits, hyphens, .forge.shop'),
  hero_headline: z.string().min(1).max(200),
  hero_subhead: z.string().min(1).max(400),
  primary: hex,
  secondary: hex,
  accent: hex,
});

// Multi-category tags. Free-text, lowercase enforced for consistency in UI
// filters. Up to 8 per product to keep the catalogue navigation tidy.
const categoriesSchema = z
  .array(z.string().trim().min(1).max(40))
  .max(8)
  .default([]);

const productUpdateSchema = z.object({
  productId: z.string().min(1),
  name: z.string().min(1).max(160),
  // Primary category is kept as a single string for back-compat; categories[]
  // is the source of truth for new code.
  category: z.string().min(1).max(80),
  categories: categoriesSchema,
  // Prices arrive in dollars (decimal); we round to cents on the server.
  price: z.number().nonnegative().max(1_000_000),
  // Optional discount. null = no active sale.
  salePrice: z.number().nonnegative().max(1_000_000).nullable().optional(),
  was: z.number().nonnegative().max(1_000_000),
  description: z.string().max(2000).optional().nullable(),
  tone: hex.optional().nullable(),
});

const productAddSchema = z.object({
  brandId: z.string().min(1),
  name: z.string().min(1).max(160),
  category: z.string().min(1).max(80),
  categories: categoriesSchema,
  price: z.number().nonnegative().max(1_000_000),
  salePrice: z.number().nonnegative().max(1_000_000).nullable().optional(),
  was: z.number().nonnegative().max(1_000_000),
  description: z.string().max(2000).optional().nullable(),
  tone: hex.optional().nullable(),
});

// Variant payloads. size and color are independently optional so a product
// can vary on only one axis (e.g. size only). At least one must be present.
const variantBaseSchema = z
  .object({
    size: z.string().trim().max(40).optional().nullable(),
    color: z.string().trim().max(40).optional().nullable(),
    colorHex: hex.optional().nullable(),
    priceOverride: z.number().nonnegative().max(1_000_000).nullable().optional(),
    salePrice: z.number().nonnegative().max(1_000_000).nullable().optional(),
    stock: z.number().int().min(0).max(1_000_000).default(0),
    sku: z.string().trim().max(80).optional().nullable(),
  })
  .refine(v => (v.size && v.size.length) || (v.color && v.color.length), {
    message: 'Variant needs a size or a color (or both).',
    path: ['size'],
  });

const variantAddSchema = z
  .object({ productId: z.string().min(1) })
  .and(variantBaseSchema);

const variantUpdateSchema = z
  .object({ variantId: z.string().min(1) })
  .and(variantBaseSchema);

const themeUpdateSchema = z.object({
  brandId: z.string().min(1),
  theme: z.string().min(1).max(40),
});

// ---------- actions ---------------------------------------------------------

export async function updateBrandTheme(
  input: z.infer<typeof themeUpdateSchema>,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: 'Not signed in.' };

  const parsed = themeUpdateSchema.safeParse(input);
  if (!parsed.success) {
    const i = parsed.error.issues[0];
    return { ok: false, error: `${i.path.join('.')}: ${i.message}` };
  }

  // Whitelist against the registry so we can't store an arbitrary value.
  const { isThemeId } = await import('@/lib/storefront/themes');
  if (!isThemeId(parsed.data.theme)) {
    return { ok: false, error: 'Unknown theme.' };
  }

  const brand = await loadOwnedBrand(session.user.id, parsed.data.brandId);
  if (!brand) return { ok: false, error: 'Brand not found.' };

  await db
    .update(brands)
    .set({ theme: parsed.data.theme })
    .where(eq(brands.id, brand.id));

  revalidatePath('/app/preview');
  revalidatePath('/app/dashboard');
  return { ok: true };
}

export async function updateBrand(
  input: z.infer<typeof brandUpdateSchema>,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: 'Not signed in.' };

  const parsed = brandUpdateSchema.safeParse(input);
  if (!parsed.success) {
    const i = parsed.error.issues[0];
    return { ok: false, error: `${i.path.join('.')}: ${i.message}` };
  }

  const brand = await loadOwnedBrand(session.user.id, parsed.data.brandId);
  if (!brand) return { ok: false, error: 'Brand not found.' };

  const slug = parsed.data.domain.replace(/\.forge\.shop$/, '');

  // Identity blob is the source of truth for hero copy + palette. Merge
  // edits onto whatever was generated so other fields (categories, products
  // catalogue, etc) stay intact.
  const existingIdentity = (brand.identity as Record<string, unknown> | null) ?? {};
  const nextIdentity = {
    ...existingIdentity,
    brand_name: parsed.data.name,
    tagline: parsed.data.tagline,
    domain: parsed.data.domain,
    hero_headline: parsed.data.hero_headline,
    hero_subhead: parsed.data.hero_subhead,
    colors: {
      primary: parsed.data.primary,
      secondary: parsed.data.secondary,
      accent: parsed.data.accent,
    },
  };

  await db
    .update(brands)
    .set({
      name: parsed.data.name,
      domain: parsed.data.domain,
      slug,
      identity: nextIdentity,
    })
    .where(eq(brands.id, brand.id));

  revalidatePath(`/app/preview`);
  revalidatePath(`/app/dashboard`);
  return { ok: true };
}

// Normalise tags: trim, lowercase, dedupe (case-insensitive), drop empties.
function normaliseCategories(raw: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const t of raw) {
    const v = t.trim().toLowerCase();
    if (!v) continue;
    if (seen.has(v)) continue;
    seen.add(v);
    out.push(v);
  }
  return out;
}

function dollarsToCents(d: number): number {
  return Math.round(d * 100);
}

export async function updateProduct(
  input: z.infer<typeof productUpdateSchema>,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: 'Not signed in.' };

  const parsed = productUpdateSchema.safeParse(input);
  if (!parsed.success) {
    const i = parsed.error.issues[0];
    return { ok: false, error: `${i.path.join('.')}: ${i.message}` };
  }

  const product = await loadOwnedProduct(session.user.id, parsed.data.productId);
  if (!product) return { ok: false, error: 'Product not found.' };

  const cats = normaliseCategories(
    parsed.data.categories.length > 0 ? parsed.data.categories : [parsed.data.category],
  );
  // Mirror the first tag into the legacy single-category field so the storefront
  // and any old reader keeps working.
  const primary = cats[0] ?? parsed.data.category;

  await db
    .update(products)
    .set({
      name: parsed.data.name,
      category: primary,
      categories: cats,
      price: dollarsToCents(parsed.data.price),
      salePrice:
        parsed.data.salePrice == null || parsed.data.salePrice === 0
          ? null
          : dollarsToCents(parsed.data.salePrice),
      wasPrice: dollarsToCents(parsed.data.was),
      description: parsed.data.description ?? null,
      tone: parsed.data.tone ?? null,
    })
    .where(eq(products.id, product.id));

  revalidatePath(`/app/products`);
  revalidatePath(`/app/preview`);
  return { ok: true };
}

export async function addProduct(
  input: z.infer<typeof productAddSchema>,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: 'Not signed in.' };

  const parsed = productAddSchema.safeParse(input);
  if (!parsed.success) {
    const i = parsed.error.issues[0];
    return { ok: false, error: `${i.path.join('.')}: ${i.message}` };
  }

  const brand = await loadOwnedBrand(session.user.id, parsed.data.brandId);
  if (!brand) return { ok: false, error: 'Brand not found.' };

  const [last] = await db
    .select({ max: max(products.position) })
    .from(products)
    .where(eq(products.brandId, brand.id));
  const nextPos = (last?.max ?? -1) + 1;

  const cats = normaliseCategories(
    parsed.data.categories.length > 0 ? parsed.data.categories : [parsed.data.category],
  );
  const primary = cats[0] ?? parsed.data.category;

  await db.insert(products).values({
    brandId: brand.id,
    name: parsed.data.name,
    category: primary,
    categories: cats,
    price: dollarsToCents(parsed.data.price),
    salePrice:
      parsed.data.salePrice == null || parsed.data.salePrice === 0
        ? null
        : dollarsToCents(parsed.data.salePrice),
    wasPrice: dollarsToCents(parsed.data.was),
    description: parsed.data.description ?? null,
    tone: parsed.data.tone ?? null,
    position: nextPos,
  });

  revalidatePath(`/app/products`);
  revalidatePath(`/app/preview`);
  return { ok: true };
}

// ---------- variants -------------------------------------------------------

export async function addVariant(
  input: z.infer<typeof variantAddSchema>,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: 'Not signed in.' };

  const parsed = variantAddSchema.safeParse(input);
  if (!parsed.success) {
    const i = parsed.error.issues[0];
    return { ok: false, error: `${i.path.join('.')}: ${i.message}` };
  }

  const product = await loadOwnedProduct(session.user.id, parsed.data.productId);
  if (!product) return { ok: false, error: 'Product not found.' };

  const [last] = await db
    .select({ max: max(productVariants.position) })
    .from(productVariants)
    .where(eq(productVariants.productId, product.id));
  const nextPos = (last?.max ?? -1) + 1;

  await db.insert(productVariants).values({
    productId: product.id,
    size: parsed.data.size?.trim() || null,
    color: parsed.data.color?.trim() || null,
    colorHex: parsed.data.colorHex ?? null,
    priceOverride:
      parsed.data.priceOverride == null
        ? null
        : dollarsToCents(parsed.data.priceOverride),
    salePrice:
      parsed.data.salePrice == null || parsed.data.salePrice === 0
        ? null
        : dollarsToCents(parsed.data.salePrice),
    stock: parsed.data.stock,
    sku: parsed.data.sku?.trim() || null,
    position: nextPos,
  });

  revalidatePath(`/app/products`);
  revalidatePath(`/app/preview`);
  return { ok: true };
}

export async function updateVariant(
  input: z.infer<typeof variantUpdateSchema>,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: 'Not signed in.' };

  const parsed = variantUpdateSchema.safeParse(input);
  if (!parsed.success) {
    const i = parsed.error.issues[0];
    return { ok: false, error: `${i.path.join('.')}: ${i.message}` };
  }

  const variant = await loadOwnedVariant(session.user.id, parsed.data.variantId);
  if (!variant) return { ok: false, error: 'Variant not found.' };

  await db
    .update(productVariants)
    .set({
      size: parsed.data.size?.trim() || null,
      color: parsed.data.color?.trim() || null,
      colorHex: parsed.data.colorHex ?? null,
      priceOverride:
        parsed.data.priceOverride == null
          ? null
          : dollarsToCents(parsed.data.priceOverride),
      salePrice:
        parsed.data.salePrice == null || parsed.data.salePrice === 0
          ? null
          : dollarsToCents(parsed.data.salePrice),
      stock: parsed.data.stock,
      sku: parsed.data.sku?.trim() || null,
    })
    .where(eq(productVariants.id, variant.id));

  revalidatePath(`/app/products`);
  revalidatePath(`/app/preview`);
  return { ok: true };
}

export async function deleteVariant(variantId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: 'Not signed in.' };

  const variant = await loadOwnedVariant(session.user.id, variantId);
  if (!variant) return { ok: false, error: 'Variant not found.' };

  await db.delete(productVariants).where(eq(productVariants.id, variant.id));

  revalidatePath(`/app/products`);
  revalidatePath(`/app/preview`);
  return { ok: true };
}

export async function deleteProduct(productId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: 'Not signed in.' };

  const product = await loadOwnedProduct(session.user.id, productId);
  if (!product) return { ok: false, error: 'Product not found.' };

  await db.delete(products).where(eq(products.id, product.id));

  revalidatePath(`/app/products`);
  revalidatePath(`/app/preview`);
  return { ok: true };
}

export async function deleteBrand(brandId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: 'Not signed in.' };

  const brand = await loadOwnedBrand(session.user.id, brandId);
  if (!brand) return { ok: false, error: 'Brand not found.' };

  // Products cascade-delete via the FK. Conversation.brandId is set null
  // automatically (FK SET NULL) so any related chat survives.
  await db.delete(brands).where(eq(brands.id, brand.id));

  // Redirect away from any preview/products page that referenced this brand.
  redirect('/app/dashboard');
}
