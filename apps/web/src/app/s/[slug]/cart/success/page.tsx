import Link from 'next/link';
import { and, eq, isNotNull } from 'drizzle-orm';
import { notFound } from 'next/navigation';

import { brands, db } from '@forge/db';
import { CheckoutSuccess } from '@/components/storefront/checkout-success';

export const metadata = { title: 'Order placed — Forge' };
export const dynamic = 'force-dynamic';

type Props = {
  params: { slug: string };
  searchParams?: { sid?: string };
};

export default async function SuccessPage({ params }: Props) {
  const brand = await db.query.brands.findFirst({
    where: and(eq(brands.slug, params.slug), isNotNull(brands.publishedAt)),
  });
  if (!brand) notFound();

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        style={{
          maxWidth: 480,
          width: '100%',
          padding: '40px 32px',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 32, marginBottom: 8 }}>✓</div>
        <h1 style={{ marginBottom: 8 }}>Thanks for your order</h1>
        <p style={{ color: 'var(--fg-3)', fontSize: 14, marginBottom: 24 }}>
          We sent a confirmation to your email. {brand.name} will be in touch
          when your order ships.
        </p>
        <CheckoutSuccess slug={brand.slug} />
        <Link
          href={`/s/${brand.slug}`}
          className="btn"
          style={{ marginTop: 16, padding: '10px 18px' }}
        >
          Back to {brand.name} →
        </Link>
      </div>
    </main>
  );
}
