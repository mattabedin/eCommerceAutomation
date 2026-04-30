import { NextResponse, type NextRequest } from 'next/server';
import { eq, sql } from 'drizzle-orm';

import {
  customers,
  db,
  orders,
  productVariants,
} from '@forge/db';
import { getStripe, verifyWebhookSignature, type Stripe } from '@forge/stripe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Stripe webhook receiver. We accept two events:
//   checkout.session.completed — primary signal that a payment was placed.
//     We use this to upsert the customer, write the order row, and decrement
//     variant stock.
//   payment_intent.payment_failed — logged for visibility; no DB writes.
//
// Verification: every request is HMAC-checked against STRIPE_WEBHOOK_SECRET
// before we trust any field.
export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature');
  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature' }, { status: 400 });
  }
  const raw = await req.text();

  let event: Stripe.Event;
  try {
    event = verifyWebhookSignature(raw, sig);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Bad signature';
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        await handleCheckoutCompleted(event.data.object);
        break;
      }
      case 'payment_intent.payment_failed': {
        // eslint-disable-next-line no-console
        console.warn('[stripe] payment_intent.payment_failed', event.data.object.id);
        break;
      }
      default:
        // Ignore other event types — Stripe retries failed deliveries based
        // on the response status, so we 2xx everything we don't handle.
        break;
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Webhook handler failed';
    // eslint-disable-next-line no-console
    console.error('[stripe] webhook handler error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const brandId = session.metadata?.brandId;
  if (!brandId) {
    // eslint-disable-next-line no-console
    console.warn('[stripe] checkout.session.completed without brandId metadata', session.id);
    return;
  }

  // Pull the line items so we know what was bought (Stripe doesn't include
  // them on the session payload by default).
  const stripe = getStripe();
  const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
    limit: 100,
    expand: ['data.price.product'],
  });

  // Upsert the customer by email. If Stripe didn't collect one (rare in
  // payment mode) we leave customerId null on the order row.
  const email =
    session.customer_details?.email ?? session.customer_email ?? null;
  const name =
    session.customer_details?.name ?? session.shipping_details?.name ?? null;

  let customerId: string | null = null;
  if (email) {
    const existing = await db.query.customers.findFirst({
      where: eq(customers.email, email),
    });
    if (existing) {
      customerId = existing.id;
    } else {
      const [created] = await db
        .insert(customers)
        .values({
          brandId,
          email,
          name: name ?? email.split('@')[0]!,
        })
        .returning();
      customerId = created?.id ?? null;
    }
  }

  const total = session.amount_total ?? 0;
  const itemCount = lineItems.data.reduce((s, li) => s + (li.quantity ?? 0), 0);

  await db.insert(orders).values({
    brandId,
    customerId,
    total,
    itemCount: Math.max(1, itemCount),
    status: 'paid' as const,
    fulfill: 'processing' as const,
    notes: `stripe_session_id=${session.id}`,
  });

  // Decrement variant stock for any line item whose product_data metadata
  // pointed at a variantId. Falling back to noop if variant is missing.
  for (const li of lineItems.data) {
    const product =
      typeof li.price?.product === 'object' && li.price?.product != null
        ? (li.price.product as Stripe.Product)
        : null;
    const variantId = product?.metadata?.variantId;
    const qty = li.quantity ?? 0;
    if (!variantId || qty <= 0) continue;
    await db
      .update(productVariants)
      .set({ stock: sql`GREATEST(${productVariants.stock} - ${qty}, 0)` })
      .where(eq(productVariants.id, variantId));
  }
}
