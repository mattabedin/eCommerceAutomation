import Link from 'next/link';
import { eq, desc, asc, inArray } from 'drizzle-orm';

import { auth } from '@/lib/auth';
import {
  db,
  brands,
  products as productsTable,
  workspaceMembers,
} from '@forge/db';
import { mockCustomers } from '@/lib/mock-runtime';

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

  const products = await db.query.products.findMany({
    where: eq(productsTable.brandId, activeBrand.id),
    orderBy: [asc(productsTable.position)],
  });

  const customers = mockCustomers(
    activeBrand.id,
    products.map(p => ({ name: p.name, price: p.price / 100 })),
    10,
  );

  const totalSpent = customers.reduce((s, c) => s + c.totalSpent, 0);

  return (
    <div className="view-pad">
      <div className="page-head">
        <div>
          <h1>Customers</h1>
          <div className="desc">
            {customers.length} customers · ${totalSpent.toFixed(2)} lifetime ·{' '}
            <strong>{activeBrand.name}</strong>
          </div>
        </div>
        <span style={{ fontSize: 11, color: 'var(--fg-4)', fontFamily: 'var(--font-mono)' }}>
          mock · Stripe customer sync in Phase 6
        </span>
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
          <div className="panel-sub">{customers.length} total</div>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Orders</th>
              <th>Lifetime</th>
              <th>Last seen</th>
            </tr>
          </thead>
          <tbody>
            {customers.map(c => (
              <tr key={c.id}>
                <td style={{ fontWeight: 500 }}>{c.name}</td>
                <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--fg-3)' }}>
                  {c.email}
                </td>
                <td>{c.orders}</td>
                <td style={{ fontVariantNumeric: 'tabular-nums' }}>
                  ${c.totalSpent.toFixed(2)}
                </td>
                <td style={{ color: 'var(--fg-3)' }}>{c.lastSeen}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
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
