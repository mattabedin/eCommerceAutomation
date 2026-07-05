const STATS = [
  { num: '4 min', label: 'From idea to a\nstore that’s live' },
  { num: '8 in 10', label: 'Customer questions\nanswered for you' },
  { num: '3.4×', label: 'More visitors turned\ninto buyers' },
  { num: '$0', label: 'Taken from your\nsales, ever' },
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
