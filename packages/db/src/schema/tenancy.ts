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
