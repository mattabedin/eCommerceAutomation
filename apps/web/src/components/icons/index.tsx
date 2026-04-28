import type { SVGProps } from 'react';

export type IconName =
  | 'sparkle'
  | 'globe'
  | 'grid'
  | 'box'
  | 'cart'
  | 'users'
  | 'mega'
  | 'chat'
  | 'trend'
  | 'gear'
  | 'card'
  | 'rocket';

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} satisfies SVGProps<SVGPathElement>;

const PATHS: Record<IconName, JSX.Element> = {
  sparkle: <path d="M8 1.5l1.6 4.4L14 7.5l-4.4 1.6L8 13.5l-1.6-4.4L2 7.5l4.4-1.6z" {...stroke} />,
  globe: (
    <>
      <circle cx="8" cy="8" r="6.5" {...stroke} />
      <path d="M1.5 8h13M8 1.5c2 2 2 11 0 13M8 1.5c-2 2-2 11 0 13" {...stroke} />
    </>
  ),
  grid: (
    <>
      <rect x="2" y="2" width="5" height="5" rx="1" {...stroke} />
      <rect x="9" y="2" width="5" height="5" rx="1" {...stroke} />
      <rect x="2" y="9" width="5" height="5" rx="1" {...stroke} />
      <rect x="9" y="9" width="5" height="5" rx="1" {...stroke} />
    </>
  ),
  box: (
    <>
      <path d="M2 5l6-3 6 3v6l-6 3-6-3z" {...stroke} />
      <path d="M2 5l6 3 6-3M8 8v6" {...stroke} />
    </>
  ),
  cart: (
    <>
      <path d="M2 3h2l1.5 8h7L14 5H4.5" {...stroke} />
      <circle cx="6" cy="13.5" r="1" {...stroke} />
      <circle cx="12" cy="13.5" r="1" {...stroke} />
    </>
  ),
  users: (
    <>
      <circle cx="6" cy="6" r="2.5" {...stroke} />
      <path d="M2 13c0-2 2-3 4-3s4 1 4 3" {...stroke} />
      <circle cx="11" cy="5" r="2" {...stroke} />
      <path d="M10 13c2 0 4-1 4-3 0-1-1-1.5-2-2" {...stroke} />
    </>
  ),
  mega: <path d="M2 6v4l8-4v6L2 8M10 5v6" {...stroke} />,
  chat: (
    <path
      d="M2 4a2 2 0 012-2h8a2 2 0 012 2v5a2 2 0 01-2 2H7l-3 3v-3H4a2 2 0 01-2-2z"
      {...stroke}
    />
  ),
  trend: <path d="M2 12l4-4 3 3 5-6M9 5h4v4" {...stroke} />,
  gear: (
    <>
      <circle cx="8" cy="8" r="2" {...stroke} />
      <path
        d="M8 1v2M8 13v2M1 8h2M13 8h2M3 3l1.5 1.5M11.5 11.5L13 13M3 13l1.5-1.5M11.5 4.5L13 3"
        {...stroke}
      />
    </>
  ),
  card: (
    <>
      <rect x="1.5" y="3.5" width="13" height="9" rx="1.5" {...stroke} />
      <path d="M1.5 6.5h13M3 10h2M7 10h2" {...stroke} />
    </>
  ),
  rocket: (
    <>
      <path
        d="M8 1.5c2.2 1.6 3.5 3.5 3.5 6 0 1.5-.4 2.7-1 4l-2.5 2L5.5 11.5c-.6-1.3-1-2.5-1-4 0-2.5 1.3-4.4 3.5-6zM5 11l-1.5 1.5.5 2 2-.5L7.5 12.5M11 11l1.5 1.5-.5 2-2-.5L8.5 12.5"
        {...stroke}
      />
      <circle cx="8" cy="7" r="1.2" {...stroke} />
    </>
  ),
};

export function Icon({ name }: { name: IconName }) {
  return (
    <svg className="nav-icon" viewBox="0 0 16 16" aria-hidden="true">
      {PATHS[name]}
    </svg>
  );
}
