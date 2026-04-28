const BRANDS = [
  'PawLuxe Co.', 'DeskNova', 'North Atelier', 'Common Press', 'Field & Vine',
  'Salt Studio', 'Verdant House', 'Harbor & Co.', 'Lumen Goods', 'Marlow',
];

export function LogosMarquee() {
  return (
    <section className="logos">
      <div className="logos-label">Powering 1,400+ AI-built brands</div>
      <div className="logos-fade">
        <div className="logos-marquee">
          {[...BRANDS, ...BRANDS].map((b, i) => (
            <span key={i}>{b}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
