import { eq } from 'drizzle-orm';
import { db, conversations, messages, workspaceMembers } from '@forge/db';

export type EnsureConversationResult =
  | { ok: true; conversationId: string; workspaceId: string }
  | { ok: false; status: number; error: string };

// Ensures the user owns the conversation (or creates a new one for them).
// Returns the conversationId + workspaceId so callers can write rows scoped
// to the right tenant. Used by /api/builder/chat and generate-blueprint.
export async function ensureConversation({
  userId,
  conversationId,
  firstUserMessage,
}: {
  userId: string;
  conversationId?: string;
  firstUserMessage?: string;
}): Promise<EnsureConversationResult> {
  if (conversationId) {
    const conv = await db.query.conversations.findFirst({
      where: eq(conversations.id, conversationId),
    });
    if (!conv) return { ok: false, status: 404, error: 'Conversation not found' };
    if (conv.userId !== userId) {
      return { ok: false, status: 403, error: 'Conversation belongs to another user' };
    }
    return { ok: true, conversationId: conv.id, workspaceId: conv.workspaceId };
  }

  const membership = await db.query.workspaceMembers.findFirst({
    where: eq(workspaceMembers.userId, userId),
  });
  if (!membership) {
    return { ok: false, status: 400, error: 'No workspace for this user' };
  }

  const title = firstUserMessage
    ? truncate(firstUserMessage.replace(/\s+/g, ' ').trim(), 80)
    : 'New chat';

  const [created] = await db
    .insert(conversations)
    .values({ userId, workspaceId: membership.workspaceId, title })
    .returning();

  if (!created) {
    return { ok: false, status: 500, error: 'Could not create conversation' };
  }
  return {
    ok: true,
    conversationId: created.id,
    workspaceId: created.workspaceId,
  };
}

export async function appendMessage(
  conversationId: string,
  role: 'user' | 'assistant',
  content: string,
): Promise<void> {
  if (!content.trim()) return;
  await db.insert(messages).values({ conversationId, role, content });
  // Bump updatedAt on the parent so dashboards can show "active 5m ago".
  await db
    .update(conversations)
    .set({ updatedAt: new Date() })
    .where(eq(conversations.id, conversationId));
}

function truncate(s: string, n: number): string {
  if (s.length <= n) return s;
  return s.slice(0, n - 1).trimEnd() + '…';
}
