import Link from 'next/link';

import { BlueprintSchema, type Blueprint } from '@/lib/builder/blueprint-schema';
import { brandTokenCss } from '@/lib/storefront/brand-tokens';
import { resolveTheme } from '@/lib/storefront/themes';
import { AnnouncementBar } from '@/components/storefront/announcement-bar';
import { CartIndicator } from '@/components/storefront/cart-indicator';
import { CategoryTiles } from '@/components/storefront/category-tiles';
import { EditorialBlock } from '@/components/storefront/editorial-block';
import { NewsletterCapture } from '@/components/storefront/newsletter-capture';
import { StorefrontHero } from '@/components/storefront/hero-variants';

type DbBrand = {
  id: string;
  name: string;
  slug: string;
  domain: string | null;
  identity: unknown;
  publishedAt: Date | null;
  createdAt: Date;
  theme?: string | null;
};

type DbVariant = {
  id: string;
  size: string | null;
  color: string | null;
  colorHex: string | null;
  priceOverride: number | null;
  salePrice: number | null;
  stock: number;
};

type DbProduct = {
  id: string;
  name: string;
  category: string;
  categories: string[];
  price: number;
  salePrice: number | null;
  wasPrice: number;
  tone: string | null;
  position: number;
  variants?: DbVariant[];
};

// Server component. Renders the storefront from DB rows + the brand's
// chosen theme. The whole subtree is wrapped in `[data-brand=...]` and
// `[data-theme=...]` so per-brand colours and per-theme styles stay
// scoped — the admin shell never picks them up.
export function SavedStorefront({
  brand,
  products,
}: {
  brand: DbBrand;
  products: DbProduct[];
}) {
  const parsedIdentity = BlueprintSchema.safeParse(brand.identity);
  const identity: Partial<Blueprint> = parsedIdentity.success
    ? parsedIdentity.data
    : (brand.identity as Partial<Blueprint> | null) ?? {};

  const colors = identity.colors ?? {
    primary: '#0a0a0a',
    secondary: '#6366F1',
    accent: '#fafafa',
  };
  const theme = resolveTheme(brand.theme ?? null);

  const productCats = Array.from(
    new Set(
      products.flatMap(p =>
        p.categories?.length ? p.categories : p.category ? [p.category] : [],
      ),
    ),
  );
  const navCategories =
    productCats.length > 0 ? productCats : (identity.categories ?? []);

  const heroHeadline = identity.hero_headline ?? brand.name;
  const heroSubhead = identity.hero_subhead ?? '';

  const tokenCss = brandTokenCss(brand.slug, colors);

  // Render the section sequence the theme declares — order matters.
  const sectionRenderers: Record<string, () => React.ReactNode> = {
    announcement: () => (
      <AnnouncementBar message="✦ Free shipping over $75 · Free 60-day returns ✦" />
    ),
    hero: () => (
      <StorefrontHero
        layout={theme.heroLayout}
        brandSlug={brand.slug}
        brandName={brand.name}
        headline={heroHeadline}
        subhead={heroSubhead}
        showTrustBadges
        topProducts={products.slice(0, 4).map(p => ({
          id: p.id,
          name: p.name,
          tone: p.tone,
        }))}
      />
    ),
    categories: () =>
      navCategories.length >= 2 ? (
        <CategoryTiles
          slug={brand.slug}
          categories={navCategories}
          products={products.map(p => ({
            id: p.id,
            name: p.name,
            category: p.category,
            categories: p.categories ?? [],
            tone: p.tone,
          }))}
        />
      ) : null,
    featured: () => (
      <section className="store-section" id="featured">
        <h2 style={{ color: 'var(--brand-primary)' }}>Featured</h2>
        <div className="sub">
          {products.length} pieces · curated for the season
        </div>
        <div className="product-grid">
          {products.map(p => (
            <ProductCard key={p.id} brandSlug={brand.slug} product={p} />
          ))}
        </div>
      </section>
    ),
    editorial: () => (
      <EditorialBlock
        brandName={brand.name}
        tagline={identity.tagline}
      />
    ),
    newsletter: () => <NewsletterCapture brandSlug={brand.slug} />,
    footer: () => (
      <footer className="store-footer">
        <span>© 2026 {brand.name}</span>
        <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--fg-4)', fontSize: 10 }}>
          built with ⊹ Forge · {theme.name}
        </span>
        <span>Privacy · Terms · Contact</span>
      </footer>
    ),
  };

  return (
    <div data-brand={brand.slug} data-theme={theme.id}>
      <style dangerouslySetInnerHTML={{ __html: tokenCss }} />
      <div className="store" style={{ background: 'var(--surface)' }}>
        <nav className="store-nav">
          <Link
            href={`/s/${brand.slug}`}
            className="store-logo"
            style={{ color: 'var(--brand-primary)', textDecoration: 'none' }}
          >
            {brand.name}
          </Link>
          <div className="store-nav-items">
            {navCategories.slice(0, 5).map(cat => (
              <Link
                key={cat}
                href={`/s/${brand.slug}#cat-${slugify(cat)}`}
                style={{ color: 'inherit', textDecoration: 'none', textTransform: 'capitalize' }}
              >
                {cat}
              </Link>
            ))}
            <span style={{ color: 'var(--fg-3)' }}>Journal</span>
          </div>
          <div className="store-nav-actions">
            <span>Search</span>
            <span>Account</span>
            <CartIndicator slug={brand.slug} />
          </div>
        </nav>

        {theme.homepageSections.map((id, idx) => {
          const renderer = sectionRenderers[id];
          if (!renderer) return null;
          return <div key={`${id}-${idx}`}>{renderer()}</div>;
        })}
      </div>
    </div>
  );
}

