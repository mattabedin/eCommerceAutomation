/* Forge — Admin views: Dashboard, Products, Orders, Customers, Marketing, Support, Analytics, Settings, Billing */

const { useState } = React;

/* ============================================================ DASHBOARD */
function Dashboard({ brand, brandKey }) {
  const products = FORGE.PRODUCTS[brandKey];
  return (
    <div className="view-pad">
      <div className="page-head">
        <div>
          <h1>Welcome back, Maya.</h1>
          <div className="desc">{brand.name} · {brand.domain} · live since 4 days ago</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-sm">Last 7 days ▾</button>
          <button className="btn btn-sm btn-accent">⊹ Ask Forge</button>
        </div>
      </div>

      <div className="approval-banner">
        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--accent)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>⊹</div>
        <div className="text">
          <strong>Forge proposes 3 changes</strong> · Reorder Cloud Lounger Bed (8 left), launch retargeting for cart abandoners, A/B test hero copy. <span style={{ color: 'var(--fg-3)' }}>Estimated +$1,840 revenue / 7 days.</span>
        </div>
        <div className="actions">
          <button className="btn btn-sm">Review</button>
          <button className="btn btn-sm btn-accent">Approve all</button>
        </div>
      </div>

      <div className="dash-grid">
        {[
          { l: 'Revenue (7d)',   v: '$12,847', d: '+18.4%', up: true },
          { l: 'Orders',         v: '142',     d: '+12.1%', up: true },
          { l: 'Conversion',     v: '3.42%',   d: '+0.4 pp', up: true },
          { l: 'Avg. order',     v: '$90.47',  d: '−$2.10',  up: false },
        ].map(k => (
          <div key={k.l} className="kpi-card">
            <div className="kpi-label">{k.l}</div>
            <div className="kpi-value">{k.v}</div>
            <div className={`kpi-delta ${k.up ? 'up' : 'down'}`}>{k.up ? '↑' : '↓'} {k.d}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 12, marginBottom: 12 }}>
        <div className="panel">
          <div className="panel-head">
            <div>
              <div className="panel-title">Revenue</div>
              <div className="panel-sub">Hourly · last 7 days</div>
            </div>
            <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'var(--fg-3)' }}>
              <span><span style={{ display: 'inline-block', width: 8, height: 8, background: 'var(--accent)', borderRadius: 2, marginRight: 4 }}/>Revenue</span>
              <span><span style={{ display: 'inline-block', width: 8, height: 8, background: 'var(--border-strong)', borderRadius: 2, marginRight: 4 }}/>Last week</span>
            </div>
          </div>
          <div style={{ padding: 16, height: 220 }}>
            <RevenueChart/>
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <div className="panel-title">Top products</div>
            <button className="btn btn-sm btn-ghost" style={{ fontSize: 11 }}>View all →</button>
          </div>
          <div>
            {products.slice(0, 5).map((p, i) => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderBottom: i < 4 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ width: 32, height: 32, borderRadius: 6, background: `linear-gradient(135deg, ${p.tone}66, ${p.tone}cc)`, flexShrink: 0 }}/>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--fg-3)' }}>{p.sales} sold</div>
                </div>
                <div style={{ fontSize: 12, fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>${(p.price * p.sales).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div className="panel">
          <div className="panel-head">
            <div className="panel-title">Live activity</div>
            <span className="status-pill" data-tone="green">● live</span>
          </div>
          <LiveFeed/>
        </div>

        <div className="panel">
          <div className="panel-head">
            <div className="panel-title">Forge agents</div>
            <span className="panel-sub">7 running · 0 errors</span>
          </div>
          <div style={{ padding: '4px 0' }}>
            {[
              { n: 'Pricing optimizer', s: 'Analyzed 8 products · 2 changes proposed', t: '2m', tone: 'amber' },
              { n: 'Inventory monitor', s: 'Cloud Lounger Bed: 8 units · reorder?',     t: '4m', tone: 'rose'  },
              { n: 'SEO writer',         s: 'Generated 3 product descriptions',          t: '12m',tone: 'green' },
              { n: 'Support triage',     s: 'Auto-resolved 4 tickets · 1 escalated',    t: '24m',tone: 'green' },
              { n: 'Email campaign',     s: 'Drafted "Heirloom" launch · awaiting',     t: '1h', tone: 'amber' },
            ].map((a, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 16px', borderBottom: i < 4 ? '1px solid var(--border)' : 'none', alignItems: 'center' }}>
                <span className="status-pill" data-tone={a.tone} style={{ width: 8, height: 8, padding: 0, borderRadius: '50%' }}/>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 500 }}>{a.n}</div>
                  <div style={{ fontSize: 11, color: 'var(--fg-3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.s}</div>
                </div>
                <span style={{ fontSize: 10.5, color: 'var(--fg-4)', fontFamily: 'var(--font-mono)' }}>{a.t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function RevenueChart() {
  // Hand-drawn SVG chart, no library
  const pts = [820, 1100, 980, 1340, 1180, 1620, 1480, 1740, 1620, 1880, 1720, 2040, 1940, 2180, 2080, 2380, 2240, 2520, 2380, 2640, 2520, 2780, 2680, 2920];
  const prev = pts.map(p => p * 0.78);
  const max = Math.max(...pts) * 1.1;
  const w = 100, h = 100;
  const path = (arr) => arr.map((p, i) => `${(i / (arr.length - 1)) * w},${h - (p / max) * h}`).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
      <defs>
        <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.25"/>
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0"/>
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map(y => <line key={y} x1="0" x2={w} y1={h*y} y2={h*y} stroke="var(--border)" strokeWidth="0.2" strokeDasharray="0.5 0.5" vectorEffect="non-scaling-stroke"/>)}
      <polyline fill="none" stroke="var(--border-strong)" strokeWidth="1.2" strokeDasharray="2 2" vectorEffect="non-scaling-stroke" points={path(prev)}/>
      <polygon fill="url(#rg)" points={`0,${h} ${path(pts)} ${w},${h}`}/>
      <polyline fill="none" stroke="var(--accent)" strokeWidth="1.6" vectorEffect="non-scaling-stroke" points={path(pts)}/>
      <circle cx={w} cy={h - (pts[pts.length - 1] / max) * h} r="2.4" fill="var(--accent)" stroke="var(--surface)" strokeWidth="1" vectorEffect="non-scaling-stroke"/>
    </svg>
  );
}

function LiveFeed() {
  const [feed, setFeed] = useState([
    { t: 'just now', i: 'order',   m: 'Maya R. ordered Heirloom Leather Collar', v: '$89' },
    { t: '14s ago', i: 'view',    m: '14 visitors viewing Brass-Cast Leash 6ft' },
    { t: '38s ago', i: 'agent',   m: 'Pricing agent suggested 6% increase on Cloud Lounger' },
    { t: '1m ago',  i: 'order',   m: 'Jordan K. ordered Travel Tote · Walnut',   v: '$145' },
    { t: '2m ago',  i: 'support', m: 'Support agent auto-resolved T-218' },
    { t: '4m ago',  i: 'cart',    m: 'Sara L. added 3 items to cart' },
  ]);
  const ic = { order: '◆', view: '◌', agent: '⊹', support: '◐', cart: '⊕' };
  const cl = { order: 'green', view: 'gray', agent: 'indigo', support: 'amber', cart: 'gray' };
  return (
    <div style={{ padding: '4px 0', maxHeight: 280, overflowY: 'auto' }}>
      {feed.map((f, i) => (
        <div key={i} style={{ display: 'flex', gap: 10, padding: '8px 16px', alignItems: 'center', borderBottom: i < feed.length - 1 ? '1px solid var(--border)' : 'none' }}>
          <span className="status-pill" data-tone={cl[f.i]} style={{ width: 18, height: 18, padding: 0, justifyContent: 'center', fontSize: 10 }}>{ic[f.i]}</span>
          <div style={{ flex: 1, fontSize: 12.5 }}>{f.m}</div>
          {f.v && <span style={{ fontSize: 12, fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>{f.v}</span>}
          <span style={{ fontSize: 10.5, color: 'var(--fg-4)', fontFamily: 'var(--font-mono)', minWidth: 56, textAlign: 'right' }}>{f.t}</span>
        </div>
      ))}
    </div>
  );
}

/* ============================================================ PRODUCTS */
function Products({ brand, brandKey }) {
  const products = FORGE.PRODUCTS[brandKey];
  const [tab, setTab] = useState('catalog');
  return (
    <div className="view-pad">
      <div className="page-head">
        <div>
          <h1>Products</h1>
          <div className="desc">{products.length} active · 0 drafts · AI-generated catalog</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-sm">Import</button>
          <button className="btn btn-sm btn-accent">⊹ Generate with AI</button>
          <button className="btn btn-sm btn-primary">+ New product</button>
        </div>
      </div>

      <div className="tabs">
        {['catalog', 'variants', 'pricing', 'inventory'].map(t => (
          <button key={t} className="tab" data-active={tab === t} onClick={() => setTab(t)}>
            {t[0].toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'catalog' && (
        <div className="panel">
          <table className="table">
            <thead><tr>
              <th style={{ width: 36 }}><input type="checkbox" style={{ accentColor: 'var(--accent)' }}/></th>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Margin</th>
              <th>Stock</th>
              <th>Status</th>
              <th>AI</th>
            </tr></thead>
            <tbody>
              {products.map(p => {
                const margin = Math.round(((p.price - p.cost) / p.price) * 100);
                const lowStock = p.stock < 30;
                return (
                  <tr key={p.id}>
                    <td><input type="checkbox" style={{ accentColor: 'var(--accent)' }}/></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 6, background: `linear-gradient(135deg, ${p.tone}66, ${p.tone}cc)` }}/>
                        <div>
                          <div style={{ fontWeight: 500 }}>{p.name}</div>
                          <div style={{ fontSize: 10.5, color: 'var(--fg-4)', fontFamily: 'var(--font-mono)' }}>{p.id.toUpperCase()}-{p.cat.slice(0,3).toUpperCase()}</div>
                        </div>
                      </div>
                    </td>
                    <td><span style={{ color: 'var(--fg-2)' }}>{p.cat}</span></td>
                    <td style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 500 }}>${p.price}</td>
                    <td style={{ fontVariantNumeric: 'tabular-nums' }}>
                      <span style={{ color: margin > 70 ? 'var(--green)' : 'var(--fg-2)' }}>{margin}%</span>
                    </td>
                    <td style={{ fontVariantNumeric: 'tabular-nums' }}>
                      {lowStock ? <span style={{ color: 'var(--rose)' }}>{p.stock} ⚠</span> : p.stock}
                    </td>
                    <td><span className="status-pill" data-tone="green">live</span></td>
                    <td><span className="status-pill" data-tone="indigo">⊹ tuning</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'variants' && <VariantEditor brand={brand}/>}
      {tab === 'pricing' && <PricingFlow brand={brand} product={products[0]}/>}
      {tab === 'inventory' && <Inventory products={products}/>}
    </div>
  );
}

function VariantEditor({ brand }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <div style={{ flex: 1, fontSize: 13 }}>
          <strong>Heirloom Leather Collar</strong>
          <span style={{ color: 'var(--fg-3)', marginLeft: 8 }}>· 6 variants · Size × Color</span>
        </div>
        <button className="btn btn-sm btn-accent">⊹ Bulk-edit prices with AI</button>
        <button className="btn btn-sm btn-primary">+ Variant</button>
      </div>

      <div className="panel" style={{ marginBottom: 16 }}>
        <table className="table">
          <thead><tr>
            <th>Image</th><th>SKU</th><th>Size</th><th>Color</th><th>Price</th><th>Cost</th><th>Stock</th><th></th>
          </tr></thead>
          <tbody>
            {FORGE.VARIANTS.map(v => (
              <tr key={v.sku}>
                <td><div style={{ width: 28, height: 28, borderRadius: 6, background: v.image }}/></td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{v.sku}</td>
                <td>{v.size}</td>
                <td>{v.color}</td>
                <td style={{ fontVariantNumeric: 'tabular-nums' }}>${v.price}.00</td>
                <td style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--fg-3)' }}>${v.cost}.00</td>
                <td style={{ fontVariantNumeric: 'tabular-nums' }}>{v.stock}</td>
                <td><button className="btn btn-sm btn-ghost">Edit</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <div className="panel-title">⊹ AI variant suggestions</div>
            <div className="panel-sub">Based on category benchmarks & demand signals</div>
          </div>
        </div>
        <div style={{ padding: 16, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {[
            { name: 'Add XL size',    why: '14% of search misses for "large dog collar"', conf: 92 },
            { name: 'Add Forest Green', why: 'Trending on Pinterest · 3.2x lift in pet category', conf: 78 },
            { name: 'Bundle: Collar + Leash', why: 'Avg cart attaches 1.4 leashes per collar', conf: 88 },
          ].map((s, i) => (
            <div key={i} style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 12, background: 'var(--surface)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <strong style={{ fontSize: 13 }}>{s.name}</strong>
                <span className="status-pill" data-tone="indigo">{s.conf}%</span>
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--fg-3)', marginBottom: 10 }}>{s.why}</div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="btn btn-sm btn-ghost" style={{ flex: 1 }}>Dismiss</button>
                <button className="btn btn-sm btn-primary" style={{ flex: 1 }}>Add →</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PricingFlow({ brand, product }) {
  return (
    <div>
      <div style={{ fontSize: 13, marginBottom: 14, color: 'var(--fg-2)' }}>
        <strong>{product.name}</strong> · how Forge prices this product
      </div>

      <div className="pricing-flow" style={{ marginBottom: 16 }}>
        <div className="pricing-step">
          <div className="label">COGS</div>
          <div className="value">${product.cost}.00</div>
          <div className="note">supplier + QC</div>
          <div className="arrow"/>
        </div>
        <div className="pricing-step">
          <div className="label">+ Margin</div>
          <div className="value">${(product.price - product.cost).toFixed(0)}.00</div>
          <div className="note">{Math.round(((product.price - product.cost) / product.price) * 100)}% target</div>
          <div className="arrow"/>
        </div>
        <div className="pricing-step">
          <div className="label">Anchor</div>
          <div className="value">${product.was}.00</div>
          <div className="note">competitor median</div>
          <div className="arrow"/>
        </div>
        <div className="pricing-step">
          <div className="label">⊹ AI tier</div>
          <div className="value">${product.price}.00</div>
          <div className="note">$89 &gt; $90 · charm</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div className="panel">
          <div className="panel-head"><div className="panel-title">Demand model</div></div>
          <div style={{ padding: 16, height: 180 }}>
            <DemandCurve brand={brand} product={product}/>
          </div>
        </div>
        <div className="panel">
          <div className="panel-head"><div className="panel-title">⊹ AI rationale</div></div>
          <div style={{ padding: 16, fontSize: 12.5, lineHeight: 1.6, color: 'var(--fg-2)' }}>
            <p style={{ marginBottom: 8 }}>Set to <strong style={{ color: 'var(--fg)' }}>${product.price}</strong> from a target band of <strong style={{ color: 'var(--fg)' }}>$82–$96</strong>.</p>
            <p style={{ marginBottom: 8 }}>$89 sits in the sweet spot: above the perceived-quality cliff at $75, below the budget-conscious wall at $99. Expected conversion: <strong style={{ color: 'var(--green)' }}>3.4%</strong> (vs. 2.1% at $99).</p>
            <p style={{ color: 'var(--fg-3)', fontSize: 11.5 }}>Re-evaluating weekly. Last update: 2 days ago.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function DemandCurve({ brand, product }) {
  const points = [];
  for (let i = 0; i <= 30; i++) {
    const x = 50 + i * 3; // price
    const y = Math.max(0, 100 - Math.pow((x - 70) / 10, 2) * 6);
    points.push({ x, y });
  }
  const optimalIdx = points.findIndex(p => p.x >= product.price);
  const w = 100, h = 100;
  const minX = points[0].x, maxX = points[points.length-1].x;
  const path = points.map((p,i) => `${((p.x-minX)/(maxX-minX))*w},${h - p.y}`).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
      <defs>
        <linearGradient id="dc" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.2"/>
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0"/>
        </linearGradient>
      </defs>
      <polygon fill="url(#dc)" points={`0,${h} ${path} ${w},${h}`}/>
      <polyline fill="none" stroke="var(--accent)" strokeWidth="1.4" vectorEffect="non-scaling-stroke" points={path}/>
      {optimalIdx >= 0 && (
        <>
          <line x1={(optimalIdx/30)*w} x2={(optimalIdx/30)*w} y1="0" y2={h} stroke="var(--green)" strokeDasharray="2 2" strokeWidth="0.8" vectorEffect="non-scaling-stroke"/>
          <circle cx={(optimalIdx/30)*w} cy={h - points[optimalIdx].y} r="2.4" fill="var(--green)" stroke="var(--surface)" strokeWidth="1" vectorEffect="non-scaling-stroke"/>
        </>
      )}
      <text x="2" y="8" fontSize="3" fill="var(--fg-3)" fontFamily="var(--font-mono)">expected units / wk</text>
      <text x={w-2} y={h-2} fontSize="3" fill="var(--fg-3)" fontFamily="var(--font-mono)" textAnchor="end">price →</text>
    </svg>
  );
}

function Inventory({ products }) {
  return (
    <div className="panel">
      <div className="panel-head">
        <div>
          <div className="panel-title">Inventory health</div>
          <div className="panel-sub">Live · auto-reordering enabled for 6 of 8 products</div>
        </div>
      </div>
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {products.map(p => {
          const pct = Math.min(100, (p.stock / 200) * 100);
          const tone = p.stock < 30 ? 'rose' : p.stock < 80 ? 'amber' : 'green';
          return (
            <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '1.4fr 80px 1fr 100px 80px', gap: 12, alignItems: 'center', fontSize: 12.5 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 24, height: 24, borderRadius: 5, background: `linear-gradient(135deg, ${p.tone}66, ${p.tone}cc)` }}/>
                <span style={{ fontWeight: 500 }}>{p.name}</span>
              </div>
              <span style={{ fontVariantNumeric: 'tabular-nums', textAlign: 'right' }}>{p.stock} units</span>
              <div style={{ height: 6, borderRadius: 3, background: 'var(--surface-2)', overflow: 'hidden' }}>
                <div style={{ width: pct + '%', height: '100%', background: tone === 'rose' ? 'var(--rose)' : tone === 'amber' ? 'var(--amber)' : 'var(--green)' }}/>
              </div>
              <span style={{ color: 'var(--fg-3)', fontSize: 11 }}>~{Math.round(p.stock / (p.sales / 30))} days left</span>
              <span className="status-pill" data-tone={tone}>{tone === 'rose' ? 'reorder' : tone === 'amber' ? 'watch' : 'healthy'}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================ ORDERS */
function Orders() {
  return (
    <div className="view-pad">
      <div className="page-head">
        <div><h1>Orders</h1><div className="desc">142 orders · last 7 days</div></div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-sm">Export CSV</button>
          <button className="btn btn-sm btn-accent">⊹ Triage with AI</button>
        </div>
      </div>
      <div className="tabs">
        {['All', 'Unfulfilled', 'Refund requests', 'Flagged'].map((t, i) => (
          <button key={t} className="tab" data-active={i === 0}>{t}{i === 1 && ' · 4'}{i === 2 && ' · 1'}</button>
        ))}
      </div>
      <div className="panel">
        <table className="table">
          <thead><tr>
            <th><input type="checkbox" style={{ accentColor: 'var(--accent)' }}/></th>
            <th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Fulfillment</th><th>Date</th><th>AI</th>
          </tr></thead>
          <tbody>
            {FORGE.ORDERS.map(o => {
              const stoneTone = o.status === 'paid' ? 'green' : o.status === 'refund req' ? 'rose' : 'gray';
              const fulfillTone = o.fulfill === 'delivered' ? 'green' : o.fulfill === 'shipped' ? 'indigo' : o.fulfill === 'processing' ? 'amber' : 'gray';
              return (
                <tr key={o.id}>
                  <td><input type="checkbox" style={{ accentColor: 'var(--accent)' }}/></td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5 }}>{o.id}</td>
                  <td style={{ fontWeight: 500 }}>{o.cust}</td>
                  <td>{o.items}</td>
                  <td style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 500 }}>${o.total.toFixed(2)}</td>
                  <td><span className="status-pill" data-tone={stoneTone}>{o.status}</span></td>
                  <td><span className="status-pill" data-tone={fulfillTone}>{o.fulfill}</span></td>
                  <td style={{ color: 'var(--fg-3)' }}>{o.date}</td>
                  <td>{o.status === 'refund req' ? <span style={{ fontSize: 11, color: 'var(--accent)' }}>⊹ draft reply</span> : <span style={{ color: 'var(--fg-4)' }}>—</span>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ============================================================ CUSTOMERS */
function Customers() {
  const customers = [
    { name: 'Maya R.',   email: 'maya@example.com',   orders: 4, ltv: 612, last: '2m ago',  seg: 'VIP', tone: 'indigo' },
    { name: 'Jordan K.', email: 'jordan@example.com', orders: 2, ltv: 234, last: '14m ago', seg: 'Returning', tone: 'green' },
    { name: 'Sara L.',   email: 'sara@example.com',   orders: 7, ltv: 1284, last: '1h ago', seg: 'VIP', tone: 'indigo' },
    { name: 'Tomás V.',  email: 'tomas@example.com',  orders: 1, ltv: 145, last: '3h ago',  seg: 'New', tone: 'gray' },
    { name: 'Priya N.',  email: 'priya@example.com',  orders: 3, ltv: 478, last: '5h ago',  seg: 'Returning', tone: 'green' },
  ];
  return (
    <div className="view-pad">
      <div className="page-head">
        <div><h1>Customers</h1><div className="desc">684 total · 142 in last 7 days</div></div>
        <button className="btn btn-sm btn-accent">⊹ Generate segments</button>
      </div>
      <div className="dash-grid">
        {[
          { l: 'Total customers', v: '684', d: '+22 this week' },
          { l: 'Repeat rate',     v: '34%', d: '+4.2 pp' },
          { l: 'Avg. LTV',        v: '$248', d: '+$18' },
          { l: 'VIP segment',     v: '47',  d: '~6.9% of base' },
        ].map(k => (
          <div key={k.l} className="kpi-card">
            <div className="kpi-label">{k.l}</div>
            <div className="kpi-value">{k.v}</div>
            <div className="kpi-delta up">{k.d}</div>
          </div>
        ))}
      </div>
      <div className="panel">
        <table className="table">
          <thead><tr><th>Customer</th><th>Orders</th><th>LTV</th><th>Last seen</th><th>Segment</th><th>AI note</th></tr></thead>
          <tbody>
            {customers.map(c => (
              <tr key={c.email}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className="user-avatar" style={{ width: 28, height: 28, fontSize: 11, background: `hsl(${c.name.charCodeAt(0)*7}, 60%, 55%)` }}>{c.name[0]}</div>
                    <div>
                      <div style={{ fontWeight: 500 }}>{c.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--fg-3)' }}>{c.email}</div>
                    </div>
                  </div>
                </td>
                <td>{c.orders}</td>
                <td style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 500 }}>${c.ltv}</td>
                <td style={{ color: 'var(--fg-3)' }}>{c.last}</td>
                <td><span className="status-pill" data-tone={c.tone}>{c.seg}</span></td>
                <td style={{ fontSize: 11.5, color: 'var(--fg-3)' }}>
                  {c.seg === 'VIP' ? 'Likely to attach travel accessories' : c.seg === 'New' ? 'Refund risk · check in' : 'Re-engage in 7d'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ============================================================ MARKETING */
function Marketing() {
  return (
    <div className="view-pad">
      <div className="page-head">
        <div><h1>Marketing</h1><div className="desc">3 campaigns running · 1 awaiting approval</div></div>
        <button className="btn btn-sm btn-accent">⊹ Generate campaign</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
        {[
          { ch: 'Email',     n: 'Heirloom launch',    s: 'awaiting',  date: 'queued · Tue 9am', open: '—',  rev: 'est. $1,200' },
          { ch: 'Instagram', n: 'Cloud Bed boost',    s: 'live',      date: 'day 3 of 7',       open: '4.2%', rev: '$340' },
          { ch: 'Email',     n: 'Cart abandoners 24h',s: 'live',      date: 'always-on',         open: '38%',  rev: '$2,180' },
        ].map((c, i) => (
          <div key={i} className="panel">
            <div className="panel-head">
              <div>
                <div style={{ fontSize: 11, color: 'var(--fg-3)', letterSpacing: 0.04 }}>{c.ch.toUpperCase()}</div>
                <div className="panel-title">{c.n}</div>
              </div>
              <span className="status-pill" data-tone={c.s === 'live' ? 'green' : 'amber'}>{c.s}</span>
            </div>
            <div style={{ padding: '12px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 12 }}>
              <div><div style={{ color: 'var(--fg-3)', fontSize: 11 }}>Schedule</div><div>{c.date}</div></div>
              <div><div style={{ color: 'var(--fg-3)', fontSize: 11 }}>Open / CTR</div><div>{c.open}</div></div>
              <div style={{ gridColumn: '1 / -1' }}><div style={{ color: 'var(--fg-3)', fontSize: 11 }}>Revenue</div><div style={{ fontWeight: 500 }}>{c.rev}</div></div>
            </div>
          </div>
        ))}
      </div>

      <div className="panel">
        <div className="panel-head">
          <div><div className="panel-title">⊹ Drafted email · Heirloom launch</div><div className="panel-sub">Generated by Forge · review before sending</div></div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn btn-sm btn-ghost">Regenerate</button>
            <button className="btn btn-sm">Edit</button>
            <button className="btn btn-sm btn-accent">Approve & schedule</button>
          </div>
        </div>
        <div style={{ padding: 24, background: 'var(--surface-2)', display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '32px 36px' }}>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 28, lineHeight: 1.1, marginBottom: 4 }}>For dogs that deserve heirlooms.</div>
            <div style={{ fontSize: 12.5, color: 'var(--fg-3)', marginBottom: 24 }}>Hand-finished leather, made to last lifetimes.</div>
            <div style={{ width: '100%', aspectRatio: '16/9', borderRadius: 6, background: 'linear-gradient(135deg, #f5e6c8, #d4af37)', marginBottom: 16, position: 'relative' }}>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(0,0,0,0.5)', letterSpacing: 0.1 }}>collection · golden hour</div>
            </div>
            <div style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--fg-2)', marginBottom: 16 }}>
              <p style={{ marginBottom: 10 }}>Hi Maya,</p>
              <p style={{ marginBottom: 10 }}>The new Heirloom collection is here — six pieces, each one cut from a single hide, hand-stitched in our Brooklyn studio. Built to outlast the trends, the seasons, and probably us.</p>
              <p>Take a look. We think you'll love what we made.</p>
            </div>
            <button className="btn" style={{ background: '#111827', color: 'white', borderColor: '#111827', padding: '10px 20px' }}>Shop the collection →</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12 }}>
            <div className="panel" style={{ background: 'var(--surface)' }}>
              <div className="panel-head" style={{ padding: '8px 12px' }}><div className="panel-title" style={{ fontSize: 12 }}>Audience</div></div>
              <div style={{ padding: 12, fontSize: 11.5 }}>
                <div>VIP · Returning</div>
                <div style={{ color: 'var(--fg-3)' }}>4,820 recipients</div>
              </div>
            </div>
            <div className="panel" style={{ background: 'var(--surface)' }}>
              <div className="panel-head" style={{ padding: '8px 12px' }}><div className="panel-title" style={{ fontSize: 12 }}>⊹ Predicted</div></div>
              <div style={{ padding: 12, fontSize: 11.5, lineHeight: 1.7 }}>
                <div>Open rate <strong>~42%</strong></div>
                <div>CTR <strong>~6.8%</strong></div>
                <div>Revenue <strong>$1,200 ± $200</strong></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================ SUPPORT */
function Support({ brand }) {
  const [active, setActive] = useState(FORGE.TICKETS[0].id);
  return (
    <div className="view-pad">
      <div className="page-head">
        <div><h1>Support</h1><div className="desc">5 open · 4 auto-resolved today (94% confidence)</div></div>
        <button className="btn btn-sm btn-accent">⊹ Train AI on policies</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 12, height: 'calc(100% - 80px)' }}>
        <div className="panel" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="panel-head"><div className="panel-title">Inbox</div></div>
          <div style={{ overflowY: 'auto' }}>
            {FORGE.TICKETS.map(t => (
              <div key={t.id} onClick={() => setActive(t.id)} style={{
                padding: '12px 14px', borderBottom: '1px solid var(--border)', cursor: 'pointer',
                background: active === t.id ? 'var(--surface-2)' : 'transparent',
                borderLeft: active === t.id ? '2px solid var(--accent)' : '2px solid transparent',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--fg-3)' }}>{t.id}</span>
                  <span style={{ fontSize: 10.5, color: 'var(--fg-4)' }}>{t.since}</span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}>{t.subj}</div>
                <div style={{ fontSize: 11.5, color: 'var(--fg-3)', marginBottom: 6 }}>{t.cust}</div>
                <span className="status-pill" data-tone={t.status === 'auto-resolved' ? 'green' : t.status === 'needs admin' ? 'rose' : 'amber'}>
                  {t.status}{t.ai !== '—' && ` · ${t.ai}`}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="panel" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="panel-head">
            <div>
              <div className="panel-title">Sizing — Heirloom XL?</div>
              <div className="panel-sub">Priya N. · priya@example.com · order #PL-1038</div>
            </div>
            <span className="status-pill" data-tone="amber">awaiting reply · 88%</span>
          </div>
          <div style={{ padding: 20, flex: 1, overflow: 'auto', background: 'var(--surface-2)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ alignSelf: 'flex-start', maxWidth: '70%', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px 12px 12px 4px', padding: '10px 14px', fontSize: 13 }}>
                Hi! Just ordered the collar in M but my golden retriever is between sizes — should I size up?
                <div style={{ fontSize: 10, color: 'var(--fg-4)', marginTop: 4 }}>14m ago</div>
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border)', padding: 16, background: 'var(--accent-soft)' }}>
            <div style={{ fontSize: 10.5, color: 'var(--accent)', letterSpacing: 0.04, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
              ⊹ DRAFTED REPLY · 88% confidence · cites size guide + 2 similar tickets
            </div>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 14, fontSize: 13, lineHeight: 1.55, marginBottom: 10 }}>
              Hi Priya — for goldens I'd size up to L. The Heirloom collar is true-to-size on the chart but most retrievers in our data fit the next size up because of their thicker neck fur. I'll send a prepaid label so you can swap M for L with no shipping cost. Sound good?
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn btn-sm btn-ghost">Regenerate</button>
              <button className="btn btn-sm">Edit</button>
              <button className="btn btn-sm btn-accent">Send →</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================ ANALYTICS */
function Analytics() {
  return (
    <div className="view-pad">
      <div className="page-head">
        <div><h1>Analytics</h1><div className="desc">All channels · last 30 days</div></div>
        <button className="btn btn-sm">Last 30 days ▾</button>
      </div>
      <div className="dash-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
        {[
          { l: 'Sessions',      v: '38,492', d: '+24%', up: true },
          { l: 'Sessions/user', v: '2.41',   d: '+0.18',up: true },
          { l: 'Add-to-cart',   v: '4.8%',   d: '+0.6 pp', up: true },
          { l: 'Conversion',    v: '3.42%',  d: '+0.4 pp', up: true },
          { l: 'Refund rate',   v: '1.2%',   d: '−0.3 pp', up: true },
        ].map(k => (
          <div key={k.l} className="kpi-card">
            <div className="kpi-label">{k.l}</div>
            <div className="kpi-value">{k.v}</div>
            <div className={`kpi-delta ${k.up ? 'up' : 'down'}`}>{k.up ? '↑' : '↓'} {k.d}</div>
          </div>
        ))}
      </div>

      <div className="panel" style={{ marginBottom: 12 }}>
        <div className="panel-head">
          <div className="panel-title">Funnel · last 30 days</div>
          <div className="panel-sub">Sessions → checkout</div>
        </div>
        <div style={{ padding: 24 }}>
          <Funnel/>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div className="panel">
          <div className="panel-head"><div className="panel-title">Traffic by source</div></div>
          <div style={{ padding: 16 }}>
            {[
              { s: 'Direct',     v: 38, c: '#6366F1' },
              { s: 'Google',    v: 28, c: '#22C55E' },
              { s: 'Instagram', v: 18, c: '#F59E0B' },
              { s: 'Email',     v: 12, c: '#EC4899' },
              { s: 'Other',     v:  4, c: '#94A3B8' },
            ].map(s => (
              <div key={s.s} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                  <span>{s.s}</span><span style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--fg-3)' }}>{s.v}%</span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: 'var(--surface-2)' }}>
                  <div style={{ width: s.v + '%', height: '100%', background: s.c, borderRadius: 3 }}/>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="panel">
          <div className="panel-head"><div className="panel-title">⊹ AI insights</div></div>
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12.5, lineHeight: 1.55 }}>
            {[
              { t: 'Mobile checkout drops at address step', s: '23% leave on address entry · suggest autocomplete', tone: 'rose' },
              { t: 'Instagram traffic converts 2.8x',         s: 'Worth +$1,200/wk if budget reallocated',          tone: 'green' },
              { t: 'Cloud Lounger Bed has highest LTV impact', s: 'Buyers return 3.4x on average',                  tone: 'indigo' },
            ].map((x, i) => (
              <div key={i} style={{ borderLeft: `3px solid var(--${x.tone === 'rose' ? 'rose' : x.tone === 'green' ? 'green' : 'accent'})`, paddingLeft: 10 }}>
                <strong>{x.t}</strong>
                <div style={{ color: 'var(--fg-3)', fontSize: 11.5 }}>{x.s}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Funnel() {
  const steps = [
    { l: 'Sessions',      v: 38492, p: 100 },
    { l: 'Product view',  v: 22184, p: 57.6 },
    { l: 'Add to cart',   v: 4842,  p: 12.6 },
    { l: 'Checkout',      v: 1842,  p:  4.8 },
    { l: 'Purchase',      v: 1316,  p:  3.4 },
  ];
  const max = steps[0].v;
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 200 }}>
      {steps.map((s, i) => {
        const h = (s.v / max) * 100;
        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end' }}>
              <div style={{ width: '100%', height: h + '%', background: i === steps.length - 1 ? 'var(--green)' : 'var(--accent)', borderRadius: '6px 6px 0 0', position: 'relative' }}>
                <div style={{ position: 'absolute', top: -22, left: 0, right: 0, textAlign: 'center', fontSize: 11, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                  {s.v.toLocaleString()}
                </div>
              </div>
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--fg-2)' }}>{s.l}</div>
            <div style={{ fontSize: 10.5, fontFamily: 'var(--font-mono)', color: 'var(--fg-4)' }}>{s.p}%</div>
          </div>
        );
      })}
    </div>
  );
}

/* ============================================================ SETTINGS / BILLING */
function Settings({ brand }) {
  return (
    <div className="view-pad">
      <div className="page-head">
        <div><h1>Settings</h1><div className="desc">Workspace, brand, integrations</div></div>
      </div>
      <div className="panel" style={{ marginBottom: 12 }}>
        <div className="panel-head"><div className="panel-title">Brand</div></div>
        <div style={{ padding: 20, display: 'grid', gridTemplateColumns: '160px 1fr', gap: 24 }}>
          <div style={{ width: 120, height: 120, borderRadius: 14, background: `linear-gradient(135deg, ${brand.colors.secondary}, ${brand.colors.primary})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontFamily: 'var(--font-serif)', fontSize: 40 }}>
            {brand.name[0]}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="Store name" value={brand.name}/>
            <Field label="Domain"     value={brand.domain}/>
            <Field label="Tagline"    value={brand.tagline} wide/>
            <Field label="Tone"       value={brand.tone}/>
            <Field label="Audience"   value={brand.audience}/>
          </div>
        </div>
      </div>
      <div className="panel">
        <div className="panel-head"><div className="panel-title">Integrations</div></div>
        <div style={{ padding: 16, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {[
            { n: 'Stripe', s: 'Connected', tone: 'green' },
            { n: 'Shippo', s: 'Connected', tone: 'green' },
            { n: 'Klaviyo', s: 'Connected', tone: 'green' },
            { n: 'Meta Ads', s: 'Disconnected', tone: 'gray' },
            { n: 'TikTok Shop', s: 'Disconnected', tone: 'gray' },
            { n: 'Google Merchant', s: 'Pending', tone: 'amber' },
          ].map(x => (
            <div key={x.n} style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12 }}>{x.n[0]}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12.5, fontWeight: 500 }}>{x.n}</div>
                <span className="status-pill" data-tone={x.tone}>{x.s}</span>
              </div>
              <button className="btn btn-sm btn-ghost">⋯</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, wide }) {
  return (
    <div style={{ gridColumn: wide ? '1 / -1' : 'auto' }}>
      <div style={{ fontSize: 11, color: 'var(--fg-3)', marginBottom: 4 }}>{label}</div>
      <div style={{ border: '1px solid var(--border)', borderRadius: 7, padding: '8px 10px', fontSize: 13, background: 'var(--surface)' }}>{value}</div>
    </div>
  );
}

function Billing() {
  return (
    <div className="view-pad">
      <div className="page-head">
        <div><h1>Billing</h1><div className="desc">Pro plan · $49/mo · renews May 4</div></div>
        <button className="btn btn-sm">Manage plan</button>
      </div>
      <div className="dash-grid">
        <div className="kpi-card"><div className="kpi-label">This month</div><div className="kpi-value">$49.00</div><div className="kpi-delta up">+ $0 add-ons</div></div>
        <div className="kpi-card"><div className="kpi-label">AI generations</div><div className="kpi-value">2,184</div><div className="kpi-delta up">of 10,000</div></div>
        <div className="kpi-card"><div className="kpi-label">Storefront views</div><div className="kpi-value">38,492</div><div className="kpi-delta up">unlimited on Pro</div></div>
        <div className="kpi-card"><div className="kpi-label">Transaction fees</div><div className="kpi-value">$0</div><div className="kpi-delta up">0% Forge fee</div></div>
      </div>
    </div>
  );
}

window.FORGE_VIEWS = { Dashboard, Products, Orders, Customers, Marketing, Support, Analytics, Settings, Billing };
