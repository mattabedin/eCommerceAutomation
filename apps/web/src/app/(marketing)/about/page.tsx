export const metadata = {
  title: 'About — Forge',
};

export default function AboutPage() {
  return (
    <>
      <section className="about-hero">
        <span className="eyebrow">About Forge</span>
        <h1 className="display" style={{ fontSize: 'clamp(36px, 5vw, 56px)' }}>
          We're building the platform we
          <br />
          <em>wish existed</em> when we started selling online.
        </h1>
      </section>

      <section className="about-section">
        <h2>The story</h2>
        <p>
          Forge started in a Brooklyn apartment in 2023. Our founder Mira had
          just spent three months — and almost $4,000 — assembling a Shopify
          store for her ceramics business. Theme licenses, app subscriptions,
          freelance copy, an agency that ghosted, a checkout that broke on
          launch day.
        </p>
        <p>
          She finally went live and immediately spent the next year doing what
          every solo founder does: drowning in the operational tax of running a
          store. Writing the same support replies. Repricing things by gut.
          Drafting newsletters at midnight.
        </p>
        <p>
          <strong>
            The problem wasn't a missing feature. The problem was that the
            platform wasn't{' '}
            <em style={{ fontFamily: 'var(--font-serif)' }}>doing</em> anything
            for her.
          </strong>{' '}
          It just gave her more tools.
        </p>
        <blockquote>
          What if running a store felt less like managing software and more
          like having a brilliant team that already knows your brand?
        </blockquote>
        <p>
          Forge is the answer. We're building commerce infrastructure where AI
          agents don't just <em>assist</em> — they own real surfaces of the
          business. Pricing. Support. Marketing. Inventory. With approval gates
          and audit logs, so the operator stays in control without doing the
          grunt work.
        </p>
      </section>

      <section className="band">
        <div className="band-header">
          <h2 className="section-title">What we believe.</h2>
        </div>
        <div className="values-grid">
          {VALUES.map(v => (
            <div key={v.num} className="value-card">
              <div className="value-num">{v.num}</div>
              <h3>{v.title}</h3>
              <p>{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="about-section">
        <h2>How we got here</h2>
        <div className="timeline" style={{ marginTop: 24 }}>
          {TIMELINE.map(t => (
            <div key={t.date} className="timeline-item">
              <div
                className="timeline-date"
                style={t.highlight ? { color: 'var(--accent)' } : undefined}
              >
                {t.date}
              </div>
              <div className="timeline-title">{t.title}</div>
              <div className="timeline-desc">{t.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="band">
        <div className="band-header">
          <div className="kicker">The team</div>
          <h2 className="section-title">
            Twenty-three people. Thirty-one languages.
            <br />
            <em>One product.</em>
          </h2>
        </div>
        <div className="team-grid">
          {TEAM.map(p => (
            <div key={p.name} className="team-card">
              <div
                className="team-photo"
                style={{ background: p.gradient }}
              />
              <div className="team-name">{p.name}</div>
              <div className="team-role">{p.role}</div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <a href="#" className="btn">
            View open roles · 7 hiring →
          </a>
        </div>
      </section>

      <section className="band">
        <div className="band-header">
          <div className="kicker">Backed by</div>
          <h2 className="section-title">
            $28M raised from people who know commerce.
          </h2>
        </div>
        <div
          style={{
            maxWidth: 900,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 16,
          }}
        >
          {['Index', 'Spark', 'a16z', 'Founders Fund'].map(name => (
            <div
              key={name}
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 12,
                padding: 28,
                textAlign: 'center',
                fontFamily: 'var(--font-serif)',
                fontSize: 22,
                fontStyle: 'italic',
                color: 'var(--fg-2)',
              }}
            >
              {name}
            </div>
          ))}
        </div>
        <div
          style={{
            textAlign: 'center',
            marginTop: 24,
            fontSize: 13,
            color: 'var(--fg-3)',
            maxWidth: 600,
            margin: '24px auto 0',
            lineHeight: 1.6,
          }}
        >
          Plus angels from Stripe, Shopify, Klaviyo, Linear, and 30+ ecommerce
          founders who built the brands you'd recognize.
        </div>
      </section>

      <section className="band">
        <div className="cta-section">
          <h2>Come build with us.</h2>
          <p>
            Whether you're starting your store or starting your career — Forge
            is hiring, and Forge is free to try.
          </p>
          <div
            style={{
              display: 'flex',
              gap: 10,
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <a className="btn btn-primary btn-lg" href="/signup">
              Build a store →
            </a>
            <a
              className="btn btn-lg"
              href="#"
              style={{
                background: 'transparent',
                color: 'white',
                borderColor: 'rgba(255,255,255,0.2)',
              }}
            >
              See open roles
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

const VALUES = [
  { num: '01', title: 'Agents do the work, operators decide.', body: "The best AI products don't replace humans — they remove the grunt work and surface the decisions worth making. Every Forge agent shows its math and waits for approval where it counts." },
  { num: '02', title: 'One platform, one bill.', body: 'The "stack" approach made sense when nobody owned the whole problem. We do. Forge replaces nine SaaS subscriptions because owning the full picture lets us build something better than any single layer could.' },
  { num: '03', title: 'Take care with money.', body: 'Zero transaction fees. Forever. Your revenue is yours. We charge a flat subscription so our incentives line up with yours: we win when you keep using Forge, not when you sell more.' },
  { num: '04', title: 'Speed is a design choice.', body: 'Five minutes from signup to first storefront. Ninety seconds to a drafted support reply. Every interaction in Forge is engineered around the time the operator actually has — not the time the platform wants to extract.' },
  { num: '05', title: 'Quiet over loud.', body: 'No emoji confetti. No "AI" badges shouting on every surface. Forge does its work in the background and surfaces only what needs your attention. The brand should feel like yours, not ours.' },
  { num: '06', title: 'Earn trust, then automate.', body: 'Every new agent ships with approval gates on by default. As the operator builds trust, they unlock more autonomy. The platform should feel like a teammate, not a black box.' },
];

const TIMELINE = [
  { date: 'MAR 2023', title: 'Founded in Brooklyn', desc: 'Mira and Aleks start sketching what a "self-running store" could feel like. Most early prototypes are a Notion doc and a hacked-together GPT chain.' },
  { date: 'SEP 2023', title: 'Seed round · $4.2M', desc: 'Led by Index Ventures with participation from Combinator alums. We hire our first three engineers and a designer.' },
  { date: 'JAN 2024', title: 'First storefront ships', desc: 'PawLuxe Co. (a real Forge customer) goes live four minutes after they sign up. They make their first sale that night.' },
  { date: 'MAY 2024', title: 'Pricing & Support agents launch', desc: 'Agents move from "drafting" to "owning." Support auto-resolution hits 78% with 94% confidence accuracy by month-end.' },
  { date: 'OCT 2024', title: 'Series A · $24M', desc: 'We hit 800 paying brands and $2.1M in ARR. Series A led by Spark with strategic participation from a16z.' },
  { date: 'FEB 2025', title: 'Public beta', desc: 'Forge 0.4 opens to anyone. 1,400+ brands within six weeks. Median time-to-launch: 4 minutes 12 seconds.' },
  { date: 'NOW', title: 'Building toward 1.0', desc: "Custom agents, multi-store, fulfillment marketplace. We're hiring across engineering, design, and ops.", highlight: true },
];

const TEAM = [
  { name: 'Mira Patel', role: 'CEO & Co-founder', gradient: 'linear-gradient(135deg, #6366F1, #8b5cf6)' },
  { name: 'Aleks Volkov', role: 'CTO & Co-founder', gradient: 'linear-gradient(135deg, #16a34a, #22C55E)' },
  { name: 'Lin Chen', role: 'Head of Design', gradient: 'linear-gradient(135deg, #d97706, #f59e0b)' },
  { name: 'Marcus Owen', role: 'Head of AI', gradient: 'linear-gradient(135deg, #ec4899, #f43f5e)' },
  { name: 'Yara Haddad', role: 'Head of Product', gradient: 'linear-gradient(135deg, #0ea5e9, #6366F1)' },
  { name: 'Theo Renard', role: 'Eng · Agents', gradient: 'linear-gradient(135deg, #84cc16, #16a34a)' },
  { name: 'Priya Devi', role: 'Eng · Storefront', gradient: 'linear-gradient(135deg, #a855f7, #ec4899)' },
  { name: 'Rumi Saito', role: 'Eng · Platform', gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)' },
];
