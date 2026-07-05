export function HowItWorks() {
  return (
    <section className="band">
      <div className="band-header">
        <div className="kicker">How it works</div>
        <h2 className="section-title">Three steps from idea to your first sale.</h2>
        <p
          className="lead"
          style={{ margin: '18px auto 0', fontSize: 16 }}
        >
          No code. No theme tweaking. No app stack. Just describe your business
          — and approve as Forge builds and runs it.
        </p>
      </div>
      <div className="howit">
        <div className="howit-step">
          <div className="howit-num">1</div>
          <h3>Describe what you sell</h3>
          <p>
            One sentence is enough. Forge picks the niche, audience, and
            aesthetic — then asks two follow-ups to lock the brief.
          </p>
          <div className="visual">
            <span style={{ color: 'var(--fg-4)' }}>prompt ›</span>
            <br />
            <span style={{ color: 'var(--fg)' }}>
              "Heirloom collars and leashes
            </span>
            <br />
            <span style={{ color: 'var(--fg)' }}>for urban dog owners."</span>
          </div>
        </div>
        <div className="howit-step">
          <div className="howit-num">2</div>
          <h3>Forge builds the entire store</h3>
          <p>
            Brand, theme, 8+ products, copy, photography prompts, pricing,
            policies, SEO schema. All generated together in 4 minutes.
          </p>
          <div className="visual">
            <span style={{ color: 'var(--green)' }}>✓ brand · PawLuxe Co.</span>
            <br />
            <span style={{ color: 'var(--green)' }}>
              ✓ catalog · 8 products
            </span>
            <br />
            <span style={{ color: 'var(--accent)' }}>
              ○ pricing model · running
            </span>
          </div>
        </div>
        <div className="howit-step">
          <div className="howit-num">3</div>
          <h3>Agents run it for you</h3>
          <p>
            Five AI teammates handle pricing, support, marketing, SEO, and
            inventory. You set guardrails and approve the moves that matter.
          </p>
          <div className="visual">
            <span style={{ color: 'var(--accent)' }}>⊹ Pricing</span>{' '}
            <span style={{ color: 'var(--fg-3)' }}>+6% Cloud Bed</span>
            <br />
            <span style={{ color: 'var(--accent)' }}>◐ Support</span>{' '}
            <span style={{ color: 'var(--fg-3)' }}>4 auto-resolved</span>
            <br />
            <span style={{ color: 'var(--accent)' }}>✦ SEO</span>{' '}
            <span style={{ color: 'var(--fg-3)' }}>3 pages drafted</span>
          </div>
        </div>
      </div>
    </section>
  );
}
