'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { seedDemoData } from '@/lib/builder/runtime-actions';

export function SeedDemoDataButton({
  brandId,
  label = 'Seed sample data',
}: {
  brandId: string;
  label?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onClick() {
    setError(null);
    startTransition(async () => {
      const res = await seedDemoData(brandId);
      if (!res.ok) setError(res.error);
      else router.refresh();
    });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <button
        type="button"
        className="btn btn-sm btn-accent"
        onClick={onClick}
        disabled={pending}
      >
        {pending ? 'Seeding…' : label}
      </button>
      {error && (
        <span
          style={{
            fontSize: 11,
            color: 'var(--rose)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          {error}
        </span>
      )}
    </div>
  );
}
