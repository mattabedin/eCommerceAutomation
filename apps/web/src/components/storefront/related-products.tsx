import Link from 'next/link';

type RelatedProduct = {
  id: string;
  name: string;
  category: string;
  price: number;
  salePrice: number | null;
  wasPrice: number;
  tone: string | null;
};

export function RelatedProducts({
  slug,
  products,
}: {
  slug: string;
  products: RelatedProduct[];
}) {
  return (
    <section className="pdp-related">
      <h3 style={{ color: 'var(--brand-primary)' }}>You may also like</h3>
      <div className="product-grid">
        {products.map(p => (
          <Link
            key={p.id}
            href={`/s/${slug}/p/${p.id}`}
            className="product-card"
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <div
              className="product-img"
              data-label={`${p.category.toLowerCase()} · ${p.id.slice(0, 6)}`}
              style={{
                background: p.tone
                  ? `repeating-linear-gradient(135deg, ${p.tone}22, ${p.tone}22 8px, ${p.tone}11 8px, ${p.tone}11 16px), linear-gradient(135deg, ${p.tone}66, ${p.tone}cc)`
                  : 'var(--surface-2)',
              }}
            />
            <div
              className="product-name"
              style={{ color: 'var(--brand-primary)' }}
            >
              {p.name}
            </div>
            <div className="product-price">
              {p.salePrice != null ? (
                <>
                  <span style={{ color: 'var(--brand-secondary)', fontWeight: 600 }}>
                    ${(p.salePrice / 100).toFixed(2)}
                  </span>{' '}
                  <span className="compare">${(p.price / 100).toFixed(2)}</span>
                </>
              ) : (
                <>
                  ${(p.price / 100).toFixed(2)}
                  {p.wasPrice > p.price && (
                    <>
                      {' '}
                      <span className="compare">
                        ${(p.wasPrice / 100).toFixed(2)}
                      </span>
                    </>
                  )}
                </>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
