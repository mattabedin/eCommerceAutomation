'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { addToCart } from '@/lib/storefront/cart';

type Variant = {
  id: string;
  size: string | null;
  color: string | null;
  colorHex: string | null;
  priceOverride: number | null; // cents
  salePrice: number | null; // cents
  stock: number;
  sku: string | null;
};

type Product = {
  id: string;
  name: string;
  category: string;
  categories: string[];
  price: number; // cents
  salePrice: number | null; // cents
  wasPrice: number; // cents
  description: string | null;
  tone: string | null;
};

type Tab = 'details' | 'care' | 'shipping';

// Deterministic mock review summary so the same product always shows the
// same numbers. Pulled from a hash of the product id so a Forge demo feels
// "real" without needing a reviews back-end.
function mockReviews(id: string): { rating: number; count: number } {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  const abs = Math.abs(h);
  const rating = 4.4 + ((abs % 60) / 100); // 4.4–5.0
  const count = 80 + (abs % 480); // 80–559
  return { rating: Math.round(rating * 10) / 10, count };
}

export function ProductDetail({
  slug,
  product,
  variants,
}: {
  slug: string;
  product: Product;
  variants: Variant[];
}) {
  const router = useRouter();
  const sizes = useMemo(
    () =>
      Array.from(
        new Set(variants.map(v => v.size).filter((s): s is string => !!s)),
      ),
    [variants],
  );
  const colorOptions = useMemo(() => {
    const seen = new Map<string, { color: string; colorHex: string | null }>();
    for (const v of variants) {
      if (!v.color) continue;
      const k = v.color.toLowerCase();
      if (!seen.has(k)) seen.set(k, { color: v.color, colorHex: v.colorHex });
    }
    return Array.from(seen.values());
  }, [variants]);

  const hasVariants = variants.length > 0;
  const [selectedSize, setSelectedSize] = useState<string | null>(sizes[0] ?? null);
  const [selectedColor, setSelectedColor] = useState<string | null>(
    colorOptions[0]?.color ?? null,
  );
  const [activeFrame, setActiveFrame] = useState(0);
  const [tab, setTab] = useState<Tab>('details');
  const [added, setAdded] = useState(false);

  const activeVariant = useMemo<Variant | null>(() => {
    if (!hasVariants) return null;
    return (
      variants.find(v => {
        const sizeOk = sizes.length === 0 || !selectedSize || v.size === selectedSize;
        const colorOk =
          colorOptions.length === 0 || !selectedColor || v.color === selectedColor;
        return sizeOk && colorOk;
      }) ?? null
    );
  }, [hasVariants, variants, sizes, colorOptions, selectedSize, selectedColor]);

  // Which sizes are sold out for the currently-selected color? We grey
  // those out instead of hiding so the customer sees the full size run.
  const soldOutSizes = useMemo(() => {
    const out = new Set<string>();
    for (const s of sizes) {
      const matches = variants.filter(
        v => v.size === s && (!selectedColor || v.color === selectedColor),
      );
      if (matches.length > 0 && matches.every(v => v.stock <= 0)) out.add(s);
    }
    return out;
  }, [variants, sizes, selectedColor]);

  const effectiveSale = activeVariant?.salePrice ?? product.salePrice ?? null;
  const effectiveRegular = activeVariant?.priceOverride ?? product.price;
  const compareAt = product.wasPrice;
  const inStock = !hasVariants || (activeVariant?.stock ?? 0) > 0;
  const stockUrgency =
    activeVariant != null && activeVariant.stock > 0 && activeVariant.stock <= 5;

  const reviews = mockReviews(product.id);
  const tone = product.tone ?? '#737373';
  // Four "frames" derived from the tone: same gradient at different angles
  // and saturations so the gallery feels like multiple photos.
  const frames = [
    `repeating-linear-gradient(135deg, ${tone}22, ${tone}22 8px, ${tone}11 8px, ${tone}11 16px), linear-gradient(135deg, ${tone}66, ${tone}cc)`,
    `radial-gradient(circle at 30% 30%, ${tone}cc 0%, ${tone}55 60%, ${tone}22 100%)`,
    `linear-gradient(180deg, ${tone}99 0%, ${tone}33 60%, ${tone}11 100%)`,
    `repeating-linear-gradient(45deg, ${tone}33, ${tone}33 12px, ${tone}11 12px, ${tone}11 24px)`,
  ];

  function add() {
    if (!inStock) return;
    addToCart(slug, {
      productId: product.id,
      variantId: activeVariant?.id ?? null,
      quantity: 1,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
    router.refresh();
  }

  return (
    <>
      <section className="pdp">
        <div className="pdp-gallery">
          <div className="thumbs">
            {frames.map((bg, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Frame ${i + 1}`}
                className="pdp-thumb"
                data-active={activeFrame === i}
                onClick={() => setActiveFrame(i)}
                style={{ background: bg }}
              />
            ))}
          </div>
          <div
            className="pdp-frame"
            style={{ background: frames[activeFrame] }}
          />
        </div>

        <div className="pdp-rail">
          <div className="pdp-eyebrow">{product.category}</div>
          <h1>{product.name}</h1>

          <div className="pdp-reviews">
            <span className="stars" aria-hidden>
              ★★★★★
            </span>
            <span style={{ fontWeight: 500 }}>{reviews.rating}</span>
            <span className="count">· {reviews.count} reviews</span>
          </div>

          <div className="pdp-price">
            {effectiveSale != null ? (
              <>
                <span className="now sale">
                  ${(effectiveSale / 100).toFixed(2)}
                </span>
                <span className="strike">${(effectiveRegular / 100).toFixed(2)}</span>
              </>
            ) : (
              <>
                <span className="now">${(effectiveRegular / 100).toFixed(2)}</span>
                {compareAt > effectiveRegular && (
                  <span className="strike">${(compareAt / 100).toFixed(2)}</span>
                )}
              </>
            )}
          </div>

          <div className="pdp-trust-line">
            <span>✦ Free shipping over $75</span>
            <span>↺ 60-day returns</span>
            <span>✈ Ships in 1–2 days</span>
          </div>

          {product.description && (
            <p
              style={{
                fontSize: 14,
                lineHeight: 1.6,
                color: 'var(--fg-2)',
                margin: '0 0 8px',
              }}
            >
              {product.description}
            </p>
          )}

          {colorOptions.length > 0 && (
            <>
              <div className="pdp-picker-label">
                <span>Color · {selectedColor ?? '—'}</span>
              </div>
              <div className="pdp-swatch-row">
                {colorOptions.map(c => (
                  <button
                    key={c.color}
                    type="button"
                    onClick={() => setSelectedColor(c.color)}
                    aria-label={c.color}
                    className="pdp-swatch"
                    data-active={selectedColor === c.color}
                    style={{ background: c.colorHex ?? 'var(--surface-2)' }}
                  />
                ))}
              </div>
            </>
          )}

          {sizes.length > 0 && (
            <>
              <div className="pdp-picker-label">
                <span>Size</span>
                <a href="#size-guide" onClick={e => e.preventDefault()}>
                  Size guide ↗
                </a>
              </div>
              <div className="pdp-size-row">
                {sizes.map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSelectedSize(s)}
                    className="pdp-size"
                    data-active={selectedSize === s}
                    disabled={soldOutSizes.has(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </>
          )}

          {stockUrgency && (
            <div className="pdp-stock">
              <span className="pulse" />
              Only {activeVariant?.stock ?? 0} left in {selectedColor ?? selectedSize ?? 'this option'}
            </div>
          )}

          <button
            type="button"
            onClick={add}
            disabled={!inStock}
            className="btn-brand pdp-add"
          >
            {!inStock ? 'Out of stock' : added ? 'Added to bag ✓' : 'Add to bag →'}
          </button>

          <div
            style={{
              marginTop: 10,
              fontSize: 11,
              color: 'var(--fg-4)',
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.04em',
              textAlign: 'center',
            }}
          >
            secure checkout via Stripe · Apple Pay · Google Pay
          </div>

          <div className="pdp-tabs">
            <button
              type="button"
              className="pdp-tab"
              data-active={tab === 'details'}
              onClick={() => setTab('details')}
            >
              Details
            </button>
            <button
              type="button"
              className="pdp-tab"
              data-active={tab === 'care'}
              onClick={() => setTab('care')}
            >
              Care
            </button>
            <button
              type="button"
              className="pdp-tab"
              data-active={tab === 'shipping'}
              onClick={() => setTab('shipping')}
            >
              Shipping & returns
            </button>
          </div>
          <div className="pdp-tab-body">
            {tab === 'details' && (
              <ul>
                <li>Designed in small batches.</li>
                <li>Materials chosen for daily use, not seasons.</li>
                <li>{product.category} — {product.categories.join(', ') || 'curated edit'}.</li>
                {activeVariant?.sku && <li>SKU {activeVariant.sku}</li>}
              </ul>
            )}
            {tab === 'care' && (
              <ul>
                <li>Wipe with a soft, damp cloth.</li>
                <li>Avoid prolonged sunlight + harsh detergents.</li>
                <li>Restore with the conditioner of your choice every 6 months.</li>
              </ul>
            )}
            {tab === 'shipping' && (
              <ul>
                <li>Free shipping on orders over $75 (USPS Priority).</li>
                <li>Ships in 1–2 business days from our studio.</li>
                <li>60-day returns on unworn pieces — we cover return label.</li>
              </ul>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
