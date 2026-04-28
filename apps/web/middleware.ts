import { NextResponse, type NextRequest } from 'next/server';

// Phase 3 — resolve <slug>.forge.shop requests to /_storefront/<slug>.
// Currently a no-op (matcher is empty so this never fires).

export function middleware(_req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
