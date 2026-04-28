import { STAGES } from '@/lib/builder/mock-data';

export function BuildStages({ active }: { active: number }) {
  return (
    <div className="build-stages">
      {STAGES.map((s, i) => {
        const state = i < active ? 'done' : i === active ? 'active' : 'queued';
        return (
          <div key={s.id} className="build-stage" data-state={state}>
            <span className={`stage-icon ${state}`}>
              {state === 'done' && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M2.5 6.5l2.5 2.5 4.5-5"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </span>
            <span>{s.label}</span>
          </div>
        );
      })}
    </div>
  );
}
