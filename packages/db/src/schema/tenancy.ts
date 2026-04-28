import {
  pgTable,
  text,
  timestamp,
  primaryKey,
  jsonb,
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
  // The original prompt the AI Builder used to generate this brand.
  prompt: text('prompt'),
  // Brand colors, voice, and other AI-generated identity fields.
  // Shape evolves with Phase 2; jsonb keeps it flexible for now.
  identity: jsonb('identity'),
  createdAt: timestamp('createdAt', { mode: 'date' }).notNull().defaultNow(),
});
