'use client';

import { useEffect, useRef, useState } from 'react';
import { StreamingText } from './streaming-text';
import { JsonStream } from './json-stream';
import { BuildStages } from './build-stages';
import {
  STAGES,
  scriptPromptFor,
  type Brand,
  type BrandKey,
  type BuildState,
} from '@/lib/builder/mock-data';
import type {
  ChatMessage,
  ChatStreamEvent,
} from '@/lib/builder/chat-types';

// Initial greeting — hardcoded so the first paint is instant. Real LLM kicks
// in once the user sends a prompt.
const GREETING = `Hi. I'll build a complete store from a single prompt — brand, pages, products, pricing, policies. Describe your business, or tap a starter below.`;

type Message =
  | { kind: 'user'; text: string }
  | {
      kind: 'ai';
      meta?: string;
      text: string;
      streaming?: boolean;
      isBuild?: boolean;
      isApproval?: boolean;
    };

export function BuilderChat({
  brand,
  brandKey,
  setBrandKey,
  buildState,
  setBuildState,
  onApprove,
  gateApproval = true,
}: {
  brand: Brand;
  brandKey: BrandKey;
  setBrandKey: (k: BrandKey) => void;
  buildState: BuildState;
  setBuildState: (next: BuildState | ((prev: BuildState) => BuildState)) => void;
  onApprove?: () => void;
  gateApproval?: boolean;
}) {
  const [messages, setMessages] = useState<Message[]>([
    { kind: 'ai', meta: 'FORGE · v0.4', text: GREETING },
  ]);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [hasReplied, setHasReplied] = useState(false);
  const streamRef = useRef<HTMLDivElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (streamRef.current) streamRef.current.scrollTop = streamRef.current.scrollHeight;
  }, [messages, buildState]);

  // Cancel any in-flight stream on unmount.
  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  function toApiMessages(history: Message[]): ChatMessage[] {
    // Drop the hardcoded greeting (first message) — the system prompt covers it.
    // Drop any in-progress empty placeholders.
    const out: ChatMessage[] = [];
    for (let i = 1; i < history.length; i++) {
      const m = history[i];
      if (!m) continue;
      if (m.kind === 'user' && m.text.trim()) {
        out.push({ role: 'user', content: m.text });
      } else if (m.kind === 'ai' && m.text.trim()) {
        out.push({ role: 'assistant', content: m.text });
      }
    }
    return out;
  }

  async function submit(text: string) {
    if (!text.trim() || busy) return;
    setDraft('');
    setBusy(true);

    // Append the user turn and an empty AI placeholder we'll stream into.
    const userMsg: Message = { kind: 'user', text };
    const aiPlaceholder: Message = { kind: 'ai', text: '', streaming: true };
    let nextMessages: Message[] = [];
    setMessages(prev => {
      nextMessages = [...prev, userMsg, aiPlaceholder];
      return nextMessages;
    });

    const apiMessages = toApiMessages([...messages, userMsg]);

    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const res = await fetch('/api/builder/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages }),
        signal: ctrl.signal,
      });
      if (!res.ok || !res.body) {
        const detail = await res.text().catch(() => '');
        throw new Error(detail || `${res.status} ${res.statusText}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let aiText = '';

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let nl: number;
        while ((nl = buffer.indexOf('\n')) !== -1) {
          const line = buffer.slice(0, nl).trim();
          buffer = buffer.slice(nl + 1);
          if (!line) continue;
          let event: ChatStreamEvent;
          try {
            event = JSON.parse(line) as ChatStreamEvent;
          } catch {
            continue;
          }
          if (event.type === 'text') {
            aiText += event.delta;
            const snapshot = aiText;
            setMessages(prev => {
              const next = [...prev];
              const last = next[next.length - 1];
              if (last && last.kind === 'ai' && last.streaming) {
                next[next.length - 1] = { ...last, text: snapshot };
              }
              return next;
            });
          } else if (event.type === 'error') {
            throw new Error(event.error);
          }
        }
      }

      setMessages(prev => {
        const next = [...prev];
        const last = next[next.length - 1];
        if (last && last.kind === 'ai' && last.streaming) {
          next[next.length - 1] = { ...last, streaming: false };
        }
        return next;
      });
      setHasReplied(true);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      const reason = err instanceof Error ? err.message : 'unknown error';
      setMessages(prev => {
        const next = [...prev];
        const last = next[next.length - 1];
        if (last && last.kind === 'ai' && last.streaming) {
          next[next.length - 1] = {
            kind: 'ai',
            text: `Sorry — I couldn't reach the model (${reason}). Try again, or re-deploy if the API key is missing.`,
          };
        }
        return next;
      });
    } finally {
      setBusy(false);
    }
  }

  function beginBuild() {
    if (busy || buildState.status !== 'idle') return;
    setMessages(m => [
      ...m,
      {
        kind: 'ai',
        meta: 'BUILDING · 7 stages',
        text: 'Building now — watch the preview update live.',
        isBuild: true,
      },
    ]);

    let stage = 0;
    setBuildState({ active: 0, blueprint: null, status: 'building' });
    const blueprint = {
      store_name: brand.name,
      tagline: brand.tagline,
      niche: brand.niche,
      target_audience: brand.audience,
      brand_tone: brand.tone,
      colors: brand.colors,
      categories: brand.categories,
      homepage_sections: ['hero', 'featured', 'benefits', 'best sellers', 'testimonials', 'FAQ'],
    };

    function tick() {
      stage++;
      if (stage >= STAGES.length) {
        setBuildState({ active: STAGES.length, blueprint, status: 'ready' });
        setMessages(m => [
          ...m,
          {
            kind: 'ai',
            meta: 'COMPLETE · 4.2s',
            text: `Done. ${brand.name} is live in preview — 8 products, full pages, AI-priced. Review on the right; ${gateApproval ? 'approve to publish to ' : 'opening '}${brand.domain}.`,
            isApproval: gateApproval,
          },
        ]);
        return;
      }
      setBuildState(prev => ({
        ...prev,
        active: stage,
        blueprint: stage >= 1 ? blueprint : null,
      }));
      setTimeout(tick, 700);
    }
    setTimeout(tick, 700);
  }

  const showBuildCta = hasReplied && !busy && buildState.status === 'idle';

  return (
    <div className="builder-pane">
      <div className="chat-stream" ref={streamRef}>
        {messages.map((m, i) => {
          if (m.kind === 'user') {
            return (
              <div key={i} className="msg-user">
                {m.text}
              </div>
            );
          }
          const isLast = i === messages.length - 1;
          const isGreeting = i === 0;
          // Greeting uses the typewriter for that on-load feel; live-streamed
          // Claude text already arrives one delta at a time, so we render plain.
          return (
            <div key={i} className="msg-ai">
              <div className="ai-avatar">F</div>
              <div className="ai-body">
                {m.meta && <div className="ai-meta">⊹ {m.meta}</div>}
                <div style={{ whiteSpace: 'pre-wrap' }}>
                  {isGreeting && isLast ? (
                    <StreamingText text={m.text} speed={10} />
                  ) : (
                    <>
                      {m.text}
                      {m.streaming && (
                        <span style={{ marginLeft: 1 }}>▍</span>
                      )}
                    </>
                  )}
                </div>

                {m.isBuild && (
                  <div className="tool-card" style={{ marginTop: 10 }}>
                    <div className="tool-head">
                      <span className="dot" /> store_blueprint.json
                      <span style={{ marginLeft: 'auto', color: 'var(--fg-4)' }}>
                        {buildState.status === 'ready' ? '✓ ready' : 'streaming'}
                      </span>
                    </div>
                    <BuildStages active={buildState.active} />
                    {buildState.blueprint && (
                      <div style={{ borderTop: '1px solid var(--border)', padding: '10px 12px' }}>
                        <JsonStream obj={buildState.blueprint} />
                      </div>
                    )}
                  </div>
                )}

                {m.isApproval && (
                  <div className="tool-card" style={{ marginTop: 10, borderColor: 'var(--accent)' }}>
                    <div
                      className="tool-head"
                      style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
                    >
                      <span style={{ fontWeight: 600 }}>APPROVAL REQUIRED</span>
                      <span style={{ marginLeft: 'auto' }}>publish + DNS</span>
                    </div>
                    <div
                      className="tool-body"
                      style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                    >
                      <span style={{ flex: 1, fontSize: 12 }}>
                        Push <strong>{brand.name}</strong> to{' '}
                        <code style={{ fontFamily: 'var(--font-mono)' }}>{brand.domain}</code>?
                      </span>
                      <button type="button" className="btn btn-sm">
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-accent"
                        onClick={onApprove}
                      >
                        Approve & publish
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {busy && (
          <div className="msg-ai">
            <div className="ai-avatar">F</div>
            <div className="ai-body">
              <div className="thinking">
                <span className="thinking-dots">
                  <span />
                  <span />
                  <span />
                </span>
                <span>Thinking…</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {messages.length <= 1 && (
        <div className="prompts">
          <button
            type="button"
            className="prompt-chip"
            onClick={() => {
              setBrandKey('pawluxe');
              submit(scriptPromptFor('pawluxe'));
            }}
          >
            Luxury pet accessories →
          </button>
          <button
            type="button"
            className="prompt-chip"
            onClick={() => {
              setBrandKey('desknova');
              submit(scriptPromptFor('desknova'));
            }}
          >
            Modern home office →
          </button>
          <button type="button" className="prompt-chip">
            Surprise me
          </button>
        </div>
      )}

      {showBuildCta && (
        <div className="prompts">
          <button
            type="button"
            className="prompt-chip"
            style={{
              borderColor: 'var(--accent)',
              color: 'var(--accent)',
              fontWeight: 500,
            }}
            onClick={beginBuild}
          >
            Build this store →
          </button>
          <span
            style={{
              fontSize: 11,
              color: 'var(--fg-4)',
              alignSelf: 'center',
              fontFamily: 'var(--font-mono)',
            }}
          >
            (Phase 2C will replace this with a real LLM-driven blueprint.)
          </span>
        </div>
      )}

      <div className="composer">
        <div className="composer-input-wrap">
          <textarea
            placeholder="Describe your business — niche, audience, vibe, price range…"
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                submit(draft);
              }
            }}
            rows={1}
            disabled={busy}
          />
          <div className="composer-row">
            <button type="button" className="btn btn-sm btn-ghost">
              <span>＋</span> Attach
            </button>
            <button type="button" className="btn btn-sm btn-ghost">
              <span>🌐</span> Niche
            </button>
            <button
              type="button"
              className="send"
              disabled={!draft.trim() || busy}
              onClick={() => submit(draft)}
            >
              ↑
            </button>
          </div>
        </div>
        <div
          style={{
            fontSize: 10.5,
            color: 'var(--fg-4)',
            marginTop: 8,
            fontFamily: 'var(--font-mono)',
          }}
        >
          Forge will not publish without your approval.
        </div>
      </div>
    </div>
  );
}
