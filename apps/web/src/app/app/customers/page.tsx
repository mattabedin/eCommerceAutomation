import Link from 'next/link';
import { eq, desc, inArray, sql } from 'drizzle-orm';

import { auth } from '@/lib/auth';
import {
  brands,
  customers as customersTable,
  db,
  orders,
  workspaceMembers,
} from '@forge/db';
import { SeedDemoDataButton } from '@/components/runtime/seed-demo-data-button';

export const metadata = {
  title: 'Customers — Forge',
};

export const dynamic = 'force-dynamic';

type PageProps = {
  searchParams?: { brand?: string };
};

export default async function CustomersPage({ searchParams }: PageProps) {
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

  const customerRows = await db.query.customers.findMany({
    where: eq(customersTable.brandId, activeBrand.id),
    orderBy: [desc(customersTable.createdAt)],
  });

  // Per-customer aggregates: order count and lifetime spend in cents.
  const aggregates = customerRows.length
    ? await db
        .select({
          customerId: orders.customerId,
          orders: sql<number>`count(*)::int`.as('orders'),
          total: sql<number>`coalesce(sum(${orders.total}), 0)::int`.as('total'),
        })
        .from(orders)
        .where(eq(orders.brandId, activeBrand.id))
        .groupBy(orders.customerId)
    : [];
  const aggsByCustomer = new Map(aggregates.map(a => [a.customerId, a]));

  const totalSpent =
    aggregates.reduce((s, a) => s + Number(a.total), 0) / 100;

  return (
    <div className="view-pad">
      <div className="page-head">
        <div>
          <h1>Customers</h1>
          <div className="desc">
            {customerRows.length} customers · ${totalSpent.toFixed(2)} lifetime ·{' '}
            <strong>{activeBrand.name}</strong>
          </div>
        </div>
        {customerRows.length === 0 && (
          <SeedDemoDataButton brandId={activeBrand.id} label="Seed sample data" />
        )}
      </div>

      {allBrands.length > 1 && (
        <div className="tabs" style={{ marginBottom: 16 }}>
          {allBrands.map(b => (
            <Link
              key={b.id}
              href={`/app/customers?brand=${b.id}`}
              className="tab"
              data-active={b.id === activeBrand.id}
            >
              {b.name}
            </Link>
          ))}
        </div>
      )}

      <div className="panel">
        <div className="panel-head">
          <div className="panel-title">All customers</div>
          <div className="panel-sub">{customerRows.length} total</div>
        </div>
        {customerRows.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: 'var(--fg-3)', marginBottom: 12 }}>
              No customers yet. Real customers will appear here once you seed
              demo data or wire up live integrations in Phase 6.
            </div>
            <SeedDemoDataButton brandId={activeBrand.id} label="Seed sample data →" />
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Orders</th>
                <th>Lifetime</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {customerRows.map(c => {
                const agg = aggsByCustomer.get(c.id);
                return (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 500 }}>{c.name}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--fg-3)' }}>
                      {c.email}
                    </td>
                    <td>{agg ? Number(agg.orders) : 0}</td>
                    <td style={{ fontVariantNumeric: 'tabular-nums' }}>
                      ${((Number(agg?.total) || 0) / 100).toFixed(2)}
                    </td>
                    <td style={{ color: 'var(--fg-3)' }}>{formatDate(c.createdAt)}</td>
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

function formatDate(d: Date): string {
  const ms = Date.now() - d.getTime();
  const hr = Math.floor(ms / 3_600_000);
  if (hr < 1) return 'just now';
  if (hr < 24) return `${hr}h ago`;
  const dy = Math.floor(hr / 24);
  if (dy < 30) return `${dy}d ago`;
  return d.toISOString().slice(0, 10);
}

function EmptyState() {
  return (
    <div className="view-pad">
      <div className="page-head">
        <div>
          <h1>Customers</h1>
          <div className="desc">No brands yet — customers attach to a store.</div>
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
