'use client';

import { useEffect } from 'react';
import { clearCart } from '@/lib/storefront/cart';

// Tiny effect that clears the local cart once the customer lands here.
// Stripe Checkout already verified the payment server-side via the webhook;
// this is purely a UI cleanup so the bag icon goes back to (0).
export function CheckoutSuccess({ slug }: { slug: string }) {
  useEffect(() => {
    clearCart(slug);
  }, [slug]);
  return null;
}
