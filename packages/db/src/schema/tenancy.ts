import {
  pgTable,
  text,
  timestamp,
  primaryKey,
  jsonb,
  integer,
} from 'drizzle-orm/pg-core';
import { users } from './auth';

// A workspace is the top-level tenant. One user can be a member of many workspaces.
export const workspaces = pgTable('workspace', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  ownerId: text('ownerId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('createdAt', { mode: 'date' }).notNull().defaultNow(),
});

// A user's role inside a workspace. Owner is created on workspace creation.
export const workspaceMembers = pgTable(
  'workspace_member',
  {
    workspaceId: text('workspaceId')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    role: text('role', { enum: ['owner', 'admin', 'member'] })
      .notNull()
      .default('member'),
    createdAt: timestamp('createdAt', { mode: 'date' }).notNull().defaultNow(),
  },
  wm => ({
    pk: primaryKey({ columns: [wm.workspaceId, wm.userId] }),
  }),
);

// A brand is what a customer-facing store represents (e.g. PawLuxe, DeskNova).
// Owned by a workspace.
export const brands = pgTable('brand', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  workspaceId: text('workspaceId')
    .notNull()
    .references(() => workspaces.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  domain: text('domain'),
  // The original prompt the AI Builder used to generate this brand.
  prompt: text('prompt'),
  // Brand colors, voice, hero copy, categories, etc. — the structured
  // Blueprint shape (see apps/web/src/lib/builder/blueprint-schema.ts).
  identity: jsonb('identity'),
  // Null = draft; set when the operator approves and we trigger the publish
  // job. Phase 3 replaces the publish stub with a real static export + DNS.
  publishedAt: timestamp('publishedAt', { mode: 'date' }),
  createdAt: timestamp('createdAt', { mode: 'date' }).notNull().defaultNow(),
});

// Products attached to a brand. One row per AI-generated product. Money in
// minor units (cents) as integers per the backend convention.
export const products = pgTable('product', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  brandId: text('brandId')
    .notNull()
    .references(() => brands.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  category: text('category').notNull(),
  // Both prices in cents. wasPrice is the compare-at — used for the visual
  // "was $129" strikethrough. wasPrice should be > price.
  price: integer('price').notNull(),
  wasPrice: integer('wasPrice').notNull(),
  description: text('description'),
  // Hex color (#xxxxxx) used for the product tile visual in the preview.
  tone: text('tone'),
  // Display ordering inside the brand. Ascending — lower comes first.
  position: integer('position').notNull().default(0),
  createdAt: timestamp('createdAt', { mode: 'date' }).notNull().defaultNow(),
});

// A conversation is one AI Builder session — a set of messages that may have
// produced a brand (when the operator clicked Approve). Conversations live
// alongside brands so the dashboard can show "recent chats" even if they
// never resulted in a published store.
export const conversations = pgTable('conversation', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  workspaceId: text('workspaceId')
    .notNull()
    .references(() => workspaces.id, { onDelete: 'cascade' }),
  userId: text('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  // Auto-derived from the first user message; truncated for display.
  title: text('title'),
  // Set when the conversation produced a brand via approveBlueprint. Null
  // means draft / abandoned. Set null on brand delete so abandoned chats
  // survive a brand deletion.
  brandId: text('brandId').references(() => brands.id, { onDelete: 'set null' }),
  createdAt: timestamp('createdAt', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).notNull().defaultNow(),
});

// Individual chat turns inside a conversation. Persisted as the user types
// and as the assistant streams; client reload reads these back to resume.
export const messages = pgTable('message', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  conversationId: text('conversationId')
    .notNull()
    .references(() => conversations.id, { onDelete: 'cascade' }),
  role: text('role', { enum: ['user', 'assistant'] }).notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('createdAt', { mode: 'date' }).notNull().defaultNow(),
});

// Phase 4B runtime tables — real customer / order / ticket records the
// operator can edit and respond to. Seed data is generated on demand via a
// server action; later phases replace seed-on-demand with live integrations
// (Stripe orders, Klaviyo customers, Forge-native tickets).

export const customers = pgTable('customer', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  brandId: text('brandId')
    .notNull()
    .references(() => brands.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  email: text('email').notNull(),
  createdAt: timestamp('createdAt', { mode: 'date' }).notNull().defaultNow(),
});

export const orders = pgTable('order', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  brandId: text('brandId')
    .notNull()
    .references(() => brands.id, { onDelete: 'cascade' }),
  customerId: text('customerId').references(() => customers.id, {
    onDelete: 'set null',
  }),
  // Cents.
  total: integer('total').notNull(),
  itemCount: integer('itemCount').notNull().default(1),
  status: text('status', { enum: ['paid', 'refund_requested', 'refunded'] })
    .notNull()
    .default('paid'),
  fulfill: text('fulfill', {
    enum: ['processing', 'shipped', 'delivered', 'fulfilled', 'cancelled'],
  })
    .notNull()
    .default('processing'),
  notes: text('notes'),
  createdAt: timestamp('createdAt', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).notNull().defaultNow(),
});

export const tickets = pgTable('ticket', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  brandId: text('brandId')
    .notNull()
    .references(() => brands.id, { onDelete: 'cascade' }),
  customerId: text('customerId').references(() => customers.id, {
    onDelete: 'set null',
  }),
  subject: text('subject').notNull(),
  status: text('status', { enum: ['open', 'awaiting', 'resolved'] })
    .notNull()
    .default('open'),
  // Soren's confidence on auto-resolving. "—" when no AI suggestion.
  aiConfidence: text('aiConfidence'),
  createdAt: timestamp('createdAt', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).notNull().defaultNow(),
});

export const ticketMessages = pgTable('ticket_message', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  ticketId: text('ticketId')
    .notNull()
    .references(() => tickets.id, { onDelete: 'cascade' }),
  sender: text('sender', { enum: ['customer', 'operator', 'agent'] }).notNull(),
  body: text('body').notNull(),
  createdAt: timestamp('createdAt', { mode: 'date' }).notNull().defaultNow(),
});
