import Link from 'next/link';

export function CTA() {
  return (
    <section className="band">
      <div className="cta-section">
        <div
          className="kicker"
          style={{
            position: 'relative',
            display: 'inline-block',
            marginBottom: 12,
          }}
        >
          Free to start · live tonight
        </div>
        <h2>
          Your store, <em>built tonight.</em>
        </h2>
        <p>
          Describe your idea and watch it come to life in minutes — with a team
          of AI helpers already running the day-to-day. No code, no credit card,
          no risk.
        </p>
        <div
          style={{
            display: 'flex',
            gap: 10,
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <Link className="btn btn-primary btn-lg" href="/signup">
            Build my store free →
          </Link>
          <Link
            className="btn btn-lg"
            href="/pricing"
            style={{
              background: 'transparent',
              color: 'var(--fg)',
              borderColor: 'var(--border-strong)',
            }}
          >
            See pricing
          </Link>
        </div>
        <div className="guarantee">
          <span><span className="ic">✓</span> Free 14-day trial</span>
          <span><span className="ic">✓</span> Cancel anytime</span>
          <span><span className="ic">✓</span> Keep everything you build</span>
        </div>
      </div>
    </section>
  );
}
