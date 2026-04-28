'use client';

import { usePathname } from 'next/navigation';

export function AnnounceBar() {
  const pathname = usePathname();
  if (pathname !== '/') return null;

  return (
    <div className="announce">
      <span className="announce-pulse">Forge 0.4 · live</span>
      <span style={{ opacity: 0.7 }}>·</span>
      <span>
        1,400+ AI-built stores · <strong>$0 transaction fees, forever</strong>
      </span>
      <span style={{ opacity: 0.7 }}>·</span>
      <a href="/signup">Try it free →</a>
    </div>
  );
}
