import Link from 'next/link';

import type { HeroLayout } from '@/lib/storefront/themes';
import { HeroTrustBadges } from '@/components/storefront/trust-badges';

type HeroProduct = {
  id: string;
  name: string;
  tone: string | null;
};

export function StorefrontHero({
  layout,
  brandSlug,
  brandName,
  headline,
  subhead,
  showTrustBadges,
  topProducts,
}: {
  layout: HeroLayout;
  brandSlug: string;
  brandName: string;
  headline: string;
  subhead?: string;
  showTrustBadges: boolean;
  topProducts: HeroProduct[];
}) {
  const heroParts = headline.split(' ');
  const heroLast = heroParts.slice(-1).join(' ');
  const heroLead = heroParts.slice(0, -1).join(' ');
  const tones = topProducts.map(p => p.tone).filter(Boolean) as string[];

  switch (layout) {
    case 'full-bleed':
      return (
        <FullBleedHero
          brandSlug={brandSlug}
          heroLead={heroLead}
          heroLast={heroLast}
          subhead={subhead}
          showTrustBadges={showTrustBadges}
          tones={tones}
        />
      );
    case 'centered':
      return (
        <CenteredHero
          brandSlug={brandSlug}
          brandName={brandName}
          heroLead={heroLead}
          heroLast={heroLast}
          subhead={subhead}
          showTrustBadges={showTrustBadges}
        />
      );
    case 'tile-hero':
      return (
        <TileHero
          brandSlug={brandSlug}
          heroLead={heroLead}
          heroLast={heroLast}
          subhead={subhead}
          showTrustBadges={showTrustBadges}
          topProducts={topProducts.slice(0, 4)}
        />
      );
    case 'split':
    default:
      return (
        <SplitHero
          brandSlug={brandSlug}
          heroLead={heroLead}
          heroLast={heroLast}
          subhead={subhead}
          showTrustBadges={showTrustBadges}
          tones={tones}
        />
      );
  }
}

function SplitHero({
  brandSlug,
  heroLead,
  heroLast,
  subhead,
  showTrustBadges,
  tones,
}: {
  brandSlug: string;
  heroLead: string;
  heroLast: string;
  subhead?: string;
  showTrustBadges: boolean;
  tones: string[];
}) {
  const heroBg =
    tones.length >= 2
      ? `linear-gradient(135deg, ${tones[0]}cc, ${tones[1]}99)`
      : `linear-gradient(135deg, var(--brand-secondary, #888) 33%, var(--brand-primary, #222))`;
  return (
    <section className="store-hero">
      <div>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'var(--fg-3)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: 14,
          }}
        >
          New collection · 2026
        </div>
        <h1 style={{ color: 'var(--brand-primary)' }}>
          {heroLead}{' '}
          <em style={{ color: 'var(--brand-secondary)' }}>{heroLast}</em>
        </h1>
        {subhead && <p>{subhead}</p>}
        <Link href={`/s/${brandSlug}#featured`} className="btn-brand">
          Shop the collection →
        </Link>
        {showTrustBadges && <HeroTrustBadges />}
      </div>
      <div className="hero-img" style={{ background: heroBg }} />
    </section>
  );
}

function FullBleedHero({
  brandSlug,
  heroLead,
  heroLast,
  subhead,
  showTrustBadges,
  tones,
}: {
  brandSlug: string;
  heroLead: string;
  heroLast: string;
  subhead?: string;
  showTrustBadges: boolean;
  tones: string[];
}) {
  const bg =
    tones.length >= 2
      ? `linear-gradient(120deg, ${tones[0]}, ${tones[1]})`
      : `linear-gradient(120deg, var(--brand-primary, #111), var(--brand-secondary, #555))`;
  return (
    <section className="store-hero-fullbleed">
      <div className="bg" style={{ background: bg }} />
      <div className="copy">
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.7)',
            marginBottom: 14,
          }}
        >
          Now in season
        </div>
        <h1>
          {heroLead}{' '}
          <em>{heroLast}</em>
        </h1>
        {subhead && <p>{subhead}</p>}
        <Link href={`/s/${brandSlug}#featured`} className="btn-brand">
          Shop the collection →
        </Link>
        {showTrustBadges && <HeroTrustBadges />}
      </div>
    </section>
  );
}

function CenteredHero({
  brandSlug,
  brandName,
  heroLead,
  heroLast,
  subhead,
  showTrustBadges,
}: {
  brandSlug: string;
  brandName: string;
  heroLead: string;
  heroLast: string;
  subhead?: string;
  showTrustBadges: boolean;
}) {
  return (
    <section className="store-hero-centered">
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: 'var(--fg-3)',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
        }}
      >
        {brandName}
      </div>
      <h1 style={{ color: 'var(--brand-primary)' }}>
        {heroLead}{' '}
        <em style={{ color: 'var(--brand-secondary)' }}>{heroLast}</em>
      </h1>
      {subhead && <p>{subhead}</p>}
      <Link href={`/s/${brandSlug}#featured`} className="btn-brand">
        Shop the collection →
      </Link>
      {showTrustBadges && <HeroTrustBadges />}
    </section>
  );
}

function TileHero({
  brandSlug,
  heroLead,
  heroLast,
  subhead,
  showTrustBadges,
  topProducts,
}: {
  brandSlug: string;
  heroLead: string;
  heroLast: string;
  subhead?: string;
  showTrustBadges: boolean;
  topProducts: HeroProduct[];
}) {
  const cells = topProducts.length >= 4
    ? topProducts.slice(0, 4)
    : [
        ...topProducts,
        ...Array.from({ length: 4 - topProducts.length }, (_, i) => ({
          id: `placeholder-${i}`,
          name: '',
          tone: null,
        })),
      ];
  return (
    <section className="store-hero-tile">
      <div>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'var(--fg-3)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: 14,
          }}
        >
          New collection · 2026
        </div>
        <h1 style={{ color: 'var(--brand-primary)' }}>
          {heroLead}{' '}
          <em style={{ color: 'var(--brand-secondary)' }}>{heroLast}</em>
        </h1>
        {subhead && <p>{subhead}</p>}
        <Link href={`/s/${brandSlug}#featured`} className="btn-brand">
          Shop the collection →
        </Link>
        {showTrustBadges && <HeroTrustBadges />}
      </div>
      <div className="store-hero-tile-grid">
        {cells.map((c, i) => (
          <Link
            key={c.id || `c-${i}`}
            href={c.id.startsWith('placeholder-') ? `/s/${brandSlug}#featured` : `/s/${brandSlug}/p/${c.id}`}
            className="store-hero-tile-cell"
            style={{
              background: c.tone
                ? `linear-gradient(135deg, ${c.tone}66, ${c.tone}cc)`
                : 'var(--surface-2)',
              textDecoration: 'none',
            }}
          />
        ))}
      </div>
    </section>
  );
}