function ProductCard({
  brandSlug,
  product,
}: {
  brandSlug: string;
  product: DbProduct;
}) {
  const variants = product.variants ?? [];
  const sizes = Array.from(
    new Set(variants.map(v => v.size).filter((s): s is string => !!s)),
  );
  const swatches = uniqueSwatches(variants);
  const onSale = product.salePrice != null;
  const discountPct =
    onSale && product.price > 0
      ? Math.round(((product.price - (product.salePrice ?? 0)) / product.price) * 100)
      : null;

  return (
    <Link
      href={`/s/${brandSlug}/p/${product.id}`}
      className="product-card"
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      {onSale && discountPct != null && discountPct > 0 && (
        <span className="badge-sale">−{discountPct}%</span>
      )}
      <div
        className="product-img"
        data-label={`${product.category.toLowerCase()} · ${product.id.slice(0, 6)}`}
        style={{
          background: product.tone
            ? `repeating-linear-gradient(135deg, ${product.tone}22, ${product.tone}22 8px, ${product.tone}11 8px, ${product.tone}11 16px), linear-gradient(135deg, ${product.tone}66, ${product.tone}cc)`
            : 'var(--surface-2)',
        }}
      />
      <div className="product-name" style={{ color: 'var(--brand-primary)' }}>
        {product.name}
      </div>
      <div className="product-price">
        {onSale ? (
          <>
            <span style={{ color: 'var(--brand-secondary)', fontWeight: 600 }}>
              ${((product.salePrice ?? 0) / 100).toFixed(2)}
            </span>{' '}
            <span className="compare">${(product.price / 100).toFixed(2)}</span>
          </>
        ) : (
          <>
            ${(product.price / 100).toFixed(2)}
            {product.wasPrice > product.price && (
              <>
                {' '}
                <span className="compare">
                  ${(product.wasPrice / 100).toFixed(2)}
                </span>
              </>
            )}
          </>
        )}
      </div>
      {(sizes.length > 0 || swatches.length > 0) && (
        <div
          style={{
            display: 'flex',
            gap: 10,
            alignItems: 'center',
            marginTop: 6,
            fontSize: 11,
            color: 'var(--fg-3)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          {swatches.length > 0 && (
            <div style={{ display: 'flex', gap: 4 }}>
              {swatches.slice(0, 5).map(sw => (
                <span
                  key={sw.key}
                  title={sw.label}
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 999,
                    background: sw.hex ?? 'var(--surface-2)',
                    border: '1px solid var(--border)',
                    display: 'inline-block',
                  }}
                />
              ))}
            </div>
          )}
          {sizes.length > 0 && <span>{sizes.slice(0, 6).join(' · ')}</span>}
        </div>
      )}
    </Link>
  );
}

function uniqueSwatches(
  variants: DbVariant[],
): { key: string; label: string; hex: string | null }[] {
  const seen = new Map<string, { key: string; label: string; hex: string | null }>();
  for (const v of variants) {
    if (!v.color && !v.colorHex) continue;
    const key = (v.color ?? v.colorHex ?? '').toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.set(key, {
      key,
      label: v.color ?? v.colorHex ?? 'color',
      hex: v.colorHex,
    });
  }
  return Array.from(seen.values());
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}
