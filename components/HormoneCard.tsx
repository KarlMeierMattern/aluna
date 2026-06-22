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
        <button type="button" className="toggle" onClick={onToggleDetail}>
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
            <div className={`ic-detail${detail ? " show" : ""}`}>
              <h4>What you&apos;ll see</h4>
              <ul>
                <li>Your current cycle phase and day count</li>
                <li>Estrogen and progesterone level indicators</li>
                <li>Phase-specific guidance for where you are</li>
              </ul>
              <h4>Get started</h4>
              <ul>
                <li>Open settings (☾) and log when your last period started</li>
                <li>Adjust cycle length in settings if yours isn&apos;t ~28 days</li>
              </ul>
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
