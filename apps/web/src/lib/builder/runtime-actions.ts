'use server';

import { revalidatePath } from 'next/cache';
import { and, asc, eq, inArray } from 'drizzle-orm';
import { z } from 'zod';

import { auth } from '@/lib/auth';
import { anthropic, BUILDER_MODEL } from '@/lib/anthropic/client';
import {
  brands,
  customers,
  db,
  orders,
  products,
  ticketMessages,
  tickets,
  workspaceMembers,
} from '@forge/db';
import {
  mockCustomers,
  mockOrders,
  mockTickets,
} from '@/lib/mock-runtime';

export type ActionResult = { ok: true } | { ok: false; error: string };

export type DraftResult =
  | { ok: true; draft: string; confidence: 'high' | 'medium' | 'low' }
  | { ok: false; error: string };

// ---------- ownership helpers ----------------------------------------------

async function userWorkspaceIds(userId: string): Promise<string[]> {
  const rows = await db.query.workspaceMembers.findMany({
    where: eq(workspaceMembers.userId, userId),
  });
  return rows.map(r => r.workspaceId);
}

async function loadOwnedBrand(userId: string, brandId: string) {
  const wsIds = await userWorkspaceIds(userId);
  if (wsIds.length === 0) return null;
  return db.query.brands.findFirst({
    where: and(eq(brands.id, brandId), inArray(brands.workspaceId, wsIds)),
  });
}

async function loadOwnedOrder(userId: string, orderId: string) {
  const wsIds = await userWorkspaceIds(userId);
  if (wsIds.length === 0) return null;
  const order = await db.query.orders.findFirst({ where: eq(orders.id, orderId) });
  if (!order) return null;
  const brand = await db.query.brands.findFirst({
    where: and(eq(brands.id, order.brandId), inArray(brands.workspaceId, wsIds)),
  });
  return brand ? order : null;
}

async function loadOwnedTicket(userId: string, ticketId: string) {
  const wsIds = await userWorkspaceIds(userId);
  if (wsIds.length === 0) return null;
  const ticket = await db.query.tickets.findFirst({
    where: eq(tickets.id, ticketId),
  });
  if (!ticket) return null;
  const brand = await db.query.brands.findFirst({
    where: and(eq(brands.id, ticket.brandId), inArray(brands.workspaceId, wsIds)),
  });
  return brand ? ticket : null;
}

// ---------- seed sample data ------------------------------------------------

// Populates one brand with realistic-looking customers, orders, and tickets
// derived from the same deterministic generator used by the old mock pages.
// Idempotent at the brand-level: skips if rows already exist.
export async function seedDemoData(brandId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: 'Not signed in.' };

  const brand = await loadOwnedBrand(session.user.id, brandId);
  if (!brand) return { ok: false, error: 'Brand not found.' };

  const existing = await db.query.customers.findFirst({
    where: eq(customers.brandId, brand.id),
  });
  if (existing) return { ok: false, error: 'Sample data already exists for this brand.' };

  const productRows = await db.query.products.findMany({
    where: eq(products.brandId, brand.id),
  });
  const productLite = productRows.map(p => ({
    name: p.name,
    price: p.price / 100,
  }));

  // Customers first so we can attach orders + tickets to them.
  const seedCustomers = mockCustomers(brand.id, productLite, 10);
  const customerRows = await db
    .insert(customers)
    .values(
      seedCustomers.map(c => ({
        brandId: brand.id,
        name: c.name,
        email: c.email,
      })),
    )
    .returning();

  // Orders — pick a random customer for each so the join populates.
  const seedOrders = mockOrders(brand.id, productLite, 8);
  if (seedOrders.length > 0 && customerRows.length > 0) {
    await db.insert(orders).values(
      seedOrders.map((o, i) => ({
        brandId: brand.id,
        customerId: customerRows[i % customerRows.length]!.id,
        total: Math.round(o.total * 100),
        itemCount: o.itemCount,
        status: o.status === 'refund req' ? ('refund_requested' as const) : ('paid' as const),
        fulfill: o.fulfill,
        notes: null,
      })),
    );
  }

  // Tickets — same idea, attach a customer and seed an opening message.
  const seedTickets = mockTickets(brand.id, 6);
  for (let i = 0; i < seedTickets.length; i++) {
    const t = seedTickets[i]!;
    const customer = customerRows[i % customerRows.length];
    const dbStatus =
      t.status === 'auto-resolved'
        ? ('resolved' as const)
        : t.status === 'awaiting reply'
          ? ('awaiting' as const)
          : ('open' as const);
    const [created] = await db
      .insert(tickets)
      .values({
        brandId: brand.id,
        customerId: customer?.id ?? null,
        subject: t.subject,
        status: dbStatus,
        aiConfidence: t.ai === '—' ? null : t.ai,
      })
      .returning();
    if (created) {
      await db.insert(ticketMessages).values({
        ticketId: created.id,
        sender: 'customer',
        body: openingMessageFor(t.subject),
      });
      if (dbStatus === 'resolved') {
        await db.insert(ticketMessages).values({
          ticketId: created.id,
          sender: 'agent',
          body: 'Hi! Thanks for reaching out. I checked your account and resolved this — you should see the change within a minute. — Soren',
        });
      }
    }
  }

  revalidatePath('/app/orders');
  revalidatePath('/app/customers');
  revalidatePath('/app/support');
  revalidatePath('/app/dashboard');
  return { ok: true };
}

