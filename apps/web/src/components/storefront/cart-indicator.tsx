'use client';

import Link from 'next/link';
import { cartCount, useCart } from '@/lib/storefront/cart';

export function CartIndicator({ slug }: { slug: string }) {
  const items = useCart(slug);
  const n = cartCount(items);
  return (
    <Link
      href={`/s/${slug}/cart`}
      style={{
        textDecoration: 'none',
        color: 'inherit',
        fontFamily: 'var(--font-mono)',
        fontSize: 12,
      }}
    >
      Bag ({n})
    </Link>
  );
}
