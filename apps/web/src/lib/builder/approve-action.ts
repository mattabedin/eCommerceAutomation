'use server';

import { redirect } from 'next/navigation';
import { eq, and } from 'drizzle-orm';

import { auth } from '@/lib/auth';
import {
  db,
  brands,
  products,
  conversations,
  workspaceMembers,
} from '@forge/db';
import {
  BlueprintSchema,
  type Blueprint,
} from '@/lib/builder/blueprint-schema';

export type ApproveResult = { ok: false; error: string };

// Anything thrown here other than NEXT_REDIRECT is a real bug; we catch and
// return so the BuilderChat surface shows a useful message instead of the
// masked production "Server Components render" stack trace.
export async function approveBlueprint(
  raw: Blueprint,
  conversationId?: string,
): Promise<ApproveResult> {
  try {
    return await runApprove(raw, conversationId);
  } catch (err) {
    // Re-throw NEXT_REDIRECT so Next handles the navigation. Anything else is
    // an unexpected server failure — log it (visible in Vercel runtime logs)
    // and return a clean error to the caller.
    if (
      err &&
      typeof err === 'object' &&
      'digest' in err &&
      typeof (err as { digest: unknown }).digest === 'string' &&
      (err as { digest: string }).digest.startsWith('NEXT_REDIRECT')
    ) {
      throw err;
    }
    const message = err instanceof Error ? err.message : 'Unknown error';
    const stack = err instanceof Error ? err.stack : undefined;
    console.error('[approveBlueprint] failed:', message, stack);
    return { ok: false, error: `Approve failed: ${message}` };
  }
}

async function runApprove(
  raw: Blueprint,
  conversationId?: string,
): Promise<ApproveResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: 'Not signed in.' };
  }
  const userId = session.user.id;

  const parsed = BlueprintSchema.safeParse(raw);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return {
      ok: false,
      error: `Blueprint failed validation: ${issue?.path.join('.')}: ${issue?.message}`,
    };
  }
  const blueprint = parsed.data;

  const membership = await db.query.workspaceMembers.findFirst({
    where: eq(workspaceMembers.userId, userId),
  });
  if (!membership) {
    return {
      ok: false,
      error: 'No workspace found for this user. Re-sign-up may be needed.',
    };
  }

  const slug = blueprint.domain.replace(/\.forge\.shop$/, '');

  const [brand] = await db
    .insert(brands)
    .values({
      workspaceId: membership.workspaceId,
      name: blueprint.brand_name,
      slug,
      domain: blueprint.domain,
      identity: blueprint,
      publishedAt: new Date(),
    })
    .returning();

  if (!brand) {
    return { ok: false, error: 'Could not create the brand record.' };
  }

  if (blueprint.products.length > 0) {
    await db.insert(products).values(
      blueprint.products.map((p, index) => ({
        brandId: brand.id,
        name: p.name,
        category: p.category,
        // Blueprint generates a single category today; store it as a 1-tag
        // categories array so the new multi-category UI has something to show.
        categories: [p.category],
        price: Math.round(p.price * 100),
        wasPrice: Math.round(p.was * 100),
        description: p.description,
        tone: p.tone,
        position: index,
      })),
    );
  }

  // Best-effort link-back. If the conversation table doesn't exist (Phase 2E
  // migration not yet applied) or the conversation belongs to someone else,
  // we still want approval to succeed — log and continue.
  if (conversationId) {
    try {
      await db
        .update(conversations)
        .set({ brandId: brand.id, updatedAt: new Date() })
        .where(
          and(
            eq(conversations.id, conversationId),
            eq(conversations.userId, userId),
          ),
        );
    } catch (err) {
      console.warn(
        '[approveBlueprint] could not link conversation → brand:',
        err instanceof Error ? err.message : err,
      );
    }
  }

  redirect(`/app/preview?brand=${brand.id}`);
}
