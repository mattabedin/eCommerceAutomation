import Link from 'next/link';

export function Hero() {
  return (
    <section className="hero">
      <div className="hero-grid-bg" />
      <div className="hero-mesh" />
      <div className="hero-inner">
        <span className="eyebrow">
          <span className="dot" /> Trusted by 4,200+ independent store owners
        </span>
        <h1 className="display">
          The AI that runs your store
          <br />
          <em>
            <span className="grad">while you sleep.</span>
          </em>
        </h1>
        <p className="lead">
          Tell Forge what you want to sell. In minutes you get a real store —
          products, photos, prices, the whole thing — plus a team of AI
          helpers that quietly handle the day-to-day.{' '}
          <strong style={{ color: 'var(--fg)' }}>
            You approve. Forge does the rest.
          </strong>
        </p>

        <div className="hero-cta">
          <Link className="btn btn-primary btn-lg btn-glow" href="/signup">
            Build my store free →
          </Link>
          <a className="btn btn-lg" href="#demo">
            ▶ Watch 90-second demo
          </a>
        </div>

        <div className="hero-social">
          <div className="avatars">
            <span style={{ background: '#c4f23c' }}>M</span>
            <span style={{ background: '#4ade80' }}>J</span>
            <span style={{ background: '#fbbf24' }}>S</span>
            <span style={{ background: '#fb7185' }}>A</span>
          </div>
          <div className="stars">★★★★★</div>
          <div className="proof-text">
            <strong>4.9/5</strong> from 1,200+ store owners
          </div>
        </div>

        <form
          className="prompt-card"
          action="/signup"
          method="get"
        >
          <div className="ic">⊹</div>
          <input
            type="text"
            name="prompt"
            placeholder="Describe your store… 'luxury pet accessories for urban dog owners'"
          />
          <button className="btn btn-primary btn-sm" type="submit">
            Generate →
          </button>
          <span className="kbd">⏎</span>
        </form>

        <div className="hero-trust">
          <span>
            <span className="check">✓</span> Free to build
          </span>
          <span>
            <span className="check">✓</span> Live in under 5 min
          </span>
          <span>
            <span className="check">✓</span> No credit card
          </span>
          <span>
            <span className="check">✓</span> 0% txn fees
          </span>
          <span>
            <span className="check">✓</span> SOC 2
          </span>
        </div>
      </div>

      <div className="hero-mock" id="demo">
        <div className="hero-mock-chrome">
          <div className="hero-mock-dots">
            <span />
            <span />
            <span />
          </div>
          <div className="hero-mock-addr">forge.shop / build</div>
        </div>
        <div className="hero-mock-body">
          <div className="hero-mock-chat">
            <div className="mock-bubble-user">
              Build me a store selling luxury pet accessories.
            </div>
            <div className="mock-bubble-ai">
              <div className="meta">⊹ FORGE · v0.4</div>
              Got it — premium pet accessories, urban audience. Building now.
            </div>
            <div className="mock-stages">
              <div className="ok">✓ Niche analyzed · 18 references</div>
              <div className="ok">✓ Brand · PawLuxe Co.</div>
              <div className="ok">✓ Pages · home, FAQ, policies</div>
              <div className="running">Drafting catalog · 8 products</div>
              <div className="queued">· Pricing model</div>
              <div className="queued">· SEO · meta, schema</div>
              <div className="queued">· Preview ready</div>
            </div>
            <div className="mock-bubble-ai">
              <div className="meta">PREVIEW · live</div>
              PawLuxe Co. is taking shape →
            </div>
          </div>
          <div className="hero-mock-preview">
            <div className="mock-store-nav">
              <div className="mock-store-logo">PawLuxe Co.</div>
              <div style={{ display: 'flex', gap: 14, fontSize: 10 }}>
                <span>Collars</span>
                <span>Leashes</span>
                <span>Beds</span>
                <span>Travel</span>
              </div>
              <div style={{ fontSize: 10 }}>Bag (0)</div>
            </div>
            <div className="mock-store-hero">
              <div>
                <h3>
                  Heirloom essentials for the modern <em>dog.</em>
                </h3>
                <p>
                  Hand-finished collars, leashes, and beds — built to last
                  lifetimes.
                </p>
                <button
                  className="btn"
                  style={{
                    background: '#111827',
                    color: 'white',
                    borderColor: '#111827',
                    fontSize: 10,
                    padding: '5px 10px',
                  }}
                >
                  Shop the collection →
                </button>
              </div>
              <div className="mock-store-hero-img" />
            </div>
            <div className="mock-store-grid">
              <div
                className="mock-prod"
                style={{
                  background: 'linear-gradient(135deg,#d4af37 30%,#a47148)',
                }}
              />
              <div
                className="mock-prod"
                style={{
                  background: 'linear-gradient(135deg,#b08968 30%,#8b6f47)',
                }}
              />
              <div
                className="mock-prod"
                style={{
                  background: 'linear-gradient(135deg,#e8dcc4 30%,#c9b89a)',
                }}
              />
              <div
                className="mock-prod"
                style={{
                  background: 'linear-gradient(135deg,#a47148 30%,#6f4e2a)',
                }}
              />
            </div>

            <div className="agent-pop agent-pop-1">
              <span className="dot" />⊹ Pricing · +6% applied
            </div>
            <div className="agent-pop agent-pop-2">
              <span className="dot" />◐ Support · 3 tickets resolved
            </div>
            <div className="agent-pop agent-pop-3">
              <span className="dot" />✦ SEO · 12 pages indexed
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
