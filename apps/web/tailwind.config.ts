import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg:             'var(--bg)',
        surface:        'var(--surface)',
        'surface-2':    'var(--surface-2)',
        'surface-3':    'var(--surface-3)',
        border:         'var(--border)',
        'border-strong':'var(--border-strong)',
        fg:             'var(--fg)',
        'fg-2':         'var(--fg-2)',
        'fg-3':         'var(--fg-3)',
        'fg-4':         'var(--fg-4)',
        accent:         'var(--accent)',
        'accent-soft':  'var(--accent-soft)',
        'accent-hover': 'var(--accent-hover)',
        'accent-fg':    'var(--accent-fg)',
        green:          'var(--green)',
        'green-soft':   'var(--green-soft)',
        amber:          'var(--amber)',
        rose:           'var(--rose)',
      },
      fontFamily: {
        sans:  ['var(--font)'],
        mono:  ['var(--font-mono)'],
        serif: ['var(--font-serif)'],
      },
      borderRadius: {
        sm:      'var(--radius-sm)',
        DEFAULT: 'var(--radius)',
        lg:      'var(--radius-lg)',
      },
      boxShadow: {
        sm:      'var(--shadow-sm)',
        DEFAULT: 'var(--shadow)',
        lg:      'var(--shadow-lg)',
      },
      spacing: {
        '1.5': '6px',
        '4.5': '18px',
        '5.5': '22px',
      },
    },
  },
  plugins: [],
};

export default config;
