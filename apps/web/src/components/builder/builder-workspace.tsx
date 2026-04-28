'use client';

import { useState, useTransition } from 'react';
import { BuilderChat } from './builder-chat';
import { StorefrontFrame } from './storefront-frame';
import { BRANDS, type BrandKey, type BuildState } from '@/lib/builder/mock-data';
import type { Blueprint } from '@/lib/builder/blueprint-schema';
import type { ChatMessage } from '@/lib/builder/chat-types';
import { approveBlueprint } from '@/lib/builder/approve-action';

const initialBuild: BuildState = { active: -1, blueprint: null, status: 'idle' };

export function BuilderWorkspace({
  initialConversationId,
  initialMessages,
}: {
  initialConversationId?: string;
  initialMessages?: ChatMessage[];
} = {}) {
  const [brandKey, setBrandKey] = useState<BrandKey>('pawluxe');
  const [buildState, setBuildState] = useState<BuildState>(initialBuild);
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [conversationId, setConversationId] = useState<string | undefined>(
    initialConversationId,
  );
  const [approving, startApprove] = useTransition();
  const [approveError, setApproveError] = useState<string | null>(null);

  const fallbackBrand = BRANDS[brandKey];

  function handleConversationId(id: string) {
    setConversationId(id);
    // Reflect the conversation in the URL so refresh resumes the same chat.
    if (typeof window !== 'undefined' && id !== initialConversationId) {
      const url = new URL(window.location.href);
      if (url.searchParams.get('id') !== id) {
        url.searchParams.set('id', id);
        window.history.replaceState({}, '', url.toString());
      }
    }
  }

  function handleApprove() {
    if (!blueprint || approving) return;
    setApproveError(null);
    startApprove(async () => {
      try {
        const result = await approveBlueprint(blueprint, conversationId);
        if (!result.ok) setApproveError(result.error);
      } catch (err) {
        if (
          err &&
          typeof err === 'object' &&
          'digest' in err &&
          typeof (err as { digest: unknown }).digest === 'string' &&
          (err as { digest: string }).digest.startsWith('NEXT_REDIRECT')
        ) {
          throw err;
        }
        setApproveError(err instanceof Error ? err.message : 'Approval failed');
      }
    });
  }

  return (
    <div className="builder-split">
      <BuilderChat
        fallbackBrand={fallbackBrand}
        brandKey={brandKey}
        setBrandKey={setBrandKey}
        buildState={buildState}
        setBuildState={setBuildState}
        blueprint={blueprint}
        setBlueprint={setBlueprint}
        conversationId={conversationId}
        onConversationId={handleConversationId}
        initialMessages={initialMessages}
        onApprove={handleApprove}
        approving={approving}
        approveError={approveError}
        gateApproval
      />
      <StorefrontFrame
        fallbackBrand={fallbackBrand}
        brandKey={brandKey}
        blueprint={blueprint}
        buildState={buildState}
        device={device}
        setDevice={setDevice}
      />
    </div>
  );
}
