'use server';

import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';

import { auth } from '@/lib/auth';
import { db, brands, products, workspaceMembers } from '@forge/db';
import {
  BlueprintSchema,
  type Blueprint,
} from '@/lib/builder/blueprint-schema';

// On success the action calls redirect() (which throws NEXT_REDIRECT) and
// the return type is therefore only the failure shape — TS infers this
// correctly because redirect() is typed as `never`.
export type ApproveResult = { ok: false; error: string };

// Materialise an approved blueprint into a real brand + products in the
// signed-in user's workspace and mark it as published. Phase 3 will replace
// the "publishedAt = now()" flip with a real static export + DNS provisioning;
// for now it's a flag the dashboard reads.
export async function approveBlueprint(
  raw: Blueprint,
): Promise<ApproveResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: 'Not signed in.' };
  }

  // Re-validate on the server even though the client validated — never
  // trust the wire.
  const parsed = BlueprintSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: 'Blueprint failed validation on the server.' };
  }
  const blueprint = parsed.data;

  // Find the user's first workspace (every user has one — created at signup
  // or via the OAuth createUser hook). Multi-workspace UX is Phase 6+.
  const membership = await db.query.workspaceMembers.findFirst({
    where: eq(workspaceMembers.userId, session.user.id),
  });
  if (!membership) {
    return {
      ok: false,
      error: 'No workspace found for this user. Re-sign-up may be needed.',
    };
  }

  const slug = blueprint.domain.replace(/\.forge\.shop$/, '');

  // Transactionless multi-step (Neon HTTP driver doesn't support multi-stmt
  // tx in this driver mode). Worst case: stray brand row with no products if
  // the products insert fails — acceptable for v0; Phase 6 can wrap this in
  // a serverless tx via the Neon WS driver.
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
        // Cents — accept fractional dollars from the model and round to cents.
        price: Math.round(p.price * 100),
        wasPrice: Math.round(p.was * 100),
        description: p.description,
        tone: p.tone,
        position: index,
      })),
    );
  }

  redirect(`/app/preview?brand=${brand.id}`);
}
