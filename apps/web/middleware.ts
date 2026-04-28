import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

// Phase 1B — protect /app/* routes (unauthed → /login).
// Phase 3 — also resolve <slug>.forge.shop hosts to /_storefront/<slug>
// (will be added when storefront rendering lands).

export default auth(req => {
  const isAppRoute = req.nextUrl.pathname.startsWith('/app');
  if (isAppRoute && !req.auth) {
    const loginUrl = new URL('/login', req.nextUrl.origin);
    loginUrl.searchParams.set('next', req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
});

export const config = {
  // Match /app and any sub-path. Auth.js's API routes and static assets are skipped.
  matcher: ['/app/:path*'],
};
