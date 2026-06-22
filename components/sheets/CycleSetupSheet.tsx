"use client";

import { useEffect, useState } from "react";
import { BC_TYPES } from "@/lib/cycle/bc";
import { iso, today } from "@/lib/cycle/utils";
import type { AlunaState } from "@/lib/db/types";
import { SheetShell } from "./SheetShell";

type Props = {
  open: boolean;
  state: AlunaState;
  onClose: () => void;
  onBack: () => void;
  onSave: (patch: Partial<AlunaState>) => Promise<void>;
};

export function CycleSetupSheet({ open, state, onClose, onBack, onSave }: Props) {
  const [periodStart, setPeriodStart] = useState(state.periodStart ?? iso(today()));
  const [cycleLen, setCycleLen] = useState(state.cycleLen);
  const [bc, setBc] = useState(state.bc);
  const [ttcMode, setTtcMode] = useState(state.ttcMode);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setPeriodStart(state.periodStart ?? iso(today()));
    setCycleLen(state.cycleLen);
    setBc(state.bc);
    setTtcMode(state.ttcMode);
  }, [open, state]);

  async function handleSave() {
    setSaving(true);
    const logs = { ...state.logs };
    if (periodStart) {
      logs[periodStart] = {
        ...(logs[periodStart] || { symptoms: [] }),
        period: true,
      };
    }
    await onSave({
      periodStart: periodStart || null,
      cycleLen,
      bc,
      ttcMode,
      logs,
    });
    setSaving(false);
    onClose();
  }

  return (
    <SheetShell
      open={open}
      title="Cycle & birth control"
      subtitle="Aluna uses this for phase estimates. Hormonal BC may pause your natural cycle."
      onClose={onClose}
      onBack={onBack}
      footer={
        <div className="actions sheet-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      }
    >
      <label htmlFor="cyclePeriod">Last period start</label>
      <input
        id="cyclePeriod"
        type="date"
        value={periodStart}
        onChange={(e) => setPeriodStart(e.target.value)}
      />
      <label>Typical cycle length</label>
      <div className="seg">
        {[24, 26, 28, 30, 32].map((len) => (
          <button
            key={len}
            type="button"
            className={cycleLen === len ? "sel" : ""}
            onClick={() => setCycleLen(len)}
          >
            {len}d
          </button>
        ))}
      </div>
      <label>Birth control method</label>
      <div className="bc-list">
        {Object.entries(BC_TYPES).map(([k, v]) => (
          <button
            key={k}
            type="button"
            className={`bc-opt${bc === k ? " sel" : ""}`}
            onClick={() => setBc(k)}
          >
            <div className="t">{v.t}</div>
            <div className="d">{v.d}</div>
          </button>
        ))}
      </div>
      <label className="check">
        <input
          type="checkbox"
          checked={ttcMode}
          onChange={(e) => setTtcMode(e.target.checked)}
        />
        Trying to conceive — show fertile window on home
      </label>
    </SheetShell>
  );
}
