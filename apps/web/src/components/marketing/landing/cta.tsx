import Link from 'next/link';

export function CTA() {
  return (
    <section className="band">
      <div className="cta-section">
        <div
          className="kicker"
          style={{
            color: '#a5b4fc',
            position: 'relative',
            display: 'inline-block',
            marginBottom: 12,
          }}
        >
          ⊹ Free to start · live tonight
        </div>
        <h2>
          Your store, <em>built tonight.</em>
        </h2>
        <p>
          Free to build. No credit card. Live in under 5 minutes — with five AI
          teammates already running it.
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
            Start building →
          </Link>
          <Link
            className="btn btn-lg"
            href="/pricing"
            style={{
              background: 'transparent',
              color: 'white',
              borderColor: 'rgba(255,255,255,0.2)',
            }}
          >
            See pricing
          </Link>
        </div>
      </div>
    </section>
  );
}
