import type { SymptomCount } from "@/lib/insights/analytics";

export function SymptomChart({ data }: { data: SymptomCount[] }) {
  if (!data.length) {
    return <p className="chart-empty">Log symptoms to see patterns here.</p>;
  }

  const max = data[0].count;

  return (
    <div className="bar-chart" role="img" aria-label="Symptom frequency chart">
      {data.map((row) => (
        <div key={row.symptom} className="bar-row">
          <span className="bar-label">{row.symptom}</span>
          <div className="bar-track">
            <div
              className="bar-fill"
              style={{ width: `${(row.count / max) * 100}%` }}
            />
          </div>
          <span className="bar-val">{row.count}</span>
        </div>
      ))}
    </div>
  );
}
