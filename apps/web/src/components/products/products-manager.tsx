'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  addProduct,
  addVariant,
  deleteProduct,
  deleteVariant,
  updateProduct,
  updateVariant,
} from '@/lib/builder/edit-actions';

export type Variant = {
  id: string;
  size: string | null;
  color: string | null;
  colorHex: string | null;
  priceOverride: number | null; // dollars
  salePrice: number | null; // dollars
  stock: number;
  sku: string | null;
};

export type Product = {
  id: string;
  name: string;
  category: string;
  categories: string[];
  price: number; // dollars
  salePrice: number | null; // dollars; null = no active sale
  was: number; // dollars
  description: string | null;
  tone: string | null;
  variants: Variant[];
};

type ProductDraft = {
  name: string;
  categories: string;
  price: number;
  salePrice: number | null;
  was: number;
  description: string;
  tone: string;
};

const blankProductDraft: ProductDraft = {
  name: '',
  categories: '',
  price: 0,
  salePrice: null,
  was: 0,
  description: '',
  tone: '#737373',
};

const inputStyle: React.CSSProperties = {
  padding: '6px 8px',
  border: '1px solid var(--border)',
  borderRadius: 6,
  fontSize: 12.5,
  background: 'var(--surface)',
  color: 'var(--fg)',
  width: '100%',
  outline: 'none',
};

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  color: 'var(--fg-3)',
  fontFamily: 'var(--font-mono)',
  marginBottom: 4,
  display: 'block',
};

function categoriesToText(cats: string[]): string {
  return cats.join(', ');
}
function textToCategories(text: string): string[] {
  return text
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
}

