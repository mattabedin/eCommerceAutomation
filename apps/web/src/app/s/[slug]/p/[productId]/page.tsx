import Link from 'next/link';
import { and, asc, eq, isNotNull } from 'drizzle-orm';
import { notFound } from 'next/navigation';

import {
  brands,
  db,
  productVariants,
  products as productsTable,
} from '@forge/db';
import {
  BlueprintSchema,
  type Blueprint,
} from '@/lib/builder/blueprint-schema';
import { ProductDetail } from '@/components/storefront/product-detail';
import { CartIndicator } from '@/components/storefront/cart-indicator';

export const dynamic = 'force-dynamic';

type Props = {
  params: { slug: string; productId: string };
};

export async function generateMetadata({ params }: Props) {
  const data = await load(params.slug, params.productId);
  if (!data) return { title: 'Product not found — Forge' };
  return {
    title: `${data.product.name} — ${data.brand.name}`,
    description: data.product.description ?? `${data.product.name} from ${data.brand.name}.`,
  };
}

export default async function PdpPage({ params }: Props) {
  const data = await load(params.slug, params.productId);
  if (!data) notFound();

  const { brand, product, variants } = data;

  const parsedIdentity = BlueprintSchema.safeParse(brand.identity);
  const identity: Partial<Blueprint> = parsedIdentity.success
    ? parsedIdentity.data
    : (brand.identity as Partial<Blueprint> | null) ?? {};
  const colors = identity.colors ?? {
    primary: '#0a0a0a',
    secondary: '#6366F1',
    accent: '#fafafa',
  };

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <div className="store" style={{ background: 'var(--surface)' }}>
        <nav className="store-nav">
          <Link
            href={`/s/${brand.slug}`}
            className="store-logo"
            style={{ color: colors.primary, textDecoration: 'none' }}
          >
            {brand.name}
          </Link>
          <div className="store-nav-items">
            <Link href={`/s/${brand.slug}`} style={{ color: 'inherit' }}>
              All
            </Link>
          </div>
          <div className="store-nav-actions">
            <CartIndicator slug={brand.slug} />
          </div>
        </nav>

        <ProductDetail
          slug={brand.slug}
          colors={colors}
          product={{
            id: product.id,
            name: product.name,
            category: product.category,
            categories: product.categories ?? [],
            price: product.price,
            salePrice: product.salePrice,
            wasPrice: product.wasPrice,
            description: product.description,
            tone: product.tone,
          }}
          variants={variants.map(v => ({
            id: v.id,
            size: v.size,
            color: v.color,
            colorHex: v.colorHex,
            priceOverride: v.priceOverride,
            salePrice: v.salePrice,
            stock: v.stock,
            sku: v.sku,
          }))}
        />
      </div>
    </main>
  );
}

async function load(slug: string, productId: string) {
  const brand = await db.query.brands.findFirst({
    where: and(eq(brands.slug, slug), isNotNull(brands.publishedAt)),
  });
  if (!brand) return null;

  const product = await db.query.products.findFirst({
    where: and(
      eq(productsTable.id, productId),
      eq(productsTable.brandId, brand.id),
    ),
  });
  if (!product) return null;

  const variants = await db.query.productVariants.findMany({
    where: eq(productVariants.productId, product.id),
    orderBy: [asc(productVariants.position)],
  });

  return { brand, product, variants };
}
