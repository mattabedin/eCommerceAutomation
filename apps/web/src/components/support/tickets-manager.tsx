'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  closeTicket,
  draftTicketReply,
  reopenTicket,
  replyToTicket,
} from '@/lib/builder/runtime-actions';

type Sender = 'customer' | 'operator' | 'agent';
type Status = 'open' | 'awaiting' | 'resolved';

type Message = {
  id: string;
  sender: Sender;
  body: string;
  createdAt: string;
};

type Ticket = {
  id: string;
  subject: string;
  customer: string;
  email: string;
  status: Status;
  aiConfidence: string | null;
  updatedAt: string;
  messages: Message[];
};

const STATUS_TONES: Record<Status, string> = {
  open: 'rose',
  awaiting: 'amber',
  resolved: 'green',
};

export function TicketsManager({ tickets }: { tickets: Ticket[] }) {
  const router = useRouter();
  const [openId, setOpenId] = useState<string | null>(
    tickets.find(t => t.status !== 'resolved')?.id ?? null,
  );
  const [reply, setReply] = useState('');
  const [pending, startTransition] = useTransition();
  const [drafting, setDrafting] = useState(false);
  // Confidence tag returned by Soren for the ticket whose draft is currently
  // sitting in the textarea. Cleared on send / cancel / new ticket open.
  const [draftBadge, setDraftBadge] = useState<{
    ticketId: string;
    confidence: 'high' | 'medium' | 'low';
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  function expand(t: Ticket) {
    setOpenId(prev => (prev === t.id ? null : t.id));
    setReply('');
    setDraftBadge(null);
    setError(null);
  }

  function send(t: Ticket) {
    const body = reply.trim();
    if (!body) return;
    setError(null);
    startTransition(async () => {
      const res = await replyToTicket({ ticketId: t.id, body });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setReply('');
      setDraftBadge(null);
      router.refresh();
    });
  }

  async function draft(t: Ticket) {
    setError(null);
    setDrafting(true);
    try {
      const res = await draftTicketReply(t.id);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setReply(res.draft);
      setDraftBadge({ ticketId: t.id, confidence: res.confidence });
      router.refresh();
    } finally {
      setDrafting(false);
    }
  }

  function resolve(t: Ticket) {
    setError(null);
    startTransition(async () => {
      const res = await closeTicket(t.id);
      if (!res.ok) setError(res.error);
      else router.refresh();
    });
  }

  function reopen(t: Ticket) {
    setError(null);
    startTransition(async () => {
      const res = await reopenTicket(t.id);
      if (!res.ok) setError(res.error);
      else router.refresh();
    });
  }

  return (
    <div className="panel">
      <div className="panel-head">
        <div className="panel-title">Inbox</div>
        <div className="panel-sub">{tickets.length} total</div>
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
      <div>
        {tickets.map(t => (
          <div
            key={t.id}
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            <button
              type="button"
              onClick={() => expand(t)}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '12px 16px',
                display: 'grid',
                gridTemplateColumns: '1fr 110px 110px 90px',
                gap: 16,
                alignItems: 'center',
                fontSize: 13,
                background:
                  openId === t.id ? 'var(--surface-2)' : 'var(--surface)',
              }}
            >
              <div>
                <div style={{ fontWeight: 500, marginBottom: 2 }}>
                  {t.subject}
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--fg-3)' }}>
                  {t.customer}{' '}
                  {t.email && (
                    <span style={{ fontFamily: 'var(--font-mono)' }}>
                      · {t.email}
                    </span>
                  )}
                </div>
              </div>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  color: t.aiConfidence ? 'var(--fg-2)' : 'var(--fg-4)',
                }}
              >
                {t.aiConfidence ? `AI ${t.aiConfidence}` : '—'}
              </span>
              <span
                className="status-pill"
                data-tone={STATUS_TONES[t.status]}
                style={{ justifySelf: 'start' }}
              >
                {t.status}
              </span>
              <span style={{ fontSize: 11.5, color: 'var(--fg-3)', textAlign: 'right' }}>
                {formatDate(t.updatedAt)}
              </span>
            </button>

            {openId === t.id && (
              <div style={{ padding: '0 16px 16px' }}>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                    paddingTop: 8,
                  }}
                >
                  {t.messages.map(m => (
                    <MessageBubble key={m.id} message={m} customer={t.customer} />
                  ))}
                  {t.messages.length === 0 && (
                    <div
                      style={{
                        fontSize: 12,
                        color: 'var(--fg-4)',
                        fontStyle: 'italic',
                        padding: '8px 0',
                      }}
                    >
                      No messages on this ticket yet.
                    </div>
                  )}
                </div>

                {t.status !== 'resolved' && (
                  <div style={{ marginTop: 12 }}>
                    <textarea
                      placeholder="Type your reply, or click Ask Soren to draft…"
                      rows={4}
                      value={reply}
                      onChange={e => {
                        setReply(e.target.value);
                        if (draftBadge && draftBadge.ticketId === t.id) {
                          setDraftBadge(null);
                        }
                      }}
                      style={{
                        padding: '10px 12px',
                        border: '1px solid var(--border)',
                        borderRadius: 8,
                        fontSize: 13,
                        background: 'var(--surface)',
                        color: 'var(--fg)',
                        width: '100%',
                        outline: 'none',
                        fontFamily: 'var(--font)',
                      }}
                    />
                    <div
                      style={{
                        display: 'flex',
                        gap: 6,
                        marginTop: 8,
                        alignItems: 'center',
                      }}
                    >
                      <button
                        type="button"
                        className="btn btn-sm btn-ghost"
                        onClick={() => draft(t)}
                        disabled={pending || drafting}
                        title="Have Soren draft a reply you can edit"
                      >
                        {drafting ? 'Drafting…' : '✨ Ask Soren'}
                      </button>
                      {draftBadge && draftBadge.ticketId === t.id && (
                        <span
                          className="status-pill"
                          data-tone={
                            draftBadge.confidence === 'high'
                              ? 'green'
                              : draftBadge.confidence === 'low'
                                ? 'rose'
                                : 'amber'
                          }
                          style={{ fontSize: 10.5 }}
                          title="Soren's confidence in this draft"
                        >
                          AI {draftBadge.confidence}
                        </span>
                      )}
                      <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                        <button
                          type="button"
                          className="btn btn-sm btn-ghost"
                          onClick={() => resolve(t)}
                          disabled={pending}
                        >
                          Mark resolved
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-accent"
                          onClick={() => send(t)}
                          disabled={pending || !reply.trim()}
                        >
                          {pending ? 'Sending…' : 'Send reply'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                {t.status === 'resolved' && (
                  <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      className="btn btn-sm btn-ghost"
                      onClick={() => reopen(t)}
                      disabled={pending}
                    >
                      Reopen ticket
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function MessageBubble({
  message,
  customer,
}: {
  message: Message;
  customer: string;
}) {
  const isCustomer = message.sender === 'customer';
  const isAgent = message.sender === 'agent';
  const senderLabel = isCustomer
    ? customer
    : isAgent
      ? 'Soren · AI'
      : 'You';
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: isCustomer ? 'flex-start' : 'flex-end',
      }}
    >
      <div
        style={{
          fontSize: 10.5,
          color: 'var(--fg-3)',
          fontFamily: 'var(--font-mono)',
          marginBottom: 4,
        }}
      >
        {senderLabel} · {formatDate(message.createdAt)}
      </div>
      <div
        style={{
          maxWidth: '78%',
          padding: '8px 12px',
          fontSize: 13,
          lineHeight: 1.5,
          borderRadius: 12,
          background: isCustomer
            ? 'var(--surface-2)'
            : isAgent
              ? 'var(--accent-soft)'
              : 'var(--fg)',
          color: isCustomer || isAgent ? 'var(--fg)' : 'var(--bg)',
          whiteSpace: 'pre-wrap',
        }}
      >
        {message.body}
      </div>
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
