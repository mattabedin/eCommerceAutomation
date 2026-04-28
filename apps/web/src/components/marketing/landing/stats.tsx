const STATS = [
  { num: '4m 12s', label: 'Median time to first\nstore live' },
  { num: '78%', label: 'Tickets auto-resolved\nby AI agents' },
  { num: '3.4×', label: 'Avg conversion vs\nShopify default' },
  { num: '$0', label: 'Forge transaction fees\non every plan' },
];

export function Stats() {
  return (
    <section
      className="band"
      style={{
        paddingTop: 60,
        paddingBottom: 60,
        borderTop: 'none',
      }}
    >
      <div className="stats">
        {STATS.map(s => (
          <div key={s.num} className="stat">
            <div className="stat-num">{s.num}</div>
            <div className="stat-label">
              {s.label.split('\n').map((line, i) => (
                <span key={i}>
                  {line}
                  {i === 0 && <br />}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
