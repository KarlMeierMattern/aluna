import type { CycleSnapshot } from "@/lib/cycle/utils";

export function Hero({ snapshot }: { snapshot: CycleSnapshot }) {
  const { phase, cycleDay, daysToNext, bcSuppresses, bcNote } = snapshot;
  const dimmed = bcSuppresses && phase !== null;

  if (!phase || cycleDay === null) {
    return (
      <section className="hero">
        <div className="glass-shimmer" />
        <div className="phase-eyebrow">welcome</div>
        <div className="phase-name">Set up to begin</div>
        <div className="phase-desc">
          Log your last period start to see your phase, countdown, and hormone
          insights.
        </div>
      </section>
    );
  }

  return (
    <section className={`hero${dimmed ? " dimmed" : ""}`}>
      <div className="glass-shimmer" />
      <div className="day-dot">
        <div className="n">{cycleDay}</div>
        <div className="l">day</div>
      </div>
      <div className="phase-eyebrow">{phase.eyebrow}</div>
      <div className="phase-name">{phase.name}</div>
      <div className="phase-desc">{phase.desc}</div>
      {daysToNext !== null && (
        <div className="countdown">
          <div className="cd-num">{daysToNext}</div>
          <div className="cd-label">
            {daysToNext === 1 ? "day" : "days"} until next bleed (est.)
          </div>
        </div>
      )}
      {bcSuppresses && bcNote && (
        <div className="bc-caveat show">☾ {bcNote}</div>
      )}
    </section>
  );
}