export function ProductsManager({
  brandId,
  products,
}: {
  brandId: string;
  products: Product[];
}) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<ProductDraft>(blankProductDraft);
  const [adding, setAdding] = useState(false);
  const [addDraft, setAddDraft] = useState<ProductDraft>(blankProductDraft);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function startEdit(p: Product) {
    setEditingId(p.id);
    setEditDraft({
      name: p.name,
      categories: categoriesToText(
        p.categories.length ? p.categories : p.category ? [p.category] : [],
      ),
      price: p.price,
      salePrice: p.salePrice,
      was: p.was,
      description: p.description ?? '',
      tone: p.tone ?? '#737373',
    });
    setError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditDraft(blankProductDraft);
    setError(null);
  }

  function saveEdit() {
    if (!editingId) return;
    const cats = textToCategories(editDraft.categories);
    if (cats.length === 0) {
      setError('Add at least one category.');
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await updateProduct({
        productId: editingId,
        name: editDraft.name,
        category: cats[0]!,
        categories: cats,
        price: editDraft.price,
        salePrice: editDraft.salePrice,
        was: editDraft.was,
        description: editDraft.description || null,
        tone: editDraft.tone || null,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      cancelEdit();
      router.refresh();
    });
  }

  function startAdd() {
    setAdding(true);
    setAddDraft(blankProductDraft);
    setError(null);
  }

  function cancelAdd() {
    setAdding(false);
    setAddDraft(blankProductDraft);
    setError(null);
  }

  function saveAdd() {
    const cats = textToCategories(addDraft.categories);
    if (cats.length === 0) {
      setError('Add at least one category.');
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await addProduct({
        brandId,
        name: addDraft.name,
        category: cats[0]!,
        categories: cats,
        price: addDraft.price,
        salePrice: addDraft.salePrice,
        was: addDraft.was,
        description: addDraft.description || null,
        tone: addDraft.tone || null,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      cancelAdd();
      router.refresh();
    });
  }

  function onDelete(p: Product) {
    if (!confirm(`Delete "${p.name}"? This can't be undone.`)) return;
    startTransition(async () => {
      const res = await deleteProduct(p.id);
      if (!res.ok) setError(res.error);
      else router.refresh();
    });
  }

  return (
    <div className="panel">
      <div className="panel-head">
        <div className="panel-title">Catalogue</div>
        <button
          type="button"
          className="btn btn-sm btn-accent"
          onClick={startAdd}
          disabled={pending || adding}
        >
          + Add product
        </button>
      </div>

      {error && (
        <div
          style={{
            padding: '8px 16px',
            fontSize: 12,
            color: 'var(--rose)',
            borderBottom: '1px solid var(--border)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          {error}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {adding && (
          <ProductFormRow
            mode="add"
            draft={addDraft}
            setDraft={setAddDraft}
            onCancel={cancelAdd}
            onSave={saveAdd}
            pending={pending}
          />
        )}

        {products.map(p =>
          editingId === p.id ? (
            <div
              key={p.id}
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              <ProductFormRow
                mode="edit"
                draft={editDraft}
                setDraft={setEditDraft}
                onCancel={cancelEdit}
                onSave={saveEdit}
                pending={pending}
              />
              <VariantsEditor product={p} pending={pending} setError={setError} />
            </div>
          ) : (
            <ProductRow
              key={p.id}
              product={p}
              onEdit={() => startEdit(p)}
              onDelete={() => onDelete(p)}
              pending={pending}
              setError={setError}
            />
          ),
        )}

        {products.length === 0 && !adding && (
          <div
            style={{
              padding: 32,
              textAlign: 'center',
              color: 'var(--fg-3)',
              fontSize: 13,
            }}
          >
            No products yet. Click <strong>+ Add product</strong> above.
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

function ProductFormRow({
  mode,
  draft,
  setDraft,
  onCancel,
  onSave,
  pending,
}: {
  mode: 'add' | 'edit';
  draft: ProductDraft;
  setDraft: (d: ProductDraft) => void;
  onCancel: () => void;
  onSave: () => void;
  pending: boolean;
}) {
  const onSale = draft.salePrice != null;
  return (
    <div
      style={{
        padding: 16,
        borderBottom: '1px solid var(--border)',
        background: 'var(--surface-2)',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '40px 1fr',
          gap: 12,
          alignItems: 'start',
        }}
      >
        <div>
          <label style={labelStyle}>Tone</label>
          <input
            type="color"
            value={draft.tone || '#737373'}
            onChange={e => setDraft({ ...draft, tone: e.target.value })}
            style={{
              width: 32,
              height: 32,
              border: '1px solid var(--border)',
              borderRadius: 6,
              cursor: 'pointer',
              background: 'none',
              padding: 0,
            }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div>
            <label style={labelStyle}>Name</label>
            <input
              style={inputStyle}
              placeholder="Heirloom Leather Collar"
              value={draft.name}
              onChange={e => setDraft({ ...draft, name: e.target.value })}
            />
          </div>
          <div>
            <label style={labelStyle}>
              Categories <span style={{ color: 'var(--fg-4)' }}>(comma-separated, up to 8)</span>
            </label>
            <input
              style={inputStyle}
              placeholder="collars, leather, dogs"
              value={draft.categories}
              onChange={e => setDraft({ ...draft, categories: e.target.value })}
            />
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: 10,
            }}
          >
            <div>
              <label style={labelStyle}>Regular price ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                style={inputStyle}
                value={draft.price}
                onChange={e =>
                  setDraft({ ...draft, price: Number(e.target.value) || 0 })
                }
              />
            </div>
            <div>
              <label style={labelStyle}>
                Sale price ($){' '}
                <span style={{ color: 'var(--fg-4)' }}>· optional</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                style={inputStyle}
                placeholder="—"
                value={onSale ? draft.salePrice ?? '' : ''}
                onChange={e => {
                  const v = e.target.value;
                  setDraft({
                    ...draft,
                    salePrice: v === '' ? null : Number(v) || 0,
                  });
                }}
              />
            </div>
            <div>
              <label style={labelStyle}>Compare-at / was ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                style={inputStyle}
                value={draft.was}
                onChange={e =>
                  setDraft({ ...draft, was: Number(e.target.value) || 0 })
                }
              />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Description</label>
            <textarea
              rows={2}
              style={{ ...inputStyle, fontFamily: 'var(--font)' }}
              placeholder="Hand-stitched in small batches…"
              value={draft.description}
              onChange={e => setDraft({ ...draft, description: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          gap: 6,
          justifyContent: 'flex-end',
        }}
      >
        <button
          type="button"
          className="btn btn-sm btn-ghost"
          onClick={onCancel}
          disabled={pending}
        >
          Cancel
        </button>
        <button
          type="button"
          className="btn btn-sm btn-accent"
          onClick={onSave}
          disabled={pending || !draft.name}
        >
          {pending ? 'Saving…' : mode === 'add' ? 'Add product' : 'Save'}
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

function ProductRow({
  product,
  onEdit,
  onDelete,
  pending,
  setError,
}: {
  product: Product;
  onEdit: () => void;
  onDelete: () => void;
  pending: boolean;
  setError: (s: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '40px 1fr 220px 200px',
          gap: 16,
          alignItems: 'center',
          padding: '12px 16px',
          fontSize: 13,
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 6,
            background: product.tone ?? 'var(--surface-2)',
            border: '1px solid var(--border)',
          }}
        />
        <div>
          <div style={{ fontWeight: 500, marginBottom: 2 }}>{product.name}</div>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 4,
              marginTop: 4,
            }}
          >
            {(product.categories.length
              ? product.categories
              : product.category
                ? [product.category]
                : []
            ).map(c => (
              <span
                key={c}
                style={{
                  fontSize: 10.5,
                  fontFamily: 'var(--font-mono)',
                  padding: '2px 6px',
                  borderRadius: 999,
                  background: 'var(--surface-2)',
                  color: 'var(--fg-3)',
                  border: '1px solid var(--border)',
                }}
              >
                {c}
              </span>
            ))}
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: 8,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {product.salePrice != null ? (
            <>
              <span style={{ fontWeight: 600, color: 'var(--rose)' }}>
                ${product.salePrice.toFixed(2)}
              </span>
              <span
                style={{
                  color: 'var(--fg-4)',
                  textDecoration: 'line-through',
                  fontSize: 12,
                }}
              >
                ${product.price.toFixed(2)}
              </span>
            </>
          ) : (
            <>
              <span style={{ fontWeight: 600 }}>${product.price.toFixed(2)}</span>
              {product.was > product.price && (
                <span
                  style={{
                    color: 'var(--fg-4)',
                    textDecoration: 'line-through',
                    fontSize: 12,
                  }}
                >
                  ${product.was.toFixed(2)}
                </span>
              )}
            </>
          )}
          {product.variants.length > 0 && (
            <span
              style={{
                fontSize: 11,
                color: 'var(--fg-3)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              · {product.variants.length} var
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="btn btn-sm btn-ghost"
            onClick={() => setOpen(o => !o)}
            disabled={pending}
          >
            {open ? 'Hide' : 'Variants'}
          </button>
          <button
            type="button"
            className="btn btn-sm btn-ghost"
            onClick={onEdit}
            disabled={pending}
          >
            Edit
          </button>
          <button
            type="button"
            className="btn btn-sm btn-ghost"
            onClick={onDelete}
            disabled={pending}
            style={{ color: 'var(--rose)' }}
          >
            Delete
          </button>
        </div>
      </div>
      {open && (
        <VariantsEditor product={product} pending={pending} setError={setError} />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------

type VariantDraft = {
  size: string;
  color: string;
  colorHex: string;
  priceOverride: number | null;
  salePrice: number | null;
  stock: number;
  sku: string;
};

const blankVariantDraft: VariantDraft = {
  size: '',
  color: '',
  colorHex: '',
  priceOverride: null,
  salePrice: null,
  stock: 0,
  sku: '',
};

function variantToDraft(v: Variant): VariantDraft {
  return {
    size: v.size ?? '',
    color: v.color ?? '',
    colorHex: v.colorHex ?? '',
    priceOverride: v.priceOverride,
    salePrice: v.salePrice,
    stock: v.stock,
    sku: v.sku ?? '',
  };
}

function VariantsEditor({
  product,
  pending,
  setError,
}: {
  product: Product;
  pending: boolean;
  setError: (s: string | null) => void;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<VariantDraft>(blankVariantDraft);
  const [adding, setAdding] = useState(false);
  const [addDraft, setAddDraft] = useState<VariantDraft>(blankVariantDraft);

  function startAdd() {
    setAdding(true);
    setAddDraft(blankVariantDraft);
  }
  function cancelAdd() {
    setAdding(false);
    setAddDraft(blankVariantDraft);
  }
  function saveAdd() {
    if (!addDraft.size && !addDraft.color) {
      setError('Variant needs a size or a color.');
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await addVariant({
        productId: product.id,
        size: addDraft.size || null,
        color: addDraft.color || null,
        colorHex: addDraft.colorHex || null,
        priceOverride: addDraft.priceOverride,
        salePrice: addDraft.salePrice,
        stock: addDraft.stock,
        sku: addDraft.sku || null,
      });
      if (!res.ok) setError(res.error);
      else {
        cancelAdd();
        router.refresh();
      }
    });
  }

  function startEdit(v: Variant) {
    setEditingId(v.id);
    setDraft(variantToDraft(v));
  }
  function cancelEdit() {
    setEditingId(null);
    setDraft(blankVariantDraft);
  }
  function saveEdit() {
    if (!editingId) return;
    if (!draft.size && !draft.color) {
      setError('Variant needs a size or a color.');
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await updateVariant({
        variantId: editingId,
        size: draft.size || null,
        color: draft.color || null,
        colorHex: draft.colorHex || null,
        priceOverride: draft.priceOverride,
        salePrice: draft.salePrice,
        stock: draft.stock,
        sku: draft.sku || null,
      });
      if (!res.ok) setError(res.error);
      else {
        cancelEdit();
        router.refresh();
      }
    });
  }

  function onDelete(v: Variant) {
    if (!confirm(`Delete variant "${variantLabel(v)}"?`)) return;
    startTransition(async () => {
      const res = await deleteVariant(v.id);
      if (!res.ok) setError(res.error);
      else router.refresh();
    });
  }

  return (
    <div
      style={{
        padding: '12px 16px 16px 56px',
        background: 'var(--surface)',
        borderTop: '1px dashed var(--border)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 8,
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontFamily: 'var(--font-mono)',
            color: 'var(--fg-3)',
            textTransform: 'uppercase',
            letterSpacing: 0.4,
          }}
        >
          Variants ({product.variants.length})
        </div>
        {!adding && (
          <button
            type="button"
            className="btn btn-sm btn-ghost"
            onClick={startAdd}
            disabled={pending}
          >
            + Add variant
          </button>
        )}
      </div>

      {product.variants.length === 0 && !adding && (
        <div style={{ fontSize: 12, color: 'var(--fg-4)', fontStyle: 'italic' }}>
          No variants — this product is sold as a single SKU.
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {product.variants.map(v =>
          editingId === v.id ? (
            <VariantForm
              key={v.id}
              draft={draft}
              setDraft={setDraft}
              onCancel={cancelEdit}
              onSave={saveEdit}
              pending={pending}
              mode="edit"
            />
          ) : (
            <VariantRow
              key={v.id}
              variant={v}
              onEdit={() => startEdit(v)}
              onDelete={() => onDelete(v)}
              pending={pending}
            />
          ),
        )}
        {adding && (
          <VariantForm
            draft={addDraft}
            setDraft={setAddDraft}
            onCancel={cancelAdd}
            onSave={saveAdd}
            pending={pending}
            mode="add"
          />
        )}
      </div>
    </div>
  );
}

function variantLabel(v: Variant): string {
  const parts: string[] = [];
  if (v.size) parts.push(v.size);
  if (v.color) parts.push(v.color);
  return parts.join(' / ') || '—';
}

function VariantRow({
  variant,
  onEdit,
  onDelete,
  pending,
}: {
  variant: Variant;
  onEdit: () => void;
  onDelete: () => void;
  pending: boolean;
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '24px 1fr 110px 90px 110px 140px',
        alignItems: 'center',
        gap: 12,
        padding: '6px 8px',
        fontSize: 12.5,
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 6,
      }}
    >
      <div
        style={{
          width: 16,
          height: 16,
          borderRadius: 4,
          background: variant.colorHex ?? 'var(--surface-2)',
          border: '1px solid var(--border)',
        }}
        title={variant.color ?? ''}
      />
      <div>
        <div style={{ fontWeight: 500 }}>{variantLabel(variant)}</div>
        {variant.sku && (
          <div
            style={{
              fontSize: 10.5,
              fontFamily: 'var(--font-mono)',
              color: 'var(--fg-4)',
            }}
          >
            SKU {variant.sku}
          </div>
        )}
      </div>
      <div
        style={{
          fontVariantNumeric: 'tabular-nums',
          color: variant.salePrice != null ? 'var(--rose)' : 'var(--fg)',
        }}
      >
        {variant.salePrice != null
          ? `$${variant.salePrice.toFixed(2)}`
          : variant.priceOverride != null
            ? `$${variant.priceOverride.toFixed(2)}`
            : '—'}
      </div>
      <div
        style={{
          fontVariantNumeric: 'tabular-nums',
          color: variant.stock > 0 ? 'var(--fg-2)' : 'var(--rose)',
        }}
      >
        {variant.stock} in stock
      </div>
      <div />
      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
        <button
          type="button"
          className="btn btn-sm btn-ghost"
          onClick={onEdit}
          disabled={pending}
        >
          Edit
        </button>
        <button
          type="button"
          className="btn btn-sm btn-ghost"
          onClick={onDelete}
          disabled={pending}
          style={{ color: 'var(--rose)' }}
        >
          Delete
        </button>
      </div>
    </div>
  );
}

function VariantForm({
  draft,
  setDraft,
  onCancel,
  onSave,
  pending,
  mode,
}: {
  draft: VariantDraft;
  setDraft: (d: VariantDraft) => void;
  onCancel: () => void;
  onSave: () => void;
  pending: boolean;
  mode: 'add' | 'edit';
}) {
  return (
    <div
      style={{
        padding: 10,
        background: 'var(--surface-2)',
        border: '1px solid var(--border)',
        borderRadius: 6,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 60px 1fr',
          gap: 8,
        }}
      >
        <div>
          <label style={labelStyle}>Size</label>
          <input
            style={inputStyle}
            placeholder="M"
            value={draft.size}
            onChange={e => setDraft({ ...draft, size: e.target.value })}
          />
        </div>
        <div>
          <label style={labelStyle}>Color</label>
          <input
            style={inputStyle}
            placeholder="Walnut"
            value={draft.color}
            onChange={e => setDraft({ ...draft, color: e.target.value })}
          />
        </div>
        <div>
          <label style={labelStyle}>Swatch</label>
          <input
            type="color"
            value={draft.colorHex || '#737373'}
            onChange={e => setDraft({ ...draft, colorHex: e.target.value })}
            style={{
              width: '100%',
              height: 28,
              border: '1px solid var(--border)',
              borderRadius: 4,
              cursor: 'pointer',
              background: 'none',
              padding: 0,
            }}
          />
        </div>
        <div>
          <label style={labelStyle}>SKU</label>
          <input
            style={inputStyle}
            placeholder="DESK-WAL-M"
            value={draft.sku}
            onChange={e => setDraft({ ...draft, sku: e.target.value })}
          />
        </div>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 100px',
          gap: 8,
        }}
      >
        <div>
          <label style={labelStyle}>
            Price override ($){' '}
            <span style={{ color: 'var(--fg-4)' }}>· blank to inherit</span>
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            style={inputStyle}
            placeholder="—"
            value={draft.priceOverride ?? ''}
            onChange={e => {
              const v = e.target.value;
              setDraft({
                ...draft,
                priceOverride: v === '' ? null : Number(v) || 0,
              });
            }}
          />
        </div>
        <div>
          <label style={labelStyle}>
            Sale price ($){' '}
            <span style={{ color: 'var(--fg-4)' }}>· optional</span>
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            style={inputStyle}
            placeholder="—"
            value={draft.salePrice ?? ''}
            onChange={e => {
              const v = e.target.value;
              setDraft({
                ...draft,
                salePrice: v === '' ? null : Number(v) || 0,
              });
            }}
          />
        </div>
        <div>
          <label style={labelStyle}>Stock</label>
          <input
            type="number"
            step="1"
            min="0"
            style={inputStyle}
            value={draft.stock}
            onChange={e =>
              setDraft({ ...draft, stock: Math.max(0, Number(e.target.value) || 0) })
            }
          />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
        <button
          type="button"
          className="btn btn-sm btn-ghost"
          onClick={onCancel}
          disabled={pending}
        >
          Cancel
        </button>
        <button
          type="button"
          className="btn btn-sm btn-accent"
          onClick={onSave}
          disabled={pending}
        >
          {pending ? 'Saving…' : mode === 'add' ? 'Add variant' : 'Save'}
        </button>
      </div>
    </div>
  );
}
