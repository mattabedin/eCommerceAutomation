import Link from 'next/link';

// Visual category browse — uses the brand's product tones to render
// gradient tiles since we don't yet have real photography. Picks the
// first product in each category as the swatch source so each tile
// genuinely reflects a piece of the catalogue.
export type TileProduct = {
  id: string;
  name: string;
  category: string;
  categories: string[];
  tone: string | null;
};

export function CategoryTiles({
  slug,
  categories,
  products,
}: {
  slug: string;
  categories: string[];
  products: TileProduct[];
}) {
  const tiles = categories.slice(0, 6).map(cat => {
    const sample = products.find(p => belongs(p, cat));
    const count = products.filter(p => belongs(p, cat)).length;
    return {
      cat,
      tone: sample?.tone ?? '#737373',
      count,
    };
  });

  if (tiles.length === 0) return null;

  return (
    <section className="store-section">
      <h2>Shop by collection</h2>
      <div className="sub">{tiles.length} curated edits across the catalogue.</div>
      <div className="cat-tiles">
        {tiles.map(t => (
          <Link
            key={t.cat}
            href={`/s/${slug}#cat-${slugify(t.cat)}`}
            className="cat-tile"
            style={{
              background: `linear-gradient(135deg, ${t.tone}aa, ${t.tone}33), repeating-linear-gradient(135deg, rgba(0,0,0,0.04), rgba(0,0,0,0.04) 10px, rgba(0,0,0,0.02) 10px, rgba(0,0,0,0.02) 20px)`,
            }}
          >
            <div className="cat-tile-label">
              <span style={{ textTransform: 'capitalize' }}>{t.cat}</span>
              <span className="meta">{t.count} ITEMS</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function belongs(p: TileProduct, cat: string): boolean {
  const c = cat.toLowerCase();
  if (p.category?.toLowerCase() === c) return true;
  return (p.categories ?? []).some(t => t.toLowerCase() === c);
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}
