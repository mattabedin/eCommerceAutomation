export default function LandingPage() {
  return (
    <main style={{ padding: 40, maxWidth: 880, margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 56, fontWeight: 400, letterSpacing: '-0.02em', marginBottom: 16 }}>
        Forge — AI Store Builder
      </h1>
      <p style={{ fontSize: 14, color: 'var(--fg-2)', lineHeight: 1.6, maxWidth: 540, marginBottom: 24 }}>
        Describe a store. Get a live, sellable, AI-managed e-commerce site.
      </p>
      <p style={{ fontSize: 12.5, color: 'var(--fg-3)' }}>
        Phase 1 marketing site lands here — full landing page with sections from <code>design/landing.html</code>.
      </p>
    </main>
  );
}
