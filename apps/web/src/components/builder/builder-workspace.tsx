'use client';

import { useState } from 'react';
import { BuilderChat } from './builder-chat';
import { StorefrontFrame } from './storefront-frame';
import { BRANDS, type BrandKey, type BuildState } from '@/lib/builder/mock-data';
import type { Blueprint } from '@/lib/builder/blueprint-schema';

const initialBuild: BuildState = { active: -1, blueprint: null, status: 'idle' };

export function BuilderWorkspace() {
  // brandKey is only used as a fallback for the storefront preview before any
  // blueprint exists (so the empty state still has visual structure). Once
  // generation completes, we render the real blueprint instead.
  const [brandKey, setBrandKey] = useState<BrandKey>('pawluxe');
  const [buildState, setBuildState] = useState<BuildState>(initialBuild);
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');

  const fallbackBrand = BRANDS[brandKey];

  function handleApprove() {
    // Phase 2D will materialise the blueprint into real DB rows + trigger publish.
    if (!blueprint) {
      alert(
        'Phase 2D will create the products, pages, and theme in your workspace, then trigger the first deploy.',
      );
      return;
    }
    alert(
      `Approve & publish — Phase 2D will materialise ${blueprint.brand_name} (${blueprint.products.length} products) into your workspace and deploy to ${blueprint.domain}.`,
    );
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
