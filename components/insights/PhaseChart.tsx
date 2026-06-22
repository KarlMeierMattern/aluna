import type { PhaseSymptomCount } from "@/lib/insights/analytics";

const COLORS: Record<string, string> = {
  menstrual: "var(--wine)",
  follicular: "var(--sage)",
  ovulatory: "var(--gold)",
  luteal: "var(--rust)",
};

export function PhaseChart({ data }: { data: PhaseSymptomCount[] }) {
  const total = data.reduce((s, d) => s + d.count, 0);
  if (!total) {
    return (
      <p className="chart-empty">Symptom logs will show which phases feel hardest.</p>
    );
  }

  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="phase-chart" role="img" aria-label="Symptoms by phase">
      {data.map((row) => (
        <div key={row.phase} className="phase-col">
          <div className="phase-bar-wrap">
            <div
              className="phase-bar"
              style={{
                height: `${(row.count / max) * 100}%`,
                background: COLORS[row.phase],
              }}
            />
          </div>
          <span className="phase-bar-label">{row.label}</span>
          <span className="phase-bar-val">{row.count}</span>
        </div>
      ))}
    </div>
  );
}
