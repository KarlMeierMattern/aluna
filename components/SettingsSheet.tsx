"use client";

import { useEffect, useState } from "react";
import { BC_TYPES } from "@/lib/cycle/bc";
import { iso, today } from "@/lib/cycle/utils";
import type { AlunaState } from "@/lib/db/types";
import { DEFAULT_SYMPTOMS } from "@/lib/cycle/phases";

type Props = {
  open: boolean;
  state: AlunaState;
  onClose: () => void;
  onSave: (patch: Partial<AlunaState>) => void;
};

export function SettingsSheet({ open, state, onClose, onSave }: Props) {
  const [periodStart, setPeriodStart] = useState(state.periodStart ?? iso(today()));
  const [cycleLen, setCycleLen] = useState(state.cycleLen);
  const [bc, setBc] = useState(state.bc);
  const [ttcMode, setTtcMode] = useState(state.ttcMode);
  const [customSymptom, setCustomSymptom] = useState("");
  const [customSymptoms, setCustomSymptoms] = useState(state.customSymptoms);
  const [note, setNote] = useState("");

  useEffect(() => {
    if (open) {
      setPeriodStart(state.periodStart ?? iso(today()));
      setCycleLen(state.cycleLen);
      setBc(state.bc);
      setTtcMode(state.ttcMode);
      setCustomSymptoms(state.customSymptoms);
      setNote(state.logs[iso(today())]?.note ?? "");
    }
  }, [open, state]);

  if (!open) return null;

  function handleSave() {
    const todayKey = iso(today());
    const logs = { ...state.logs };
    if (periodStart) {
      logs[periodStart] = {
        ...(logs[periodStart] || { symptoms: [] }),
        period: true,
        note: logs[periodStart]?.note,
      };
    }
    if (note.trim()) {
      logs[todayKey] = {
        ...(logs[todayKey] || { symptoms: [] }),
        note: note.trim(),
      };
    }
    onSave({
      periodStart: periodStart || null,
      cycleLen,
      bc,
      ttcMode,
      customSymptoms,
      logs,
    });
    onClose();
  }

  function addCustomSymptom() {
    const s = customSymptom.trim();
    if (!s || customSymptoms.includes(s) || DEFAULT_SYMPTOMS.includes(s as never)) return;
    setCustomSymptoms([...customSymptoms, s]);
    setCustomSymptom("");
  }

  return (
    <div className="scrim open" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="sheet">
        <h3>Your cycle &amp; birth control</h3>
        <p>
          This sets the rhythm for your estimates — and your birth control changes
          how that rhythm works, so Aluna adjusts what it shows you.
        </p>
        <label htmlFor="dateIn">Last period start date</label>
        <input
          type="date"
          id="dateIn"
          value={periodStart}
          onChange={(e) => setPeriodStart(e.target.value)}
        />
        <label>Typical cycle length (days)</label>
        <div className="seg">
          {[24, 26, 28, 30, 32].map((len) => (
            <button
              key={len}
              className={cycleLen === len ? "sel" : ""}
              onClick={() => setCycleLen(len)}
            >
              {len}
            </button>
          ))}
        </div>
        <label>Birth control</label>
        <div className="bc-list">
          {Object.entries(BC_TYPES).map(([k, v]) => (
            <button
              key={k}
              className={`bc-opt${bc === k ? " sel" : ""}`}
              onClick={() => setBc(k)}
            >
              <div className="t">{v.t}</div>
              <div className="d">{v.d}</div>
            </button>
          ))}
        </div>
        <label>
          <input
            type="checkbox"
            checked={ttcMode}
            onChange={(e) => setTtcMode(e.target.checked)}
            style={{ marginRight: 8 }}
          />
          Trying to conceive mode (highlight fertile window)
        </label>
        <label htmlFor="noteIn">Today&apos;s note</label>
        <textarea
          id="noteIn"
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="How are you feeling in your own words?"
        />
        <label>Custom symptoms</label>
        <div className="seg">
          <input
            value={customSymptom}
            onChange={(e) => setCustomSymptom(e.target.value)}
            placeholder="Add symptom"
            onKeyDown={(e) => e.key === "Enter" && addCustomSymptom()}
          />
          <button className="btn btn-ghost" onClick={addCustomSymptom} style={{ flex: "0 0 auto" }}>
            Add
          </button>
        </div>
        {customSymptoms.length > 0 && (
          <p style={{ fontSize: 13, opacity: 0.8 }}>{customSymptoms.join(", ")}</p>
        )}
        <div className="actions" style={{ marginTop: 22 }}>
          <button className="btn btn-primary" onClick={handleSave}>
            Save
          </button>
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
