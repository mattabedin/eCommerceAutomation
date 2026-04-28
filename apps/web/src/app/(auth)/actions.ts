'use server';

import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { AuthError } from 'next-auth';

import { db, users, workspaces, workspaceMembers } from '@forge/db';
import { signIn } from '@/lib/auth';

const signupSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(8, 'Use at least 8 characters').max(128),
  name: z.string().min(1).max(80).optional(),
});

const loginSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(1).max(128),
});

export type ActionResult =
  | { ok: true }
  | { ok: false; error: string; field?: string };

function workspaceSlugFor(email: string): string {
  const local = email.split('@')[0]?.toLowerCase().replace(/[^a-z0-9]/g, '-') ?? 'workspace';
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${local || 'ws'}-${suffix}`;
}

export async function signupAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = signupSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    name: formData.get('name') || undefined,
  });
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { ok: false, error: issue.message, field: issue.path[0]?.toString() };
  }

  const email = parsed.data.email.toLowerCase();
  const existing = await db.query.users.findFirst({
    where: eq(users.email, email),
  });
  if (existing) {
    return { ok: false, error: 'An account with that email already exists.', field: 'email' };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  // Transactionless multi-step (Neon HTTP driver doesn't support tx).
  // Worst case: a stray empty workspace if the membership insert fails — acceptable for v0.
  const [user] = await db
    .insert(users)
    .values({ email, name: parsed.data.name ?? null, passwordHash })
    .returning();
  if (!user) {
    return { ok: false, error: 'Could not create account. Please try again.' };
  }

  const [workspace] = await db
    .insert(workspaces)
    .values({
      name: parsed.data.name ? `${parsed.data.name}'s workspace` : 'My workspace',
      slug: workspaceSlugFor(email),
      ownerId: user.id,
    })
    .returning();
  if (workspace) {
    await db.insert(workspaceMembers).values({
      workspaceId: workspace.id,
      userId: user.id,
      role: 'owner',
    });
  }

  // Sign in via the credentials provider. We let signIn() do the redirect
  // itself (rather than calling next/navigation's redirect after) — when
  // signIn returns normally, the Set-Cookie header for the session JWT
  // doesn't make it to the browser before redirect() throws. Letting signIn
  // own the redirect ensures the cookie + Location header land in one
  // response.
  try {
    await signIn('credentials', {
      email,
      password: parsed.data.password,
      redirectTo: '/app/builder',
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return {
        ok: false,
        error: 'Account created but auto-sign-in failed. Please log in.',
      };
    }
    // NEXT_REDIRECT errors must bubble up so Next.js handles the redirect.
    throw err;
  }
  // Unreachable — signIn either redirects or throws.
  return { ok: true };
}

export async function loginAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { ok: false, error: issue.message, field: issue.path[0]?.toString() };
  }

  try {
    await signIn('credentials', {
      email: parsed.data.email.toLowerCase(),
      password: parsed.data.password,
      redirectTo: '/app/dashboard',
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return { ok: false, error: 'Invalid email or password.' };
    }
    throw err;
  }
  return { ok: true };
}

// OAuth sign-in via form action. signIn() throws NEXT_REDIRECT internally
// when redirect is enabled, which next/navigation handles correctly.
export async function signInWithGoogle() {
  await signIn('google', { redirectTo: '/app/dashboard' });
}

export async function signInWithMicrosoft() {
  await signIn('microsoft-entra-id', { redirectTo: '/app/dashboard' });
}
