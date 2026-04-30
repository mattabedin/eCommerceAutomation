import Stripe from 'stripe';

// Single Stripe client for the Forge backend. Lazy-initialised so the absence
// of STRIPE_SECRET_KEY at build time doesn't crash the bundle — the first
// real call throws a clear error instead.
let _client: Stripe | null = null;

export function getStripe(): Stripe {
  if (_client) return _client;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      'STRIPE_SECRET_KEY is not set. Add it to your env vars to enable checkout.',
    );
  }
  _client = new Stripe(key, {
    // Pin the API version so a Stripe-side rollout never silently changes
    // the shape of objects we read in the webhook.
    apiVersion: '2025-02-24.acacia',
    typescript: true,
    appInfo: { name: 'Forge AI Store Builder', version: '0.1.0' },
  });
  return _client;
}

// ---------- checkout sessions --------------------------------------------

export type CheckoutLineItem = {
  // Display name for the Stripe-hosted checkout page.
  name: string;
  // Optional descriptor — usually a variant ("Walnut · M") or category.
  description?: string;
  // Cents.
  unitAmount: number;
  quantity: number;
  // Anything we need to recover on the webhook side: productId, variantId,
  // sku. Stripe only allows ≤ 50 entries and 500-char values, so keep it
  // short. We mirror the same data into the session metadata for the
  // top-level case (orders without line-item details).
  metadata?: Record<string, string>;
};

export type CreateCheckoutSessionInput = {
  // The brandId we want to attribute the resulting order to. Surfaces in
  // session metadata so the webhook can route the order correctly.
  brandId: string;
  brandName: string;
  // Where Stripe redirects after success / cancel. Use absolute URLs.
  successUrl: string;
  cancelUrl: string;
  currency: string; // e.g. 'usd'
  lineItems: CheckoutLineItem[];
  // Optional cart token — useful if the operator later wants to dedupe
  // duplicate webhook deliveries against an in-progress cart.
  clientReferenceId?: string;
  customerEmail?: string;
};

// Stripe's `line_items[].price_data.product_data` only stores name +
// description + metadata; no price-tier hierarchy is needed for one-shot
// purchases, which is what Forge supports today.
export async function createCheckoutSession(
  input: CreateCheckoutSessionInput,
): Promise<{ id: string; url: string }> {
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    success_url: input.successUrl,
    cancel_url: input.cancelUrl,
    client_reference_id: input.clientReferenceId,
    customer_email: input.customerEmail,
    metadata: {
      brandId: input.brandId,
      brandName: input.brandName.slice(0, 200),
    },
    line_items: input.lineItems.map(li => ({
      quantity: li.quantity,
      price_data: {
        currency: input.currency,
        unit_amount: li.unitAmount,
        product_data: {
          name: li.name.slice(0, 200),
          description: li.description?.slice(0, 200),
          metadata: li.metadata,
        },
      },
    })),
  });
  if (!session.url) {
    throw new Error('Stripe returned a session without a redirect URL.');
  }
  return { id: session.id, url: session.url };
}

// ---------- webhooks ------------------------------------------------------

// Verifies and parses a webhook delivery. Throws if the signature is bad.
// Caller passes the *raw* body — Next must read it as a string before parsing.
export function verifyWebhookSignature(
  rawBody: string,
  signature: string,
): Stripe.Event {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error(
      'STRIPE_WEBHOOK_SECRET is not set. Add it before serving /api/webhooks/stripe.',
    );
  }
  return stripe.webhooks.constructEvent(rawBody, signature, secret);
}

// Re-export the Stripe namespace for downstream typing convenience.
export type { Stripe };
