'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateBrand, deleteBrand } from '@/lib/builder/edit-actions';

type Props = {
  brandId: string;
  initial: {
    name: string;
    tagline: string;
    domain: string;
    hero_headline: string;
    hero_subhead: string;
    primary: string;
    secondary: string;
    accent: string;
  };
};

export function BrandEditor({ brandId, initial }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(initial);

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm(prev => ({ ...prev, [k]: v }));
  }

  function save() {
    setError(null);
    startTransition(async () => {
      const res = await updateBrand({ brandId, ...form });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setOpen(false);
      router.refresh();
    });
  }

  function reset() {
    setForm(initial);
    setError(null);
  }

  function onDelete() {
    if (
      !confirm(
        `Delete ${initial.name}? This removes the brand and all its products. This cannot be undone.`,
      )
    ) {
      return;
    }
    startTransition(async () => {
      try {
        const res = await deleteBrand(brandId);
        if (!res.ok) setError(res.error);
      } catch (err) {
        // Re-throw NEXT_REDIRECT so navigation completes; everything else is real.
        if (
          err &&
          typeof err === 'object' &&
          'digest' in err &&
          typeof (err as { digest: unknown }).digest === 'string' &&
          (err as { digest: string }).digest.startsWith('NEXT_REDIRECT')
        ) {
          throw err;
        }
        setError(err instanceof Error ? err.message : 'Delete failed');
      }
    });
  }

  if (!open) {
    return (
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          type="button"
          className="btn btn-sm"
          onClick={() => setOpen(true)}
        >
          Edit brand
        </button>
        <button
          type="button"
          className="btn btn-sm btn-ghost"
          onClick={onDelete}
          disabled={pending}
          style={{ color: 'var(--rose)' }}
        >
          {pending ? 'Deleting…' : 'Delete'}
        </button>
      </div>
    );
  }

  return (
    <div
      className="panel"
      style={{ margin: '12px 24px 0', maxWidth: 720, padding: 0 }}
    >
      <div className="panel-head">
        <div className="panel-title">Edit brand</div>
        <div className="panel-sub">Changes apply on save</div>
      </div>
      <div style={{ padding: 16, display: 'grid', gap: 12 }}>
        <Field label="Name">
          <input
            style={inputStyle}
            value={form.name}
            onChange={e => set('name', e.target.value)}
          />
        </Field>
        <Field label="Tagline">
          <input
            style={inputStyle}
            value={form.tagline}
            onChange={e => set('tagline', e.target.value)}
          />
        </Field>
        <Field label="Domain (subdomain.forge.shop)">
          <input
            style={{ ...inputStyle, fontFamily: 'var(--font-mono)', fontSize: 12 }}
            value={form.domain}
            onChange={e => set('domain', e.target.value)}
          />
        </Field>
        <Field label="Hero headline">
          <input
            style={inputStyle}
            value={form.hero_headline}
            onChange={e => set('hero_headline', e.target.value)}
          />
        </Field>
        <Field label="Hero subhead">
          <textarea
            rows={2}
            style={{ ...inputStyle, fontFamily: 'var(--font)' }}
            value={form.hero_subhead}
            onChange={e => set('hero_subhead', e.target.value)}
          />
        </Field>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          <ColorField label="Primary" value={form.primary} onChange={v => set('primary', v)} />
          <ColorField label="Secondary" value={form.secondary} onChange={v => set('secondary', v)} />
          <ColorField label="Accent" value={form.accent} onChange={v => set('accent', v)} />
        </div>

        {error && (
          <div
            style={{
              fontSize: 12,
              color: 'var(--rose)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="btn btn-sm btn-ghost"
            onClick={() => {
              reset();
              setOpen(false);
            }}
            disabled={pending}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-sm"
            onClick={reset}
            disabled={pending}
          >
            Reset
          </button>
          <button
            type="button"
            className="btn btn-sm btn-accent"
            onClick={save}
            disabled={pending}
          >
            {pending ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: '8px 10px',
  border: '1px solid var(--border)',
  borderRadius: 6,
  fontSize: 13,
  background: 'var(--surface)',
  color: 'var(--fg)',
  width: '100%',
  outline: 'none',
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{ fontSize: 11, color: 'var(--fg-3)', fontWeight: 500 }}>
        {label}
      </span>
      {children}
    </label>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{ fontSize: 11, color: 'var(--fg-3)', fontWeight: 500 }}>
        {label}
      </span>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <input
          type="color"
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{
            width: 32,
            height: 32,
            border: '1px solid var(--border)',
            borderRadius: 6,
            cursor: 'pointer',
            background: 'none',
            padding: 0,
          }}
        />
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            border: '1px solid var(--border)',
            borderRadius: 6,
            padding: '6px 8px',
            flex: 1,
          }}
        />
      </div>
    </label>
  );
}
