'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/', label: 'Product' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/about', label: 'About' },
  { href: '/#agents', label: 'Agents' },
  { href: '/#customers', label: 'Customers' },
];

export function MarketingNav() {
  const pathname = usePathname();

  return (
    <nav className="nav">
      <div className="nav-inner">
        <Link href="/" className="logo">
          <span className="logo-mark">F</span>
          <span>Forge</span>
        </Link>
        <div className="nav-links">
          {LINKS.map(link => {
            const isActive =
              link.href === pathname ||
              (link.href.startsWith('/#') && pathname === '/');
            // Only the page links (no hash) get active state. Hash links never active.
            const showActive = !link.href.includes('#') && pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                data-active={showActive ? 'true' : undefined}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
        <div className="nav-cta">
          <Link className="btn btn-ghost" href="/login">
            Sign in
          </Link>
          <Link className="btn btn-primary btn-glow" href="/signup">
            Start free →
          </Link>
        </div>
      </div>
    </nav>
  );
}
