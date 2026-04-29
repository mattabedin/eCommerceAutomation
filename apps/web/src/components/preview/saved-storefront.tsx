import { BlueprintSchema, type Blueprint } from '@/lib/builder/blueprint-schema';

type DbBrand = {
  id: string;
  name: string;
  slug: string;
  domain: string | null;
  identity: unknown;
  publishedAt: Date | null;
  createdAt: Date;
};

type DbProduct = {
  id: string;
  name: string;
  category: string;
  price: number;
  wasPrice: number;
  tone: string | null;
  position: number;
};

const GENERIC_BENEFITS = [
  { i: '✦', t: 'Built to last', s: 'Pieces designed for years of daily use, not seasons.' },
  { i: '✈', t: 'Free fast shipping', s: '2–3 day delivery, carbon-offset, no minimum.' },
  { i: '↺', t: '60-day returns', s: "Live with it. If it isn't right, we'll take it back." },
  { i: '◐', t: 'Made responsibly', s: 'Materials sourced from partners we audit ourselves.' },
];

// Server component. Renders a saved store from DB rows, using the Blueprint
// identity blob for hero copy, palette, and categories.
export function SavedStorefront({
  brand,
  products,
}: {
  brand: DbBrand;
  products: DbProduct[];
}) {
  // The identity column holds the original Blueprint when 2D approved. Older
  // rows or migrations might not — fall back gracefully.
  const parsedIdentity = BlueprintSchema.safeParse(brand.identity);
  const identity: Partial<Blueprint> = parsedIdentity.success
    ? parsedIdentity.data
    : (brand.identity as Partial<Blueprint> | null) ?? {};

  const colors = identity.colors ?? {
    primary: '#0a0a0a',
    secondary: '#6366F1',
    accent: '#fafafa',
  };
  const categories = identity.categories ?? Array.from(new Set(products.map(p => p.category)));
  const heroHeadline = identity.hero_headline ?? brand.name;
  const heroSubhead = identity.hero_subhead ?? '';

  const heroParts = heroHeadline.split(' ');
  const heroLast = heroParts.slice(-1).join(' ');
  const heroLead = heroParts.slice(0, -1).join(' ');


  return (
    <div style={{ padding: 0 }}>
      <div className="store" style={{ background: 'var(--surface)' }}>
        <nav className="store-nav">
          <div className="store-logo" style={{ color: colors.primary }}>
            {brand.name}
          </div>
          <div className="store-nav-items">
            {categories.map(cat => (
              <span key={cat}>{cat}</span>
            ))}
            <span>Journal</span>
          </div>
          <div className="store-nav-actions">
            <span>Search</span>
            <span>Account</span>
            <span>Bag (0)</span>
          </div>
        </nav>

        <section className="store-hero">
          <div>
            <h1 style={{ fontSize: 56, color: colors.primary }}>
              {heroLead} <em style={{ color: colors.secondary }}>{heroLast}</em>
            </h1>
            {heroSubhead && <p>{heroSubhead}</p>}
            <button
              type="button"
              className="btn"
              style={{
                background: colors.primary,
                color: 'white',
                borderColor: colors.primary,
                padding: '10px 18px',
              }}
            >
              Shop the collection →
            </button>
          </div>
          <div
            className="hero-img"
            style={{
              background: `linear-gradient(135deg, ${colors.secondary}33, ${colors.primary}cc)`,
            }}
          />
        </section>

        <section className="store-section">
          <h2 style={{ color: colors.primary, fontSize: 32 }}>Featured</h2>
          <div className="sub">
            {products.length} pieces · curated by Forge AI
          </div>
          <div className="product-grid">
            {products.map(p => (
              <div key={p.id} className="product-card">
                <div
                  className="product-img"
                  data-label={`${p.category.toLowerCase()} · ${p.id.slice(0, 6)}`}
                  style={{
                    background: p.tone
                      ? `repeating-linear-gradient(135deg, ${p.tone}22, ${p.tone}22 8px, ${p.tone}11 8px, ${p.tone}11 16px), linear-gradient(135deg, ${p.tone}66, ${p.tone}cc)`
                      : 'var(--surface-2)',
                  }}
                />
                <div className="product-name" style={{ color: colors.primary }}>
                  {p.name}
                </div>
                <div className="product-price">
                  ${(p.price / 100).toFixed(2)}{' '}
                  <span className="compare">${(p.wasPrice / 100).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section
          className="store-section"
          style={{ background: colors.accent || 'var(--surface-2)' }}
        >
          <h2 style={{ color: colors.primary, fontSize: 32 }}>Why {brand.name}</h2>
          <div className="sub">Built for people who care.</div>
          <div className="benefits">
            {GENERIC_BENEFITS.map(b => (
              <div key={b.t} className="benefit">
                <div
                  className="benefit-icon"
                  style={{ color: colors.secondary, background: `${colors.secondary}22` }}
                >
                  {b.i}
                </div>
                <h4 style={{ color: colors.primary }}>{b.t}</h4>
                <p>{b.s}</p>
              </div>
            ))}
          </div>
        </section>

        <footer className="store-footer">
          <span>© 2026 {brand.name}</span>
          <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--fg-4)', fontSize: 10 }}>
            built with ⊹ Forge
          </span>
          <span>Privacy · Terms · Contact</span>
        </footer>
      </div>
    </div>
  );
}
