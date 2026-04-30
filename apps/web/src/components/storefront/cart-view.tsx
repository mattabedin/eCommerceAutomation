'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import {
  addToCart,
  cartCount,
  removeItem,
  setItemQty,
  useCart,
} from '@/lib/storefront/cart';
import {
  createCheckout,
  enrichCart,
  type EnrichedCart,
  type EnrichedItem,
} from '@/lib/storefront/actions';
import { FREE_SHIPPING_THRESHOLD_CENTS } from '@/lib/storefront/brand-tokens';

type UpsellCandidate = {
  id: string;
  name: string;
  price: number;
  salePrice: number | null;
  tone: string | null;
};

export function CartView({
  slug,
  upsellCandidates,
}: {
  slug: string;
  upsellCandidates: UpsellCandidate[];
}) {
  const router = useRouter();
  const items = useCart(slug);
  const [enriched, setEnriched] = useState<EnrichedCart | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [discount, setDiscount] = useState('');
  const [discountStatus, setDiscountStatus] = useState<
    'idle' | 'applied' | 'invalid'
  >('idle');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await enrichCart({ slug, items });
      if (cancelled) return;
      if (!res.ok) {
        setError(res.error);
        setEnriched(null);
      } else {
        setError(null);
        setEnriched(res);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug, items]);

  function checkout() {
    setError(null);
    startTransition(async () => {
      const res = await createCheckout({ slug, items });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      window.location.href = res.url;
    });
  }

  function applyDiscount() {
    const code = discount.trim().toUpperCase();
    if (!code) return;
    // Demo: WELCOME10 is the only stub code. Real coupons land in Phase 6+.
    if (code === 'WELCOME10') setDiscountStatus('applied');
    else setDiscountStatus('invalid');
  }

  const cartItemKeys = useMemo(
    () =>
      new Set(items.map(i => `${i.productId}:${i.variantId ?? ''}`)),
    [items],
  );
  const upsellPicks = upsellCandidates
    .filter(c => !cartItemKeys.has(`${c.id}:`))
    .slice(0, 4);

  if (cartCount(items) === 0) {
    return (
      <section
        style={{
          padding: '80px 24px',
          textAlign: 'center',
          maxWidth: 480,
          margin: '0 auto',
        }}
      >
        <div
          style={{
            fontSize: 36,
            fontFamily: 'var(--font-serif)',
            color: 'var(--brand-primary)',
            marginBottom: 8,
          }}
        >
          Your bag is empty
        </div>
        <p style={{ color: 'var(--fg-3)', marginTop: 8, marginBottom: 24 }}>
          Add a few pieces to see them here.
        </p>
        <Link href={`/s/${slug}`} className="btn-brand">
          Continue shopping →
        </Link>
      </section>
    );
  }

  const subtotal = enriched?.subtotal ?? 0;
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD_CENTS - subtotal);
  const fillPct = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD_CENTS) * 100);
  const discountAmount =
    discountStatus === 'applied' ? Math.round(subtotal * 0.1) : 0;
  const total = subtotal - discountAmount;

  return (
    <section className="cart-shell">
      <div>
        <h1
          style={{
            fontFamily: 'var(--font-serif)',
            color: 'var(--brand-primary)',
            fontSize: 32,
            marginBottom: 8,
          }}
        >
          Your bag
        </h1>
        <div
          style={{
            color: 'var(--fg-3)',
            fontSize: 13,
            marginBottom: 16,
          }}
        >
          {cartCount(items)} item{cartCount(items) === 1 ? '' : 's'}
        </div>

        <div className="cart-progress">
          <div className="cart-progress-text">
            <span>
              {remaining === 0
                ? '✓ You unlocked free shipping'
                : `Add $${(remaining / 100).toFixed(2)} more for free shipping`}
            </span>
            <span>${(subtotal / 100).toFixed(2)} / ${(FREE_SHIPPING_THRESHOLD_CENTS / 100).toFixed(0)}</span>
          </div>
          <div className="cart-progress-track">
            <div className="cart-progress-fill" style={{ width: `${fillPct}%` }} />
          </div>
        </div>

        {error && (
          <div
            style={{
              padding: '8px 12px',
              fontSize: 12,
              color: 'var(--rose)',
              background: 'var(--surface-2)',
              border: '1px solid var(--rose)',
              borderRadius: 6,
              marginBottom: 12,
              fontFamily: 'var(--font-mono)',
            }}
          >
            {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {(enriched?.items ?? []).map(i => (
            <CartLine
              key={`${i.productId}:${i.variantId ?? ''}`}
              slug={slug}
              item={i}
              onRefresh={() => router.refresh()}
              pending={pending}
            />
          ))}
          {!enriched && (
            <div style={{ color: 'var(--fg-3)', fontSize: 13 }}>Loading…</div>
          )}
        </div>
      </div>

      <aside className="cart-summary">
        {upsellPicks.length > 0 && (
          <div className="cart-upsell">
            <div className="cart-upsell-head">Frequently bought with</div>
            <div className="cart-upsell-grid">
              {upsellPicks.map(u => (
                <div key={u.id} className="cart-upsell-card">
                  <div
                    className="swatch"
                    style={{
                      background: u.tone
                        ? `linear-gradient(135deg, ${u.tone}66, ${u.tone}cc)`
                        : 'var(--surface-2)',
                    }}
                  />
                  <div className="body">
                    <div className="name">{u.name}</div>
                    <div className="price">
                      ${((u.salePrice ?? u.price) / 100).toFixed(2)}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      addToCart(slug, {
                        productId: u.id,
                        variantId: null,
                        quantity: 1,
                      });
                      router.refresh();
                    }}
                    aria-label={`Add ${u.name} to bag`}
                  >
                    Add
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="cart-summary-row">
          <span>Subtotal</span>
          <span style={{ fontVariantNumeric: 'tabular-nums' }}>
            ${(subtotal / 100).toFixed(2)}
          </span>
        </div>
        {discountAmount > 0 && (
          <div
            className="cart-summary-row"
            style={{ color: 'var(--brand-secondary)' }}
          >
            <span>Discount (WELCOME10)</span>
            <span style={{ fontVariantNumeric: 'tabular-nums' }}>
              −${(discountAmount / 100).toFixed(2)}
            </span>
          </div>
        )}
        <div className="cart-summary-row">
          <span className="label">Shipping</span>
          <span className="label">
            {remaining === 0 ? 'Free' : 'Calculated at checkout'}
          </span>
        </div>

        <div className="cart-discount">
          <input
            type="text"
            placeholder="Discount code"
            value={discount}
            onChange={e => {
              setDiscount(e.target.value);
              if (discountStatus !== 'idle') setDiscountStatus('idle');
            }}
            onKeyDown={e => {
              if (e.key === 'Enter') applyDiscount();
            }}
          />
          <button type="button" onClick={applyDiscount}>
            Apply
          </button>
        </div>
        {discountStatus === 'invalid' && (
          <div
            style={{
              fontSize: 11,
              color: 'var(--rose)',
              fontFamily: 'var(--font-mono)',
              marginBottom: 8,
              marginTop: -8,
            }}
          >
            That code isn't valid.
          </div>
        )}

        <div className="cart-summary-total">
          <span>Total</span>
          <span style={{ fontVariantNumeric: 'tabular-nums' }}>
            ${(total / 100).toFixed(2)}
          </span>
        </div>

        <button
          type="button"
          onClick={checkout}
          disabled={pending || !enriched || enriched.items.some(i => !i.available)}
          className="btn-brand"
          style={{ width: '100%', justifyContent: 'center', padding: '14px 18px' }}
        >
          {pending ? 'Redirecting to checkout…' : 'Checkout securely →'}
        </button>

        <div className="cart-trust-row">
          <span>✓ SSL ENCRYPTED</span>
          <span>✓ STRIPE</span>
          <span>✓ APPLE PAY</span>
          <span>✓ 60-DAY RETURNS</span>
        </div>
      </aside>
    </section>
  );
}

function CartLine({
  slug,
  item,
  onRefresh,
  pending,
}: {
  slug: string;
  item: EnrichedItem;
  onRefresh: () => void;
  pending: boolean;
}) {
  function dec() {
    setItemQty(slug, item.productId, item.variantId, item.quantity - 1);
    onRefresh();
  }
  function inc() {
    if (item.stock != null && item.quantity + 1 > item.stock) return;
    setItemQty(slug, item.productId, item.variantId, item.quantity + 1);
    onRefresh();
  }
  function remove() {
    removeItem(slug, item.productId, item.variantId);
    onRefresh();
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '88px 1fr 110px 30px',
        gap: 16,
        alignItems: 'center',
        padding: 14,
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        background: 'var(--surface)',
      }}
    >
      <div
        style={{
          aspectRatio: '1 / 1',
          borderRadius: 'var(--radius-sm)',
          background: item.tone
            ? `linear-gradient(135deg, ${item.tone}66, ${item.tone}cc)`
            : 'var(--surface-2)',
        }}
      />
      <div>
        <div style={{ fontWeight: 500, fontSize: 14 }}>{item.name}</div>
        {item.variantLabel && (
          <div
            style={{
              fontSize: 11.5,
              color: 'var(--fg-3)',
              fontFamily: 'var(--font-mono)',
              marginTop: 2,
            }}
          >
            {item.variantLabel}
          </div>
        )}
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: 8,
            marginTop: 4,
            fontVariantNumeric: 'tabular-nums',
            fontSize: 13,
          }}
        >
          <span>${(item.unitPrice / 100).toFixed(2)}</span>
          {item.unitPrice < item.unitRegular && (
            <span
              style={{
                fontSize: 11,
                color: 'var(--fg-4)',
                textDecoration: 'line-through',
              }}
            >
              ${(item.unitRegular / 100).toFixed(2)}
            </span>
          )}
        </div>
        {!item.available && (
          <div style={{ fontSize: 11, color: 'var(--rose)', marginTop: 4 }}>
            Only {item.stock ?? 0} in stock
          </div>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <button
          type="button"
          className="btn btn-sm btn-ghost"
          onClick={dec}
          disabled={pending}
          aria-label="Decrease quantity"
        >
          −
        </button>
        <span style={{ width: 24, textAlign: 'center', fontSize: 13 }}>
          {item.quantity}
        </span>
        <button
          type="button"
          className="btn btn-sm btn-ghost"
          onClick={inc}
          disabled={pending}
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>
      <button
        type="button"
        onClick={remove}
        aria-label="Remove from cart"
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--fg-4)',
          cursor: 'pointer',
          padding: 4,
          fontSize: 18,
        }}
      >
        ×
      </button>
    </div>
  );
}
