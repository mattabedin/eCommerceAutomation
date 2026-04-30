'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { addToCart } from '@/lib/storefront/cart';

type Colors = { primary: string; secondary: string; accent?: string };

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

export function ProductDetail({
  slug,
  colors,
  product,
  variants,
}: {
  slug: string;
  colors: Colors;
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
  const [selectedSize, setSelectedSize] = useState<string | null>(
    sizes[0] ?? null,
  );
  const [selectedColor, setSelectedColor] = useState<string | null>(
    colorOptions[0]?.color ?? null,
  );
  const [added, setAdded] = useState(false);

  // Resolve which variant matches the current selection. If only one axis is
  // varied, we match on that axis alone.
  const activeVariant = useMemo<Variant | null>(() => {
    if (!hasVariants) return null;
    return (
      variants.find(v => {
        const sizeOk =
          sizes.length === 0 || !selectedSize || v.size === selectedSize;
        const colorOk =
          colorOptions.length === 0 ||
          !selectedColor ||
          v.color === selectedColor;
        return sizeOk && colorOk;
      }) ?? null
    );
  }, [hasVariants, variants, sizes, colorOptions, selectedSize, selectedColor]);

  // Effective prices (cents). Variant override > product price.
  const effectiveSale =
    activeVariant?.salePrice ?? product.salePrice ?? null;
  const effectiveRegular =
    activeVariant?.priceOverride ?? product.price;
  const compareAt = product.wasPrice;

  const inStock = !hasVariants || (activeVariant?.stock ?? 0) > 0;

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
    <section
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 1fr)',
        gap: 48,
        padding: '40px 56px 64px',
        maxWidth: 1280,
        margin: '0 auto',
      }}
    >
      <div
        style={{
          aspectRatio: '4 / 5',
          borderRadius: 16,
          background: product.tone
            ? `repeating-linear-gradient(135deg, ${product.tone}22, ${product.tone}22 8px, ${product.tone}11 8px, ${product.tone}11 16px), linear-gradient(135deg, ${product.tone}66, ${product.tone}cc)`
            : 'var(--surface-2)',
        }}
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div
          style={{
            fontSize: 11,
            fontFamily: 'var(--font-mono)',
            color: 'var(--fg-3)',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}
        >
          {product.category}
        </div>
        <h1 style={{ fontSize: 36, color: colors.primary, margin: 0 }}>
          {product.name}
        </h1>

        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: 10,
            fontSize: 22,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {effectiveSale != null ? (
            <>
              <span style={{ color: colors.secondary, fontWeight: 600 }}>
                ${(effectiveSale / 100).toFixed(2)}
              </span>
              <span
                style={{
                  color: 'var(--fg-4)',
                  textDecoration: 'line-through',
                  fontSize: 16,
                }}
              >
                ${(effectiveRegular / 100).toFixed(2)}
              </span>
            </>
          ) : (
            <>
              <span style={{ fontWeight: 600 }}>
                ${(effectiveRegular / 100).toFixed(2)}
              </span>
              {compareAt > effectiveRegular && (
                <span
                  style={{
                    color: 'var(--fg-4)',
                    textDecoration: 'line-through',
                    fontSize: 16,
                  }}
                >
                  ${(compareAt / 100).toFixed(2)}
                </span>
              )}
            </>
          )}
        </div>

        {product.description && (
          <p
            style={{
              fontSize: 14,
              lineHeight: 1.6,
              color: 'var(--fg-2)',
              margin: 0,
            }}
          >
            {product.description}
          </p>
        )}

        {colorOptions.length > 0 && (
          <div>
            <div
              style={{
                fontSize: 11,
                fontFamily: 'var(--font-mono)',
                color: 'var(--fg-3)',
                marginBottom: 8,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              Color · {selectedColor ?? '—'}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {colorOptions.map(c => (
                <button
                  key={c.color}
                  type="button"
                  onClick={() => setSelectedColor(c.color)}
                  aria-label={c.color}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 999,
                    background: c.colorHex ?? 'var(--surface-2)',
                    border:
                      selectedColor === c.color
                        ? `2px solid ${colors.primary}`
                        : '1px solid var(--border)',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {sizes.length > 0 && (
          <div>
            <div
              style={{
                fontSize: 11,
                fontFamily: 'var(--font-mono)',
                color: 'var(--fg-3)',
                marginBottom: 8,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              Size
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {sizes.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSelectedSize(s)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 8,
                    border:
                      selectedSize === s
                        ? `2px solid ${colors.primary}`
                        : '1px solid var(--border)',
                    background:
                      selectedSize === s ? colors.primary : 'var(--surface)',
                    color: selectedSize === s ? 'white' : 'var(--fg)',
                    cursor: 'pointer',
                    fontSize: 13,
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginTop: 8 }}>
          <button
            type="button"
            onClick={add}
            disabled={!inStock}
            className="btn"
            style={{
              background: colors.primary,
              color: 'white',
              borderColor: colors.primary,
              padding: '12px 24px',
              fontSize: 14,
              opacity: inStock ? 1 : 0.5,
              cursor: inStock ? 'pointer' : 'not-allowed',
            }}
          >
            {!inStock
              ? 'Out of stock'
              : added
                ? 'Added ✓'
                : 'Add to cart →'}
          </button>
          {hasVariants && activeVariant && (
            <div
              style={{
                marginTop: 8,
                fontSize: 11,
                color: 'var(--fg-3)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {activeVariant.sku ? `SKU ${activeVariant.sku} · ` : ''}
              {activeVariant.stock > 0
                ? `${activeVariant.stock} in stock`
                : 'Out of stock'}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
