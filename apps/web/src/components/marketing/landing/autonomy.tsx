import Link from 'next/link';

type Row = {
  time: string;
  icon: string;
  title: string;
  sub: string;
  status: string;
  statusClass: 'done' | 'review' | 'live';
};

const ROWS: Row[] = [
  {
    time: '11:42 PM',
    icon: 'P',
    title: 'Pria · re-priced Cloud Bed +6%',
    sub: 'demand model: +$340/wk · competitor anchor: $129',
    status: 'applied',
    statusClass: 'done',
  },
  {
    time: '12:18 AM',
    icon: 'S',
    title: 'Soren · resolved 7 support tickets',
    sub: 'avg response 38s · 6 cited the return policy · 1 escalated',
    status: 'resolved',
    statusClass: 'done',
  },
  {
    time: '2:04 AM',
    icon: 'M',
    title: 'Maren · drafted "Father\'s Day" campaign',
    sub: 'subject: For dogs that deserve heirlooms · predicted +$1,200 revenue',
    status: 'awaiting review',
    statusClass: 'review',
  },
  {
    time: '3:31 AM',
    icon: 'O',
    title: 'Otto · published 3 SEO pages',
    sub: 'heirloom collar · brass leash · cloud bed · indexed in 22 min',
    status: 'live',
    statusClass: 'done',
  },
  {
    time: '5:09 AM',
    icon: 'I',
    title: 'Iris · drafted purchase order',
    sub: 'Cloud Bed velocity ↑ 22% · supplier lead 14 days · 80 units',
    status: 'awaiting review',
    statusClass: 'review',
  },
  {
    time: '6:47 AM',
    icon: 'P',
    title: 'Pria · weekend bundle live',
    sub: 'Collar + Leash · 12% off · forecast +$890 · expires Sun 11pm',
    status: 'live',
    statusClass: 'live',
  },
];

export function Autonomy() {
  return (
    <section className="autonomy">
      <div className="band-header">
        <div className="kicker">⊹ Last night, on Forge</div>
        <h2 className="section-title">
          What Forge did
          <br />
          <em>while you slept.</em>
        </h2>
        <p className="autonomy-lead">
          A real night on a real Forge store. Agents shipped, customers got
          served, money got made — and you wake up to a one-screen summary.
        </p>
      </div>
      <div className="autonomy-feed">
        <div className="autonomy-feed-head">
          <span>PawLuxe Co. · activity feed · last 8 hours</span>
          <span className="live-dot">live</span>
        </div>
        <div className="autonomy-feed-list">
          {ROWS.map((r, i) => (
            <div key={i} className="autonomy-row">
              <div className="autonomy-time">{r.time}</div>
              <div className="autonomy-icon">{r.icon}</div>
              <div className="autonomy-msg">
                <strong>{r.title}</strong>
                <span className="sub">{r.sub}</span>
              </div>
              <div className={`autonomy-status ${r.statusClass}`}>
                {r.status}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div
        style={{
          textAlign: 'center',
          marginTop: 40,
          position: 'relative',
        }}
      >
        <Link
          href="/signup"
          className="btn btn-lg"
          style={{
            background: 'white',
            color: '#0a0a0a',
            border: 'none',
          }}
        >
          See your activity feed →
        </Link>
      </div>
    </section>
  );
}
