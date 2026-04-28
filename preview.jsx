/* Forge — Live Storefront Preview (PawLuxe / DeskNova) */

const { useState, useEffect } = React;

function StorefrontFrame({ brand, brandKey, buildState, device, setDevice }) {
  const ready = buildState.status === 'ready' || buildState.active >= 6;
  const showHero = buildState.active >= 2;
  const showCatalog = buildState.active >= 4;
  const showBenefits = buildState.active >= 3;
  const products = FORGE.PRODUCTS[brandKey] || [];

  return (
    <div className="preview-pane">
      <div className="preview-header">
        <div className="preview-tabs">
          <button className="preview-tab" data-active={device === 'desktop'} onClick={() => setDevice('desktop')}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="1" y="2" width="10" height="7" rx="1" stroke="currentColor" strokeWidth="1.2"/><path d="M4 11h4M6 9v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
            Desktop
          </button>
          <button className="preview-tab" data-active={device === 'mobile'} onClick={() => setDevice('mobile')}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="3" y="1" width="6" height="10" rx="1" stroke="currentColor" strokeWidth="1.2"/><circle cx="6" cy="9.2" r="0.4" fill="currentColor"/></svg>
            Mobile
          </button>
        </div>
        <div className="preview-url">
          <span className="live-dot"/>
          {brand.domain}
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
          <button className="btn btn-sm btn-ghost">↻</button>
          <button className="btn btn-sm">Inspect</button>
        </div>
      </div>

      <div className="preview-canvas">
        {device === 'desktop' ? (
          <div className="browser">
            <div className="browser-chrome">
              <div className="browser-dots"><span/><span/><span/></div>
              <div className="browser-addr">{brand.domain}</div>
            </div>
            <StoreBody brand={brand} brandKey={brandKey} products={products} ready={ready} showHero={showHero} showCatalog={showCatalog} showBenefits={showBenefits}/>
          </div>
        ) : (
          <div className="phone">
            <div className="phone-screen">
              <StoreBody brand={brand} brandKey={brandKey} products={products.slice(0,4)} ready={ready} showHero={showHero} showCatalog={showCatalog} showBenefits={showBenefits} mobile/>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StoreBody({ brand, brandKey, products, ready, showHero, showCatalog, showBenefits, mobile }) {
  const c = brand.colors;
  const benefits = brandKey === 'pawluxe'
    ? [
        { i: '↺', t: 'Lifetime repairs', s: 'We fix anything we make, forever.' },
        { i: '✦', t: 'Hand-finished', s: 'Each piece passes 12 quality checks.' },
        { i: '◐', t: 'Ethical leather', s: 'LWG Gold certified tanneries.' },
        { i: '✈', t: 'Free US shipping', s: 'Two-day, carbon-offset.' },
      ]
    : [
        { i: '◇', t: '5-year warranty', s: 'On every piece, no questions.' },
        { i: '⚡', t: 'Ships in 48h', s: 'From Portland or Berlin.' },
        { i: '◐', t: 'Recycled materials', s: '70% post-consumer aluminum.' },
        { i: '✓', t: '60-day returns', s: 'Use it. Live with it. Decide.' },
      ];

  return (
    <div className="store">
      <nav className="store-nav">
        <div className="store-logo" style={{ color: c.primary }}>{brand.name}</div>
        {!mobile && (
          <>
            <div className="store-nav-items">
              {brand.categories.map(cat => <span key={cat}>{cat}</span>)}
              <span>Journal</span>
            </div>
            <div className="store-nav-actions">
              <span>Search</span>
              <span>Account</span>
              <span>Bag (0)</span>
            </div>
          </>
        )}
        {mobile && <div className="store-nav-actions" style={{ fontSize: 11 }}><span>☰</span></div>}
      </nav>

      <section className="store-hero" style={mobile ? { gridTemplateColumns: '1fr', padding: '24px 20px', gap: 16 } : null}>
        <div>
          {showHero ? (
            <>
              <h1 style={{ fontSize: mobile ? 32 : 56, color: c.primary }}>
                {brand.heroH.split(' ').slice(0,-1).join(' ')} <em style={{ color: c.secondary }}>{brand.heroH.split(' ').slice(-1)}</em>
              </h1>
              <p>{brand.heroP}</p>
              <button className="btn" style={{ background: c.primary, color: 'white', borderColor: c.primary, padding: '10px 18px' }}>
                Shop the collection →
              </button>
            </>
          ) : (
            <>
              <div className="skel" style={{ height: mobile ? 32 : 60, width: '85%', marginBottom: 12 }}/>
              <div className="skel" style={{ height: mobile ? 28 : 50, width: '60%', marginBottom: 18 }}/>
              <div className="skel" style={{ height: 14, width: '92%', marginBottom: 6 }}/>
              <div className="skel" style={{ height: 14, width: '78%', marginBottom: 18 }}/>
              <div className="skel" style={{ height: 36, width: 180, borderRadius: 7 }}/>
            </>
          )}
        </div>
        <div className="hero-img" style={{ background: showHero ? `linear-gradient(135deg, ${c.secondary}33, ${c.primary}cc)` : undefined }}>
          {!showHero && <div className="skel" style={{ width: '100%', height: '100%', borderRadius: 14 }}/>}
        </div>
      </section>

      <section className="store-section">
        <h2 style={{ color: c.primary, fontSize: mobile ? 22 : 32 }}>Featured</h2>
        <div className="sub">{showCatalog ? `${products.length} pieces · curated by Forge AI` : 'AI is selecting products…'}</div>
        <div className="product-grid" style={mobile ? { gridTemplateColumns: 'repeat(2, 1fr)' } : null}>
          {(showCatalog ? products : Array(mobile ? 4 : 8).fill(null)).map((p, i) => (
            <div key={i} className="product-card">
              {p ? (
                <>
                  <div className="product-img" data-label={`${p.cat.toLowerCase()} · ${p.id}`} style={{
                    background: `repeating-linear-gradient(135deg, ${p.tone}22, ${p.tone}22 8px, ${p.tone}11 8px, ${p.tone}11 16px), linear-gradient(135deg, ${p.tone}66, ${p.tone}cc)`,
                  }}/>
                  <div className="product-name" style={{ color: c.primary }}>{p.name}</div>
                  <div className="product-price">${p.price} <span className="compare">${p.was}</span></div>
                </>
              ) : (
                <>
                  <div className="skel product-img" style={{ aspectRatio: 1 }}/>
                  <div className="skel" style={{ height: 12, width: '70%', marginBottom: 4 }}/>
                  <div className="skel" style={{ height: 11, width: '40%' }}/>
                </>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="store-section" style={{ background: c.accent || 'var(--surface-2)' }}>
        <h2 style={{ color: c.primary, fontSize: mobile ? 22 : 32 }}>Why {brand.name}</h2>
        <div className="sub">Built for people who care.</div>
        <div className="benefits" style={mobile ? { gridTemplateColumns: 'repeat(2, 1fr)' } : null}>
          {(showBenefits ? benefits : Array(4).fill(null)).map((b, i) => (
            <div key={i} className="benefit">
              {b ? (
                <>
                  <div className="benefit-icon" style={{ color: c.secondary, background: `${c.secondary}22` }}>{b.i}</div>
                  <h4 style={{ color: c.primary }}>{b.t}</h4>
                  <p>{b.s}</p>
                </>
              ) : (
                <>
                  <div className="skel" style={{ width: 28, height: 28, borderRadius: 8, marginBottom: 10 }}/>
                  <div className="skel" style={{ height: 13, width: '70%', marginBottom: 6 }}/>
                  <div className="skel" style={{ height: 11, width: '95%', marginBottom: 3 }}/>
                  <div className="skel" style={{ height: 11, width: '80%' }}/>
                </>
              )}
            </div>
          ))}
        </div>
      </section>

      <footer className="store-footer">
        <span>© 2025 {brand.name}</span>
        {!mobile && <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--fg-4)', fontSize: 10 }}>built with ⊹ Forge</span>}
        {!mobile && <span>Privacy · Terms · Contact</span>}
      </footer>
    </div>
  );
}

window.FORGE_PREVIEW = { StorefrontFrame };
