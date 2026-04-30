'use client';

import { useState } from 'react';

// Single-input newsletter form. We don't yet have a backend list — submits
// stash the email in localStorage and show a success state, so we can wire
// Resend/Klaviyo in a later phase without changing the UI shape.
export function NewsletterCapture({ brandSlug }: { brandSlug: string }) {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const v = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return;
    try {
      const key = `forge:newsletter:${brandSlug}`;
      window.localStorage.setItem(key, v);
    } catch {
      /* ignore — private mode etc. */
    }
    setDone(true);
  }

  return (
    <section className="newsletter">
      <h2>Join the list</h2>
      <p>10% off your first order. Drops, restocks, and the occasional note.</p>
      {done ? (
        <div className="newsletter-success">✓ You're in. Check your inbox.</div>
      ) : (
        <form className="newsletter-form" onSubmit={submit}>
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <button
            type="submit"
            className="btn-brand"
            style={{ padding: '12px 18px' }}
          >
            Subscribe →
          </button>
        </form>
      )}
    </section>
  );
}