function openingMessageFor(subject: string): string {
  const map: Record<string, string> = {
    'Where is my order?':
      "Hi, I ordered three days ago and haven't seen any tracking info. Can you check on it?",
    'Sizing question':
      "Hey — I'm between two sizes. Any guidance on how this fits?",
    'Refund request':
      "Hi, this didn't work for me. Could I get a refund? Thanks.",
    'Change shipping address':
      'I just placed an order and need to update the shipping address. Can you help?',
    'Bulk order quote':
      "Hi, looking at ordering 50+ units for our office. Do you offer a quantity discount?",
    'Damaged on arrival':
      'Order arrived but the item is damaged. Photos attached. Hoping for a replacement.',
    'Wrong item received':
      'I think you sent the wrong colour. Order says oat, but I got walnut.',
    'Cancel my order':
      'Need to cancel my order — placed it by mistake. Hopefully it hasn’t shipped yet.',
    'Tracking link broken':
      'The tracking link in my confirmation email goes to a 404. Can you resend?',
    'Product care instructions?':
      'How do I care for this? Is it dishwasher safe / machine washable?',
  };
  return map[subject] ?? 'Hi, hoping you can help with my recent order.';
}

// ---------- order management -----------------------------------------------

const orderUpdateSchema = z.object({
  orderId: z.string().min(1),
  status: z.enum(['paid', 'refund_requested', 'refunded']),
  fulfill: z.enum(['processing', 'shipped', 'delivered', 'fulfilled', 'cancelled']),
  notes: z.string().max(2000).optional().nullable(),
});

export async function updateOrder(
  input: z.infer<typeof orderUpdateSchema>,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: 'Not signed in.' };

  const parsed = orderUpdateSchema.safeParse(input);
  if (!parsed.success) {
    const i = parsed.error.issues[0];
    return { ok: false, error: `${i.path.join('.')}: ${i.message}` };
  }

  const order = await loadOwnedOrder(session.user.id, parsed.data.orderId);
  if (!order) return { ok: false, error: 'Order not found.' };

  await db
    .update(orders)
    .set({
      status: parsed.data.status,
      fulfill: parsed.data.fulfill,
      notes: parsed.data.notes ?? null,
      updatedAt: new Date(),
    })
    .where(eq(orders.id, order.id));

  revalidatePath('/app/orders');
  return { ok: true };
}

// ---------- support reply ---------------------------------------------------

const replySchema = z.object({
  ticketId: z.string().min(1),
  body: z.string().min(1).max(8000),
});

export async function replyToTicket(
  input: z.infer<typeof replySchema>,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: 'Not signed in.' };

  const parsed = replySchema.safeParse(input);
  if (!parsed.success) {
    const i = parsed.error.issues[0];
    return { ok: false, error: `${i.path.join('.')}: ${i.message}` };
  }

  const ticket = await loadOwnedTicket(session.user.id, parsed.data.ticketId);
  if (!ticket) return { ok: false, error: 'Ticket not found.' };

  await db.insert(ticketMessages).values({
    ticketId: ticket.id,
    sender: 'operator',
    body: parsed.data.body,
  });
  // Operator replied → bump status to "awaiting" if it was open / awaiting.
  // If already resolved we leave it alone.
  if (ticket.status !== 'resolved') {
    await db
      .update(tickets)
      .set({ status: 'awaiting', updatedAt: new Date() })
      .where(eq(tickets.id, ticket.id));
  } else {
    await db
      .update(tickets)
      .set({ updatedAt: new Date() })
      .where(eq(tickets.id, ticket.id));
  }

  revalidatePath('/app/support');
  return { ok: true };
}

export async function closeTicket(ticketId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: 'Not signed in.' };

  const ticket = await loadOwnedTicket(session.user.id, ticketId);
  if (!ticket) return { ok: false, error: 'Ticket not found.' };

  await db
    .update(tickets)
    .set({ status: 'resolved', updatedAt: new Date() })
    .where(eq(tickets.id, ticket.id));

  revalidatePath('/app/support');
  return { ok: true };
}

