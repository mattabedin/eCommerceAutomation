/* Forge — Publishing & Hosting module
   Three tabs: Publishing · Domains · Storage
   Plus Super-Admin oversight view */

const { useState, useEffect, useRef } = React;

/* ============================================================ shared icons */
const PIcon = ({ name, size = 14 }) => {
  const s = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' };
  const map = {
    globe:    <><circle cx="8" cy="8" r="6.5" {...s}/><path d="M1.5 8h13M8 1.5c2 2 2 11 0 13M8 1.5c-2 2-2 11 0 13" {...s}/></>,
    link:     <><path d="M6.5 9.5l3-3M6 5l1-1a2.8 2.8 0 014 4l-1 1M10 11l-1 1a2.8 2.8 0 01-4-4l1-1" {...s}/></>,
    eye:      <><path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" {...s}/><circle cx="8" cy="8" r="2" {...s}/></>,
    upload:   <><path d="M8 11V2M5 5l3-3 3 3M2 11v2a1 1 0 001 1h10a1 1 0 001-1v-2" {...s}/></>,
    image:    <><rect x="2" y="2" width="12" height="12" rx="1.5" {...s}/><circle cx="6" cy="6" r="1.2" {...s}/><path d="M2.5 11l3-3 3 3 2-2 3 3" {...s}/></>,
    folder:   <><path d="M2 4a1 1 0 011-1h3l1.5 1.5h6a1 1 0 011 1v6a1 1 0 01-1 1H3a1 1 0 01-1-1V4z" {...s}/></>,
    check:    <path d="M3 8.5l3 3 7-7" {...s}/>,
    copy:     <><rect x="5" y="5" width="9" height="9" rx="1.5" {...s}/><path d="M11 5V3a1 1 0 00-1-1H3a1 1 0 00-1 1v7a1 1 0 001 1h2" {...s}/></>,
    rocket:   <><path d="M8 1l2 2-1 5-1 1-1-1-1-5 2-2zM5.5 8.5L3 11l1 1 2.5-2.5M10.5 8.5L13 11l-1 1-2.5-2.5M6 12l-1 2 2-1M10 12l1 2-2-1" {...s}/></>,
    shield:   <><path d="M8 1.5L2 3v5c0 3 2.5 5.5 6 6.5 3.5-1 6-3.5 6-6.5V3L8 1.5z" {...s}/></>,
    refresh:  <><path d="M2 8a6 6 0 0110-4.5L13 5M14 8a6 6 0 01-10 4.5L3 11M13 2v3h-3M3 14v-3h3" {...s}/></>,
    trash:    <><path d="M3 4h10M6 4V2.5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5V4M5 4l.5 9a1 1 0 001 1h3a1 1 0 001-1L11 4" {...s}/></>,
    plus:     <path d="M8 3v10M3 8h10" {...s}/>,
    chevron:  <path d="M6 4l4 4-4 4" {...s}/>,
    lock:     <><rect x="3" y="7" width="10" height="7" rx="1" {...s}/><path d="M5 7V5a3 3 0 016 0v2" {...s}/></>,
  };
  return <svg width={size} height={size} viewBox="0 0 16 16" style={{ flexShrink: 0 }}>{map[name]}</svg>;
};

/* ============================================================ mock state — could come from props in real app */
const PUB_DATA = {
  pawluxe: {
    slug: 'pawluxe',
    platformDomain: 'pawluxe.forge.shop',
    customDomain: 'shop.pawluxe.com',
    customStatus: 'verifying', // 'none' | 'pending-dns' | 'verifying' | 'connected' | 'failed'
    publishedAt: '2 days ago',
    storageUsed: 1.84,    // GB
    storageLimit: 10,     // GB
    plan: 'Pro',
    assetsCount: { logo: 2, banner: 4, product: 38, generated: 17, download: 0 },
  },
  desknova: {
    slug: 'desknova',
    platformDomain: 'desknova.forge.shop',
    customDomain: null,
    customStatus: 'none',
    publishedAt: null, // draft
    storageUsed: 0.42,
    storageLimit: 10,
    plan: 'Pro',
    assetsCount: { logo: 1, banner: 2, product: 22, generated: 9, download: 0 },
  },
};

