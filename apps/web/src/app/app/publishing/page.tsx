import Link from 'next/link';
import { eq, desc, inArray } from 'drizzle-orm';

import { auth } from '@/lib/auth';
import { db, brands, workspaceMembers } from '@forge/db';

export const metadata = {
  title: 'Publishing & Hosting — Forge',
};

export const dynamic = 'force-dynamic';

export default async function PublishingPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const memberships = await db.query.workspaceMembers.findMany({
    where: eq(workspaceMembers.userId, session.user.id),
  });
  const wsIds = memberships.map(m => m.workspaceId);

  const userBrands = wsIds.length
    ? await db.query.brands.findMany({
        where: inArray(brands.workspaceId, wsIds),
        orderBy: [desc(brands.createdAt)],
      })
    : [];

  return (
    <div className="view-pad">
      <div className="page-head">
        <div>
          <h1>Publishing & Hosting</h1>
          <div className="desc">
            Public URLs for your stores. Custom domains land in Phase 4.
          </div>
        </div>
      </div>

      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-head">
          <div className="panel-title">How publishing works today</div>
          <div className="panel-sub">v0.4 status</div>
        </div>
        <div style={{ padding: 16, fontSize: 13, color: 'var(--fg-2)', lineHeight: 1.55 }}>
          <p style={{ marginBottom: 8 }}>
            Approving a blueprint in the AI Builder marks the brand as <strong>live</strong>{' '}
            and exposes a public URL at <code style={{ fontFamily: 'var(--font-mono)' }}>/s/&lt;slug&gt;</code>{' '}
            on this domain. Anyone with the link can visit — no sign-in required.
          </p>
          <p style={{ marginBottom: 8 }}>
            Phase 3B will add real <code style={{ fontFamily: 'var(--font-mono)' }}>&lt;slug&gt;.forge.shop</code>{' '}
            subdomain routing once we own the apex domain and wire wildcard DNS to Vercel. Phase 4 then
            adds custom domains (your own URL, with a DNS-record verification flow).
          </p>
          <p style={{ color: 'var(--fg-3)', fontSize: 12 }}>
            The <code style={{ fontFamily: 'var(--font-mono)' }}>.forge.shop</code> address shown on each brand
            below is the slug we&rsquo;ll route to once 3B is live. For now, click <strong>Visit</strong> to use
            the path-based equivalent.
          </p>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div className="panel-title">Your stores</div>
          <div className="panel-sub">
            {userBrands.length === 0 ? 'No brands yet' : `${userBrands.length} total`}
          </div>
        </div>
        {userBrands.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center' }}>
            <Link href="/app/builder" className="btn btn-sm btn-accent">
              Open the AI Builder →
            </Link>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Brand</th>
                <th>Subdomain (Phase 3B)</th>
                <th>Public URL (today)</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {userBrands.map(b => {
                const subdomain = b.domain ?? `${b.slug}.forge.shop`;
                return (
                  <tr key={b.id}>
                    <td style={{ fontWeight: 500 }}>{b.name}</td>
                    <td
                      style={{
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--fg-3)',
                        fontSize: 12,
                      }}
                    >
                      {subdomain}
                    </td>
                    <td
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 12,
                      }}
                    >
                      /s/{b.slug}
                    </td>
                    <td>
                      <span
                        className="status-pill"
                        data-tone={b.publishedAt ? 'green' : 'amber'}
                      >
                        {b.publishedAt ? 'live' : 'draft'}
                      </span>
                    </td>
                    <td>
                      {b.publishedAt ? (
                        <a
                          href={`/s/${b.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-sm"
                        >
                          Visit ↗
                        </a>
                      ) : (
                        <Link
                          href={`/app/preview?brand=${b.id}`}
                          className="btn btn-sm btn-ghost"
                        >
                          Preview →
                        </Link>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