export async function reopenTicket(ticketId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: 'Not signed in.' };

  const ticket = await loadOwnedTicket(session.user.id, ticketId);
  if (!ticket) return { ok: false, error: 'Ticket not found.' };

  await db
    .update(tickets)
    .set({ status: 'open', updatedAt: new Date() })
    .where(eq(tickets.id, ticket.id));

  revalidatePath('/app/support');
  return { ok: true };
}

// ---------- Soren — AI draft for a ticket reply ---------------------------

// Loads the ticket thread + brand identity, asks Claude for a draft reply,
// returns the draft + a self-reported confidence label. We deliberately do
// NOT persist the draft — the operator pastes it into the textarea, edits,
// and clicks Send (which goes through `replyToTicket` like a manual reply).
// Confidence is also written back to the ticket so the inbox row shows
// "AI med" / "AI high" without re-running the model.
export async function draftTicketReply(ticketId: string): Promise<DraftResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: 'Not signed in.' };

  const ticket = await loadOwnedTicket(session.user.id, ticketId);
  if (!ticket) return { ok: false, error: 'Ticket not found.' };

  const brand = await db.query.brands.findFirst({
    where: eq(brands.id, ticket.brandId),
  });
  if (!brand) return { ok: false, error: 'Brand not found.' };

  const customer = ticket.customerId
    ? await db.query.customers.findFirst({
        where: eq(customers.id, ticket.customerId),
      })
    : null;

  const thread = await db.query.ticketMessages.findMany({
    where: eq(ticketMessages.ticketId, ticket.id),
    orderBy: [asc(ticketMessages.createdAt)],
  });
  if (thread.length === 0) {
    return { ok: false, error: 'Nothing to draft from — ticket has no messages yet.' };
  }

  const identity = (brand.identity ?? {}) as Record<string, unknown>;
  const tagline = typeof identity.tagline === 'string' ? identity.tagline : '';

  const senderLabel = (s: 'customer' | 'operator' | 'agent') =>
    s === 'customer' ? (customer?.name ?? 'Customer') : s === 'agent' ? 'Soren (you, earlier)' : 'Operator';

  const transcript = thread
    .map(m => `${senderLabel(m.sender)}:\n${m.body}`)
    .join('\n\n---\n\n');

  const systemPrompt = [
    `You are Soren, the AI customer-support agent for ${brand.name}.`,
    tagline ? `Brand tagline: "${tagline}".` : '',
    'Voice: warm, concise, plainspoken. No corporate filler ("we appreciate your patience"). No upselling. No emojis unless the customer used one first.',
    'Format: a complete reply ready to send. Open with the customer\'s first name if known, otherwise no greeting. End with "— Soren". Keep it under 120 words unless the question genuinely needs more.',
    'If the request is something only a human operator can confirm (issuing a refund, cancelling a fulfilled order, escalations, legal), say so honestly and offer the next step instead of fabricating a resolution.',
    'After the reply body, output exactly one line:',
    'CONFIDENCE: <high|med|low>',
    'high = standard request, draft is ready to send as-is.',
    'med = draft works but needs a quick human review.',
    'low = needs operator judgment — draft is a starting point.',
  ]
    .filter(Boolean)
    .join('\n');

  const userPrompt = [
    `Subject: ${ticket.subject}`,
    customer?.name ? `Customer name: ${customer.name}` : '',
    customer?.email ? `Customer email: ${customer.email}` : '',
    '',
    'Thread (oldest → newest):',
    '',
    transcript,
    '',
    'Draft your reply now.',
  ]
    .filter(Boolean)
    .join('\n');

  let raw = '';
  try {
    const res = await anthropic.messages.create({
      model: BUILDER_MODEL,
      max_tokens: 600,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });
    raw = res.content
      .filter(b => b.type === 'text')
      .map(b => (b as { text: string }).text)
      .join('\n')
      .trim();
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'AI draft failed.';
    return { ok: false, error: msg };
  }

  if (!raw) return { ok: false, error: 'AI returned an empty draft.' };

  // Pull the trailing "CONFIDENCE: high|med|low" off the body.
  const confMatch = raw.match(/CONFIDENCE:\s*(high|med|medium|low)/i);
  let confidence: 'high' | 'medium' | 'low' = 'medium';
  if (confMatch) {
    const v = confMatch[1]!.toLowerCase();
    confidence = v === 'high' ? 'high' : v === 'low' ? 'low' : 'medium';
  }
  const draft = raw.replace(/\n*CONFIDENCE:\s*(high|med|medium|low)\s*$/i, '').trim();

  // Persist the confidence so the inbox list reflects it without a re-run.
  await db
    .update(tickets)
    .set({
      aiConfidence: confidence === 'medium' ? 'med' : confidence,
      updatedAt: new Date(),
    })
    .where(eq(tickets.id, ticket.id));

  revalidatePath('/app/support');
  return { ok: true, draft, confidence };
}
