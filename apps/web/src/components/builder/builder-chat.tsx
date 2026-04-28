'use client';

import { useEffect, useRef, useState } from 'react';
import { StreamingText } from './streaming-text';
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
  BlueprintStreamEvent,
} from '@/lib/builder/chat-types';
import type { Blueprint } from '@/lib/builder/blueprint-schema';

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
  fallbackBrand,
  brandKey,
  setBrandKey,
  buildState,
  setBuildState,
  blueprint,
  setBlueprint,
  onApprove,
  gateApproval = true,
}: {
  fallbackBrand: Brand;
  brandKey: BrandKey;
  setBrandKey: (k: BrandKey) => void;
  buildState: BuildState;
  setBuildState: (next: BuildState | ((prev: BuildState) => BuildState)) => void;
  blueprint: Blueprint | null;
  setBlueprint: (bp: Blueprint | null) => void;
  onApprove?: () => void;
  gateApproval?: boolean;
}) {
  const [messages, setMessages] = useState<Message[]>([
    { kind: 'ai', meta: 'FORGE · v0.4', text: GREETING },
  ]);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [building, setBuilding] = useState(false);
  const [partialJson, setPartialJson] = useState('');
  const [hasReplied, setHasReplied] = useState(false);
  const streamRef = useRef<HTMLDivElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (streamRef.current) streamRef.current.scrollTop = streamRef.current.scrollHeight;
  }, [messages, buildState, partialJson]);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  function toApiMessages(history: Message[]): ChatMessage[] {
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

  // ---------- conversational chat (Phase 2B) ----------
  async function submit(text: string) {
    if (!text.trim() || busy || building) return;
    setDraft('');
    setBusy(true);

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

  // ---------- blueprint generation (Phase 2C) ----------
  async function beginBuild() {
    if (busy || building || buildState.status !== 'idle') return;
    setBuilding(true);
    setPartialJson('');
    setBlueprint(null);
    setBuildState({ active: 0, blueprint: null, status: 'building' });

    setMessages(m => [
      ...m,
      {
        kind: 'ai',
        meta: 'BUILDING · structured generation',
        text: 'Generating your blueprint now — palette, catalogue, hero copy, the lot. Watch the preview update live.',
        isBuild: true,
      },
    ]);

    const apiMessages = toApiMessages(messages);

    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const res = await fetch('/api/builder/generate-blueprint', {
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
          let event: BlueprintStreamEvent;
          try {
            event = JSON.parse(line) as BlueprintStreamEvent;
          } catch {
            continue;
          }
          if (event.type === 'stage') {
            setBuildState(prev => ({ ...prev, active: event.index }));
          } else if (event.type === 'partial') {
            setPartialJson(event.json);
          } else if (event.type === 'blueprint') {
            setBlueprint(event.blueprint);
            setBuildState({
              active: STAGES.length,
              blueprint: null,
              status: 'ready',
            });
          } else if (event.type === 'error') {
            throw new Error(event.error);
          }
        }
      }

      // Final acknowledgement message with approval card.
      setMessages(m => [
        ...m,
        {
          kind: 'ai',
          meta: 'COMPLETE',
          text: '',
          isApproval: gateApproval,
        },
      ]);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      const reason = err instanceof Error ? err.message : 'unknown error';
      setBuildState({ active: -1, blueprint: null, status: 'idle' });
      setMessages(m => [
        ...m,
        {
          kind: 'ai',
          text: `Generation failed (${reason}). Try again, or refine the brief and re-run.`,
        },
      ]);
    } finally {
      setBuilding(false);
    }
  }

  const showBuildCta =
    hasReplied && !busy && !building && buildState.status === 'idle';

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
          return (
            <div key={i} className="msg-ai">
              <div className="ai-avatar">F</div>
              <div className="ai-body">
                {m.meta && <div className="ai-meta">⊹ {m.meta}</div>}
                {m.text && (
                  <div style={{ whiteSpace: 'pre-wrap' }}>
                    {isGreeting && isLast ? (
                      <StreamingText text={m.text} speed={10} />
                    ) : (
                      <>
                        {m.text}
                        {m.streaming && <span style={{ marginLeft: 1 }}>▍</span>}
                      </>
                    )}
                  </div>
                )}

                {m.isBuild && (
                  <div className="tool-card" style={{ marginTop: 10 }}>
                    <div className="tool-head">
                      <span className="dot" /> blueprint.json
                      <span style={{ marginLeft: 'auto', color: 'var(--fg-4)' }}>
                        {buildState.status === 'ready' ? '✓ ready' : 'streaming'}
                      </span>
                    </div>
                    <BuildStages active={buildState.active} />
                    {(partialJson || blueprint) && (
                      <div
                        style={{ borderTop: '1px solid var(--border)', padding: '10px 12px' }}
                      >
                        <PartialJson json={partialJson} streaming={building} />
                      </div>
                    )}
                  </div>
                )}

                {m.isApproval && blueprint && (
                  <div
                    className="tool-card"
                    style={{ marginTop: 10, borderColor: 'var(--accent)' }}
                  >
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
                        Push <strong>{blueprint.brand_name}</strong> (
                        {blueprint.products.length} products) to{' '}
                        <code style={{ fontFamily: 'var(--font-mono)' }}>
                          {blueprint.domain}
                        </code>
                        ?
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

        {(busy || building) && (
          <div className="msg-ai">
            <div className="ai-avatar">F</div>
            <div className="ai-body">
              <div className="thinking">
                <span className="thinking-dots">
                  <span />
                  <span />
                  <span />
                </span>
                <span>{building ? 'Generating blueprint…' : 'Thinking…'}</span>
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
            (uses Opus 4.7 · ~10–15s · structured tool call)
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
            disabled={busy || building}
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
              disabled={!draft.trim() || busy || building}
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

// Light syntax highlighting + caret for the streaming JSON inside the build
// tool card. Renders the raw partial_json string straight from Anthropic's
// input_json_delta events — no client-side typewriter required.
function PartialJson({ json, streaming }: { json: string; streaming: boolean }) {
  const escaped = json
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  const html =
    escaped
      .replace(/(&quot;[^&]*?&quot;)(\s*:)/g, '<span class="json-key">$1</span>$2')
      .replace(
        /:\s*(&quot;[^&]*?&quot;)/g,
        ': <span class="json-string">$1</span>',
      )
      .replace(/:\s*(\d+\.?\d*)/g, ': <span class="json-num">$1</span>')
      .replace(/([{}[\],])/g, '<span class="json-punct">$1</span>') +
    (streaming ? '<span style="opacity:1">▍</span>' : '');
  // Re-encode &quot; back to plain quotes for display readability.
  const display = html.replace(/&quot;/g, '"');
  return <pre className="json-stream" dangerouslySetInnerHTML={{ __html: display }} />;
}
