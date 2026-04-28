/* Forge — AI Builder (chat-first) */

const { useState, useEffect, useRef } = React;

function StreamingText({ text, speed = 14, onDone }) {
  const [shown, setShown] = useState('');
  useEffect(() => {
    setShown('');
    let i = 0;
    const itv = setInterval(() => {
      i++;
      setShown(text.slice(0, i));
      if (i >= text.length) { clearInterval(itv); onDone && onDone(); }
    }, speed);
    return () => clearInterval(itv);
  }, [text, speed]);
  return <>{shown}<span style={{ opacity: shown.length < text.length ? 1 : 0, marginLeft: 1 }}>▍</span></>;
}

function JsonStream({ obj, speed = 12 }) {
  const full = JSON.stringify(obj, null, 2);
  const [shown, setShown] = useState('');
  useEffect(() => {
    let i = 0;
    const itv = setInterval(() => { i += 2; setShown(full.slice(0, i)); if (i >= full.length) clearInterval(itv); }, speed);
    return () => clearInterval(itv);
  }, [full, speed]);
  // colorize
  const html = shown
    .replace(/("[^"]+")(\s*:)/g, '<span class="json-key">$1</span>$2')
    .replace(/:\s*("[^"]*")/g, ': <span class="json-string">$1</span>')
    .replace(/:\s*(\d+\.?\d*)/g, ': <span class="json-num">$1</span>')
    .replace(/([{}[\],])/g, '<span class="json-punct">$1</span>');
  return <pre className="json-stream" dangerouslySetInnerHTML={{ __html: html + (shown.length < full.length ? '<span style="opacity:1">▍</span>' : '') }}/>;
}

function BuildStages({ active }) {
  return (
    <div className="build-stages">
      {FORGE.STAGES.map((s, i) => {
        const state = i < active ? 'done' : i === active ? 'active' : 'queued';
        return (
          <div key={s.id} className="build-stage" data-state={state}>
            <span className={`stage-icon ${state}`}>
              {state === 'done' && <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 6.5l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            </span>
            <span>{s.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function BuilderChat({ brand, brandKey, setBrandKey, buildState, setBuildState, onApprove, gateApproval }) {
  const [messages, setMessages] = useState([
    { kind: 'ai', meta: 'FORGE · v0.4', text: `Hi Maya. I'll build a complete store from a single prompt — brand, pages, products, pricing, policies. Describe your business, or tap a starter below.` },
  ]);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const streamRef = useRef(null);

  useEffect(() => {
    if (streamRef.current) streamRef.current.scrollTop = streamRef.current.scrollHeight;
  }, [messages, buildState]);

  const submit = (text) => {
    if (!text.trim() || busy) return;
    setMessages(m => [...m, { kind: 'user', text }]);
    setDraft('');
    setBusy(true);
    setBuildState({ active: -1, blueprint: null, status: 'thinking' });

    setTimeout(() => {
      setMessages(m => [...m, {
        kind: 'ai',
        meta: 'PLANNING · niche analysis',
        text: `Got it — ${brand.niche}, premium positioning, audience ${brand.audience}. Let me clarify three things, then I'll build.`,
        followups: [
          { q: 'Sourcing model?',   a: ['Hand-picked suppliers', 'Dropshipping', 'Hybrid'] },
          { q: 'Inventory size?',   a: ['8 hero products', '20+ catalog', 'Full assortment'] },
          { q: 'Tone preference?',  a: ['Premium · warm', 'Clean · minimal', 'Playful'] },
        ],
      }]);
      setBusy(false);
      setTimeout(() => beginBuild(text), 900);
    }, 800);
  };

  const beginBuild = (prompt) => {
    setMessages(m => [...m, {
      kind: 'ai',
      meta: 'BUILDING · 7 stages',
      text: `Picking sensible defaults. Building now — watch the preview update live.`,
      isBuild: true,
    }]);

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

    const tick = () => {
      stage++;
      if (stage >= FORGE.STAGES.length) {
        setBuildState({ active: FORGE.STAGES.length, blueprint, status: 'ready' });
        setMessages(m => [...m, {
          kind: 'ai',
          meta: 'COMPLETE · 4.2s',
          text: `Done. ${brand.name} is live in preview — 8 products, full pages, AI-priced. Review on the right; ${gateApproval ? 'approve to publish to ' : 'opening '}${brand.domain}.`,
          isApproval: gateApproval,
        }]);
        return;
      }
      setBuildState(s => ({ ...s, active: stage, blueprint: stage >= 1 ? blueprint : null }));
      setTimeout(tick, 700);
    };
    setTimeout(tick, 700);
  };

  return (
    <div className="builder-pane">
      <div className="chat-stream" ref={streamRef}>
        {messages.map((m, i) => {
          if (m.kind === 'user') return <div key={i} className="msg-user">{m.text}</div>;
          return (
            <div key={i} className="msg-ai">
              <div className="ai-avatar">F</div>
              <div className="ai-body">
                {m.meta && <div className="ai-meta">⊹ {m.meta}</div>}
                <div>{i === messages.length - 1 ? <StreamingText text={m.text} speed={10}/> : m.text}</div>

                {m.followups && (
                  <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {m.followups.map((f, fi) => (
                      <div key={fi} className="tool-card">
                        <div className="tool-head"><span style={{ color: 'var(--fg)' }}>?</span> {f.q}</div>
                        <div className="tool-body" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {f.a.map((opt, oi) => (
                            <button key={oi} className="btn btn-sm" style={{ borderColor: oi === 0 ? 'var(--accent)' : 'var(--border)', color: oi === 0 ? 'var(--accent)' : 'var(--fg)' }}>
                              {oi === 0 && '✓ '}{opt}
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
                      <span className="dot"/> store_blueprint.json
                      <span style={{ marginLeft: 'auto', color: 'var(--fg-4)' }}>{buildState.status === 'ready' ? '✓ ready' : 'streaming'}</span>
                    </div>
                    <BuildStages active={buildState.active}/>
                    {buildState.blueprint && (
                      <div style={{ borderTop: '1px solid var(--border)', padding: '10px 12px' }}>
                        <JsonStream obj={buildState.blueprint}/>
                      </div>
                    )}
                  </div>
                )}

                {m.isApproval && (
                  <div className="tool-card" style={{ marginTop: 10, borderColor: 'var(--accent)' }}>
                    <div className="tool-head" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
                      <span style={{ fontWeight: 600 }}>APPROVAL REQUIRED</span>
                      <span style={{ marginLeft: 'auto' }}>publish + DNS</span>
                    </div>
                    <div className="tool-body" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ flex: 1, fontSize: 12 }}>Push <strong>{brand.name}</strong> to <code style={{ fontFamily: 'var(--font-mono)' }}>{brand.domain}</code>?</span>
                      <button className="btn btn-sm">Edit</button>
                      <button className="btn btn-sm btn-accent" onClick={onApprove}>Approve & publish</button>
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
                <span className="thinking-dots"><span/><span/><span/></span>
                <span>Analyzing prompt · checking 18 reference brands</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {messages.length <= 1 && (
        <div className="prompts">
          <button className="prompt-chip" onClick={() => { setBrandKey('pawluxe'); submit(FORGE.SCRIPT_PROMPT('pawluxe')); }}>
            Luxury pet accessories →
          </button>
          <button className="prompt-chip" onClick={() => { setBrandKey('desknova'); submit(FORGE.SCRIPT_PROMPT('desknova')); }}>
            Modern home office →
          </button>
          <button className="prompt-chip">Surprise me</button>
        </div>
      )}

      <div className="composer">
        <div className="composer-input-wrap">
          <textarea
            placeholder="Describe your business — niche, audience, vibe, price range…"
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(draft); } }}
            rows={1}
          />
          <div className="composer-row">
            <button className="btn btn-sm btn-ghost"><span>＋</span> Attach</button>
            <button className="btn btn-sm btn-ghost"><span>🌐</span> Niche</button>
            <button className="send" disabled={!draft.trim() || busy} onClick={() => submit(draft)}>↑</button>
          </div>
        </div>
        <div style={{ fontSize: 10.5, color: 'var(--fg-4)', marginTop: 8, fontFamily: 'var(--font-mono)' }}>
          Forge will not publish without your approval.
        </div>
      </div>
    </div>
  );
}

window.FORGE_BUILDER = { BuilderChat, StreamingText, JsonStream, BuildStages };
