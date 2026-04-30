// Storefront theme registry. Adding a theme is a 30-line config + an
// optional [data-theme="..."] CSS block in globals.css. Component code
// reads `theme.homepageSections` and `theme.heroLayout` to choose which
// React variant renders; everything else is CSS variation keyed off the
// data attribute on the page wrapper.

export type ThemeId =
  | 'editorial'
  | 'minimal'
  | 'bold'
  | 'lookbook'
  | 'boutique'
  | 'tech'
  | 'vintage'
  | 'playful'
  | 'brutalist'
  | 'catalog';

export type SectionId =
  | 'announcement'
  | 'hero'
  | 'categories'
  | 'featured'
  | 'editorial'
  | 'newsletter'
  | 'footer';

export type HeroLayout = 'split' | 'full-bleed' | 'centered' | 'tile-hero';

export type ThemeConfig = {
  id: ThemeId;
  name: string;
  description: string;
  // Section sequence — the order they render on the homepage.
  homepageSections: SectionId[];
  heroLayout: HeroLayout;
  // Brief shown next to the picker so the operator knows when to pick it.
  bestFor: string;
};

export const THEMES: Record<ThemeId, ThemeConfig> = {
  editorial: {
    id: 'editorial',
    name: 'Editorial',
    description: 'Magazine-style serif headlines, soft accents, story-led.',
    homepageSections: [
      'announcement',
      'hero',
      'categories',
      'featured',
      'editorial',
      'newsletter',
      'footer',
    ],
    heroLayout: 'split',
    bestFor: 'Boutique, lifestyle, beauty',
  },
  minimal: {
    id: 'minimal',
    name: 'Minimal',
    description: 'Sans-only, generous whitespace, single big hero, no chrome.',
    homepageSections: ['hero', 'featured', 'footer'],
    heroLayout: 'centered',
    bestFor: 'Premium tech, accessories, single-product brands',
  },
  bold: {
    id: 'bold',
    name: 'Bold',
    description: 'Saturated colour blocks, oversized type, sale-heavy.',
    homepageSections: [
      'announcement',
      'hero',
      'featured',
      'categories',
      'editorial',
      'newsletter',
      'footer',
    ],
    heroLayout: 'full-bleed',
    bestFor: 'Streetwear, discount-feel niches, urgency drops',
  },
  lookbook: {
    id: 'lookbook',
    name: 'Lookbook',
    description: 'Tile-first hero, large product imagery, sparse copy.',
    homepageSections: ['hero', 'categories', 'featured', 'editorial', 'footer'],
    heroLayout: 'tile-hero',
    bestFor: 'Fashion, jewellery, decor, gift sets',
  },
  boutique: {
    id: 'boutique',
    name: 'Boutique',
    description: 'Cream tones, serif everywhere, ornate spacing.',
    homepageSections: [
      'announcement',
      'hero',
      'featured',
      'editorial',
      'newsletter',
      'footer',
    ],
    heroLayout: 'centered',
    bestFor: 'Heritage brands, fine goods, perfumery',
  },
  tech: {
    id: 'tech',
    name: 'Tech',
    description: 'Monospace eyebrows, sharp corners, geometric grid.',
    homepageSections: [
      'announcement',
      'hero',
      'categories',
      'featured',
      'footer',
    ],
    heroLayout: 'split',
    bestFor: 'Gadgets, gear, tools, software-adjacent goods',
  },
  vintage: {
    id: 'vintage',
    name: 'Vintage',
    description: 'Hatched textures, framed cards, sepia accents.',
    homepageSections: [
      'announcement',
      'hero',
      'featured',
      'editorial',
      'newsletter',
      'footer',
    ],
    heroLayout: 'split',
    bestFor: 'Antiques, books, vinyl, slow goods',
  },
  playful: {
    id: 'playful',
    name: 'Playful',
    description: 'Pill buttons, rounded everything, soft pastels, bouncy.',
    homepageSections: [
      'announcement',
      'hero',
      'categories',
      'featured',
      'newsletter',
      'footer',
    ],
    heroLayout: 'full-bleed',
    bestFor: 'Kids, snacks, candles, pet brands',
  },
  brutalist: {
    id: 'brutalist',
    name: 'Brutalist',
    description: 'Sharp corners, raw type, no shadows, monospace headlines.',
    homepageSections: ['hero', 'featured', 'editorial', 'footer'],
    heroLayout: 'split',
    bestFor: 'Indie design, art books, statement goods',
  },
  catalog: {
    id: 'catalog',
    name: 'Catalog',
    description: 'Dense product grid, compact spacing, classic e-comm feel.',
    homepageSections: ['announcement', 'hero', 'featured', 'footer'],
    heroLayout: 'tile-hero',
    bestFor: 'Tools, hardware, multi-SKU stores',
  },
};

export const DEFAULT_THEME: ThemeId = 'editorial';

export function isThemeId(v: string | null | undefined): v is ThemeId {
  return v != null && Object.prototype.hasOwnProperty.call(THEMES, v);
}

export function resolveTheme(v: string | null | undefined): ThemeConfig {
  return isThemeId(v) ? THEMES[v] : THEMES[DEFAULT_THEME];
}

// Heuristic: scan a brief / brand prompt for keywords that suggest a
// particular theme. Used at AI Builder time to pre-select a theme on a
// new brand. Operator can change it from the preview later.
export function suggestThemeFromBrief(brief: string): ThemeId {
  const b = brief.toLowerCase();
  const has = (...words: string[]) => words.some(w => b.includes(w));
  if (has('streetwear', 'urban', 'drop', 'hype', 'sneaker')) return 'bold';
  if (has('vintage', 'antique', 'retro', 'heritage', 'restored')) return 'vintage';
  if (has('boutique', 'perfumery', 'luxury', 'fine', 'heritage', 'maison')) return 'boutique';
  if (has('kids', 'snack', 'candy', 'pet', 'toy', 'plush', 'candle')) return 'playful';
  if (has('tool', 'gear', 'hardware', 'workshop', 'multi-tool', 'utility')) return 'tech';
  if (has('book', 'art', 'gallery', 'studio', 'press')) return 'brutalist';
  if (has('catalog', 'parts', 'supplies', 'wholesale')) return 'catalog';
  if (has('lookbook', 'jewellery', 'jewelry', 'decor', 'gift')) return 'lookbook';
  if (has('minimal', 'simple', 'one product', 'single-sku')) return 'minimal';
  return 'editorial';
}
