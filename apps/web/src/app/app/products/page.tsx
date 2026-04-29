import Link from 'next/link';
import { eq, and, asc, desc, inArray } from 'drizzle-orm';

import { auth } from '@/lib/auth';
import {
  db,
  brands,
  products as productsTable,
  workspaceMembers,
} from '@forge/db';
import { ProductsManager } from '@/components/products/products-manager';

export const metadata = {
  title: 'Products — Forge',
};

export const dynamic = 'force-dynamic';

type PageProps = {
  searchParams?: { brand?: string };
};

export default async function ProductsPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const memberships = await db.query.workspaceMembers.findMany({
    where: eq(workspaceMembers.userId, session.user.id),
  });
  const wsIds = memberships.map(m => m.workspaceId);

  if (wsIds.length === 0) return <EmptyState />;

  const allBrands = await db.query.brands.findMany({
    where: inArray(brands.workspaceId, wsIds),
    orderBy: [desc(brands.createdAt)],
  });
  if (allBrands.length === 0) return <EmptyState />;

  // Pick the brand from ?brand= or fall back to the most recent.
  const activeBrand = searchParams?.brand
    ? allBrands.find(b => b.id === searchParams.brand) ?? allBrands[0]!
    : allBrands[0]!;

  const productRows = await db.query.products.findMany({
    where: eq(productsTable.brandId, activeBrand.id),
    orderBy: [asc(productsTable.position)],
  });

  return (
    <div className="view-pad">
      <div className="page-head">
        <div>
          <h1>Products</h1>
          <div className="desc">
            {productRows.length} {productRows.length === 1 ? 'product' : 'products'} in{' '}
            <strong>{activeBrand.name}</strong>
          </div>
        </div>
        <Link href={`/app/preview?brand=${activeBrand.id}`} className="btn btn-sm">
          View store ↗
        </Link>
      </div>

      {allBrands.length > 1 && (
        <div className="tabs" style={{ marginBottom: 16 }}>
          {allBrands.map(b => (
            <Link
              key={b.id}
              href={`/app/products?brand=${b.id}`}
              className="tab"
              data-active={b.id === activeBrand.id}
            >
              {b.name}
            </Link>
          ))}
        </div>
      )}

      <ProductsManager
        brandId={activeBrand.id}
        products={productRows.map(p => ({
          id: p.id,
          name: p.name,
          category: p.category,
          price: p.price / 100,
          was: p.wasPrice / 100,
          description: p.description,
          tone: p.tone,
        }))}
      />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="view-pad">
      <div className="page-head">
        <div>
          <h1>Products</h1>
          <div className="desc">No brands yet — products live on a brand.</div>
        </div>
      </div>
      <div className="panel">
        <div className="panel-head">
          <div className="panel-title">Nothing here yet</div>
          <div className="panel-sub">Approve a blueprint to get products</div>
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
