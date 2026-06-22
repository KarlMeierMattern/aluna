import type { CycleSnapshot } from "@/lib/cycle/utils";

export function HormoneCard({
  snapshot,
  cycleLen,
  detail,
  onToggleDetail,
}: {
  snapshot: CycleSnapshot;
  cycleLen: number;
  detail: boolean;
  onToggleDetail: () => void;
}) {
  const { phase, cycleDay } = snapshot;

  return (
    <>
      <h2 className="section-title">
        Your hormones now
        <button className="toggle" onClick={onToggleDetail}>
          {detail ? "Brief" : "Detailed"}
        </button>
      </h2>
      <div className="info-card">
        {!phase || cycleDay === null ? (
          <>
            <div className="ic-phase">Set up to see your hormones</div>
            <div className="ic-days" />
            <div className="ic-body">
              Once you log your last period, Aluna shows what estrogen and
              progesterone are doing right now.
            </div>
          </>
        ) : (
          <>
            <div className="ic-phase">
              {phase.name} — {phase.eyebrow}
            </div>
            <div className="ic-days">
              Day {cycleDay} of ~{cycleLen}
            </div>
            <div className="hormone-row">
              <div className="hbar">
                <div className="hname">Estrogen</div>
                <div className="htrack">
                  <div
                    className="hfill"
                    style={{
                      width: `${phase.e}%`,
                      background:
                        "linear-gradient(90deg,var(--gold),var(--amber))",
                    }}
                  />
                </div>
              </div>
              <div className="hbar">
                <div className="hname">Progesterone</div>
                <div className="htrack">
                  <div
                    className="hfill"
                    style={{
                      width: `${phase.p}%`,
                      background:
                        "linear-gradient(90deg,var(--berry),var(--wine))",
                    }}
                  />
                </div>
              </div>
            </div>
            <div
              className="ic-body"
              dangerouslySetInnerHTML={{ __html: phase.brief }}
            />
            <div className={`ic-detail${detail ? " show" : ""}`}>
              <h4>What you might notice</h4>
              <ul>
                {phase.expect.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
              <h4>Gentle support</h4>
              <ul>
                {phase.tips.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
    </>
  );
}
