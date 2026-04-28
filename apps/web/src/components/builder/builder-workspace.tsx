'use client';

import { useState } from 'react';
import { BuilderChat } from './builder-chat';
import { StorefrontFrame } from './storefront-frame';
import { BRANDS, type BrandKey, type BuildState } from '@/lib/builder/mock-data';

const initialBuild: BuildState = { active: -1, blueprint: null, status: 'idle' };

export function BuilderWorkspace() {
  const [brandKey, setBrandKey] = useState<BrandKey>('pawluxe');
  const [buildState, setBuildState] = useState<BuildState>(initialBuild);
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');

  const brand = BRANDS[brandKey];

  function handleApprove() {
    // Phase 2D will materialise the blueprint into real DB rows + trigger publish.
    // For 2A we just acknowledge.
    alert(
      `Approve & publish — Phase 2D will create the products, pages, and theme in your workspace, then trigger the first deploy to ${brand.domain}.`,
    );
  }

  return (
    <div className="builder-split">
      <BuilderChat
        brand={brand}
        brandKey={brandKey}
        setBrandKey={setBrandKey}
        buildState={buildState}
        setBuildState={setBuildState}
        onApprove={handleApprove}
        gateApproval
      />
      <StorefrontFrame
        brand={brand}
        brandKey={brandKey}
        buildState={buildState}
        device={device}
        setDevice={setDevice}
      />
    </div>
  );
}
