/* Forge — data: PawLuxe brand + catalog + agent stages */

const BRANDS = {
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

const PRODUCTS = {
  pawluxe: [
    { id: 'p1', name: 'Heirloom Leather Collar', cat: 'Collars',  price: 89,  was: 129, cost: 22, tone: '#d4af37', stock: 142, sales: 318 },
    { id: 'p2', name: 'Brass-Cast Leash 6ft',    cat: 'Leashes',  price: 74,  was: 98,  cost: 18, tone: '#b08968', stock: 88,  sales: 211 },
    { id: 'p3', name: 'Cloud Lounger Bed',       cat: 'Beds',     price: 189, was: 240, cost: 62, tone: '#e8dcc4', stock: 34,  sales: 142 },
    { id: 'p4', name: 'Travel Tote · Walnut',    cat: 'Travel',   price: 145, was: 195, cost: 41, tone: '#8b6f47', stock: 21,  sales: 96  },
    { id: 'p5', name: 'Cashmere Throw Bed',      cat: 'Beds',     price: 245, was: 320, cost: 78, tone: '#c9b89a', stock: 12,  sales: 68  },
    { id: 'p6', name: 'Rolled Suede Collar',     cat: 'Collars',  price: 64,  was: 89,  cost: 16, tone: '#a47148', stock: 96,  sales: 187 },
    { id: 'p7', name: 'Marble Treat Vessel',     cat: 'Travel',   price: 58,  was: 75,  cost: 14, tone: '#ede4d3', stock: 67,  sales: 124 },
    { id: 'p8', name: 'Linen Day Harness',       cat: 'Collars',  price: 98,  was: 130, cost: 25, tone: '#d6cab1', stock: 53,  sales: 102 },
  ],
  desknova: [
    { id: 'd1', name: 'Halo Task Lamp',         cat: 'Lighting', price: 169, was: 220, cost: 52, tone: '#3b82f6', stock: 84,  sales: 312 },
    { id: 'd2', name: 'Sift Linear Speaker',    cat: 'Audio',    price: 245, was: 320, cost: 78, tone: '#71717a', stock: 32,  sales: 198 },
    { id: 'd3', name: 'Plinth Monitor Stand',   cat: 'Monitors', price: 89,  was: 119, cost: 28, tone: '#a8a29e', stock: 142, sales: 401 },
    { id: 'd4', name: 'Form Sit-Stand Desk',    cat: 'Desks',    price: 749, was: 950, cost: 280,tone: '#525252', stock: 18,  sales: 42  },
    { id: 'd5', name: 'Cable Spine v2',         cat: 'Desks',    price: 39,  was: 52,  cost: 9,  tone: '#262626', stock: 240, sales: 521 },
    { id: 'd6', name: 'Hush Mech Keyboard 65',  cat: 'Audio',    price: 219, was: 280, cost: 72, tone: '#0a0a0a', stock: 41,  sales: 156 },
    { id: 'd7', name: 'Aether Mic Boom',        cat: 'Audio',    price: 129, was: 165, cost: 38, tone: '#404040', stock: 67,  sales: 88  },
    { id: 'd8', name: 'Plate Mouse Pad',        cat: 'Desks',    price: 49,  was: 64,  cost: 12, tone: '#737373', stock: 188, sales: 342 },
  ],
};

const ORDERS = [
  { id: '#PL-1042', cust: 'Maya R.',   total: 218.00, status: 'paid',       fulfill: 'processing', date: '2m ago',   items: 2 },
  { id: '#PL-1041', cust: 'Jordan K.', total: 89.00,  status: 'paid',       fulfill: 'shipped',    date: '14m ago',  items: 1 },
  { id: '#PL-1040', cust: 'Sara L.',   total: 432.00, status: 'paid',       fulfill: 'delivered',  date: '1h ago',   items: 3 },
  { id: '#PL-1039', cust: 'Tomás V.',  total: 145.00, status: 'refund req', fulfill: 'delivered',  date: '3h ago',   items: 1 },
  { id: '#PL-1038', cust: 'Priya N.',  total: 189.00, status: 'paid',       fulfill: 'shipped',    date: '5h ago',   items: 1 },
  { id: '#PL-1037', cust: 'Kenji M.',  total: 64.00,  status: 'paid',       fulfill: 'fulfilled',  date: '8h ago',   items: 1 },
];

const TICKETS = [
  { id: 'T-218', subj: 'Where is my order?',    cust: 'Tomás V.',   ai: '94%', status: 'auto-resolved', since: '3m' },
  { id: 'T-217', subj: 'Sizing — Heirloom XL?', cust: 'Priya N.',   ai: '88%', status: 'awaiting reply', since: '14m' },
  { id: 'T-216', subj: 'Refund request',         cust: 'Sam P.',     ai: '—',   status: 'needs admin',   since: '1h' },
  { id: 'T-215', subj: 'Change shipping addr',   cust: 'Lucia O.',   ai: '91%', status: 'auto-resolved', since: '2h' },
  { id: 'T-214', subj: 'Bulk order quote',       cust: 'Acme Co.',   ai: '—',   status: 'needs admin',   since: '4h' },
];

const VARIANTS = [
  { sku: 'PLC-S-BLK', size: 'S', color: 'Black',  price: 89,  cost: 22, stock: 24, image: '#1a1a1a' },
  { sku: 'PLC-M-BLK', size: 'M', color: 'Black',  price: 89,  cost: 22, stock: 38, image: '#1a1a1a' },
  { sku: 'PLC-L-BLK', size: 'L', color: 'Black',  price: 89,  cost: 22, stock: 22, image: '#1a1a1a' },
  { sku: 'PLC-S-COG', size: 'S', color: 'Cognac', price: 95,  cost: 24, stock: 16, image: '#a47148' },
  { sku: 'PLC-M-COG', size: 'M', color: 'Cognac', price: 95,  cost: 24, stock: 28, image: '#a47148' },
  { sku: 'PLC-L-COG', size: 'L', color: 'Cognac', price: 95,  cost: 24, stock: 14, image: '#a47148' },
];

// Builder conversation script
const SCRIPT_INITIAL = (brandKey) => {
  const b = BRANDS[brandKey];
  return [
    {
      kind: 'ai',
      text: `I'll build you a complete store. Got a niche in mind, or want me to start with a strong example?`,
      meta: 'FORGE · v0.4',
    },
  ];
};

const SCRIPT_PROMPT = (brandKey) => {
  const b = BRANDS[brandKey];
  if (brandKey === 'pawluxe') return `Build me an online store selling luxury pet accessories for dog owners in the United States, premium branding, products $30–$200.`;
  return `Build me a store for modern home office accessories — minimal, professional, $40–$800.`;
};

// Build stages shown during generation
const STAGES = [
  { id: 'analyze',  label: 'Analyzing niche · sourcing 18 reference brands' },
  { id: 'brand',    label: 'Generating brand · name, palette, voice' },
  { id: 'pages',    label: 'Building pages · home, about, FAQ, policies' },
  { id: 'catalog',  label: 'Drafting catalog · 8 products + variants' },
  { id: 'price',    label: 'Pricing · margin model · psychological tiers' },
  { id: 'seo',      label: 'SEO · meta, schema, sitemap' },
  { id: 'preview',  label: 'Preview ready' },
];

window.FORGE = { BRANDS, PRODUCTS, ORDERS, TICKETS, VARIANTS, SCRIPT_INITIAL, SCRIPT_PROMPT, STAGES };
