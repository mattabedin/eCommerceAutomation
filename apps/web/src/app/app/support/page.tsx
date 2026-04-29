import Link from 'next/link';
import { eq, desc, inArray, asc } from 'drizzle-orm';

import { auth } from '@/lib/auth';
import {
  brands,
  customers,
  db,
  ticketMessages,
  tickets as ticketsTable,
  workspaceMembers,
} from '@forge/db';
import { TicketsManager } from '@/components/support/tickets-manager';
import { SeedDemoDataButton } from '@/components/runtime/seed-demo-data-button';

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

  const [ticketRows, customerRows] = await Promise.all([
    db.query.tickets.findMany({
      where: eq(ticketsTable.brandId, activeBrand.id),
      orderBy: [desc(ticketsTable.updatedAt)],
    }),
    db.query.customers.findMany({
      where: eq(customers.brandId, activeBrand.id),
    }),
  ]);

  const customerById = new Map(customerRows.map(c => [c.id, c]));

  const messageRows = ticketRows.length
    ? await db.query.ticketMessages.findMany({
        where: inArray(
          ticketMessages.ticketId,
          ticketRows.map(t => t.id),
        ),
        orderBy: [asc(ticketMessages.createdAt)],
      })
    : [];

  const messagesByTicket = new Map<
    string,
    { id: string; sender: 'customer' | 'operator' | 'agent'; body: string; createdAt: string }[]
  >();
  for (const m of messageRows) {
    const list = messagesByTicket.get(m.ticketId) ?? [];
    list.push({
      id: m.id,
      sender: m.sender as 'customer' | 'operator' | 'agent',
      body: m.body,
      createdAt: m.createdAt.toISOString(),
    });
    messagesByTicket.set(m.ticketId, list);
  }

  const autoResolved = ticketRows.filter(t => t.status === 'resolved').length;
  const awaiting = ticketRows.filter(t => t.status === 'awaiting').length;
  const open = ticketRows.filter(t => t.status === 'open').length;

  return (
    <div className="view-pad">
      <div className="page-head">
        <div>
          <h1>Support</h1>
          <div className="desc">
            {ticketRows.length} tickets · {autoResolved} resolved ·{' '}
            <strong>{activeBrand.name}</strong>
          </div>
        </div>
        {ticketRows.length === 0 && (
          <SeedDemoDataButton brandId={activeBrand.id} label="Seed sample data" />
        )}
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

      {ticketRows.length > 0 ? (
        <>
          <div className="dash-grid">
            <Kpi label="Tickets" value={String(ticketRows.length)} />
            <Kpi label="Open" value={String(open)} />
            <Kpi label="Awaiting" value={String(awaiting)} />
            <Kpi label="Resolved" value={String(autoResolved)} />
          </div>

          <TicketsManager
            tickets={ticketRows.map(t => ({
              id: t.id,
              subject: t.subject,
              customer: customerById.get(t.customerId ?? '')?.name ?? 'Guest',
              email: customerById.get(t.customerId ?? '')?.email ?? '',
              status: t.status,
              aiConfidence: t.aiConfidence,
              updatedAt: t.updatedAt.toISOString(),
              messages: messagesByTicket.get(t.id) ?? [],
            }))}
          />
        </>
      ) : (
        <div className="panel">
          <div className="panel-head">
            <div className="panel-title">Inbox is empty</div>
            <div className="panel-sub">No tickets yet</div>
          </div>
          <div style={{ padding: 32, textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: 'var(--fg-3)', marginBottom: 12 }}>
              Sample tickets let you try the reply + resolve flow before real
              customers start writing in.
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
