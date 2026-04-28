type Testimonial = {
  quote: string;
  name: string;
  role: string;
  initial: string;
  gradient: string;
  metric: string;
};

const TESTIMONIALS: Testimonial[] = [
  {
    quote: '"I described my idea on Tuesday. Friday morning we shipped our first order. Forge wrote everything — the brand, copy, FAQ. I just approved."',
    name: 'Maya Chen',
    role: 'Founder, PawLuxe Co.',
    initial: 'M',
    gradient: 'linear-gradient(135deg, #6366F1, #8b5cf6)',
    metric: '↑ Live in 4 days',
  },
  {
    quote: "\"The pricing agent paid for the platform in week two. I wasn't going to charge $89 for that collar. Forge ran the math, showed the demand curve, and I trusted it.\"",
    name: 'Jordan Kettering',
    role: 'Operator, DeskNova',
    initial: 'J',
    gradient: 'linear-gradient(135deg, #16a34a, #22C55E)',
    metric: '↑ +$2,800 / mo',
  },
  {
    quote: '"We replaced Shopify, Klaviyo, Gorgias, and Recharge. One bill, one inbox. Our team went from drowning to actually running the brand."',
    name: 'Sara Levin',
    role: 'CEO, North Atelier',
    initial: 'S',
    gradient: 'linear-gradient(135deg, #d97706, #f59e0b)',
    metric: '↓ Saved $903 / mo',
  },
];

export function Testimonials() {
  return (
    <section className="band" id="customers">
      <div className="band-header">
        <div className="kicker">⊹ From the brands using Forge</div>
        <h2 className="section-title">
          "It's like having ten
          <br />
          employees on day one."
        </h2>
      </div>
      <div className="testimonials">
        {TESTIMONIALS.map(t => (
          <div key={t.name} className="testi">
            <p className="testi-quote">{t.quote}</p>
            <div className="testi-author">
              <div className="testi-avatar" style={{ background: t.gradient }}>
                {t.initial}
              </div>
              <div>
                <div className="testi-name">{t.name}</div>
                <div className="testi-role">{t.role}</div>
              </div>
            </div>
            <span className="testi-metric">{t.metric}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
