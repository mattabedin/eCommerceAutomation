import Link from 'next/link';

export const metadata = {
  title: 'Pricing — Forge',
};

export default function PricingPage() {
  return (
    <>
      <section className="hero" style={{ padding: '64px 24px 40px' }}>
        <div className="hero-inner">
          <span className="eyebrow">
            Pricing · 0% transaction fees on every plan
          </span>
          <h1 className="display" style={{ fontSize: 'clamp(36px, 5vw, 56px)' }}>
            Simple pricing.
            <br />
            <em>Real margin.</em>
          </h1>
          <p className="lead" style={{ margin: '18px auto 0' }}>
            Free to build. Pay when you're selling. We don't take a cut of your
            revenue — ever.
          </p>
          <div
            style={{
              marginTop: 24,
              display: 'inline-flex',
              padding: 4,
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 10,
            }}
          >
            <button
              className="btn btn-sm"
              style={{
                background: 'var(--fg)',
                color: 'var(--bg)',
                borderColor: 'var(--fg)',
              }}
            >
              Monthly
            </button>
            <button className="btn btn-sm btn-ghost">Yearly · save 20%</button>
          </div>
        </div>
      </section>

      <section style={{ padding: '24px 24px 60px' }}>
        <div className="price-grid">
          {PLANS.map(p => (
            <div
              key={p.name}
              className={p.featured ? 'price-card featured' : 'price-card'}
            >
              <div className="price-name">{p.name}</div>
              <div className="price-tag">
                <span className="num">{p.price}</span>
                <span className="per">{p.per}</span>
              </div>
              <p className="price-desc">{p.desc}</p>
              <Link
                href={p.ctaHref}
                className={p.featured ? 'btn btn-primary' : 'btn'}
              >
                {p.cta}
              </Link>
              <div className="price-divider" />
              <div className="price-features-label">{p.featuresLabel}</div>
              <ul className="price-features">
                {p.features.map((f, i) => (
                  <li key={i}>
                    <span className="check">✓</span>{' '}
                    <span dangerouslySetInnerHTML={{ __html: f }} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div
          style={{
            textAlign: 'center',
            marginTop: 32,
            fontSize: 13,
            color: 'var(--fg-3)',
          }}
        >
          All plans include 0% Forge transaction fees · payment processor fees
          apply (Stripe ~2.9% + 30¢)
        </div>
      </section>

      <section className="band">
        <div className="band-header">
          <div className="kicker">Compare plans</div>
          <h2 className="section-title">Every detail, side by side.</h2>
        </div>
        <div className="compare-table">
          <table>
            <thead>
              <tr>
                <th>Feature</th>
                <th>Starter</th>
                <th>Pro</th>
                <th>Scale</th>
              </tr>
            </thead>
            <tbody>
              {COMPARE.map((row, i) => {
                if ('section' in row) {
                  return (
                    <tr key={i}>
                      <td colSpan={4} className="feat-section">
                        {row.section}
                      </td>
                    </tr>
                  );
                }
                return (
                  <tr key={i}>
                    <td>{row.label}</td>
                    {row.values.map((v, j) => (
                      <td
                        key={j}
                        className={
                          v === '✓' ? 'check' : v === '—' ? 'dash' : ''
                        }
                        dangerouslySetInnerHTML={{ __html: v }}
                      />
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="band">
        <div className="band-header">
          <div className="kicker">The math</div>
          <h2 className="section-title">
            One bill instead of <em>nine.</em>
          </h2>
        </div>
        <div
          style={{
            maxWidth: 900,
            margin: '0 auto',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <div
              style={{
                padding: 28,
                borderRight: '1px solid var(--border)',
              }}
            >
              <div className="kicker">Typical Shopify stack</div>
              <ul
                style={{
                  listStyle: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  fontSize: 13.5,
                  color: 'var(--fg-2)',
                  marginTop: 12,
                }}
              >
                {SHOPIFY_STACK.map(item => (
                  <li
                    key={item.label}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      ...(item.muted
                        ? {
                            color: 'var(--fg-3)',
                            fontSize: 11.5,
                            fontFamily: 'var(--font-mono)',
                          }
                        : {}),
                    }}
                  >
                    <span>{item.label}</span>
                    <span style={{ fontVariantNumeric: 'tabular-nums' }}>
                      {item.value}
                    </span>
                  </li>
                ))}
              </ul>
              <div
                style={{
                  marginTop: 16,
                  paddingTop: 14,
                  borderTop: '1px solid var(--border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 16,
                  fontWeight: 600,
                }}
              >
                <span>Total</span>
                <span style={{ fontVariantNumeric: 'tabular-nums' }}>
                  ~$952/mo
                </span>
              </div>
            </div>
            <div style={{ padding: 28, background: 'var(--accent-soft)' }}>
              <div className="kicker" style={{ color: 'var(--accent)' }}>
                Forge Pro
              </div>
              <ul
                style={{
                  listStyle: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  fontSize: 13.5,
                  color: 'var(--fg-2)',
                  marginTop: 12,
                }}
              >
                {FORGE_INCLUDED.map(item => (
                  <li
                    key={item.label}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      ...(item.accent
                        ? {
                            color: 'var(--accent)',
                            fontSize: 11.5,
                            fontFamily: 'var(--font-mono)',
                          }
                        : {}),
                    }}
                  >
                    <span>{item.label}</span>
                    <span
                      style={{
                        fontVariantNumeric: 'tabular-nums',
                        color: item.accent ? undefined : 'var(--green)',
                      }}
                    >
                      {item.value}
                    </span>
                  </li>
                ))}
              </ul>
              <div
                style={{
                  marginTop: 16,
                  paddingTop: 14,
                  borderTop: '1px solid var(--border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 16,
                  fontWeight: 600,
                }}
              >
                <span>Total</span>
                <span
                  style={{
                    fontVariantNumeric: 'tabular-nums',
                    color: 'var(--accent)',
                  }}
                >
                  $49/mo
                </span>
              </div>
            </div>
          </div>
          <div
            style={{
              padding: '18px 28px',
              background: 'var(--surface-2)',
              fontSize: 13,
              color: 'var(--fg-2)',
              textAlign: 'center',
            }}
          >
            <strong>Save ~$903/month.</strong> Pay back the entire year of Forge
            in 36 hours.
          </div>
        </div>
      </section>

      <section className="band">
        <div className="band-header">
          <div className="kicker">Pricing FAQ</div>
          <h2 className="section-title">Common questions.</h2>
        </div>
        <div className="faq-list">
          {FAQ.map((q, i) => (
            <details key={i} className="faq-item" open={i === 0}>
              <summary className="faq-q">
                {q.q} <span className="ic">+</span>
              </summary>
              <div
                className="faq-a"
                dangerouslySetInnerHTML={{ __html: q.a }}
              />
            </details>
          ))}
        </div>
      </section>

      <section className="band">
        <div className="cta-section">
          <h2>
            Try Forge for <em>free.</em>
          </h2>
          <p>Build your full store before you decide to pay anything.</p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <Link className="btn btn-primary btn-lg" href="/signup">
              Start free →
            </Link>
            <a
              className="btn btn-lg"
              href="#contact"
              style={{
                background: 'transparent',
                color: 'white',
                borderColor: 'rgba(255,255,255,0.2)',
              }}
            >
              Talk to sales
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

const PLANS = [
  {
    name: 'Starter',
    price: '$0',
    per: '/mo',
    desc: "Build, preview, and pressure-test ideas with the full AI builder. Pay nothing until you're ready to sell.",
    cta: 'Start free',
    ctaHref: '/signup',
    featured: false,
    featuresLabel: 'Includes',
    features: [
      'Unlimited AI store generations',
      'Full storefront preview',
      '1 published store on forge.shop subdomain',
      '3 products live',
      '100 AI generations / month',
      'Community support',
    ],
  },
  {
    name: 'Pro',
    price: '$49',
    per: '/mo',
    desc: 'Everything you need to run a real brand — agents, custom domain, and 0% transaction fees.',
    cta: 'Start free trial',
    ctaHref: '/signup',
    featured: true,
    featuresLabel: 'Everything in Starter, plus',
    features: [
      '<strong>Custom domain</strong> + free SSL',
      '<strong>Unlimited products</strong> & variants',
      '<strong>10,000 AI generations</strong> / mo',
      'All 5 agents (Pricing · Support · Marketing · SEO · Inventory)',
      'Approval gates + audit log',
      'Stripe, Klaviyo, Shippo integrations',
      'Email support · 24h SLA',
    ],
  },
  {
    name: 'Scale',
    price: '$249',
    per: '/mo',
    desc: 'For brands doing $50K+/mo. Multiple stores, custom agents, dedicated support.',
    cta: 'Talk to sales',
    ctaHref: '#contact',
    featured: false,
    featuresLabel: 'Everything in Pro, plus',
    features: [
      '<strong>5 stores</strong> · multi-brand',
      '<strong>Unlimited</strong> AI generations',
      'Custom AI agents · your policies',
      'Headless API + webhooks',
      'SSO + SAML',
      'SOC 2 + DPA',
      'Slack channel · 4h SLA',
    ],
  },
];

type CompareRow = { section: string } | { label: string; values: string[] };

const COMPARE: CompareRow[] = [
  { section: 'Builder' },
  { label: 'AI store generations', values: ['100/mo', '10,000/mo', 'Unlimited'] },
  { label: 'Stores', values: ['1', '1', '5'] },
  { label: 'Products', values: ['3', 'Unlimited', 'Unlimited'] },
  { label: 'Custom domain', values: ['—', '✓', '✓'] },
  { label: 'Custom theme tokens', values: ['—', '✓', '✓'] },
  { section: 'Agents' },
  { label: 'Pricing optimizer', values: ['—', '✓', '✓'] },
  { label: 'Support agent', values: ['—', '✓', '✓'] },
  { label: 'Marketing agent', values: ['—', '✓', '✓'] },
  { label: 'SEO writer', values: ['✓', '✓', '✓'] },
  { label: 'Inventory monitor', values: ['—', '✓', '✓'] },
  { label: 'Custom agents (your policies)', values: ['—', '—', '✓'] },
  { section: 'Commerce' },
  { label: 'Forge transaction fee', values: ['<strong style="color:var(--green);">0%</strong>', '<strong style="color:var(--green);">0%</strong>', '<strong style="color:var(--green);">0%</strong>'] },
  { label: 'Stripe / payment processor', values: ['✓', '✓', '✓'] },
  { label: 'Multi-currency', values: ['—', '✓', '✓'] },
  { label: 'Subscriptions', values: ['—', '✓', '✓'] },
  { section: 'Platform' },
  { label: 'Approval gates + audit log', values: ['—', '✓', '✓'] },
  { label: 'Headless API + webhooks', values: ['—', '—', '✓'] },
  { label: 'SSO / SAML', values: ['—', '—', '✓'] },
  { label: 'SOC 2 report + DPA', values: ['—', '—', '✓'] },
  { section: 'Support' },
  { label: 'Channel', values: ['Community', 'Email · 24h', 'Slack · 4h'] },
  { label: 'Onboarding session', values: ['—', '—', '✓'] },
];

const SHOPIFY_STACK = [
  { label: 'Shopify Basic', value: '$39' },
  { label: 'Klaviyo (email)', value: '$60' },
  { label: 'Gorgias (support)', value: '$50' },
  { label: 'Yotpo (reviews)', value: '$29' },
  { label: 'ReConvert (upsell)', value: '$15' },
  { label: 'Recharge (subs)', value: '$99' },
  { label: 'Theme + dev hours', value: '$200' },
  { label: 'Copywriter / freelance', value: '$300' },
  { label: '+ 1.6% Shopify txn fee', value: '~$160 / mo on $10K', muted: true },
];

const FORGE_INCLUDED = [
  { label: 'Storefront + builder', value: 'included' },
  { label: 'Email marketing agent', value: 'included' },
  { label: 'Support agent', value: 'included' },
  { label: 'Reviews + UGC', value: 'included' },
  { label: 'Upsell + cart agent', value: 'included' },
  { label: 'Subscriptions', value: 'included' },
  { label: 'Theme + design', value: 'AI-generated' },
  { label: 'Copywriting agent', value: 'included' },
  { label: '0% Forge txn fee', value: '$0 / mo on $10K', accent: true },
];

const FAQ = [
  { q: 'Are there really no transaction fees?', a: "Forge takes 0% on every plan, forever. You'll still pay your payment processor (typically Stripe at 2.9% + 30¢). We don't add anything on top." },
  { q: 'What counts as an "AI generation"?', a: "A generation is one AI action — drafting a product description, generating a brand, replying to a ticket, suggesting a price. Most stores use 500–2,000/mo. Pro's 10,000 cap covers nearly everyone we've onboarded." },
  { q: 'Can I cancel anytime?', a: 'Yes. Monthly plans cancel anytime; annual plans are pro-rated. You keep ownership of your store, products, customers, and data — export anything as CSV or via the API.' },
  { q: 'Do you offer a free trial of Pro?', a: 'Yes — 14 days, no credit card required. You get the full agent stack, custom domain trial, and unlimited generations during the trial.' },
  { q: 'What if I outgrow Pro?', a: 'Scale is for brands at $50K+/mo who want multi-store, custom agents, headless API, and SOC 2 docs. Email <a href="#" style="color:var(--accent);">sales@forge.com</a> — most upgrades are done in 24 hours.' },
  { q: 'Is my data safe? Are you SOC 2?', a: 'Yes. SOC 2 Type II report available on Scale. All plans use PCI Level 1 payment processing, encrypted at rest and in transit. We never train on your data.' },
  { q: 'Can I migrate from Shopify?', a: 'Yes — our import wizard pulls your products, customers, orders, and theme references in one click. Most migrations finish in under 30 minutes.' },
];
