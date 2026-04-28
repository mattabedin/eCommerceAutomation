'use client';

import { useEffect, useRef, useState } from 'react';
import { StreamingText } from './streaming-text';
import { JsonStream } from './json-stream';
import { BuildStages } from './build-stages';
import {
  BRANDS,
  STAGES,
  scriptPromptFor,
  type Brand,
  type BrandKey,
  type BuildState,
} from '@/lib/builder/mock-data';

type Message =
  | { kind: 'user'; text: string }
  | {
      kind: 'ai';
      meta?: string;
      text: string;
      followups?: { q: string; a: string[] }[];
      isBuild?: boolean;
      isApproval?: boolean;
    };

const FOLLOWUPS = [
  { q: 'Sourcing model?', a: ['Hand-picked suppliers', 'Dropshipping', 'Hybrid'] },
  { q: 'Inventory size?', a: ['8 hero products', '20+ catalog', 'Full assortment'] },
  { q: 'Tone preference?', a: ['Premium · warm', 'Clean · minimal', 'Playful'] },
];

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
    {
      kind: 'ai',
      meta: 'FORGE · v0.4',
      text: `Hi. I'll build a complete store from a single prompt — brand, pages, products, pricing, policies. Describe your business, or tap a starter below.`,
    },
  ]);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const streamRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (streamRef.current) streamRef.current.scrollTop = streamRef.current.scrollHeight;
  }, [messages, buildState]);

  function submit(text: string) {
    if (!text.trim() || busy) return;
    setMessages(m => [...m, { kind: 'user', text }]);
    setDraft('');
    setBusy(true);
    setBuildState({ active: -1, blueprint: null, status: 'thinking' });

    setTimeout(() => {
      setMessages(m => [
        ...m,
        {
          kind: 'ai',
          meta: 'PLANNING · niche analysis',
          text: `Got it — ${brand.niche}, premium positioning, audience ${brand.audience}. Let me clarify three things, then I'll build.`,
          followups: FOLLOWUPS,
        },
      ]);
      setBusy(false);
      setTimeout(() => beginBuild(), 900);
    }, 800);
  }

  function beginBuild() {
    setMessages(m => [
      ...m,
      {
        kind: 'ai',
        meta: 'BUILDING · 7 stages',
        text: 'Picking sensible defaults. Building now — watch the preview update live.',
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
          return (
            <div key={i} className="msg-ai">
              <div className="ai-avatar">F</div>
              <div className="ai-body">
                {m.meta && <div className="ai-meta">⊹ {m.meta}</div>}
                <div>{isLast ? <StreamingText text={m.text} speed={10} /> : m.text}</div>

                {m.followups && (
                  <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {m.followups.map((f, fi) => (
                      <div key={fi} className="tool-card">
                        <div className="tool-head">
                          <span style={{ color: 'var(--fg)' }}>?</span> {f.q}
                        </div>
                        <div
                          className="tool-body"
                          style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}
                        >
                          {f.a.map((opt, oi) => (
                            <button
                              key={oi}
                              type="button"
                              className="btn btn-sm"
                              style={{
                                borderColor: oi === 0 ? 'var(--accent)' : 'var(--border)',
                                color: oi === 0 ? 'var(--accent)' : 'var(--fg)',
                              }}
                            >
                              {oi === 0 && '✓ '}
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

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
                <span>Analyzing prompt · checking 18 reference brands</span>
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
