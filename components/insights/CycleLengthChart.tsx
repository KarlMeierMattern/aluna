import type { CycleLengthPoint } from "@/lib/insights/analytics";

export function CycleLengthChart({ data }: { data: CycleLengthPoint[] }) {
  if (data.length < 2) {
    return (
      <p className="chart-empty">
        Log two or more period starts to see cycle length trends.
      </p>
    );
  }

  const max = Math.max(...data.map((d) => d.length));
  const min = Math.min(...data.map((d) => d.length));

  return (
    <div className="cycle-chart" role="img" aria-label="Cycle length trend">
      {data.map((row) => {
        const d = new Date(row.start + "T12:00:00");
        const label = d.toLocaleDateString(undefined, { month: "short", year: "2-digit" });
        return (
          <div key={row.start} className="cycle-col">
            <div className="cycle-bar-wrap">
              <div
                className="cycle-bar"
                style={{ height: `${(row.length / max) * 100}%` }}
              />
            </div>
            <span className="cycle-bar-val">{row.length}d</span>
            <span className="cycle-bar-label">{label}</span>
          </div>
        );
      })}
      <p className="chart-caption">
        Range {min}–{max} days · estimates from logged period starts
      </p>
    </div>
  );
}
