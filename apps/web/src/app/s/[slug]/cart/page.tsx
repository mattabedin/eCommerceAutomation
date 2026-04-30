import Link from 'next/link';
import { and, asc, eq, isNotNull } from 'drizzle-orm';
import { notFound } from 'next/navigation';

import { brands, db, products as productsTable } from '@forge/db';
import {
  BlueprintSchema,
  type Blueprint,
} from '@/lib/builder/blueprint-schema';
import { brandTokenCss } from '@/lib/storefront/brand-tokens';
import { resolveTheme } from '@/lib/storefront/themes';
import { AnnouncementBar } from '@/components/storefront/announcement-bar';
import { CartView } from '@/components/storefront/cart-view';
import { CartIndicator } from '@/components/storefront/cart-indicator';

export const dynamic = 'force-dynamic';

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props) {
  const brand = await loadBrand(params.slug);
  if (!brand) return { title: 'Cart — Forge' };
  return { title: `Bag — ${brand.name}` };
}

export default async function CartPage({ params }: Props) {
  const brand = await loadBrand(params.slug);
  if (!brand) notFound();

  const parsed = BlueprintSchema.safeParse(brand.identity);
  const identity: Partial<Blueprint> = parsed.success
    ? parsed.data
    : (brand.identity as Partial<Blueprint> | null) ?? {};
  const colors = identity.colors ?? {
    primary: '#0a0a0a',
    secondary: '#6366F1',
    accent: '#fafafa',
  };
  const tokenCss = brandTokenCss(brand.slug, colors);
  const theme = resolveTheme(brand.theme ?? null);

  // Pre-fetch a small upsell pool — the client filters out anything already
  // in the cart and renders the top 4.
  const upsellPool = await db.query.products.findMany({
    where: eq(productsTable.brandId, brand.id),
    orderBy: [asc(productsTable.position)],
    limit: 12,
  });

  return (
    <main
      data-brand={brand.slug}
      data-theme={theme.id}
      style={{ minHeight: '100vh', background: 'var(--bg)' }}
    >
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
            <Link
              href={`/s/${brand.slug}`}
              style={{ color: 'inherit', textDecoration: 'none' }}
            >
              Continue shopping
            </Link>
          </div>
          <div className="store-nav-actions">
            <CartIndicator slug={brand.slug} />
          </div>
        </nav>

        <CartView
          slug={brand.slug}
          upsellCandidates={upsellPool.map(p => ({
            id: p.id,
            name: p.name,
            price: p.price,
            salePrice: p.salePrice,
            tone: p.tone,
          }))}
        />
      </div>
    </main>
  );
}

async function loadBrand(slug: string) {
  return db.query.brands.findFirst({
    where: and(eq(brands.slug, slug), isNotNull(brands.publishedAt)),
  });
}
