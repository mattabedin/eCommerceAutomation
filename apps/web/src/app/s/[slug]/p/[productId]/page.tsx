import Link from 'next/link';
import { and, asc, desc, eq, isNotNull, ne } from 'drizzle-orm';
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
import { brandTokenCss } from '@/lib/storefront/brand-tokens';
import { AnnouncementBar } from '@/components/storefront/announcement-bar';
import { CartIndicator } from '@/components/storefront/cart-indicator';
import { ProductDetail } from '@/components/storefront/product-detail';
import { RelatedProducts } from '@/components/storefront/related-products';

export const dynamic = 'force-dynamic';

type Props = {
  params: { slug: string; productId: string };
};

export async function generateMetadata({ params }: Props) {
  const data = await load(params.slug, params.productId);
  if (!data) return { title: 'Product not found — Forge' };
  return {
    title: `${data.product.name} — ${data.brand.name}`,
    description:
      data.product.description ?? `${data.product.name} from ${data.brand.name}.`,
  };
}

export default async function PdpPage({ params }: Props) {
  const data = await load(params.slug, params.productId);
  if (!data) notFound();

  const { brand, product, variants, related } = data;

  const parsedIdentity = BlueprintSchema.safeParse(brand.identity);
  const identity: Partial<Blueprint> = parsedIdentity.success
    ? parsedIdentity.data
    : (brand.identity as Partial<Blueprint> | null) ?? {};
  const colors = identity.colors ?? {
    primary: '#0a0a0a',
    secondary: '#6366F1',
    accent: '#fafafa',
  };
  const tokenCss = brandTokenCss(brand.slug, colors);

  return (
    <main data-brand={brand.slug} style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <style dangerouslySetInnerHTML={{ __html: tokenCss }} />
      <div className="store" style={{ background: 'var(--surface)' }}>
        <AnnouncementBar message="✦ Free shipping over $75 · Free 60-day returns ✦" />
        <nav className="store-nav">
          <Link
            href={`/s/${brand.slug}`}
            className="store-logo"
            style={{ color: 'var(--brand-primary)', textDecoration: 'none' }}
          >
            {brand.name}
          </Link>
          <div className="store-nav-items">
            <Link href={`/s/${brand.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
              All
            </Link>
          </div>
          <div className="store-nav-actions">
            <CartIndicator slug={brand.slug} />
          </div>
        </nav>

        <div
          style={{
            padding: '12px 40px 0',
            fontSize: 11.5,
            fontFamily: 'var(--font-mono)',
            letterSpacing: '0.06em',
            color: 'var(--fg-4)',
          }}
        >
          <Link href={`/s/${brand.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
            Home
          </Link>{' '}
          / <span style={{ textTransform: 'capitalize' }}>{product.category}</span> /{' '}
          <span style={{ color: 'var(--fg-2)' }}>{product.name}</span>
        </div>

        <ProductDetail
          slug={brand.slug}
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

        {related.length > 0 && (
          <RelatedProducts
            slug={brand.slug}
            products={related.map(r => ({
              id: r.id,
              name: r.name,
              category: r.category,
              price: r.price,
              salePrice: r.salePrice,
              wasPrice: r.wasPrice,
              tone: r.tone,
            }))}
          />
        )}

        <footer className="store-footer">
          <span>© 2026 {brand.name}</span>
          <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--fg-4)', fontSize: 10 }}>
            built with ⊹ Forge
          </span>
          <span>Privacy · Terms · Contact</span>
        </footer>
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

  const [variants, related] = await Promise.all([
    db.query.productVariants.findMany({
      where: eq(productVariants.productId, product.id),
      orderBy: [asc(productVariants.position)],
    }),
    db.query.products.findMany({
      where: and(
        eq(productsTable.brandId, brand.id),
        ne(productsTable.id, product.id),
      ),
      orderBy: [desc(productsTable.createdAt)],
      limit: 4,
    }),
  ]);

  return { brand, product, variants, related };
}
