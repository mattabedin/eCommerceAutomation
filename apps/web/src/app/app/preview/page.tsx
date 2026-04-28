import { eq, desc, asc, and, inArray } from 'drizzle-orm';

import { auth } from '@/lib/auth';
import {
  db,
  brands,
  products as productsTable,
  workspaceMembers,
} from '@forge/db';
import { PhasePlaceholder } from '@/components/shell/placeholder';
import { SavedStorefront } from '@/components/preview/saved-storefront';

export const metadata = {
  title: 'Storefront preview — Forge',
};

type PageProps = {
  searchParams?: { brand?: string };
};

export default async function PreviewPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    // Middleware already enforces auth for /app/*; this is a defence-in-depth
    // belt for direct rendering.
    return <PhasePlaceholder label="Storefront" phase={2} />;
  }

  const memberships = await db.query.workspaceMembers.findMany({
    where: eq(workspaceMembers.userId, session.user.id),
  });
  const workspaceIds = memberships.map(m => m.workspaceId);
  if (workspaceIds.length === 0) {
    return <EmptyState />;
  }

  const brand = searchParams?.brand
    ? await db.query.brands.findFirst({
        where: and(
          eq(brands.id, searchParams.brand),
          inArray(brands.workspaceId, workspaceIds),
        ),
      })
    : await db.query.brands.findFirst({
        where: inArray(brands.workspaceId, workspaceIds),
        orderBy: [desc(brands.createdAt)],
      });

  if (!brand) {
    return <EmptyState />;
  }

  const productRows = await db.query.products.findMany({
    where: eq(productsTable.brandId, brand.id),
    orderBy: [asc(productsTable.position)],
  });

  return <SavedStorefront brand={brand} products={productRows} />;
}

function EmptyState() {
  return (
    <div className="view-pad">
      <div className="page-head">
        <div>
          <h1>Storefront</h1>
          <div className="desc">No store yet — head to the AI Builder.</div>
        </div>
      </div>
      <div className="panel">
        <div className="panel-head">
          <div className="panel-title">Nothing to preview</div>
          <div className="panel-sub">Create your first store</div>
        </div>
        <div style={{ padding: 24, fontSize: 12.5, color: 'var(--fg-3)' }}>
          Use the AI Builder to describe a brand. After you approve, your
          storefront will appear here — read straight from the database.
        </div>
      </div>
    </div>
  );
}