/* ============================================================ MAIN VIEW */
function Publishing({ brand, brandKey }) {
  const [tab, setTab] = useState('publishing');
  const data = PUB_DATA[brandKey];
  const [published, setPublished] = useState(!!data.publishedAt);

  return (
    <div className="view-pad">
      <div className="page-head">
        <div>
          <h1>Publishing &amp; Hosting</h1>
          <div className="desc">
            {published
              ? <>Live at <a href="#" style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>{data.platformDomain}</a> · {data.plan} plan</>
              : <>Draft · not visible to the public · {data.plan} plan</>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-sm">
            <PIcon name="eye"/> Preview store
          </button>
          {published
            ? <button className="btn btn-sm" onClick={() => setPublished(false)}>Unpublish</button>
            : <button className="btn btn-sm btn-primary" onClick={() => setPublished(true)}>
                <PIcon name="rocket"/> Publish store
              </button>}
        </div>
      </div>

      <div className="tabs">
        <button className="tab" data-active={tab === 'publishing'} onClick={() => setTab('publishing')}>Publishing</button>
        <button className="tab" data-active={tab === 'domain'}     onClick={() => setTab('domain')}>Domain {data.customStatus === 'verifying' && <span style={{ marginLeft: 4, color: 'var(--amber)' }}>·</span>}</button>
        <button className="tab" data-active={tab === 'storage'}    onClick={() => setTab('storage')}>Storage</button>
        <button className="tab" data-active={tab === 'admin'}      onClick={() => setTab('admin')}>
          <PIcon name="shield" size={11}/> &nbsp;Super admin
        </button>
      </div>

      {tab === 'publishing' && <PublishingTab brand={brand} brandKey={brandKey} data={data} published={published} setPublished={setPublished}/>}
      {tab === 'domain'     && <DomainTab     brand={brand} brandKey={brandKey} data={data}/>}
      {tab === 'storage'    && <StorageTab    brand={brand} brandKey={brandKey} data={data}/>}
      {tab === 'admin'      && <AdminTab/>}
    </div>
  );
}

/* ============================================================ TAB 1 · PUBLISHING */
function PublishingTab({ brand, brandKey, data, published, setPublished }) {
  const [slug, setSlug] = useState(data.slug);
  const [slugStatus, setSlugStatus] = useState('available'); // 'checking' | 'available' | 'taken'
  const [showDeploy, setShowDeploy] = useState(false);

  // simulate slug availability check
  useEffect(() => {
    if (slug === data.slug) { setSlugStatus('available'); return; }
    setSlugStatus('checking');
    const reserved = ['admin', 'shopify', 'forge', 'app', 'api', 'www', 'mail'];
    const t = setTimeout(() => {
      setSlugStatus(reserved.includes(slug) || slug.length < 3 ? 'taken' : 'available');
    }, 500);
    return () => clearTimeout(t);
  }, [slug, data.slug]);

  const onPublish = () => {
    setShowDeploy(true);
    setTimeout(() => { setShowDeploy(false); setPublished(true); }, 3200);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 14 }}>
      {/* LEFT: store URL hero */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

        <div className="panel" style={{ overflow: 'visible' }}>
          <div className="panel-head">
            <div>
              <div className="panel-title">Store URL</div>
              <div className="panel-sub">Your free Forge subdomain — always available, secured with SSL</div>
            </div>
            <span className={`status-pill`} data-tone={published ? 'green' : 'gray'}>
              {published ? '● live' : '○ draft'}
            </span>
          </div>
          <div style={{ padding: 24 }}>
            {/* browser-bar style URL display */}
            <div style={{
              display: 'flex', alignItems: 'stretch',
              border: '1px solid var(--border)', borderRadius: 10,
              background: 'var(--surface-2)',
              fontFamily: 'var(--font-mono)', fontSize: 14,
              overflow: 'hidden', marginBottom: 14,
            }}>
              <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8, color: 'var(--fg-3)', borderRight: '1px solid var(--border)' }}>
                <PIcon name="lock" size={12}/> https://
              </div>
              <input
                value={slug}
                onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                style={{
                  border: 'none', outline: 'none',
                  background: 'var(--surface)', padding: '10px 8px',
                  fontFamily: 'inherit', fontSize: 14, fontWeight: 600,
                  color: 'var(--fg)', minWidth: 0, flex: '0 1 auto', width: 140,
                  textAlign: 'right',
                }}
              />
              <div style={{ padding: '10px 14px', color: 'var(--fg-2)', flex: 1, display: 'flex', alignItems: 'center' }}>
                .forge.shop
              </div>
              <button className="btn btn-sm btn-ghost" style={{ borderRadius: 0, borderLeft: '1px solid var(--border)' }} onClick={() => navigator.clipboard?.writeText(`${slug}.forge.shop`)}>
                <PIcon name="copy"/> Copy
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
              {slugStatus === 'checking' && <><span className="loader-dot"/><span style={{ color: 'var(--fg-3)' }}>Checking availability…</span></>}
              {slugStatus === 'available' && <><PIcon name="check"/><span style={{ color: 'var(--green)' }}>Available · this URL is yours</span></>}
              {slugStatus === 'taken' && <span style={{ color: 'var(--rose)' }}>✕ Taken or reserved · try another slug</span>}
              <span style={{ marginLeft: 'auto', color: 'var(--fg-4)', fontSize: 11 }}>3–32 characters · letters, numbers, hyphens</span>
            </div>
          </div>
        </div>

        {/* Publish action card */}
        <div className="panel" style={{ background: published ? 'var(--surface)' : 'linear-gradient(180deg, var(--accent-soft) 0%, var(--surface) 60%)' }}>
          <div style={{ padding: '20px 22px' }}>
            {!published ? (
              <>
                <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--accent)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <PIcon name="rocket" size={18}/>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Ready to go live?</div>
                    <div style={{ fontSize: 12.5, color: 'var(--fg-3)', lineHeight: 1.55, marginBottom: 14 }}>
                      Forge will publish your store in seconds. Your site stays on the platform — no servers, no DNS, no devops.
                      Hosting, SSL, and CDN are included in your plan.
                    </div>
                    <button className="btn btn-primary" onClick={onPublish} disabled={slugStatus !== 'available'}>
                      <PIcon name="rocket"/> Publish to {slug}.forge.shop
                    </button>
                    <button className="btn btn-ghost" style={{ marginLeft: 6 }}>
                      <PIcon name="eye"/> Preview first
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--green-soft)', color: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <PIcon name="check" size={18}/>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>Your store is live</div>
                  <div style={{ fontSize: 12, color: 'var(--fg-3)' }}>Published {data.publishedAt} · auto-redeploys when you save changes</div>
                </div>
                <button className="btn btn-sm">
                  <PIcon name="link"/> Open store
                </button>
                <button className="btn btn-sm btn-ghost" onClick={() => setPublished(false)}>Unpublish</button>
              </div>
            )}
          </div>
        </div>

        {/* Deploy progress overlay */}
        {showDeploy && <DeployToast slug={slug}/>}

        {/* What's included */}
        <div className="panel">
          <div className="panel-head">
            <div className="panel-title">Hosting included</div>
            <span className="panel-sub">No setup required</span>
          </div>
          <div style={{ padding: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {[
              { i: 'globe',  t: 'Global CDN',           s: '38 edge locations · sub-100ms worldwide' },
              { i: 'shield', t: 'Auto SSL',             s: 'HTTPS provisioned automatically' },
              { i: 'rocket', t: 'Instant deploys',      s: 'Live within seconds of saving' },
              { i: 'refresh',t: 'Zero-downtime',        s: 'Redeploys never interrupt visitors' },
            ].map(x => (
              <div key={x.t} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: 'var(--accent-soft)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <PIcon name={x.i}/>
                </div>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 500 }}>{x.t}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--fg-3)' }}>{x.s}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT: deployment timeline + plan card */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="panel">
          <div className="panel-head">
            <div className="panel-title">Recent deployments</div>
            <button className="btn btn-sm btn-ghost" style={{ fontSize: 11 }}>View all →</button>
          </div>
          <div>
            {[
              { v: 'v.124', m: 'Updated hero copy · added 2 products', t: '2m ago',  st: 'live',     tone: 'green' },
              { v: 'v.123', m: 'Imported "Heirloom" collection',        t: '4h ago',  st: 'rolled back', tone: 'gray' },
              { v: 'v.122', m: 'Forge agent: priced 8 products',        t: '1d ago',  st: 'live',     tone: 'gray' },
              { v: 'v.121', m: 'Initial publish',                       t: '2d ago',  st: 'live',     tone: 'gray' },
            ].map((d, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, padding: '11px 16px', borderBottom: i < 3 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ position: 'relative', width: 14, paddingTop: 5 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.tone === 'green' ? 'var(--green)' : 'var(--border-strong)', boxShadow: d.tone === 'green' ? '0 0 0 3px var(--green-soft)' : 'none' }}/>
                  {i < 3 && <div style={{ position: 'absolute', top: 16, left: 3.5, bottom: -11, width: 1, background: 'var(--border)' }}/>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)' }}>{d.v}</span>
                    <span style={{ fontSize: 10.5, color: 'var(--fg-4)', fontFamily: 'var(--font-mono)' }}>{d.t}</span>
                  </div>
                  <div style={{ fontSize: 12.5, marginTop: 2 }}>{d.m}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <PlanLimitsCard data={data}/>
      </div>
    </div>
  );
}

function DeployToast({ slug }) {
  const [step, setStep] = useState(0);
  const stages = [
    'Bundling store assets…',
    'Provisioning SSL certificate…',
    'Pushing to global CDN…',
    'Live at ' + slug + '.forge.shop',
  ];
  useEffect(() => {
    const t = setInterval(() => setStep(s => Math.min(s + 1, stages.length - 1)), 800);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="panel" style={{ background: 'var(--fg)', color: 'var(--bg)', borderColor: 'var(--fg)' }}>
      <div style={{ padding: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <span className="loader-dot" style={{ background: '#22C55E' }}/>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Deploying…</span>
          <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 11, opacity: 0.6 }}>build #124</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontFamily: 'var(--font-mono)', fontSize: 11 }}>
          {stages.map((s, i) => (
            <div key={i} style={{ opacity: i <= step ? 1 : 0.3, display: 'flex', gap: 8 }}>
              <span style={{ color: i < step ? '#22C55E' : i === step ? '#fbbf24' : 'rgba(255,255,255,0.3)' }}>
                {i < step ? '✓' : i === step ? '●' : '○'}
              </span>
              <span>{s}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PlanLimitsCard({ data }) {
  const limits = [
    { l: 'Stores',           v: 1,  max: 3,  unit: '' },
    { l: 'Products',         v: 8,  max: 500, unit: '' },
    { l: 'Storage',          v: data.storageUsed, max: data.storageLimit, unit: 'GB', dec: 2 },
    { l: 'Custom domains',   v: 1,  max: 3,  unit: '' },
  ];
  return (
    <div className="panel">
      <div className="panel-head">
        <div>
          <div className="panel-title">Plan: {data.plan}</div>
          <div className="panel-sub">$49/mo · renews May 4</div>
        </div>
        <button className="btn btn-sm btn-ghost" style={{ fontSize: 11 }}>Upgrade →</button>
      </div>
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {limits.map(l => {
          const pct = Math.min(100, (l.v / l.max) * 100);
          const tone = pct > 90 ? 'rose' : pct > 70 ? 'amber' : 'accent';
          return (
            <div key={l.l}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 5 }}>
                <span style={{ color: 'var(--fg-2)' }}>{l.l}</span>
                <span style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--fg-3)' }}>
                  <strong style={{ color: 'var(--fg)' }}>{l.dec ? l.v.toFixed(2) : l.v}</strong>
                  {l.unit && ' '}{l.unit} <span style={{ color: 'var(--fg-4)' }}>/ {l.max}{l.unit && ' ' + l.unit}</span>
                </span>
              </div>
              <div style={{ height: 5, borderRadius: 3, background: 'var(--surface-2)', overflow: 'hidden' }}>
                <div style={{ width: pct + '%', height: '100%', background: tone === 'rose' ? 'var(--rose)' : tone === 'amber' ? 'var(--amber)' : 'var(--accent)', transition: 'width 0.5s' }}/>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================ TAB 2 · DOMAIN */
function DomainTab({ brand, brandKey, data }) {
  const [status, setStatus] = useState(data.customStatus);
  const [domain, setDomain] = useState(data.customDomain || '');
  const [showAdd, setShowAdd] = useState(status === 'none');
  const [verifying, setVerifying] = useState(false);

  const onAdd = () => {
    if (!domain) return;
    setStatus('pending-dns');
    setShowAdd(false);
  };

  const onVerify = () => {
    setVerifying(true);
    setStatus('verifying');
    setTimeout(() => {
      setStatus('connected');
      setVerifying(false);
    }, 2400);
  };

  // empty state — no domain connected
  if (showAdd && status === 'none') {
    return (
      <div className="panel">
        <div style={{ padding: 48, textAlign: 'center', maxWidth: 460, margin: '0 auto' }}>
          <div style={{ width: 56, height: 56, margin: '0 auto 18px', borderRadius: 14, background: 'var(--accent-soft)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <PIcon name="globe" size={26}/>
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 6 }}>Connect your own domain</h2>
          <p style={{ fontSize: 13, color: 'var(--fg-3)', marginBottom: 22, lineHeight: 1.55 }}>
            Already own a domain like <span style={{ fontFamily: 'var(--font-mono)' }}>shop.yourbrand.com</span>?
            Point it at Forge — we handle SSL, HTTPS redirects, and worldwide CDN automatically.
          </p>
          <div style={{ display: 'flex', gap: 6, maxWidth: 360, margin: '0 auto', marginBottom: 10 }}>
            <input
              value={domain}
              onChange={e => setDomain(e.target.value.toLowerCase().trim())}
              placeholder="shop.yourbrand.com"
              style={{
                flex: 1, padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 8,
                fontSize: 13, fontFamily: 'var(--font-mono)', background: 'var(--surface)', color: 'var(--fg)',
                outline: 'none',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
            <button className="btn btn-primary" onClick={onAdd} disabled={!domain}>
              Add domain
            </button>
          </div>
          <div style={{ fontSize: 11, color: 'var(--fg-4)' }}>Don't own a domain yet? <a href="#" style={{ color: 'var(--accent)' }}>Buy one through Forge →</a></div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 14 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Domain header card */}
        <div className="panel">
          <div style={{ padding: 18, display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--surface-2)', color: 'var(--fg-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PIcon name="globe" size={20}/>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{domain || data.customDomain}</div>
              <DomainStatusBadge status={status} verifying={verifying}/>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {status === 'pending-dns' && (
                <button className="btn btn-primary" onClick={onVerify}>
                  <PIcon name="check"/> Verify connection
                </button>
              )}
              {status === 'verifying' && <button className="btn" disabled><span className="loader-dot"/>&nbsp;Verifying…</button>}
              {status === 'connected' && (
                <>
                  <button className="btn btn-sm">
                    <PIcon name="refresh"/> Re-check
                  </button>
                  <button className="btn btn-sm btn-ghost" onClick={() => { setStatus('none'); setShowAdd(true); setDomain(''); }}>
                    <PIcon name="trash"/>
                  </button>
                </>
              )}
              {status === 'failed' && <button className="btn btn-primary" onClick={onVerify}><PIcon name="refresh"/> Retry</button>}
            </div>
          </div>
        </div>

        {/* DNS records */}
        {(status === 'pending-dns' || status === 'verifying' || status === 'failed') && (
          <DNSRecordsPanel domain={domain || data.customDomain} status={status}/>
        )}

        {status === 'connected' && (
          <ConnectedPanel domain={domain || data.customDomain}/>
        )}
      </div>

      {/* RIGHT */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="panel">
          <div className="panel-head">
            <div>
              <div className="panel-title">Connection progress</div>
              <div className="panel-sub">Typically takes 5–60 minutes</div>
            </div>
          </div>
          <div style={{ padding: '16px 20px' }}>
            <ConnectionStepper status={status}/>
          </div>
        </div>

        <div className="panel">
          <div className="panel-head"><div className="panel-title">Need help?</div></div>
          <div style={{ padding: 16, fontSize: 12.5, color: 'var(--fg-2)', lineHeight: 1.6 }}>
            <p style={{ marginBottom: 10 }}>DNS changes can take up to 24 hours to propagate worldwide. If your domain isn't verifying, double-check your records exactly match.</p>
            <a href="#" style={{ color: 'var(--accent)', fontSize: 12 }}>Step-by-step guide for GoDaddy →</a><br/>
            <a href="#" style={{ color: 'var(--accent)', fontSize: 12 }}>Step-by-step guide for Namecheap →</a><br/>
            <a href="#" style={{ color: 'var(--accent)', fontSize: 12 }}>Step-by-step guide for Cloudflare →</a>
          </div>
        </div>
      </div>
    </div>
  );
}

function DomainStatusBadge({ status, verifying }) {
  if (verifying || status === 'verifying') return <span className="status-pill" data-tone="amber"><span className="loader-dot" style={{ width: 6, height: 6 }}/>&nbsp;Verifying DNS…</span>;
  if (status === 'pending-dns') return <span className="status-pill" data-tone="amber">○ Waiting for DNS</span>;
  if (status === 'connected')   return <span className="status-pill" data-tone="green">● Connected · SSL active</span>;
  if (status === 'failed')      return <span className="status-pill" data-tone="rose">✕ Verification failed</span>;
  return <span className="status-pill" data-tone="gray">Not connected</span>;
}

function DNSRecordsPanel({ domain, status }) {
  const isApex = !domain.includes('.', domain.indexOf('.') + 1) || domain.split('.').length === 2;
  const records = [
    { type: 'A',     host: '@',              value: '76.76.21.21',          note: 'apex / root domain' },
    { type: 'CNAME', host: domain.split('.')[0] || 'www', value: 'cname.forge.shop',   note: 'subdomain target' },
    { type: 'TXT',   host: '_aistoreverify', value: 'forge=k7r4n9mq2p8wx5cb', note: 'verification token' },
  ];
  return (
    <div className="panel">
      <div className="panel-head">
        <div>
          <div className="panel-title">DNS records to add</div>
          <div className="panel-sub">Add these at your domain provider · we'll detect them automatically</div>
        </div>
        <button className="btn btn-sm btn-ghost"><PIcon name="copy"/> Copy all</button>
      </div>
      <div style={{ padding: 0 }}>
        <table className="table" style={{ fontSize: 12 }}>
          <thead><tr>
            <th style={{ width: 80 }}>Type</th>
            <th style={{ width: 160 }}>Host / Name</th>
            <th>Value / Target</th>
            <th style={{ width: 40 }}></th>
          </tr></thead>
          <tbody>
            {records.map((r, i) => (
              <tr key={i}>
                <td><span className="status-pill" data-tone="indigo" style={{ fontFamily: 'var(--font-mono)' }}>{r.type}</span></td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5 }}>{r.host}</td>
                <td>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5 }}>{r.value}</div>
                  <div style={{ fontSize: 10.5, color: 'var(--fg-4)', marginTop: 2 }}>{r.note}</div>
                </td>
                <td>
                  <button className="btn btn-sm btn-ghost" onClick={() => navigator.clipboard?.writeText(r.value)} title="Copy value">
                    <PIcon name="copy"/>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ padding: '12px 16px', background: 'var(--surface-2)', borderTop: '1px solid var(--border)', fontSize: 11.5, color: 'var(--fg-3)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <PIcon name="refresh"/> We auto-check every 5 minutes. Last check: 2 min ago · no records detected yet.
      </div>
    </div>
  );
}

function ConnectedPanel({ domain }) {
  return (
    <div className="panel">
      <div style={{ padding: 22, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--green-soft)', color: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <PIcon name="check" size={22}/>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Domain connected</div>
          <div style={{ fontSize: 12.5, color: 'var(--fg-3)', marginBottom: 14, lineHeight: 1.55 }}>
            Visitors at <strong style={{ color: 'var(--fg)', fontFamily: 'var(--font-mono)' }}>{domain}</strong> now reach your store.
            HTTPS is enforced via auto-renewing SSL.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, fontSize: 11 }}>
            {[
              { l: 'SSL certificate', v: 'Active', t: 'green' },
              { l: 'HTTPS redirect',  v: 'Enforced', t: 'green' },
              { l: 'CDN routing',     v: '38 edges', t: 'green' },
            ].map(x => (
              <div key={x.l} style={{ background: 'var(--surface-2)', borderRadius: 8, padding: '10px 12px' }}>
                <div style={{ color: 'var(--fg-3)', fontSize: 10.5, marginBottom: 3 }}>{x.l}</div>
                <div style={{ fontWeight: 500 }}><span style={{ color: 'var(--green)' }}>●</span> {x.v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ConnectionStepper({ status }) {
  const steps = [
    { l: 'Domain added',     done: status !== 'none' },
    { l: 'DNS records added', done: status === 'verifying' || status === 'connected', active: status === 'pending-dns' },
    { l: 'Records verified',  done: status === 'connected', active: status === 'verifying' },
    { l: 'SSL provisioned',   done: status === 'connected' },
    { l: 'Routing live',      done: status === 'connected' },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {steps.map((s, i) => (
        <div key={i} style={{ display: 'flex', gap: 10, paddingBottom: i < steps.length - 1 ? 14 : 0 }}>
          <div style={{ position: 'relative', width: 18, paddingTop: 2 }}>
            <div style={{
              width: 16, height: 16, borderRadius: '50%',
              background: s.done ? 'var(--green)' : s.active ? 'var(--amber)' : 'var(--surface-2)',
              border: !s.done && !s.active ? '1.5px solid var(--border-strong)' : 'none',
              color: 'white', fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {s.done && <PIcon name="check" size={10}/>}
              {s.active && <span className="loader-dot" style={{ width: 6, height: 6, background: 'white' }}/>}
            </div>
            {i < steps.length - 1 && <div style={{ position: 'absolute', top: 20, left: 7.5, width: 1, bottom: -14, background: s.done ? 'var(--green)' : 'var(--border)' }}/>}
          </div>
          <div style={{ flex: 1, fontSize: 12.5, color: s.done ? 'var(--fg)' : s.active ? 'var(--fg)' : 'var(--fg-3)', fontWeight: s.active ? 500 : 400 }}>
            {s.l}
            {s.active && <div style={{ fontSize: 10.5, color: 'var(--amber)', marginTop: 2, fontWeight: 400 }}>In progress…</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ============================================================ TAB 3 · STORAGE */
function StorageTab({ brand, brandKey, data }) {
  const [filter, setFilter] = useState('all');

  const cats = [
    { id: 'logo',     label: 'Logos',          icon: 'image',   count: data.assetsCount.logo,     color: '#6366F1' },
    { id: 'banner',   label: 'Banners',        icon: 'image',   count: data.assetsCount.banner,   color: '#22C55E' },
    { id: 'product',  label: 'Product images', icon: 'image',   count: data.assetsCount.product,  color: '#F59E0B' },
    { id: 'generated',label: 'AI-generated',   icon: 'image',   count: data.assetsCount.generated,color: '#EC4899' },
    { id: 'download', label: 'Digital files',  icon: 'folder',  count: data.assetsCount.download, color: '#737373' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 14 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Asset categories — pill row */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button className="btn btn-sm" data-active={filter === 'all'}
            style={{ background: filter === 'all' ? 'var(--fg)' : 'var(--surface)', color: filter === 'all' ? 'var(--bg)' : 'var(--fg)', borderColor: filter === 'all' ? 'var(--fg)' : 'var(--border)' }}
            onClick={() => setFilter('all')}>
            All <span style={{ marginLeft: 4, opacity: 0.6 }}>· {Object.values(data.assetsCount).reduce((a,b)=>a+b,0)}</span>
          </button>
          {cats.map(c => (
            <button key={c.id} className="btn btn-sm" onClick={() => setFilter(c.id)}
              style={{ background: filter === c.id ? 'var(--fg)' : 'var(--surface)', color: filter === c.id ? 'var(--bg)' : 'var(--fg)', borderColor: filter === c.id ? 'var(--fg)' : 'var(--border)' }}>
              {c.label} <span style={{ marginLeft: 4, opacity: 0.6 }}>· {c.count}</span>
            </button>
          ))}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
            <button className="btn btn-sm btn-accent">⊹ Generate with AI</button>
            <button className="btn btn-sm btn-primary"><PIcon name="upload"/> Upload</button>
          </div>
        </div>

        {/* Upload dropzone */}
        <div style={{
          border: '2px dashed var(--border-strong)', borderRadius: 12,
          padding: 28, textAlign: 'center', background: 'var(--surface-2)',
        }}>
          <div style={{ width: 40, height: 40, margin: '0 auto 10px', borderRadius: 10, background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fg-3)' }}>
            <PIcon name="upload" size={18}/>
          </div>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>Drop files here, or <a href="#" style={{ color: 'var(--accent)' }}>browse</a></div>
          <div style={{ fontSize: 11.5, color: 'var(--fg-3)' }}>PNG, JPG, WebP, SVG, MP4 · up to 50 MB each · stored under <span style={{ fontFamily: 'var(--font-mono)' }}>/stores/{data.slug}/</span></div>
        </div>

        {/* Asset gallery */}
        <div className="panel">
          <div className="panel-head">
            <div className="panel-title">{filter === 'all' ? 'All assets' : cats.find(c => c.id === filter)?.label}</div>
            <div style={{ display: 'flex', gap: 8, fontSize: 11.5, color: 'var(--fg-3)' }}>
              <span>Sort: Newest ▾</span>
              <span>·</span>
              <span>Grid ▾</span>
            </div>
          </div>
          <AssetGrid brand={brand} brandKey={brandKey} filter={filter}/>
        </div>
      </div>

      {/* RIGHT sidebar: storage usage donut + breakdown */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <StorageDonut data={data} cats={cats}/>

        <div className="panel">
          <div className="panel-head"><div className="panel-title">By category</div></div>
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {cats.map(c => {
              const sizeMap = { logo: 0.04, banner: 0.18, product: 1.32, generated: 0.30, download: 0 };
              const size = sizeMap[c.id];
              return (
                <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: c.color }}/>
                  <span style={{ flex: 1 }}>{c.label}</span>
                  <span style={{ color: 'var(--fg-3)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
                    {c.count} files · {size === 0 ? '0 MB' : size < 1 ? `${(size * 1000).toFixed(0)} MB` : `${size.toFixed(2)} GB`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="panel" style={{ background: 'linear-gradient(180deg, var(--accent-soft), var(--surface) 80%)' }}>
          <div style={{ padding: 16 }}>
            <div style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600, letterSpacing: 0.04, marginBottom: 6 }}>BUSINESS PLAN</div>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Need more storage?</div>
            <div style={{ fontSize: 11.5, color: 'var(--fg-2)', marginBottom: 12, lineHeight: 1.55 }}>
              Get 100 GB, unlimited products, and priority hosting.
            </div>
            <button className="btn btn-sm btn-primary" style={{ width: '100%' }}>Upgrade to Business</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StorageDonut({ data, cats }) {
  const pct = (data.storageUsed / data.storageLimit) * 100;
  const r = 56, c = 2 * Math.PI * r;
  const tone = pct > 90 ? 'rose' : pct > 70 ? 'amber' : 'accent';
  return (
    <div className="panel">
      <div style={{ padding: 22, textAlign: 'center' }}>
        <div style={{ position: 'relative', width: 140, height: 140, margin: '0 auto 10px' }}>
          <svg width={140} height={140} style={{ transform: 'rotate(-90deg)' }}>
            <circle cx={70} cy={70} r={r} stroke="var(--surface-2)" strokeWidth={10} fill="none"/>
            <circle cx={70} cy={70} r={r}
              stroke={tone === 'rose' ? 'var(--rose)' : tone === 'amber' ? 'var(--amber)' : 'var(--accent)'}
              strokeWidth={10} fill="none" strokeLinecap="round"
              strokeDasharray={c} strokeDashoffset={c - (c * pct / 100)}
              style={{ transition: 'stroke-dashoffset 0.6s' }}/>
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 600, fontVariantNumeric: 'tabular-nums', letterSpacing: -0.02 }}>{data.storageUsed.toFixed(2)}</div>
            <div style={{ fontSize: 10.5, color: 'var(--fg-3)', fontFamily: 'var(--font-mono)' }}>of {data.storageLimit} GB</div>
          </div>
        </div>
        <div style={{ fontSize: 12, color: 'var(--fg-2)', fontWeight: 500 }}>{pct.toFixed(0)}% used</div>
        <div style={{ fontSize: 11, color: 'var(--fg-4)', marginTop: 2 }}>{(data.storageLimit - data.storageUsed).toFixed(2)} GB available</div>
      </div>
    </div>
  );
}

function AssetGrid({ brand, brandKey, filter }) {
  // generate mock asset tiles based on brand colors
  const products = FORGE.PRODUCTS[brandKey];
  const tiles = [];

  if (filter === 'all' || filter === 'logo') {
    tiles.push({ kind: 'logo', name: 'logo-mark.svg', size: '4 KB', tone: brand.colors.primary, label: brand.name[0], ai: false });
    tiles.push({ kind: 'logo', name: 'logo-wordmark.svg', size: '12 KB', tone: brand.colors.primary, label: brand.name.split(' ')[0].toLowerCase(), ai: false });
  }
  if (filter === 'all' || filter === 'banner') {
    [
      { name: 'hero-spring.jpg', size: '184 KB', tone: brand.colors.secondary },
      { name: 'collection-banner.jpg', size: '218 KB', tone: brand.colors.primary },
      { name: 'about-us-bg.jpg', size: '142 KB', tone: '#94A3B8' },
      { name: 'newsletter-art.png', size: '88 KB', tone: brand.colors.secondary },
    ].forEach(b => tiles.push({ kind: 'banner', ...b, ai: false }));
  }
  if (filter === 'all' || filter === 'product') {
    products.forEach(p => {
      tiles.push({ kind: 'product', name: p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-01.jpg', size: '94 KB', tone: p.tone, ai: false });
    });
  }
  if (filter === 'all' || filter === 'generated') {
    [
      'lifestyle-shot-01.png', 'lifestyle-shot-02.png', 'closeup-leather.png',
      'studio-flat-lay.png', 'mood-board-01.png',
    ].forEach((name, i) => {
      tiles.push({ kind: 'generated', name, size: '312 KB', tone: ['#EC4899', '#F59E0B', '#6366F1', '#22C55E', '#A855F7'][i], ai: true });
    });
  }

  if (tiles.length === 0) return (
    <div style={{ padding: 60, textAlign: 'center', color: 'var(--fg-3)', fontSize: 13 }}>
      No files in this category yet.
    </div>
  );

  return (
    <div style={{ padding: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
      {tiles.slice(0, 24).map((t, i) => (
        <div key={i} className="asset-tile">
          <div style={{
            aspectRatio: '1',
            background: t.kind === 'logo'
              ? `linear-gradient(135deg, ${t.tone}11, ${t.tone}33)`
              : `linear-gradient(135deg, ${t.tone}66, ${t.tone}cc)`,
            borderRadius: 8, position: 'relative', overflow: 'hidden',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {t.kind === 'logo' && (
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 36, color: t.tone, fontWeight: 600 }}>{t.label}</div>
            )}
            {t.kind === 'banner' && (
              <div style={{ position: 'absolute', inset: 0, background: `repeating-linear-gradient(45deg, transparent 0 8px, rgba(255,255,255,0.06) 8px 16px)` }}/>
            )}
            {t.ai && (
              <div style={{ position: 'absolute', top: 6, left: 6, background: 'rgba(0,0,0,0.7)', color: 'white', fontSize: 9, padding: '2px 6px', borderRadius: 10, fontWeight: 600, letterSpacing: 0.04 }}>
                ⊹ AI
              </div>
            )}
            <div className="asset-overlay">
              <button className="btn btn-sm" style={{ padding: '3px 6px' }}><PIcon name="eye" size={11}/></button>
              <button className="btn btn-sm" style={{ padding: '3px 6px' }}><PIcon name="copy" size={11}/></button>
              <button className="btn btn-sm" style={{ padding: '3px 6px', color: 'var(--rose)' }}><PIcon name="trash" size={11}/></button>
            </div>
          </div>
          <div style={{ fontSize: 11, fontWeight: 500, marginTop: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.name}</div>
          <div style={{ fontSize: 10, color: 'var(--fg-4)', fontFamily: 'var(--font-mono)' }}>{t.size}</div>
        </div>
      ))}
    </div>
  );
}

/* ============================================================ TAB 4 · SUPER ADMIN */
function AdminTab() {
  const stores = [
    { id: 'pawluxe',    owner: 'Maya Chen',     email: 'maya@studio.co',     domain: 'shop.pawluxe.com',  custStatus: 'connected',   plan: 'Pro',      storage: 1.84, limit: 10,  products: 8,   status: 'active',    flagged: false },
    { id: 'desknova',   owner: 'Maya Chen',     email: 'maya@studio.co',     domain: '—',                 custStatus: 'none',        plan: 'Pro',      storage: 0.42, limit: 10,  products: 8,   status: 'draft',     flagged: false },
    { id: 'bloomatlas', owner: 'Naomi Park',    email: 'naomi@bloomatlas.io', domain: 'bloomatlas.shop',  custStatus: 'verifying',   plan: 'Starter',  storage: 0.78, limit: 1,   products: 42,  status: 'active',    flagged: true  },
    { id: 'forgehifi',  owner: 'Anders Vidal',  email: 'av@forgehifi.com',   domain: 'forgehifi.com',     custStatus: 'failed',      plan: 'Business', storage: 64.2, limit: 100, products: 318, status: 'active',    flagged: false },
    { id: 'lumenale',   owner: 'Pat O\'Hare',   email: 'pat@lumenale.co',    domain: '—',                 custStatus: 'none',        plan: 'Starter', storage: 0.91, limit: 1,   products: 12,  status: 'suspended', flagged: true  },
    { id: 'cobalt',     owner: 'Riya Sundar',   email: 'riya@cobaltbike.com',domain: 'cobaltbike.com',    custStatus: 'connected',   plan: 'Pro',      storage: 4.32, limit: 10,  products: 24,  status: 'active',    flagged: false },
    { id: 'driftcafe',  owner: 'Theo Bell',     email: 'theo@driftcafe.shop',domain: 'driftcafe.shop',    custStatus: 'connected',   plan: 'Pro',      storage: 2.10, limit: 10,  products: 18,  status: 'active',    flagged: false },
    { id: 'pulpsoap',   owner: 'Iris Tanaka',   email: 'iris@pulp.co',       domain: '—',                 custStatus: 'none',        plan: 'Starter', storage: 0.18, limit: 1,   products: 6,   status: 'active',    flagged: false },
  ];

  const [search, setSearch] = useState('');
  const filtered = stores.filter(s => !search || s.id.includes(search.toLowerCase()) || s.owner.toLowerCase().includes(search.toLowerCase()));

  const failedEvents = [
    { t: '12m ago',  store: 'forgehifi',   ev: 'DNS verification failed', detail: 'A record points to wrong IP' },
    { t: '1h ago',   store: 'bloomatlas',  ev: 'Storage warning · 78%',   detail: '0.78 / 1.00 GB · approaching Starter limit' },
    { t: '3h ago',   store: 'lumenale',    ev: 'Storage exceeded',         detail: 'Suspended by policy · 0.91 / 1.00 GB' },
    { t: '6h ago',   store: 'forgehifi',   ev: 'Publish failed',           detail: 'Build error · stale dependencies' },
  ];

  return (
    <div>
      {/* admin warning banner */}
      <div style={{
        background: '#1a1a1a', color: '#fafafa', borderRadius: 10, padding: '10px 14px',
        marginBottom: 14, fontSize: 12, display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <PIcon name="shield"/> <strong>Super-admin view</strong>
        <span style={{ color: '#a3a3a3' }}>· Forge platform staff only · {stores.length} stores · 2 flagged</span>
        <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 10.5, color: '#737373' }}>read/write · audited</span>
      </div>

      {/* admin KPI strip */}
      <div className="dash-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
        {[
          { l: 'Total stores',         v: '1,284',   d: '+24 this week' },
          { l: 'Published',            v: '1,142',   d: '88.9%' },
          { l: 'Custom domains',       v: '482',     d: '37.5% of stores' },
          { l: 'Total storage',        v: '4.2 TB',  d: '+38 GB / day' },
          { l: 'Failed events (24h)',  v: '12',      d: '−4 vs yesterday' },
        ].map(k => (
          <div key={k.l} className="kpi-card">
            <div className="kpi-label">{k.l}</div>
            <div className="kpi-value">{k.v}</div>
            <div className="kpi-delta up">{k.d}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 14 }}>
        <div className="panel">
          <div className="panel-head">
            <div className="panel-title">All stores</div>
            <div style={{ display: 'flex', gap: 6 }}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search store / owner…"
                style={{ padding: '5px 10px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 11.5, background: 'var(--surface)', color: 'var(--fg)', outline: 'none', width: 200 }}/>
              <button className="btn btn-sm">Export CSV</button>
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ fontSize: 11.5 }}>
              <thead><tr>
                <th>Store</th><th>Owner</th><th>Domain</th><th>Plan</th>
                <th>Storage</th><th>Status</th><th></th>
              </tr></thead>
              <tbody>
                {filtered.map(s => {
                  const stPct = (s.storage / s.limit) * 100;
                  const stTone = stPct > 90 ? 'rose' : stPct > 70 ? 'amber' : 'green';
                  return (
                    <tr key={s.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 22, height: 22, borderRadius: 5, background: `hsl(${s.id.charCodeAt(0) * 7}, 60%, 55%)` }}/>
                          <div>
                            <div style={{ fontWeight: 500 }}>{s.id}</div>
                            <div style={{ fontSize: 10, color: 'var(--fg-4)', fontFamily: 'var(--font-mono)' }}>{s.id}.forge.shop</div>
                          </div>
                          {s.flagged && <span style={{ color: 'var(--rose)', fontSize: 11 }}>⚑</span>}
                        </div>
                      </td>
                      <td>
                        <div>{s.owner}</div>
                        <div style={{ fontSize: 10, color: 'var(--fg-4)' }}>{s.email}</div>
                      </td>
                      <td>
                        {s.domain === '—' ? <span style={{ color: 'var(--fg-4)' }}>—</span> : (
                          <div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{s.domain}</div>
                            <span className="status-pill" data-tone={
                              s.custStatus === 'connected' ? 'green' :
                              s.custStatus === 'verifying' ? 'amber' :
                              s.custStatus === 'failed' ? 'rose' : 'gray'
                            } style={{ marginTop: 2 }}>{s.custStatus}</span>
                          </div>
                        )}
                      </td>
                      <td>{s.plan}</td>
                      <td>
                        <div style={{ fontVariantNumeric: 'tabular-nums', marginBottom: 3 }}>
                          {s.storage.toFixed(1)} / {s.limit} GB
                        </div>
                        <div style={{ height: 4, borderRadius: 2, background: 'var(--surface-2)', width: 80 }}>
                          <div style={{ width: Math.min(100, stPct) + '%', height: '100%', background: `var(--${stTone === 'rose' ? 'rose' : stTone === 'amber' ? 'amber' : 'green'})`, borderRadius: 2 }}/>
                        </div>
                      </td>
                      <td>
                        <span className="status-pill" data-tone={
                          s.status === 'active' ? 'green' :
                          s.status === 'suspended' ? 'rose' : 'gray'
                        }>{s.status}</span>
                      </td>
                      <td>
                        <button className="btn btn-sm btn-ghost" title="More">⋯</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="panel">
            <div className="panel-head">
              <div>
                <div className="panel-title">Failed events</div>
                <div className="panel-sub">Last 24 hours</div>
              </div>
              <span className="status-pill" data-tone="rose">{failedEvents.length}</span>
            </div>
            <div>
              {failedEvents.map((e, i) => (
                <div key={i} style={{ padding: '10px 14px', borderBottom: i < failedEvents.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                    <span style={{ fontSize: 12, fontWeight: 500 }}>{e.ev}</span>
                    <span style={{ fontSize: 10.5, color: 'var(--fg-4)', fontFamily: 'var(--font-mono)' }}>{e.t}</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--fg-3)' }}>
                    <span style={{ fontFamily: 'var(--font-mono)' }}>{e.store}</span> · {e.detail}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="panel">
            <div className="panel-head"><div className="panel-title">Storage by plan</div></div>
            <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12, fontSize: 12 }}>
              {[
                { p: 'Starter',  used: 142,  total: 482,  c: '#94A3B8' },
                { p: 'Pro',      used: 1840, total: 3200, c: '#6366F1' },
                { p: 'Business', used: 2280, total: 5400, c: '#22C55E' },
              ].map(x => {
                const pct = (x.used / x.total) * 100;
                return (
                  <div key={x.p}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span>{x.p}</span>
                      <span style={{ color: 'var(--fg-3)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>{x.used} / {x.total} GB</span>
                    </div>
                    <div style={{ height: 5, borderRadius: 3, background: 'var(--surface-2)' }}>
                      <div style={{ width: pct + '%', height: '100%', background: x.c, borderRadius: 3 }}/>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="panel">
            <div className="panel-head"><div className="panel-title">Quick actions</div></div>
            <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <button className="btn btn-sm" style={{ justifyContent: 'flex-start' }}><PIcon name="globe"/> Manage all domains</button>
              <button className="btn btn-sm" style={{ justifyContent: 'flex-start' }}><PIcon name="shield"/> Set storage policies</button>
              <button className="btn btn-sm" style={{ justifyContent: 'flex-start' }}><PIcon name="refresh"/> Re-run all DNS checks</button>
              <button className="btn btn-sm" style={{ justifyContent: 'flex-start', color: 'var(--rose)' }}><PIcon name="trash"/> Suspend stores by policy</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

window.FORGE_PUBLISHING = { Publishing };
