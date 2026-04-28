export function Bento() {
  return (
    <section className="band">
      <div className="band-header">
        <div className="kicker">⊹ Inside the platform</div>
        <h2 className="section-title">
          Everything a brand needs.
          <br />
          <em>Nothing it doesn't.</em>
        </h2>
      </div>
      <div className="bento">
        <div
          className="bento-card b-tall"
          style={{
            background:
              'linear-gradient(160deg, var(--surface), var(--accent-soft))',
          }}
        >
          <span className="tag">⊹ BUILDER</span>
          <h3>One prompt, full storefront</h3>
          <p>
            Brand, theme, pages, policies, products, prices — generated
            together, designed to fit, ready to publish.
          </p>
          <div
            style={{
              position: 'absolute',
              bottom: 24,
              left: 24,
              right: 24,
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              color: 'var(--fg-3)',
              lineHeight: 1.6,
              background: 'var(--surface)',
              borderRadius: 10,
              border: '1px solid var(--border)',
              padding: '12px 14px',
            }}
          >
            <div style={{ color: 'var(--accent)' }}>⊹ blueprint.json</div>
            <div>
              "name": <span style={{ color: 'var(--green)' }}>"PawLuxe Co."</span>
            </div>
            <div>
              "products": <span style={{ color: 'var(--amber)' }}>8</span>,
            </div>
            <div>
              "pages": <span style={{ color: 'var(--amber)' }}>12</span>,
            </div>
            <div>
              "setup": <span style={{ color: 'var(--green)' }}>"4m 12s"</span>
            </div>
          </div>
        </div>

        <div className="bento-card b-wide">
          <span className="tag">⊹ PRICING AGENT</span>
          <h3>Prices that price themselves</h3>
          <p>
            Forge models demand and competitor anchors. Adjusts weekly. Shows
            its math.
          </p>
          <div style={{ display: 'flex', gap: 6, marginTop: 14 }}>
            {[
              { label: 'COGS', value: '$22' },
              { label: '+ MARGIN', value: '$67' },
              { label: 'ANCHOR', value: '$129' },
            ].map(c => (
              <div
                key={c.label}
                style={{
                  flex: 1,
                  padding: 10,
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  fontSize: 11,
                }}
              >
                <div style={{ color: 'var(--fg-3)', fontSize: 10 }}>
                  {c.label}
                </div>
                <strong style={{ fontSize: 16 }}>{c.value}</strong>
              </div>
            ))}
            <div
              style={{
                flex: 1,
                padding: 10,
                border: '1px solid var(--accent)',
                borderRadius: 8,
                fontSize: 11,
                background: 'var(--accent-soft)',
              }}
            >
              <div style={{ color: 'var(--accent)', fontSize: 10 }}>
                ⊹ AI TIER
              </div>
              <strong style={{ fontSize: 16, color: 'var(--accent)' }}>
                $89
              </strong>
            </div>
          </div>
        </div>

        <div className="bento-card b-sq">
          <span className="tag">⊹ SUPPORT</span>
          <h3>Replies in 90 seconds</h3>
          <p>
            Auto-resolves 78% of tickets. Drafts the rest. Cites your policies.
          </p>
          <div
            style={{
              marginTop: 14,
              fontSize: 11,
              background: 'var(--accent-soft)',
              color: 'var(--accent)',
              padding: '6px 10px',
              borderRadius: 8,
              display: 'inline-block',
            }}
          >
            88% confidence · awaiting send
          </div>
        </div>

        <div className="bento-card b-sq">
          <span className="tag">⊹ INVENTORY</span>
          <h3>Reorders before you notice</h3>
          <p>
            Tracks velocity, lead times, and seasonality. Pings supplier when
            stock dips.
          </p>
          <div
            style={{
              marginTop: 12,
              height: 6,
              borderRadius: 3,
              background: 'var(--surface-2)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{ width: '18%', height: '100%', background: 'var(--rose)' }}
            />
          </div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              color: 'var(--rose)',
              marginTop: 6,
            }}
          >
            Cloud Bed · 8 units · ~5 days
          </div>
        </div>

        <div className="bento-card b-half">
          <span className="tag">⊹ MARKETING</span>
          <h3>Campaigns, drafted</h3>
          <p>
            Forge writes, designs, segments, and schedules — you approve in one
            click.
          </p>
          <div
            style={{
              marginTop: 14,
              background: 'var(--surface-2)',
              padding: '10px 12px',
              borderRadius: 8,
              fontSize: 11.5,
              lineHeight: 1.5,
            }}
          >
            <div
              style={{
                color: 'var(--fg-3)',
                fontSize: 10,
                fontFamily: 'var(--font-mono)',
              }}
            >
              EMAIL · subject
            </div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 14 }}>
              For dogs that deserve heirlooms.
            </div>
            <div style={{ color: 'var(--fg-3)' }}>
              Predicted open: <strong style={{ color: 'var(--fg)' }}>42%</strong> ·
              revenue $1,200 ± $200
            </div>
          </div>
        </div>

        <div className="bento-card b-half">
          <span className="tag">⊹ ANALYTICS</span>
          <h3>Insights, not dashboards</h3>
          <p>
            Forge tells you what changed and what to do — in plain English, with
            the math behind it.
          </p>
          <div
            style={{
              marginTop: 14,
              borderLeft: '3px solid var(--green)',
              paddingLeft: 10,
              fontSize: 12,
              lineHeight: 1.5,
            }}
          >
            <strong>Instagram converts 2.8×</strong>
            <div style={{ color: 'var(--fg-3)', fontSize: 11 }}>
              +$1,200/wk if you reallocate $400 from Google.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
