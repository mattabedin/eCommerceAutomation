// Trust-badges row, designed to sit *inline under the hero CTA* per the
// designer brief — a separate section row wastes the first scroll.
export function HeroTrustBadges() {
  return (
    <div className="hero-trust">
      <span><span className="dot" /> Free shipping over $75</span>
      <span><span className="dot" /> 60-day returns</span>
      <span><span className="dot" /> Carbon-neutral delivery</span>
    </div>
  );
}
