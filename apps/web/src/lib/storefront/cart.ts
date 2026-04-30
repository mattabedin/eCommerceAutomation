'use client';

// Tiny localStorage-backed cart, keyed by brand slug. Each storefront has
// its own cart so a customer browsing two Forge stores doesn't see them
// cross-contaminate. Prices are NOT stored here — they are recomputed
// server-side from the DB on cart-page load and at Checkout, so a malicious
// client can't tamper with totals.

import { useEffect, useState } from 'react';

export type CartItem = {
  productId: string;
  variantId: string | null;
  quantity: number;
};

const KEY_PREFIX = 'forge:cart:';
const EVENT = 'forge:cart-changed';

function key(slug: string): string {
  return `${KEY_PREFIX}${slug}`;
}

function safeParse(raw: string | null): CartItem[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (i: unknown): i is CartItem =>
        !!i &&
        typeof i === 'object' &&
        typeof (i as CartItem).productId === 'string' &&
        typeof (i as CartItem).quantity === 'number',
    );
  } catch {
    return [];
  }
}

export function readCart(slug: string): CartItem[] {
  if (typeof window === 'undefined') return [];
  return safeParse(window.localStorage.getItem(key(slug)));
}

function writeCart(slug: string, items: CartItem[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key(slug), JSON.stringify(items));
  window.dispatchEvent(new CustomEvent(EVENT, { detail: { slug } }));
}

export function addToCart(slug: string, item: CartItem): void {
  const items = readCart(slug);
  // Match on product + variant. Same combo bumps quantity.
  const existing = items.find(
    i => i.productId === item.productId && i.variantId === item.variantId,
  );
  if (existing) {
    existing.quantity += item.quantity;
  } else {
    items.push({ ...item });
  }
  writeCart(slug, items);
}

export function setItemQty(
  slug: string,
  productId: string,
  variantId: string | null,
  quantity: number,
): void {
  const items = readCart(slug);
  const next = items
    .map(i =>
      i.productId === productId && i.variantId === variantId
        ? { ...i, quantity }
        : i,
    )
    .filter(i => i.quantity > 0);
  writeCart(slug, next);
}

export function removeItem(
  slug: string,
  productId: string,
  variantId: string | null,
): void {
  const items = readCart(slug).filter(
    i => !(i.productId === productId && i.variantId === variantId),
  );
  writeCart(slug, items);
}

export function clearCart(slug: string): void {
  writeCart(slug, []);
}

// React hook that re-reads on storage events so a cart icon in the nav
// updates when the customer adds something on the PDP without a router
// refresh.
export function useCart(slug: string): CartItem[] {
  const [items, setItems] = useState<CartItem[]>([]);
  useEffect(() => {
    setItems(readCart(slug));
    function refresh() {
      setItems(readCart(slug));
    }
    window.addEventListener(EVENT, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(EVENT, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, [slug]);
  return items;
}

export function cartCount(items: CartItem[]): number {
  return items.reduce((s, i) => s + i.quantity, 0);
}
