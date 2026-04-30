'use client';

import { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import {
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

type Colors = { primary: string; secondary: string; accent?: string };

export function CartView({
  slug,
  colors,
}: {
  slug: string;
  colors: Colors;
}) {
  const router = useRouter();
  const items = useCart(slug);
  const [enriched, setEnriched] = useState<EnrichedCart | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // Re-fetch enriched cart whenever the local items list changes — prices
  // and stock are authoritative on the server.
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

  if (cartCount(items) === 0) {
    return (
      <section
        style={{
          padding: '64px 24px',
          textAlign: 'center',
          maxWidth: 480,
          margin: '0 auto',
        }}
      >
        <h1 style={{ color: colors.primary }}>Your bag is empty</h1>
        <p style={{ color: 'var(--fg-3)', marginTop: 8 }}>
          Add a few pieces to see them here.
        </p>
        <Link
          href={`/s/${slug}`}
          className="btn"
          style={{
            marginTop: 16,
            background: colors.primary,
            color: 'white',
            borderColor: colors.primary,
            padding: '10px 18px',
          }}
        >
          Continue shopping →
        </Link>
      </section>
    );
  }

  return (
    <section
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)',
        gap: 48,
        padding: '40px 56px 64px',
        maxWidth: 1280,
        margin: '0 auto',
      }}
    >
      <div>
        <h1 style={{ color: colors.primary, fontSize: 32, marginBottom: 16 }}>
          Your bag
        </h1>
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

      <aside
        style={{
          padding: 24,
          background: 'var(--surface-2)',
          borderRadius: 12,
          height: 'fit-content',
          position: 'sticky',
          top: 24,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 13,
            color: 'var(--fg-2)',
            marginBottom: 8,
          }}
        >
          <span>Subtotal</span>
          <span style={{ fontVariantNumeric: 'tabular-nums' }}>
            {formatMoney(enriched?.subtotal ?? 0)}
          </span>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 12,
            color: 'var(--fg-3)',
            marginBottom: 16,
          }}
        >
          <span>Shipping</span>
          <span>Calculated at checkout</span>
        </div>
        <div
          style={{
            borderTop: '1px solid var(--border)',
            paddingTop: 12,
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 16,
            fontWeight: 600,
            marginBottom: 16,
          }}
        >
          <span>Total</span>
          <span style={{ fontVariantNumeric: 'tabular-nums' }}>
            {formatMoney(enriched?.subtotal ?? 0)}
          </span>
        </div>
        <button
          type="button"
          onClick={checkout}
          disabled={pending || !enriched || enriched.items.some(i => !i.available)}
          className="btn"
          style={{
            width: '100%',
            background: colors.primary,
            color: 'white',
            borderColor: colors.primary,
            padding: '12px 18px',
            fontSize: 14,
          }}
        >
          {pending ? 'Redirecting to checkout…' : 'Checkout →'}
        </button>
        <div
          style={{
            marginTop: 8,
            textAlign: 'center',
            fontSize: 11,
            color: 'var(--fg-4)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          payments by Stripe
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
        gridTemplateColumns: '80px 1fr 110px 30px',
        gap: 16,
        alignItems: 'center',
        padding: 12,
        border: '1px solid var(--border)',
        borderRadius: 8,
        background: 'var(--surface)',
      }}
    >
      <div
        style={{
          aspectRatio: '1 / 1',
          borderRadius: 6,
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
          <span>{formatMoney(item.unitPrice)}</span>
          {item.unitPrice < item.unitRegular && (
            <span
              style={{
                fontSize: 11,
                color: 'var(--fg-4)',
                textDecoration: 'line-through',
              }}
            >
              {formatMoney(item.unitRegular)}
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
        }}
      >
        ×
      </button>
    </div>
  );
}

function formatMoney(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
