import Link from 'next/link';
import { eq, desc, inArray } from 'drizzle-orm';

import { auth } from '@/lib/auth';
import {
  brands,
  customers,
  db,
  orders as ordersTable,
  workspaceMembers,
} from '@forge/db';
import { OrdersManager } from '@/components/orders/orders-manager';
import { SeedDemoDataButton } from '@/components/runtime/seed-demo-data-button';

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

  const [orderRows, customerRows] = await Promise.all([
    db.query.orders.findMany({
      where: eq(ordersTable.brandId, activeBrand.id),
      orderBy: [desc(ordersTable.createdAt)],
    }),
    db.query.customers.findMany({
      where: eq(customers.brandId, activeBrand.id),
    }),
  ]);

  const customerById = new Map(customerRows.map(c => [c.id, c]));

  const grossRevenue = orderRows.reduce((s, o) => s + o.total, 0) / 100;

  return (
    <div className="view-pad">
      <div className="page-head">
        <div>
          <h1>Orders</h1>
          <div className="desc">
            {orderRows.length} orders · ${grossRevenue.toFixed(2)} gross ·{' '}
            <strong>{activeBrand.name}</strong>
          </div>
        </div>
        {orderRows.length === 0 && (
          <SeedDemoDataButton brandId={activeBrand.id} label="Seed sample data" />
        )}
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

      {orderRows.length > 0 ? (
        <>
          <div className="dash-grid">
            <Kpi label="Orders" value={String(orderRows.length)} />
            <Kpi label="Gross" value={`$${grossRevenue.toFixed(0)}`} />
            <Kpi
              label="Avg order"
              value={`$${orderRows.length ? (grossRevenue / orderRows.length).toFixed(0) : '0'}`}
            />
            <Kpi
              label="Refund req"
              value={String(
                orderRows.filter(o => o.status === 'refund_requested').length,
              )}
            />
          </div>

          <OrdersManager
            orders={orderRows.map(o => ({
              id: o.id,
              customer: customerById.get(o.customerId ?? '')?.name ?? 'Guest',
              total: o.total / 100,
              itemCount: o.itemCount,
              status: o.status,
              fulfill: o.fulfill,
              notes: o.notes,
              createdAt: o.createdAt.toISOString(),
            }))}
          />
        </>
      ) : (
        <div className="panel">
          <div className="panel-head">
            <div className="panel-title">No orders yet</div>
            <div className="panel-sub">Phase 6 wires real Stripe orders</div>
          </div>
          <div style={{ padding: 32, textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: 'var(--fg-3)', marginBottom: 12 }}>
              Generate sample customers, orders, and tickets so the views feel
              alive while you wait for real Stripe traffic.
            </div>
            <SeedDemoDataButton brandId={activeBrand.id} label="Seed sample data →" />
          </div>
        </div>
      )}
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
