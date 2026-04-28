// Mock data for Phase 2A — the Builder UI runs on a scripted exchange so we
// can iterate on visuals without burning Claude tokens. Phase 2B replaces
// the script with real Anthropic streaming.

export type BrandKey = 'pawluxe' | 'desknova';

export type Brand = {
  name: string;
  tagline: string;
  niche: string;
  audience: string;
  tone: string;
  colors: { primary: string; secondary: string; accent: string };
  categories: string[];
  domain: string;
  heroH: string;
  heroP: string;
};

export type Product = {
  id: string;
  name: string;
  cat: string;
  price: number;
  was: number;
  cost: number;
  tone: string;
  stock: number;
  sales: number;
};

export const BRANDS: Record<BrandKey, Brand> = {
  pawluxe: {
    name: 'PawLuxe Co.',
    tagline: 'Luxury essentials for modern dog owners.',
    niche: 'premium pet accessories',
    audience: 'urban dog owners, 25–45',
    tone: 'premium · warm · stylish',
    colors: { primary: '#111827', secondary: '#D4AF37', accent: '#F9FAFB' },
    categories: ['Collars', 'Leashes', 'Beds', 'Travel'],
    domain: 'pawluxe.forge.shop',
    heroH: 'Heirloom essentials for the modern dog.',
    heroP: 'Hand-finished collars, leashes, and beds for owners who care about how things are made — and how they last.',
  },
  desknova: {
    name: 'DeskNova',
    tagline: 'Smarter tools for modern workspaces.',
    niche: 'home office accessories',
    audience: 'remote workers, 25–45',
    tone: 'clean · professional · minimal',
    colors: { primary: '#0a0a0a', secondary: '#3b82f6', accent: '#fafafa' },
    categories: ['Desks', 'Lighting', 'Monitors', 'Audio'],
    domain: 'desknova.forge.shop',
    heroH: 'A workspace that disappears.',
    heroP: 'Quietly designed desk tools for people who want their work to be the loudest thing in the room.',
  },
};

export const PRODUCTS: Record<BrandKey, Product[]> = {
  pawluxe: [
    { id: 'p1', name: 'Heirloom Leather Collar', cat: 'Collars', price: 89, was: 129, cost: 22, tone: '#d4af37', stock: 142, sales: 318 },
    { id: 'p2', name: 'Brass-Cast Leash 6ft', cat: 'Leashes', price: 74, was: 98, cost: 18, tone: '#b08968', stock: 88, sales: 211 },
    { id: 'p3', name: 'Cloud Lounger Bed', cat: 'Beds', price: 189, was: 240, cost: 62, tone: '#e8dcc4', stock: 34, sales: 142 },
    { id: 'p4', name: 'Travel Tote · Walnut', cat: 'Travel', price: 145, was: 195, cost: 41, tone: '#8b6f47', stock: 21, sales: 96 },
    { id: 'p5', name: 'Cashmere Throw Bed', cat: 'Beds', price: 245, was: 320, cost: 78, tone: '#c9b89a', stock: 12, sales: 68 },
    { id: 'p6', name: 'Rolled Suede Collar', cat: 'Collars', price: 64, was: 89, cost: 16, tone: '#a47148', stock: 96, sales: 187 },
    { id: 'p7', name: 'Marble Treat Vessel', cat: 'Travel', price: 58, was: 75, cost: 14, tone: '#ede4d3', stock: 67, sales: 124 },
    { id: 'p8', name: 'Linen Day Harness', cat: 'Collars', price: 98, was: 130, cost: 25, tone: '#d6cab1', stock: 53, sales: 102 },
  ],
  desknova: [
    { id: 'd1', name: 'Halo Task Lamp', cat: 'Lighting', price: 169, was: 220, cost: 52, tone: '#3b82f6', stock: 84, sales: 312 },
    { id: 'd2', name: 'Sift Linear Speaker', cat: 'Audio', price: 245, was: 320, cost: 78, tone: '#71717a', stock: 32, sales: 198 },
    { id: 'd3', name: 'Plinth Monitor Stand', cat: 'Monitors', price: 89, was: 119, cost: 28, tone: '#a8a29e', stock: 142, sales: 401 },
    { id: 'd4', name: 'Form Sit-Stand Desk', cat: 'Desks', price: 749, was: 950, cost: 280, tone: '#525252', stock: 18, sales: 42 },
    { id: 'd5', name: 'Cable Spine v2', cat: 'Desks', price: 39, was: 52, cost: 9, tone: '#262626', stock: 240, sales: 521 },
    { id: 'd6', name: 'Hush Mech Keyboard 65', cat: 'Audio', price: 219, was: 280, cost: 72, tone: '#0a0a0a', stock: 41, sales: 156 },
    { id: 'd7', name: 'Aether Mic Boom', cat: 'Audio', price: 129, was: 165, cost: 38, tone: '#404040', stock: 67, sales: 88 },
    { id: 'd8', name: 'Plate Mouse Pad', cat: 'Desks', price: 49, was: 64, cost: 12, tone: '#737373', stock: 188, sales: 342 },
  ],
};

export const STAGES = [
  { id: 'analyze', label: 'Analyzing niche · sourcing 18 reference brands' },
  { id: 'brand', label: 'Generating brand · name, palette, voice' },
  { id: 'pages', label: 'Building pages · home, about, FAQ, policies' },
  { id: 'catalog', label: 'Drafting catalog · 8 products + variants' },
  { id: 'price', label: 'Pricing · margin model · psychological tiers' },
  { id: 'seo', label: 'SEO · meta, schema, sitemap' },
  { id: 'preview', label: 'Preview ready' },
] as const;

export function scriptPromptFor(brandKey: BrandKey): string {
  if (brandKey === 'pawluxe') {
    return 'Build me an online store selling luxury pet accessories for dog owners in the United States, premium branding, products $30–$200.';
  }
  return 'Build me a store for modern home office accessories — minimal, professional, $40–$800.';
}

export type BuildStatus = 'idle' | 'thinking' | 'building' | 'ready';

export type BuildState = {
  active: number;
  blueprint: Blueprint | null;
  status: BuildStatus;
};

export type Blueprint = {
  store_name: string;
  tagline: string;
  niche: string;
  target_audience: string;
  brand_tone: string;
  colors: { primary: string; secondary: string; accent: string };
  categories: string[];
  homepage_sections: string[];
};
