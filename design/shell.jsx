/* Forge — Sidebar + Topbar + shared bits */

const { useState, useEffect, useRef } = React;

const NAV = [
  { sec: 'Build', items: [
    { id: 'builder',    label: 'AI Builder',  icon: 'sparkle', sub: 'New' },
    { id: 'preview',    label: 'Storefront',  icon: 'globe' },
    { id: 'publishing', label: 'Publishing',  icon: 'rocket' },
  ]},
  { sec: 'Manage', items: [
    { id: 'dashboard', label: 'Dashboard',   icon: 'grid' },
    { id: 'products',  label: 'Products',    icon: 'box',     count: '8' },
    { id: 'orders',    label: 'Orders',      icon: 'cart',    count: '6' },
    { id: 'customers', label: 'Customers',   icon: 'users' },
  ]},
  { sec: 'Grow', items: [
    { id: 'marketing', label: 'Marketing',   icon: 'mega' },
    { id: 'support',   label: 'Support',     icon: 'chat',    count: '5' },
    { id: 'analytics', label: 'Analytics',   icon: 'trend' },
  ]},
  { sec: 'Workspace', items: [
    { id: 'settings',  label: 'Settings',    icon: 'gear' },
    { id: 'billing',   label: 'Billing',     icon: 'card' },
  ]},
];

function Icon({ name }) {
  const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' };
  const map = {
    sparkle: <path d="M8 1.5l1.6 4.4L14 7.5l-4.4 1.6L8 13.5l-1.6-4.4L2 7.5l4.4-1.6z" {...stroke}/>,
    globe:   <><circle cx="8" cy="8" r="6.5" {...stroke}/><path d="M1.5 8h13M8 1.5c2 2 2 11 0 13M8 1.5c-2 2-2 11 0 13" {...stroke}/></>,
    grid:    <><rect x="2" y="2" width="5" height="5" rx="1" {...stroke}/><rect x="9" y="2" width="5" height="5" rx="1" {...stroke}/><rect x="2" y="9" width="5" height="5" rx="1" {...stroke}/><rect x="9" y="9" width="5" height="5" rx="1" {...stroke}/></>,
    box:     <><path d="M2 5l6-3 6 3v6l-6 3-6-3z" {...stroke}/><path d="M2 5l6 3 6-3M8 8v6" {...stroke}/></>,
    cart:    <><path d="M2 3h2l1.5 8h7L14 5H4.5" {...stroke}/><circle cx="6" cy="13.5" r="1" {...stroke}/><circle cx="12" cy="13.5" r="1" {...stroke}/></>,
    users:   <><circle cx="6" cy="6" r="2.5" {...stroke}/><path d="M2 13c0-2 2-3 4-3s4 1 4 3" {...stroke}/><circle cx="11" cy="5" r="2" {...stroke}/><path d="M10 13c2 0 4-1 4-3 0-1-1-1.5-2-2" {...stroke}/></>,
    mega:    <><path d="M2 6v4l8-4v6L2 8M10 5v6" {...stroke}/></>,
    chat:    <><path d="M2 4a2 2 0 012-2h8a2 2 0 012 2v5a2 2 0 01-2 2H7l-3 3v-3H4a2 2 0 01-2-2z" {...stroke}/></>,
    trend:   <><path d="M2 12l4-4 3 3 5-6M9 5h4v4" {...stroke}/></>,
    gear:    <><circle cx="8" cy="8" r="2" {...stroke}/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3 3l1.5 1.5M11.5 11.5L13 13M3 13l1.5-1.5M11.5 4.5L13 3" {...stroke}/></>,
    card:    <><rect x="1.5" y="3.5" width="13" height="9" rx="1.5" {...stroke}/><path d="M1.5 6.5h13M3 10h2M7 10h2" {...stroke}/></>,
    rocket:  <><path d="M8 1.5c2.2 1.6 3.5 3.5 3.5 6 0 1.5-.4 2.7-1 4l-2.5 2L5.5 11.5c-.6-1.3-1-2.5-1-4 0-2.5 1.3-4.4 3.5-6zM5 11l-1.5 1.5.5 2 2-.5L7.5 12.5M11 11l1.5 1.5-.5 2-2-.5L8.5 12.5" {...stroke}/><circle cx="8" cy="7" r="1.2" {...stroke}/></>,
  };
  return <svg className="nav-icon" viewBox="0 0 16 16">{map[name]}</svg>;
}

function Sidebar({ view, setView, brand, openSwitch }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">F</div>
        <div className="brand-name">Forge</div>
      </div>

      <button className="workspace-switcher" onClick={openSwitch}>
        <div className="workspace-avatar" style={{ background: `linear-gradient(135deg, ${brand.colors.secondary}, ${brand.colors.primary})` }}/>
        <span style={{ flex: 1, textAlign: 'left' }}>{brand.name}</span>
        <span style={{ color: 'var(--fg-4)', fontSize: 11 }}>⇅</span>
      </button>

      {NAV.map(group => (
        <div key={group.sec} className="nav-section">
          <div className="nav-label">{group.sec}</div>
          {group.items.map(it => (
            <button key={it.id} className="nav-item" data-active={view === it.id} onClick={() => setView(it.id)}>
              <Icon name={it.icon}/>
              <span>{it.label}</span>
              {it.sub && <span className="plan-pill" style={{ marginLeft: 'auto', background: 'var(--accent-soft)', color: 'var(--accent)' }}>{it.sub}</span>}
              {it.count && <span className="nav-count">{it.count}</span>}
            </button>
          ))}
        </div>
      ))}

      <div className="sidebar-footer">
        <div className="user-avatar">M</div>
        <div style={{ flex: 1, fontSize: 12, lineHeight: 1.2 }}>
          <div style={{ fontWeight: 500 }}>Maya Chen</div>
          <div style={{ color: 'var(--fg-3)', fontSize: 10.5 }}>maya@studio.co</div>
        </div>
        <span className="plan-pill">PRO</span>
      </div>
    </aside>
  );
}

function Topbar({ view, brand, theme, setTheme }) {
  const labels = { builder:'AI Builder', preview:'Storefront', publishing:'Publishing & Hosting', dashboard:'Dashboard', products:'Products', orders:'Orders', customers:'Customers', marketing:'Marketing', support:'Support', analytics:'Analytics', settings:'Settings', billing:'Billing' };
  return (
    <header className="topbar">
      <div className="crumbs">
        <span>{brand.name}</span>
        <span className="sep">/</span>
        <strong>{labels[view]}</strong>
      </div>
      <div className="topbar-actions">
        <button className="btn btn-sm btn-ghost">
          <Icon name="sparkle"/>
          <span>Ask Forge</span>
          <span className="kbd">⌘K</span>
        </button>
        <button className="btn btn-sm btn-ghost" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} title="Toggle theme">
          {theme === 'light' ? '◐' : '◑'}
        </button>
        <button className="btn btn-sm">View store ↗</button>
        <button className="btn btn-sm btn-primary">Publish</button>
      </div>
    </header>
  );
}

window.FORGE_NAV = { Sidebar, Topbar, Icon };
