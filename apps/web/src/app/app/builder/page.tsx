import { eq, asc, and } from 'drizzle-orm';

import { auth } from '@/lib/auth';
import { db, conversations, messages as msgTable } from '@forge/db';
import { BuilderWorkspace } from '@/components/builder/builder-workspace';
import type { ChatMessage } from '@/lib/builder/chat-types';

export const metadata = {
  title: 'AI Builder — Forge',
};

export const dynamic = 'force-dynamic';

type PageProps = {
  searchParams?: { id?: string };
};

export default async function BuilderPage({ searchParams }: PageProps) {
  const session = await auth();
  // Middleware already enforces auth on /app/*; defence-in-depth here.
  if (!session?.user?.id) {
    return <BuilderWorkspace />;
  }

  const conversationId = searchParams?.id;
  if (!conversationId) {
    return <BuilderWorkspace />;
  }

  // Verify ownership before exposing any messages.
  const conv = await db.query.conversations.findFirst({
    where: and(
      eq(conversations.id, conversationId),
      eq(conversations.userId, session.user.id),
    ),
  });
  if (!conv) {
    // Treat unknown / not-yours as a fresh chat — fail-soft over leaking.
    return <BuilderWorkspace />;
  }

  const rows = await db.query.messages.findMany({
    where: eq(msgTable.conversationId, conv.id),
    orderBy: [asc(msgTable.createdAt)],
  });

  const initialMessages: ChatMessage[] = rows.map(r => ({
    role: r.role as 'user' | 'assistant',
    content: r.content,
  }));

  return (
    <BuilderWorkspace
      initialConversationId={conv.id}
      initialMessages={initialMessages}
    />
  );
}
