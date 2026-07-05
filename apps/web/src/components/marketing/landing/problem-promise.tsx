export function ProblemPromise() {
  return (
    <section className="band">
      <div className="band-header">
        <div className="kicker">The Forge difference</div>
        <h2 className="section-title">
          Other platforms hand you tools.
          <br />
          <em>Forge runs the store.</em>
        </h2>
      </div>
      <div
        className="feature-grid"
        style={{ gridTemplateColumns: '1fr 1fr', maxWidth: 1000 }}
      >
        <div className="feature-card" style={{ background: 'var(--surface-2)' }}>
          <div className="kicker" style={{ color: 'var(--fg-3)' }}>
            Shopify, WooCommerce, Wix
          </div>
          <h3 style={{ fontSize: 19, marginBottom: 14 }}>
            You assemble the store.
          </h3>
          <ul
            style={{
              listStyle: 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              fontSize: 13.5,
              color: 'var(--fg-3)',
            }}
          >
            <li>· Pick a theme, edit it for weeks</li>
            <li>· Hunt apps for every feature</li>
            <li>· Write copy, take photos, set prices</li>
            <li>· Handle support, marketing, fulfillment alone</li>
            <li>· Pay 8–12 monthly subscriptions</li>
            <li>· 1.6%+ in transaction fees</li>
          </ul>
        </div>
        <div
          className="feature-card"
          style={{
            borderColor: 'var(--accent)',
            background:
              'linear-gradient(180deg, var(--surface), var(--accent-soft))',
          }}
        >
          <div className="kicker" style={{ color: 'var(--accent)' }}>
            ⊹ Forge
          </div>
          <h3 style={{ fontSize: 19, marginBottom: 14 }}>
            AI runs the store. You decide.
          </h3>
          <ul
            style={{
              listStyle: 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              fontSize: 13.5,
              color: 'var(--fg-2)',
            }}
          >
            <li><span style={{ color: 'var(--green)' }}>✓</span> Describe it · brand built in 4 minutes</li>
            <li><span style={{ color: 'var(--green)' }}>✓</span> Catalog, copy, prices generated + tuned weekly</li>
            <li><span style={{ color: 'var(--green)' }}>✓</span> Agents run support, email, ads, inventory</li>
            <li><span style={{ color: 'var(--green)' }}>✓</span> Approve in one click · roll back any change</li>
            <li><span style={{ color: 'var(--green)' }}>✓</span> One platform · one bill · 0% txn fees</li>
            <li><span style={{ color: 'var(--green)' }}>✓</span> Ship in minutes, not months</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
