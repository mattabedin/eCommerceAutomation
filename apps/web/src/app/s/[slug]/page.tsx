import { and, asc, eq, inArray, isNotNull } from 'drizzle-orm';
import { notFound } from 'next/navigation';

import {
  brands,
  db,
  productVariants,
  products as productsTable,
} from '@forge/db';
import { SavedStorefront } from '@/components/preview/saved-storefront';

export const dynamic = 'force-dynamic';

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props) {
  const brand = await loadPublishedBrand(params.slug);
  if (!brand) return { title: 'Store not found — Forge' };
  return {
    title: brand.name,
    description: `${brand.name} — built with Forge.`,
  };
}

export default async function PublicStorefrontPage({ params }: Props) {
  const brand = await loadPublishedBrand(params.slug);
  if (!brand) notFound();

  const productRows = await db.query.products.findMany({
    where: eq(productsTable.brandId, brand.id),
    orderBy: [asc(productsTable.position)],
  });

  const variantRows = productRows.length
    ? await db.query.productVariants.findMany({
        where: inArray(
          productVariants.productId,
          productRows.map(p => p.id),
        ),
        orderBy: [asc(productVariants.position)],
      })
    : [];

  const productsWithVariants = productRows.map(p => ({
    ...p,
    variants: variantRows.filter(v => v.productId === p.id),
  }));

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <SavedStorefront brand={brand} products={productsWithVariants} />
    </main>
  );
}

async function loadPublishedBrand(slug: string) {
  // Only published brands are reachable from the public URL — drafts return 404.
  return db.query.brands.findFirst({
    where: and(eq(brands.slug, slug), isNotNull(brands.publishedAt)),
  });
}
