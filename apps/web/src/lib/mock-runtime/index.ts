// Deterministic mock-runtime data for Phase 4 admin views.
//
// Real Phase 6+ replaces this with Stripe orders, customer accounts,
// and Gorgias / Forge-native support tickets. For now we synthesise
// stable rows from the brand id + saved products so the UI feels
// coherent and re-renders show the same data.

const FIRST_NAMES = [
  'Maya', 'Jordan', 'Sara', 'Tomás', 'Priya', 'Kenji', 'Lucia', 'Sam',
  'Ava', 'Noah', 'Olivia', 'Liam', 'Mei', 'Theo', 'Yara', 'Rumi',
  'Aleks', 'Marcus', 'Mira', 'Lin', 'Cora', 'Felix', 'Iris', 'Ezra',
];

const LAST_INITIALS = ['R.', 'K.', 'L.', 'V.', 'N.', 'M.', 'O.', 'P.', 'C.', 'D.', 'H.', 'S.'];

const FULFILL_STATES = ['processing', 'shipped', 'delivered', 'fulfilled'] as const;
const PAYMENT_STATES = ['paid', 'paid', 'paid', 'paid', 'paid', 'refund req'] as const;

const TICKET_SUBJECTS = [
  'Where is my order?',
  'Sizing question',
  'Refund request',
  'Change shipping address',
  'Bulk order quote',
  'Damaged on arrival',
  'Wrong item received',
  'Cancel my order',
  'Tracking link broken',
  'Product care instructions?',
];

const TICKET_STATES = [
  { status: 'auto-resolved' as const, ai: '94%' },
  { status: 'auto-resolved' as const, ai: '88%' },
  { status: 'auto-resolved' as const, ai: '91%' },
  { status: 'awaiting reply' as const, ai: '72%' },
  { status: 'awaiting reply' as const, ai: '68%' },
  { status: 'needs admin' as const, ai: '—' },
];

// xmur3 — a small deterministic hash that turns a string into a number stream.
function rng(seed: string) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return ((h >>> 0) % 1_000_000) / 1_000_000;
  };
}

function pick<T>(rand: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rand() * arr.length)]!;
}

function relativeTime(rand: () => number): { label: string; sortKey: number } {
  const minutesAgo = Math.floor(rand() * 60 * 24 * 6); // up to 6 days
  const sortKey = -minutesAgo;
  if (minutesAgo < 1) return { label: 'just now', sortKey };
  if (minutesAgo < 60) return { label: `${minutesAgo}m ago`, sortKey };
  const hr = Math.floor(minutesAgo / 60);
  if (hr < 24) return { label: `${hr}h ago`, sortKey };
  const d = Math.floor(hr / 24);
  return { label: `${d}d ago`, sortKey };
}

export type MockOrder = {
  id: string;
  customer: string;
  total: number;
  itemCount: number;
  status: (typeof PAYMENT_STATES)[number];
  fulfill: (typeof FULFILL_STATES)[number];
  date: string;
};

export type MockCustomer = {
  id: string;
  name: string;
  email: string;
  orders: number;
  totalSpent: number;
  lastSeen: string;
};

export type MockTicket = {
  id: string;
  subject: string;
  customer: string;
  ai: string;
  status: (typeof TICKET_STATES)[number]['status'];
  since: string;
};

type ProductLite = { name: string; price: number };

export function mockOrders(
  brandId: string,
  products: ProductLite[],
  count = 6,
): MockOrder[] {
  if (products.length === 0) return [];
  const r = rng(`${brandId}:orders`);
  const slugPrefix = brandId.slice(0, 2).toUpperCase();
  return Array.from({ length: count }, (_, i) => {
    const itemCount = 1 + Math.floor(r() * 3);
    let total = 0;
    for (let k = 0; k < itemCount; k++) {
      total += pick(r, products).price;
    }
    const t = relativeTime(r);
    return {
      id: `#${slugPrefix}-${1000 + Math.floor(r() * 9000)}`,
      customer: `${pick(r, FIRST_NAMES)} ${pick(r, LAST_INITIALS)}`,
      total,
      itemCount,
      status: pick(r, PAYMENT_STATES),
      fulfill: pick(r, FULFILL_STATES),
      date: t.label,
    };
  }).sort((a, b) => a.date.localeCompare(b.date));
}

export function mockCustomers(
  brandId: string,
  products: ProductLite[],
  count = 8,
): MockCustomer[] {
  const r = rng(`${brandId}:customers`);
  return Array.from({ length: count }, () => {
    const orders = 1 + Math.floor(r() * 5);
    let totalSpent = 0;
    for (let k = 0; k < orders; k++) {
      const p = products.length > 0 ? pick(r, products) : { price: 50 };
      totalSpent += p.price * (1 + Math.floor(r() * 2));
    }
    const first = pick(r, FIRST_NAMES);
    const last = pick(r, LAST_INITIALS);
    const localPart = `${first.toLowerCase()}.${last.toLowerCase().replace(/[^a-z]/g, '')}`;
    const t = relativeTime(r);
    return {
      id: `cu_${Math.floor(r() * 1_000_000).toString(16)}`,
      name: `${first} ${last}`,
      email: `${localPart}@${pick(r, ['gmail.com', 'icloud.com', 'protonmail.com', 'hey.com', 'fastmail.com'])}`,
      orders,
      totalSpent,
      lastSeen: t.label,
    };
  });
}

export function mockTickets(brandId: string, count = 5): MockTicket[] {
  const r = rng(`${brandId}:tickets`);
  return Array.from({ length: count }, (_, i) => {
    const state = pick(r, TICKET_STATES);
    const t = relativeTime(r);
    return {
      id: `T-${200 + Math.floor(r() * 100)}`,
      subject: pick(r, TICKET_SUBJECTS),
      customer: `${pick(r, FIRST_NAMES)} ${pick(r, LAST_INITIALS)}`,
      ai: state.ai,
      status: state.status,
      since: t.label,
    };
  });
}
