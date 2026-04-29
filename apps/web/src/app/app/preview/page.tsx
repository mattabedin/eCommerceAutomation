import Link from 'next/link';
import { eq, desc, asc, and, inArray } from 'drizzle-orm';

import { auth } from '@/lib/auth';
import {
  brands,
  db,
  productVariants,
  products as productsTable,
  workspaceMembers,
} from '@forge/db';
import { PhasePlaceholder } from '@/components/shell/placeholder';
import { SavedStorefront } from '@/components/preview/saved-storefront';
import { BrandEditor } from '@/components/preview/brand-editor';
import {
  BlueprintSchema,
  type Blueprint,
} from '@/lib/builder/blueprint-schema';

export const metadata = {
  title: 'Storefront preview — Forge',
};

export const dynamic = 'force-dynamic';

type PageProps = {
  searchParams?: { brand?: string };
};

export default async function PreviewPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    return <PhasePlaceholder label="Storefront" phase={2} />;
  }

  const memberships = await db.query.workspaceMembers.findMany({
    where: eq(workspaceMembers.userId, session.user.id),
  });
  const workspaceIds = memberships.map(m => m.workspaceId);
  if (workspaceIds.length === 0) return <EmptyState />;

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

  if (!brand) return <EmptyState />;

  const productRows = await db.query.products.findMany({
    where: eq(productsTable.brandId, brand.id),
    orderBy: [asc(productsTable.position)],
  });

  const variantRows = productRows.length
    ? await db.query.productVariants.findMany({
        where: inArray(
          productVariants.productId,
          productRows.map(p => p.id),
        ),
        orderBy: [asc(productVariants.position)],
      })
    : [];

  const productsWithVariants = productRows.map(p => ({
    ...p,
    variants: variantRows.filter(v => v.productId === p.id),
  }));

  // Pull editable fields out of the identity blob (with safe fallbacks).
  const parsed = BlueprintSchema.safeParse(brand.identity);
  const identity: Partial<Blueprint> =
    (parsed.success
      ? parsed.data
      : (brand.identity as Partial<Blueprint> | null)) ?? {};

  const editorInitial = {
    name: brand.name,
    tagline: identity.tagline ?? '',
    domain: brand.domain ?? `${brand.slug}.forge.shop`,
    hero_headline: identity.hero_headline ?? '',
    hero_subhead: identity.hero_subhead ?? '',
    primary: identity.colors?.primary ?? '#0a0a0a',
    secondary: identity.colors?.secondary ?? '#6366F1',
    accent: identity.colors?.accent ?? '#fafafa',
  };

  return (
    <div style={{ flex: 1, overflow: 'auto' }}>
      <div
        style={{
          padding: '12px 24px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--surface)',
          display: 'flex',
          gap: 12,
          alignItems: 'center',
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 500 }}>{brand.name}</span>
        <span
          className="status-pill"
          data-tone={brand.publishedAt ? 'green' : 'amber'}
        >
          {brand.publishedAt ? 'live' : 'draft'}
        </span>
        <code
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11.5,
            color: 'var(--fg-3)',
          }}
        >
          {brand.domain ?? `${brand.slug}.forge.shop`}
        </code>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          {brand.publishedAt && (
            <a
              href={`/s/${brand.slug}`}
              target="_blank"
              rel="noreferrer"
              className="btn btn-sm"
            >
              Visit live store ↗
            </a>
          )}
          <Link
            href={`/app/products?brand=${brand.id}`}
            className="btn btn-sm btn-ghost"
          >
            Manage products
          </Link>
          <BrandEditor brandId={brand.id} initial={editorInitial} />
        </div>
      </div>

      <SavedStorefront brand={brand} products={productsWithVariants} />
    </div>
  );
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
