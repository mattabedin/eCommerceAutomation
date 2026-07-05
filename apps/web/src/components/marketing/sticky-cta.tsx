'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

// A compact, always-there nudge that slides in once the visitor has
// scrolled past the hero. Keeps the primary action one tap away on every
// screen without stealing attention up top.
export function StickyCta() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 720);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!show) return null;

  return (
    <div className="sticky-cta">
      <span className="msg">
        Your store, <b>built free in minutes.</b>
      </span>
      <Link className="btn btn-primary" href="/signup">
        Build my store free →
      </Link>
    </div>
  );
}
