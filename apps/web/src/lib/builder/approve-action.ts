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

export async function approveBlueprint(
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
    return { ok: false, error: 'Blueprint failed validation on the server.' };
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
        price: Math.round(p.price * 100),
        wasPrice: Math.round(p.was * 100),
        description: p.description,
        tone: p.tone,
        position: index,
      })),
    );
  }

  // Link the conversation back to the brand it produced. Verifies the
  // conversation belongs to this user before mutating.
  if (conversationId) {
    await db
      .update(conversations)
      .set({ brandId: brand.id, updatedAt: new Date() })
      .where(
        and(
          eq(conversations.id, conversationId),
          eq(conversations.userId, userId),
        ),
      );
  }

  redirect(`/app/preview?brand=${brand.id}`);
}
