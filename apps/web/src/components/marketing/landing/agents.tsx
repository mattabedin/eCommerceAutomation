type Agent = {
  letter: string;
  name: string;
  role: string;
  desc: string;
  status: string;
  cardColor: string;
  cardSoft: string;
};

const AGENTS: Agent[] = [
  {
    letter: 'P',
    name: 'Pria',
    role: 'Pricing',
    desc: 'Models demand and competitor anchors. Adjusts weekly and shows the math behind every move.',
    status: 'Live · +$340/wk avg lift',
    cardColor: '#6366F1',
    cardSoft: '#eef2ff',
  },
  {
    letter: 'S',
    name: 'Soren',
    role: 'Support',
    desc: 'Auto-resolves 78% of tickets in under 90 seconds. Cites your policies. Escalates the rest.',
    status: 'Live · 94% confidence',
    cardColor: '#16a34a',
    cardSoft: '#dcfce7',
  },
  {
    letter: 'M',
    name: 'Maren',
    role: 'Marketing',
    desc: 'Writes campaigns, segments lists, schedules sends. Predicts open rate and revenue per email.',
    status: 'Live · 42% avg open',
    cardColor: '#a855f7',
    cardSoft: '#f3e8ff',
  },
  {
    letter: 'O',
    name: 'Otto',
    role: 'SEO',
    desc: 'Drafts product pages, meta tags, schema, and blog content tuned to keywords that actually convert.',
    status: 'Live · 12 pages indexed',
    cardColor: '#d97706',
    cardSoft: '#fef3c7',
  },
  {
    letter: 'I',
    name: 'Iris',
    role: 'Inventory',
    desc: 'Tracks velocity, lead times, and seasonality. Drafts purchase orders to suppliers before stockouts.',
    status: 'Live · 2 PO drafts ready',
    cardColor: '#e11d48',
    cardSoft: '#ffe4e6',
  },
];

export function Agents() {
  return (
    <section className="agents-band" id="agents">
      <div className="band-header">
        <div className="kicker">⊹ Meet your AI team</div>
        <h2 className="section-title">
          Five teammates.
          <br />
          <em>One always-on storefront.</em>
        </h2>
        <p className="lead" style={{ margin: '18px auto 0', fontSize: 16 }}>
          Each agent has a name, a role, and a track record. They show their
          math, wait for approval where it matters, and log every move to an
          audit trail you can roll back.
        </p>
      </div>
      <div className="agents-grid">
        {AGENTS.map(a => (
          <div
            key={a.name}
            className="agent-card"
            style={
              {
                '--card-color': a.cardColor,
                '--card-soft': a.cardSoft,
              } as React.CSSProperties
            }
          >
            <div className="agent-avatar">{a.letter}</div>
            <div className="agent-name">{a.name}</div>
            <div className="agent-role">{a.role}</div>
            <p>{a.desc}</p>
            <div className="agent-status">
              <span className="pulse" />
              {a.status}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
