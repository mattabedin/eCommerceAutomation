import Link from 'next/link';
import { eq, desc, asc, inArray } from 'drizzle-orm';

import { auth } from '@/lib/auth';
import {
  db,
  brands,
  products as productsTable,
  workspaceMembers,
} from '@forge/db';
import { mockOrders } from '@/lib/mock-runtime';

export const metadata = {
  title: 'Orders — Forge',
};

export const dynamic = 'force-dynamic';

type PageProps = {
  searchParams?: { brand?: string };
};

export default async function OrdersPage({ searchParams }: PageProps) {
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

  const orders = mockOrders(
    activeBrand.id,
    products.map(p => ({ name: p.name, price: p.price / 100 })),
    8,
  );

  const grossRevenue = orders.reduce((s, o) => s + o.total, 0);

  return (
    <div className="view-pad">
      <div className="page-head">
        <div>
          <h1>Orders</h1>
          <div className="desc">
            {orders.length} orders · ${grossRevenue.toFixed(2)} gross · {' '}
            <strong>{activeBrand.name}</strong>
          </div>
        </div>
        <span style={{ fontSize: 11, color: 'var(--fg-4)', fontFamily: 'var(--font-mono)' }}>
          mock · Stripe wires up in Phase 6
        </span>
      </div>

      {allBrands.length > 1 && (
        <div className="tabs" style={{ marginBottom: 16 }}>
          {allBrands.map(b => (
            <Link
              key={b.id}
              href={`/app/orders?brand=${b.id}`}
              className="tab"
              data-active={b.id === activeBrand.id}
            >
              {b.name}
            </Link>
          ))}
        </div>
      )}

      <div className="dash-grid">
        <Kpi label="Orders" value={String(orders.length)} />
        <Kpi label="Gross" value={`$${grossRevenue.toFixed(0)}`} />
        <Kpi
          label="Avg order"
          value={`$${orders.length ? (grossRevenue / orders.length).toFixed(0) : '0'}`}
        />
        <Kpi
          label="Refund req"
          value={String(orders.filter(o => o.status === 'refund req').length)}
        />
      </div>

      <div className="panel">
        <div className="panel-head">
          <div className="panel-title">Recent orders</div>
          <div className="panel-sub">{orders.length} total</div>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Fulfilment</th>
              <th>Placed</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id}>
                <td style={{ fontFamily: 'var(--font-mono)' }}>{o.id}</td>
                <td style={{ fontWeight: 500 }}>{o.customer}</td>
                <td>{o.itemCount}</td>
                <td style={{ fontVariantNumeric: 'tabular-nums' }}>
                  ${o.total.toFixed(2)}
                </td>
                <td>
                  <span
                    className="status-pill"
                    data-tone={o.status === 'paid' ? 'green' : 'rose'}
                  >
                    {o.status}
                  </span>
                </td>
                <td>
                  <span
                    className="status-pill"
                    data-tone={
                      o.fulfill === 'delivered' || o.fulfill === 'fulfilled'
                        ? 'green'
                        : o.fulfill === 'shipped'
                          ? 'indigo'
                          : 'amber'
                    }
                  >
                    {o.fulfill}
                  </span>
                </td>
                <td style={{ color: 'var(--fg-3)' }}>{o.date}</td>
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
          <h1>Orders</h1>
          <div className="desc">No brands yet — orders attach to a store.</div>
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
