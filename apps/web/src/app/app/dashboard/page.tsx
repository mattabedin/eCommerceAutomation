import Link from 'next/link';
import { eq, desc, inArray, sql } from 'drizzle-orm';

import { auth } from '@/lib/auth';
import {
  db,
  brands,
  conversations,
  products as productsTable,
  workspaceMembers,
} from '@forge/db';

export const metadata = {
  title: 'Dashboard — Forge',
};

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const memberships = await db.query.workspaceMembers.findMany({
    where: eq(workspaceMembers.userId, session.user.id),
  });
  const workspaceIds = memberships.map(m => m.workspaceId);

  const [userBrands, recentChats] = workspaceIds.length
    ? await Promise.all([
        db.query.brands.findMany({
          where: inArray(brands.workspaceId, workspaceIds),
          orderBy: [desc(brands.createdAt)],
        }),
        db.query.conversations.findMany({
          where: eq(conversations.userId, session.user.id),
          orderBy: [desc(conversations.updatedAt)],
          limit: 8,
        }),
      ])
    : [[], []];

  const counts = userBrands.length
    ? await db
        .select({
          brandId: productsTable.brandId,
          count: sql<number>`count(*)::int`.as('count'),
        })
        .from(productsTable)
        .where(
          inArray(
            productsTable.brandId,
            userBrands.map(b => b.id),
          ),
        )
        .groupBy(productsTable.brandId)
    : [];
  const countByBrand = new Map(counts.map(c => [c.brandId, Number(c.count)]));

  const totalBrands = userBrands.length;
  const totalProducts = counts.reduce((acc, c) => acc + Number(c.count), 0);
  const liveBrands = userBrands.filter(b => b.publishedAt).length;
  const totalChats = recentChats.length;

  return (
    <div className="view-pad">
      <div className="page-head">
        <div>
          <h1>Dashboard</h1>
          <div className="desc">
            {totalBrands === 0 && totalChats === 0
              ? 'You haven’t built anything yet. Head to the AI Builder.'
              : `${totalBrands} ${totalBrands === 1 ? 'brand' : 'brands'} · ${totalProducts} products · ${liveBrands} live`}
          </div>
        </div>
        <Link href="/app/builder" className="btn btn-sm btn-primary">
          + New chat
        </Link>
      </div>

      <div className="dash-grid">
        <Kpi label="Brands" value={String(totalBrands)} />
        <Kpi label="Products" value={String(totalProducts)} />
        <Kpi label="Live" value={String(liveBrands)} />
        <Kpi label="Drafts" value={String(totalBrands - liveBrands)} />
      </div>

      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-head">
          <div className="panel-title">Recent chats</div>
          <div className="panel-sub">
            {totalChats === 0 ? 'No chats yet' : `${totalChats} most recent`}
          </div>
        </div>
        {totalChats === 0 ? (
          <div style={{ padding: 32, textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: 'var(--fg-3)', marginBottom: 12 }}>
              Start a conversation with the AI Builder. Every chat is saved.
            </div>
            <Link href="/app/builder" className="btn btn-sm btn-accent">
              Open the AI Builder →
            </Link>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Chat</th>
                <th>Status</th>
                <th>Last activity</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {recentChats.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 500, maxWidth: 480 }}>
                    {c.title ?? 'Untitled chat'}
                  </td>
                  <td>
                    <span
                      className="status-pill"
                      data-tone={c.brandId ? 'green' : 'gray'}
                    >
                      {c.brandId ? 'published' : 'draft'}
                    </span>
                  </td>
                  <td style={{ color: 'var(--fg-3)' }}>
                    {formatRelative(c.updatedAt)}
                  </td>
                  <td>
                    <Link
                      href={`/app/builder?id=${c.id}`}
                      className="btn btn-sm btn-ghost"
                    >
                      Resume →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="panel">
        <div className="panel-head">
          <div className="panel-title">Your stores</div>
          <div className="panel-sub">
            {totalBrands === 0 ? 'No brands yet' : `${totalBrands} total`}
          </div>
        </div>
        {totalBrands === 0 ? (
          <div style={{ padding: 32, textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: 'var(--fg-3)', marginBottom: 12 }}>
              Approve a blueprint in the AI Builder to publish your first store.
            </div>
            <Link href="/app/builder" className="btn btn-sm btn-accent">
              Open the AI Builder →
            </Link>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Brand</th>
                <th>Domain</th>
                <th>Products</th>
                <th>Status</th>
                <th>Created</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {userBrands.map(b => (
                <tr key={b.id}>
                  <td style={{ fontWeight: 500 }}>{b.name}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--fg-3)' }}>
                    {b.domain ?? `${b.slug}.forge.shop`}
                  </td>
                  <td>{countByBrand.get(b.id) ?? 0}</td>
                  <td>
                    <span
                      className="status-pill"
                      data-tone={b.publishedAt ? 'green' : 'amber'}
                    >
                      {b.publishedAt ? 'live' : 'draft'}
                    </span>
                  </td>
                  <td style={{ color: 'var(--fg-3)' }}>{formatRelative(b.createdAt)}</td>
                  <td style={{ display: 'flex', gap: 4 }}>
                    <Link
                      href={`/app/preview?brand=${b.id}`}
                      className="btn btn-sm btn-ghost"
                    >
                      Preview →
                    </Link>
                    {b.publishedAt && (
                      <a
                        href={`/s/${b.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-sm btn-ghost"
                      >
                        Visit ↗
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
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

function formatRelative(date: Date): string {
  const ms = Date.now() - date.getTime();
  const min = Math.floor(ms / 60_000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const d = Math.floor(hr / 24);
  if (d < 30) return `${d}d ago`;
  return date.toISOString().slice(0, 10);
}
