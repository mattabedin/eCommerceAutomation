// Story / Editorial block. Serif type does the luxury lift; the testimonial
// quote is folded inside this section per the designer brief — a separate
// testimonial trio looks sparse for 6-8 SKU stores.
export function EditorialBlock({
  brandName,
  tagline,
  body,
}: {
  brandName: string;
  tagline?: string;
  body?: string;
}) {
  // We don't have a real long-form story per brand yet, so we synthesise
  // one from tagline + a stock paragraph. The AI Builder can generate a
  // dedicated `story` field later; until then this still reads
  // intentional because the type does the work.
  const headline = tagline ?? `Made with care, sold with conviction.`;
  const paragraph =
    body ??
    `${brandName} is a small studio building pieces that reward daily use. ` +
      `Every item is sourced and finished against the same standard: it has to last, ` +
      `it has to feel honest, and it has to be worth the price.`;

  return (
    <section className="editorial">
      <div className="editorial-img" />
      <div className="editorial-body">
        <h2>{headline}</h2>
        <p>{paragraph}</p>
        <blockquote className="editorial-quote">
          “Nothing here is filler. Each piece is the one we'd reach for
          ourselves.”
          <span className="editorial-quote-source">
            — A. Mendes, head of design
          </span>
        </blockquote>
      </div>
    </section>
  );
}
