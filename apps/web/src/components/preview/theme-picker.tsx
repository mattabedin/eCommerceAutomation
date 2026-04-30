'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { THEMES, type ThemeId } from '@/lib/storefront/themes';
import { updateBrandTheme } from '@/lib/builder/edit-actions';

const ORDER: ThemeId[] = [
  'editorial',
  'minimal',
  'bold',
  'lookbook',
  'boutique',
  'tech',
  'vintage',
  'playful',
  'brutalist',
  'catalog',
];

export function ThemePicker({
  brandId,
  current,
}: {
  brandId: string;
  current: ThemeId;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function pick(id: ThemeId) {
    if (id === current) {
      setOpen(false);
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await updateBrandTheme({ brandId, theme: id });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setOpen(false);
      router.refresh();
    });
  }

  const currentTheme = THEMES[current];

  return (
    <>
      <button
        type="button"
        className="btn btn-sm btn-ghost"
        onClick={() => setOpen(true)}
        disabled={pending}
      >
        Theme · {currentTheme.name}
      </button>
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.45)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            padding: '64px 24px 24px',
            zIndex: 1000,
            overflow: 'auto',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: 920,
              width: '100%',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-lg)',
              padding: 24,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                marginBottom: 4,
              }}
            >
              <h2 style={{ fontSize: 20, margin: 0 }}>Pick a theme</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--fg-3)',
                  cursor: 'pointer',
                  fontSize: 20,
                  padding: 0,
                }}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <p style={{ color: 'var(--fg-3)', fontSize: 13, margin: '0 0 16px' }}>
              Themes change the layout, typography, and styling of your storefront.
              Your products, copy, and palette stay the same — switch any time.
            </p>
            {error && (
              <div
                style={{
                  padding: '8px 12px',
                  fontSize: 12,
                  color: 'var(--rose)',
                  background: 'var(--surface-2)',
                  borderRadius: 6,
                  marginBottom: 12,
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {error}
              </div>
            )}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: 12,
              }}
            >
              {ORDER.map(id => {
                const t = THEMES[id];
                const active = id === current;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => pick(id)}
                    disabled={pending}
                    style={{
                      textAlign: 'left',
                      padding: 14,
                      background: active ? 'var(--surface-2)' : 'var(--surface)',
                      border: active
                        ? '2px solid var(--fg)'
                        : '1px solid var(--border)',
                      borderRadius: 'var(--radius)',
                      cursor: pending ? 'wait' : 'pointer',
                      transition: 'transform 0.15s, box-shadow 0.15s',
                    }}
                  >
                    <ThemeMiniature themeId={id} />
                    <div
                      style={{
                        marginTop: 10,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'baseline',
                      }}
                    >
                      <span style={{ fontWeight: 500, fontSize: 14 }}>{t.name}</span>
                      {active && (
                        <span
                          style={{
                            fontSize: 10,
                            fontFamily: 'var(--font-mono)',
                            letterSpacing: '0.06em',
                            color: 'var(--fg-3)',
                          }}
                        >
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        fontSize: 11.5,
                        color: 'var(--fg-3)',
                        lineHeight: 1.45,
                        marginTop: 4,
                      }}
                    >
                      {t.description}
                    </div>
                    <div
                      style={{
                        fontSize: 10.5,
                        color: 'var(--fg-4)',
                        fontFamily: 'var(--font-mono)',
                        letterSpacing: '0.04em',
                        marginTop: 8,
                        textTransform: 'uppercase',
                      }}
                    >
                      {t.bestFor}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Mini visual preview card per theme — pure CSS, no real product data.
// Each one tries to capture the layout + typography flavour at a glance.
function ThemeMiniature({ themeId }: { themeId: ThemeId }) {
  const palette: Record<ThemeId, { bg: string; ink: string; accent: string }> = {
    editorial: { bg: '#fff', ink: '#222', accent: '#6366F1' },
    minimal: { bg: '#fff', ink: '#111', accent: '#888' },
    bold: { bg: '#0a0a0a', ink: '#fff', accent: '#ff3b30' },
    lookbook: { bg: '#fdf9f3', ink: '#222', accent: '#a4805c' },
    boutique: { bg: '#faf6ee', ink: '#3a2f23', accent: '#bfa46a' },
    tech: { bg: '#fafafa', ink: '#111', accent: '#3b82f6' },
    vintage: { bg: '#f6efe2', ink: '#2b2b1f', accent: '#a85a3a' },
    playful: { bg: '#fff7f1', ink: '#1d1d1d', accent: '#ff7a59' },
    brutalist: { bg: '#fafafa', ink: '#000', accent: '#000' },
    catalog: { bg: '#fff', ink: '#222', accent: '#444' },
  };
  const p = palette[themeId];
  return (
    <div
      style={{
        height: 96,
        borderRadius: 'var(--radius-sm)',
        background: p.bg,
        border: '1px solid var(--border)',
        padding: 10,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: '40%',
          height: 6,
          background: p.ink,
          borderRadius: 1,
          marginBottom: 8,
        }}
      />
      <div
        style={{
          width: '70%',
          height: 14,
          background: p.ink,
          borderRadius: 2,
          marginBottom: 4,
          fontFamily: themeId === 'tech' || themeId === 'brutalist' ? 'var(--font-mono)' : 'var(--font-serif)',
        }}
      />
      <div style={{ width: '50%', height: 14, background: p.ink, borderRadius: 2, opacity: 0.7 }} />
      <div
        style={{
          position: 'absolute',
          right: 10,
          bottom: 10,
          width: 36,
          height: 36,
          borderRadius:
            themeId === 'playful'
              ? 999
              : themeId === 'bold' || themeId === 'brutalist' || themeId === 'vintage'
                ? 0
                : 6,
          background: p.accent,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 10,
          bottom: 10,
          width: 28,
          height: 28,
          borderRadius:
            themeId === 'playful'
              ? 999
              : themeId === 'bold' || themeId === 'brutalist' || themeId === 'vintage'
                ? 0
                : 6,
          background: p.ink,
          opacity: 0.18,
        }}
      />
    </div>
  );
}
