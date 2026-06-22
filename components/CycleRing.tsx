import type { CycleSnapshot } from "@/lib/cycle/utils";

export function CycleRing({
  snapshot,
  cycleLen,
}: {
  snapshot: CycleSnapshot;
  cycleLen: number;
}) {
  const len = cycleLen;
  const dayInCycle = snapshot.dayInCycle;
  const cx = 110;
  const cy = 110;
  const r = 86;

  const phases = [
    { s: 0, e: 5, c: "var(--wine)" },
    { s: 5, e: len - 16, c: "var(--sage)" },
    { s: len - 16, e: len - 12, c: "var(--gold)" },
    { s: len - 12, e: len, c: "var(--rust)" },
  ];

  const arcs = phases.map((ph, i) => {
    const a0 = (ph.s / len) * 2 * Math.PI - Math.PI / 2;
    const a1 = (ph.e / len) * 2 * Math.PI - Math.PI / 2;
    const x0 = cx + r * Math.cos(a0);
    const y0 = cy + r * Math.sin(a0);
    const x1 = cx + r * Math.cos(a1);
    const y1 = cy + r * Math.sin(a1);
    const lg = (ph.e - ph.s) / len > 0.5 ? 1 : 0;
    return (
      <path
        key={i}
        d={`M${x0} ${y0} A${r} ${r} 0 ${lg} 1 ${x1} ${y1}`}
        fill="none"
        stroke={ph.c}
        strokeWidth="14"
        strokeLinecap="round"
        opacity="0.9"
      />
    );
  });

  let marker = null;
  let centerText = null;

  if (dayInCycle !== null && snapshot.cycleDay !== null) {
    const a = (dayInCycle / len) * 2 * Math.PI - Math.PI / 2;
    const mx = cx + r * Math.cos(a);
    const my = cy + r * Math.sin(a);
    marker = <circle cx={mx} cy={my} r="11" fill="var(--cream)" />;
    centerText = (
      <>
        <text
          x={cx}
          y={cy - 4}
          textAnchor="middle"
          fontFamily="var(--font-d)"
          fontStyle="italic"
          fontSize="30"
          fill="var(--cream)"
        >
          {snapshot.cycleDay}
        </text>
        <text
          x={cx}
          y={cy + 18}
          textAnchor="middle"
          fontSize="11"
          letterSpacing="2"
          fill="var(--cream)"
          opacity="0.7"
        >
          DAY
        </text>
      </>
    );
  } else {
    centerText = (
      <text
        x={cx}
        y={cy + 6}
        textAnchor="middle"
        fontFamily="var(--font-d)"
        fontStyle="italic"
        fontSize="18"
        fill="var(--cream)"
        opacity="0.7"
      >
        set up to begin
      </text>
    );
  }

  return (
    <div className="ring-card">
      <svg className="ring" viewBox="0 0 220 220" aria-hidden="true">
        {arcs}
        {marker}
        {centerText}
      </svg>
    </div>
  );
}
