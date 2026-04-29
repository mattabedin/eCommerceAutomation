import Link from 'next/link';
import { eq, desc, inArray } from 'drizzle-orm';

import { auth } from '@/lib/auth';
import { db, brands, workspaceMembers } from '@forge/db';
import { mockTickets } from '@/lib/mock-runtime';

export const metadata = {
  title: 'Support — Forge',
};

export const dynamic = 'force-dynamic';

type PageProps = {
  searchParams?: { brand?: string };
};

export default async function SupportPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const memberships = await db.query.workspaceMembers.findMany({
    where: eq(workspaceMembers.userId, session.user.id),
  });
  const wsIds = memberships.map(m => m.workspaceId);

  const allBrands = wsIds.length
    ? await db.query.brands.findMany({
        where: inArray(brands.workspaceId, wsIds),
        orderBy: [desc(brands.createdAt)],
      })
    : [];

  if (allBrands.length === 0) return <EmptyState />;

  const activeBrand = searchParams?.brand
    ? allBrands.find(b => b.id === searchParams.brand) ?? allBrands[0]!
    : allBrands[0]!;

  const tickets = mockTickets(activeBrand.id, 8);
  const autoResolved = tickets.filter(t => t.status === 'auto-resolved').length;
  const needsAdmin = tickets.filter(t => t.status === 'needs admin').length;
  const awaiting = tickets.filter(t => t.status === 'awaiting reply').length;

  return (
    <div className="view-pad">
      <div className="page-head">
        <div>
          <h1>Support</h1>
          <div className="desc">
            {tickets.length} tickets · {autoResolved} auto-resolved by Soren ·{' '}
            <strong>{activeBrand.name}</strong>
          </div>
        </div>
        <span style={{ fontSize: 11, color: 'var(--fg-4)', fontFamily: 'var(--font-mono)' }}>
          mock · the Soren agent ships in Phase 7
        </span>
      </div>

      {allBrands.length > 1 && (
        <div className="tabs" style={{ marginBottom: 16 }}>
          {allBrands.map(b => (
            <Link
              key={b.id}
              href={`/app/support?brand=${b.id}`}
              className="tab"
              data-active={b.id === activeBrand.id}
            >
              {b.name}
            </Link>
          ))}
        </div>
      )}

      <div className="dash-grid">
        <Kpi label="Tickets" value={String(tickets.length)} />
        <Kpi label="Auto-resolved" value={String(autoResolved)} />
        <Kpi label="Awaiting" value={String(awaiting)} />
        <Kpi label="Needs admin" value={String(needsAdmin)} />
      </div>

      <div className="panel">
        <div className="panel-head">
          <div className="panel-title">Open tickets</div>
          <div className="panel-sub">Sorted by recency</div>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Subject</th>
              <th>Customer</th>
              <th>AI confidence</th>
              <th>Status</th>
              <th>Age</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map(t => (
              <tr key={t.id}>
                <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--fg-3)' }}>
                  {t.id}
                </td>
                <td style={{ fontWeight: 500 }}>{t.subject}</td>
                <td>{t.customer}</td>
                <td
                  style={{
                    fontFamily: 'var(--font-mono)',
                    color: t.ai === '—' ? 'var(--fg-4)' : 'var(--fg-2)',
                  }}
                >
                  {t.ai}
                </td>
                <td>
                  <span
                    className="status-pill"
                    data-tone={
                      t.status === 'auto-resolved'
                        ? 'green'
                        : t.status === 'awaiting reply'
                          ? 'amber'
                          : 'rose'
                    }
                  >
                    {t.status}
                  </span>
                </td>
                <td style={{ color: 'var(--fg-3)' }}>{t.since}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="kpi-card">
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="view-pad">
      <div className="page-head">
        <div>
          <h1>Support</h1>
          <div className="desc">No brands yet — support attaches to a store.</div>
        </div>
      </div>
      <div className="panel">
        <div className="panel-head">
          <div className="panel-title">Nothing here yet</div>
          <div className="panel-sub">Approve a blueprint first</div>
        </div>
        <div style={{ padding: 24, textAlign: 'center' }}>
          <Link href="/app/builder" className="btn btn-sm btn-accent">
            Open the AI Builder →
          </Link>
        </div>
      </div>
    </div>
  );
}
