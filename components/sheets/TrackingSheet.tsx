"use client";

import { useEffect, useState } from "react";
import { DEFAULT_SYMPTOMS } from "@/lib/cycle/phases";
import type { AlunaState } from "@/lib/db/types";
import { SheetShell } from "./SheetShell";

type Props = {
  open: boolean;
  state: AlunaState;
  onClose: () => void;
  onBack: () => void;
  onSave: (customSymptoms: string[]) => Promise<void>;
};

export function TrackingSheet({ open, state, onClose, onBack, onSave }: Props) {
  const [customSymptoms, setCustomSymptoms] = useState(state.customSymptoms);
  const [input, setInput] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setCustomSymptoms(state.customSymptoms);
  }, [open, state.customSymptoms]);

  function add() {
    const s = input.trim();
    if (!s || customSymptoms.includes(s) || DEFAULT_SYMPTOMS.includes(s as never))
      return;
    setCustomSymptoms([...customSymptoms, s]);
    setInput("");
  }

  function remove(s: string) {
    setCustomSymptoms(customSymptoms.filter((x) => x !== s));
  }

  async function handleSave() {
    setSaving(true);
    await onSave(customSymptoms);
    setSaving(false);
    onClose();
  }

  return (
    <SheetShell
      open={open}
      title="Custom symptoms"
      subtitle="Added tags appear alongside the defaults on your daily log."
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
      <label htmlFor="symptomIn">Add a symptom</label>
      <div className="seg">
        <input
          id="symptomIn"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. Nauseous"
          onKeyDown={(e) => e.key === "Enter" && add()}
        />
        <button type="button" className="btn btn-ghost" onClick={add} style={{ flex: "0 0 auto" }}>
          Add
        </button>
      </div>
      {customSymptoms.length > 0 && (
        <ul className="tag-list">
          {customSymptoms.map((s) => (
            <li key={s}>
              <span>{s}</span>
              <button type="button" onClick={() => remove(s)} aria-label={`Remove ${s}`}>
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </SheetShell>
  );
}
