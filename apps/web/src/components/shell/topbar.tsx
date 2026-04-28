'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Icon } from '@/components/icons';
import { CURRENT_BRAND, VIEW_LABELS } from './nav-config';

type Theme = 'light' | 'dark';
const STORAGE_KEY = 'forge.theme';

export function Topbar() {
  const pathname = usePathname();
  const viewId = pathname?.split('/')[2] ?? 'dashboard';
  const viewLabel = VIEW_LABELS[viewId] ?? 'Dashboard';

  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const stored =
      (typeof window !== 'undefined' &&
        (localStorage.getItem(STORAGE_KEY) as Theme | null)) ||
      null;
    if (stored === 'dark' || stored === 'light') {
      setTheme(stored);
      document.documentElement.dataset.theme = stored;
    }
  }, []);

  function toggleTheme() {
    const next: Theme = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore storage errors
    }
  }

  return (
    <header className="topbar">
      <div className="crumbs">
        <span>{CURRENT_BRAND.name}</span>
        <span className="sep">/</span>
        <strong>{viewLabel}</strong>
      </div>
      <div className="topbar-actions">
        <button className="btn btn-sm btn-ghost" type="button">
          <Icon name="sparkle" />
          <span>Ask Forge</span>
          <span className="kbd">⌘K</span>
        </button>
        <button
          className="btn btn-sm btn-ghost"
          type="button"
          onClick={toggleTheme}
          title="Toggle theme"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? '◐' : '◑'}
        </button>
        <button className="btn btn-sm" type="button">
          View store ↗
        </button>
        <button className="btn btn-sm btn-primary" type="button">
          Publish
        </button>
      </div>
    </header>
  );
}
