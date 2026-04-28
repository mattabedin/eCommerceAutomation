'use client';

import { useState, useTransition } from 'react';
import { BuilderChat } from './builder-chat';
import { StorefrontFrame } from './storefront-frame';
import { BRANDS, type BrandKey, type BuildState } from '@/lib/builder/mock-data';
import type { Blueprint } from '@/lib/builder/blueprint-schema';
import { approveBlueprint } from '@/lib/builder/approve-action';

const initialBuild: BuildState = { active: -1, blueprint: null, status: 'idle' };

export function BuilderWorkspace() {
  // brandKey is only used as a fallback for the storefront preview before any
  // blueprint exists (so the empty state still has visual structure). Once
  // generation completes, we render the real blueprint instead.
  const [brandKey, setBrandKey] = useState<BrandKey>('pawluxe');
  const [buildState, setBuildState] = useState<BuildState>(initialBuild);
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [approving, startApprove] = useTransition();
  const [approveError, setApproveError] = useState<string | null>(null);

  const fallbackBrand = BRANDS[brandKey];

  function handleApprove() {
    if (!blueprint || approving) return;
    setApproveError(null);
    startApprove(async () => {
      try {
        const result = await approveBlueprint(blueprint);
        if (!result.ok) setApproveError(result.error);
        // Success path: server action calls redirect() — Next handles the
        // navigation; this callback never resolves with ok:true.
      } catch (err) {
        // NEXT_REDIRECT errors are rethrown by Next's runtime; anything else
        // is an unexpected failure.
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
