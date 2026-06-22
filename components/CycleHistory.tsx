import { DAY_MS, iso, today } from "@/lib/cycle/utils";
import type { AlunaState } from "@/lib/db/types";

export function CycleHistory({ state }: { state: AlunaState }) {
  if (!state.periodStart) {
    return (
      <span style={{ fontSize: "12.5px", opacity: 0.6 }}>
        Your logged days will appear here.
      </span>
    );
  }

  const start = new Date(state.periodStart + "T00:00:00");
  const days: React.ReactNode[] = [];

  for (let i = 0; i < state.cycleLen; i++) {
    const d = new Date(start.getTime() + i * DAY_MS);
    if (d > today()) break;
    const key = iso(d);
    const log = state.logs[key];
    let cls = "hist-day";
    if (log?.period) cls += " period";
    else if (log?.symptoms?.length) cls += " logged";
    days.push(
      <div key={key} className={cls}>
        {d.getDate()}
      </div>
    );
  }

  return <div className="history">{days}</div>;
}
