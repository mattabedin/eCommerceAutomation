'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  addProduct,
  deleteProduct,
  updateProduct,
} from '@/lib/builder/edit-actions';

type Product = {
  id: string;
  name: string;
  category: string;
  price: number; // dollars
  was: number; // dollars
  description: string | null;
  tone: string | null;
};

type Draft = Omit<Product, 'id'>;

const blankDraft: Draft = {
  name: '',
  category: '',
  price: 0,
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

export function ProductsManager({
  brandId,
  products,
}: {
  brandId: string;
  products: Product[];
}) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Draft>(blankDraft);
  const [adding, setAdding] = useState(false);
  const [addDraft, setAddDraft] = useState<Draft>(blankDraft);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function startEdit(p: Product) {
    setEditingId(p.id);
    setEditDraft({
      name: p.name,
      category: p.category,
      price: p.price,
      was: p.was,
      description: p.description ?? '',
      tone: p.tone ?? '#737373',
    });
    setError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditDraft(blankDraft);
    setError(null);
  }

  function saveEdit() {
    if (!editingId) return;
    setError(null);
    startTransition(async () => {
      const res = await updateProduct({
        productId: editingId,
        ...editDraft,
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
    setAddDraft(blankDraft);
    setError(null);
  }

  function cancelAdd() {
    setAdding(false);
    setAddDraft(blankDraft);
    setError(null);
  }

  function saveAdd() {
    setError(null);
    startTransition(async () => {
      const res = await addProduct({
        brandId,
        ...addDraft,
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

      <table className="table">
        <thead>
          <tr>
            <th style={{ width: 36 }} />
            <th>Name</th>
            <th>Category</th>
            <th style={{ width: 110 }}>Price</th>
            <th style={{ width: 110 }}>Was</th>
            <th style={{ width: 200 }} />
          </tr>
        </thead>
        <tbody>
          {adding && (
            <tr>
              <td>
                <input
                  type="color"
                  value={addDraft.tone ?? '#737373'}
                  onChange={e => setAddDraft({ ...addDraft, tone: e.target.value })}
                  style={{
                    width: 24,
                    height: 24,
                    border: '1px solid var(--border)',
                    borderRadius: 4,
                    cursor: 'pointer',
                    background: 'none',
                    padding: 0,
                  }}
                />
              </td>
              <td>
                <input
                  style={inputStyle}
                  placeholder="Heirloom Leather Collar"
                  value={addDraft.name}
                  onChange={e => setAddDraft({ ...addDraft, name: e.target.value })}
                />
              </td>
              <td>
                <input
                  style={inputStyle}
                  placeholder="Collars"
                  value={addDraft.category}
                  onChange={e => setAddDraft({ ...addDraft, category: e.target.value })}
                />
              </td>
              <td>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  style={inputStyle}
                  value={addDraft.price}
                  onChange={e =>
                    setAddDraft({ ...addDraft, price: Number(e.target.value) || 0 })
                  }
                />
              </td>
              <td>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  style={inputStyle}
                  value={addDraft.was}
                  onChange={e =>
                    setAddDraft({ ...addDraft, was: Number(e.target.value) || 0 })
                  }
                />
              </td>
              <td style={{ display: 'flex', gap: 6 }}>
                <button
                  type="button"
                  className="btn btn-sm btn-ghost"
                  onClick={cancelAdd}
                  disabled={pending}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-accent"
                  onClick={saveAdd}
                  disabled={pending || !addDraft.name || !addDraft.category}
                >
                  {pending ? 'Adding…' : 'Add'}
                </button>
              </td>
            </tr>
          )}

          {products.map(p =>
            editingId === p.id ? (
              <tr key={p.id}>
                <td>
                  <input
                    type="color"
                    value={editDraft.tone ?? '#737373'}
                    onChange={e =>
                      setEditDraft({ ...editDraft, tone: e.target.value })
                    }
                    style={{
                      width: 24,
                      height: 24,
                      border: '1px solid var(--border)',
                      borderRadius: 4,
                      cursor: 'pointer',
                      background: 'none',
                      padding: 0,
                    }}
                  />
                </td>
                <td>
                  <input
                    style={inputStyle}
                    value={editDraft.name}
                    onChange={e => setEditDraft({ ...editDraft, name: e.target.value })}
                  />
                </td>
                <td>
                  <input
                    style={inputStyle}
                    value={editDraft.category}
                    onChange={e =>
                      setEditDraft({ ...editDraft, category: e.target.value })
                    }
                  />
                </td>
                <td>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    style={inputStyle}
                    value={editDraft.price}
                    onChange={e =>
                      setEditDraft({ ...editDraft, price: Number(e.target.value) || 0 })
                    }
                  />
                </td>
                <td>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    style={inputStyle}
                    value={editDraft.was}
                    onChange={e =>
                      setEditDraft({ ...editDraft, was: Number(e.target.value) || 0 })
                    }
                  />
                </td>
                <td style={{ display: 'flex', gap: 6 }}>
                  <button
                    type="button"
                    className="btn btn-sm btn-ghost"
                    onClick={cancelEdit}
                    disabled={pending}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-accent"
                    onClick={saveEdit}
                    disabled={pending}
                  >
                    {pending ? 'Saving…' : 'Save'}
                  </button>
                </td>
              </tr>
            ) : (
              <tr key={p.id}>
                <td>
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 4,
                      background: p.tone ?? 'var(--surface-2)',
                      border: '1px solid var(--border)',
                    }}
                  />
                </td>
                <td style={{ fontWeight: 500 }}>{p.name}</td>
                <td style={{ color: 'var(--fg-3)' }}>{p.category}</td>
                <td style={{ fontVariantNumeric: 'tabular-nums' }}>
                  ${p.price.toFixed(2)}
                </td>
                <td
                  style={{
                    color: 'var(--fg-3)',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  ${p.was.toFixed(2)}
                </td>
                <td style={{ display: 'flex', gap: 6 }}>
                  <button
                    type="button"
                    className="btn btn-sm btn-ghost"
                    onClick={() => startEdit(p)}
                    disabled={pending}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-ghost"
                    onClick={() => onDelete(p)}
                    disabled={pending}
                    style={{ color: 'var(--rose)' }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ),
          )}

          {products.length === 0 && !adding && (
            <tr>
              <td colSpan={6} style={{ padding: 32, textAlign: 'center', color: 'var(--fg-3)' }}>
                No products yet. Click <strong>+ Add product</strong> above.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
