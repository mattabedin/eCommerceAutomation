'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from '@/components/icons';
import { CURRENT_BRAND, CURRENT_USER, NAV } from './nav-config';

export function Sidebar() {
  const pathname = usePathname();
  const activeId = pathname?.split('/')[2] ?? '';

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">F</div>
        <div className="brand-name">Forge</div>
      </div>

      <button
        className="workspace-switcher"
        type="button"
        aria-label="Switch workspace"
      >
        <div
          className="workspace-avatar"
          style={{
            background: `linear-gradient(135deg, ${CURRENT_BRAND.colors.secondary}, ${CURRENT_BRAND.colors.primary})`,
          }}
        />
        <span style={{ flex: 1, textAlign: 'left' }}>{CURRENT_BRAND.name}</span>
        <span style={{ color: 'var(--fg-4)', fontSize: 11 }}>⇅</span>
      </button>

      {NAV.map(group => (
        <div key={group.sec} className="nav-section">
          <div className="nav-label">{group.sec}</div>
          {group.items.map(it => (
            <Link
              key={it.id}
              href={`/app/${it.id}`}
              className="nav-item"
              data-active={activeId === it.id}
            >
              <Icon name={it.icon} />
              <span>{it.label}</span>
              {it.sub && (
                <span
                  className="plan-pill"
                  style={{
                    marginLeft: 'auto',
                    background: 'var(--accent-soft)',
                    color: 'var(--accent)',
                  }}
                >
                  {it.sub}
                </span>
              )}
              {it.count && <span className="nav-count">{it.count}</span>}
            </Link>
          ))}
        </div>
      ))}

      <div className="sidebar-footer">
        <div className="user-avatar">{CURRENT_USER.initial}</div>
        <div style={{ flex: 1, fontSize: 12, lineHeight: 1.2 }}>
          <div style={{ fontWeight: 500 }}>{CURRENT_USER.name}</div>
          <div style={{ color: 'var(--fg-3)', fontSize: 10.5 }}>
            {CURRENT_USER.email}
          </div>
        </div>
        <span className="plan-pill">{CURRENT_USER.plan}</span>
      </div>
    </aside>
  );
}
