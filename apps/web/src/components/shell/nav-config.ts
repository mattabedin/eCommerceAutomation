import type { IconName } from '@/components/icons';

export type NavItem = {
  id: string;
  label: string;
  icon: IconName;
  sub?: string;
  count?: string;
};

export type NavSection = {
  sec: string;
  items: NavItem[];
};

export const NAV: NavSection[] = [
  {
    sec: 'Build',
    items: [
      { id: 'builder', label: 'AI Builder', icon: 'sparkle', sub: 'New' },
      { id: 'preview', label: 'Storefront', icon: 'globe' },
      { id: 'publishing', label: 'Publishing', icon: 'rocket' },
    ],
  },
  {
    sec: 'Manage',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: 'grid' },
      { id: 'products', label: 'Products', icon: 'box', count: '8' },
      { id: 'orders', label: 'Orders', icon: 'cart', count: '6' },
      { id: 'customers', label: 'Customers', icon: 'users' },
    ],
  },
  {
    sec: 'Grow',
    items: [
      { id: 'marketing', label: 'Marketing', icon: 'mega' },
      { id: 'support', label: 'Support', icon: 'chat', count: '5' },
      { id: 'analytics', label: 'Analytics', icon: 'trend' },
    ],
  },
  {
    sec: 'Workspace',
    items: [
      { id: 'settings', label: 'Settings', icon: 'gear' },
      { id: 'billing', label: 'Billing', icon: 'card' },
    ],
  },
];

export const VIEW_LABELS: Record<string, string> = {
  builder: 'AI Builder',
  preview: 'Storefront',
  publishing: 'Publishing & Hosting',
  dashboard: 'Dashboard',
  products: 'Products',
  orders: 'Orders',
  customers: 'Customers',
  marketing: 'Marketing',
  support: 'Support',
  analytics: 'Analytics',
  settings: 'Settings',
  billing: 'Billing',
};

export const CURRENT_BRAND = {
  name: 'PawLuxe',
  colors: { primary: '#d97706', secondary: '#fbbf24' },
};

export const CURRENT_USER = {
  name: 'Maya Chen',
  email: 'maya@studio.co',
  initial: 'M',
  plan: 'PRO',
};
