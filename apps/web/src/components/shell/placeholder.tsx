export function PhasePlaceholder({
  label,
  phase,
}: {
  label: string;
  phase: number;
}) {
  return (
    <div className="view-pad">
      <div className="page-head">
        <div>
          <h1>{label}</h1>
          <div className="desc">Implemented in Phase {phase}</div>
        </div>
      </div>
      <div className="panel">
        <div className="panel-head">
          <div className="panel-title">{label}</div>
          <div className="panel-sub">Scaffold</div>
        </div>
        <div style={{ padding: 24, fontSize: 12.5, color: 'var(--fg-3)' }}>
          This view is part of Phase {phase}. The shell, routing, and design tokens
          are wired; the feature implementation lands in a later phase.
        </div>
      </div>
    </div>
  );
}
