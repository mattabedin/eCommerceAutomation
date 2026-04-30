import Link from 'next/link';
import { and, eq, isNotNull } from 'drizzle-orm';
import { notFound } from 'next/navigation';

import { brands, db } from '@forge/db';
import {
  BlueprintSchema,
  type Blueprint,
} from '@/lib/builder/blueprint-schema';
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
              Continue shopping
            </Link>
          </div>
          <div className="store-nav-actions">
            <CartIndicator slug={brand.slug} />
          </div>
        </nav>

        <CartView slug={brand.slug} colors={colors} />
      </div>
    </main>
  );
}

async function loadBrand(slug: string) {
  return db.query.brands.findFirst({
    where: and(eq(brands.slug, slug), isNotNull(brands.publishedAt)),
  });
}
