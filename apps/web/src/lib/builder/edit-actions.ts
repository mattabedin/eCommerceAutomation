'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { and, eq, inArray, max } from 'drizzle-orm';
import { z } from 'zod';

import { auth } from '@/lib/auth';
import { brands, db, products, workspaceMembers } from '@forge/db';

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

const productUpdateSchema = z.object({
  productId: z.string().min(1),
  name: z.string().min(1).max(160),
  category: z.string().min(1).max(80),
  // Prices arrive in dollars (decimal); we round to cents on the server.
  price: z.number().nonnegative().max(1_000_000),
  was: z.number().nonnegative().max(1_000_000),
  description: z.string().max(2000).optional().nullable(),
  tone: hex.optional().nullable(),
});

const productAddSchema = z.object({
  brandId: z.string().min(1),
  name: z.string().min(1).max(160),
  category: z.string().min(1).max(80),
  price: z.number().nonnegative().max(1_000_000),
  was: z.number().nonnegative().max(1_000_000),
  description: z.string().max(2000).optional().nullable(),
  tone: hex.optional().nullable(),
});

// ---------- actions ---------------------------------------------------------

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

  await db
    .update(products)
    .set({
      name: parsed.data.name,
      category: parsed.data.category,
      price: Math.round(parsed.data.price * 100),
      wasPrice: Math.round(parsed.data.was * 100),
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

  await db.insert(products).values({
    brandId: brand.id,
    name: parsed.data.name,
    category: parsed.data.category,
    price: Math.round(parsed.data.price * 100),
    wasPrice: Math.round(parsed.data.was * 100),
    description: parsed.data.description ?? null,
    tone: parsed.data.tone ?? null,
    position: nextPos,
  });

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
