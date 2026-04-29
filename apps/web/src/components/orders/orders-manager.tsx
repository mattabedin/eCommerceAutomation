'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateOrder } from '@/lib/builder/runtime-actions';

type StatusValue = 'paid' | 'refund_requested' | 'refunded';
type FulfillValue =
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'fulfilled'
  | 'cancelled';

type Order = {
  id: string;
  customer: string;
  total: number;
  itemCount: number;
  status: StatusValue;
  fulfill: FulfillValue;
  notes: string | null;
  createdAt: string;
};

const STATUS_OPTIONS: { value: StatusValue; label: string; tone: string }[] = [
  { value: 'paid', label: 'paid', tone: 'green' },
  { value: 'refund_requested', label: 'refund req', tone: 'rose' },
  { value: 'refunded', label: 'refunded', tone: 'gray' },
];

const FULFILL_OPTIONS: { value: FulfillValue; label: string; tone: string }[] = [
  { value: 'processing', label: 'processing', tone: 'amber' },
  { value: 'shipped', label: 'shipped', tone: 'indigo' },
  { value: 'delivered', label: 'delivered', tone: 'green' },
  { value: 'fulfilled', label: 'fulfilled', tone: 'green' },
  { value: 'cancelled', label: 'cancelled', tone: 'gray' },
];

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

export function OrdersManager({ orders }: { orders: Order[] }) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<{
    status: StatusValue;
    fulfill: FulfillValue;
    notes: string;
  } | null>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function startEdit(o: Order) {
    setEditingId(o.id);
    setDraft({ status: o.status, fulfill: o.fulfill, notes: o.notes ?? '' });
    setError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setDraft(null);
    setError(null);
  }

  function save() {
    if (!editingId || !draft) return;
    setError(null);
    startTransition(async () => {
      const res = await updateOrder({
        orderId: editingId,
        status: draft.status,
        fulfill: draft.fulfill,
        notes: draft.notes || null,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      cancelEdit();
      router.refresh();
    });
  }

  return (
    <div className="panel">
      <div className="panel-head">
        <div className="panel-title">Recent orders</div>
        <div className="panel-sub">{orders.length} total</div>
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
            <th>Order</th>
            <th>Customer</th>
            <th>Items</th>
            <th>Total</th>
            <th>Status</th>
            <th>Fulfilment</th>
            <th>Placed</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {orders.map(o =>
            editingId === o.id && draft ? (
              <>
                <tr key={o.id}>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>
                    {o.id.slice(0, 8)}
                  </td>
                  <td style={{ fontWeight: 500 }}>{o.customer}</td>
                  <td>{o.itemCount}</td>
                  <td style={{ fontVariantNumeric: 'tabular-nums' }}>
                    ${o.total.toFixed(2)}
                  </td>
                  <td>
                    <select
                      style={inputStyle}
                      value={draft.status}
                      onChange={e =>
                        setDraft({ ...draft, status: e.target.value as StatusValue })
                      }
                    >
                      {STATUS_OPTIONS.map(s => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <select
                      style={inputStyle}
                      value={draft.fulfill}
                      onChange={e =>
                        setDraft({
                          ...draft,
                          fulfill: e.target.value as FulfillValue,
                        })
                      }
                    >
                      {FULFILL_OPTIONS.map(s => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td style={{ color: 'var(--fg-3)' }}>{formatDate(o.createdAt)}</td>
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
                      onClick={save}
                      disabled={pending}
                    >
                      {pending ? 'Saving…' : 'Save'}
                    </button>
                  </td>
                </tr>
                <tr>
                  <td colSpan={8} style={{ background: 'var(--surface-2)' }}>
                    <textarea
                      placeholder="Internal notes on this order…"
                      rows={2}
                      style={{ ...inputStyle, fontFamily: 'var(--font)' }}
                      value={draft.notes}
                      onChange={e => setDraft({ ...draft, notes: e.target.value })}
                    />
                  </td>
                </tr>
              </>
            ) : (
              <tr key={o.id}>
                <td style={{ fontFamily: 'var(--font-mono)' }}>{o.id.slice(0, 8)}</td>
                <td style={{ fontWeight: 500 }}>{o.customer}</td>
                <td>{o.itemCount}</td>
                <td style={{ fontVariantNumeric: 'tabular-nums' }}>
                  ${o.total.toFixed(2)}
                </td>
                <td>
                  <span
                    className="status-pill"
                    data-tone={
                      STATUS_OPTIONS.find(s => s.value === o.status)?.tone ??
                      'gray'
                    }
                  >
                    {STATUS_OPTIONS.find(s => s.value === o.status)?.label ??
                      o.status}
                  </span>
                </td>
                <td>
                  <span
                    className="status-pill"
                    data-tone={
                      FULFILL_OPTIONS.find(s => s.value === o.fulfill)?.tone ??
                      'gray'
                    }
                  >
                    {o.fulfill}
                  </span>
                </td>
                <td style={{ color: 'var(--fg-3)' }}>{formatDate(o.createdAt)}</td>
                <td>
                  <button
                    type="button"
                    className="btn btn-sm btn-ghost"
                    onClick={() => startEdit(o)}
                    disabled={pending}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ),
          )}
        </tbody>
      </table>
    </div>
  );
}

function formatDate(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const min = Math.floor(ms / 60_000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const d = Math.floor(hr / 24);
  if (d < 30) return `${d}d ago`;
  return iso.slice(0, 10);
}
