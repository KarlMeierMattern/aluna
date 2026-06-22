"use client";

import { useState } from "react";

export function SymptomCells({
  symptoms,
  selected,
  onChange,
}: {
  symptoms: string[];
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  const [pulse, setPulse] = useState<string | null>(null);

  function toggle(s: string) {
    const next = selected.includes(s)
      ? selected.filter((x) => x !== s)
      : [...selected, s];
    onChange(next);
    setPulse(s);
    setTimeout(() => setPulse(null), 500);
  }

  return (
    <div className="cells">
      {symptoms.map((s) => (
        <button
          key={s}
          className={`cell${selected.includes(s) ? " on" : ""}${pulse === s ? " pulse" : ""}`}
          onClick={() => toggle(s)}
        >
          {s}
        </button>
      ))}
    </div>
  );
}
