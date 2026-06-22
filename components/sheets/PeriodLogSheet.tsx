"use client";

import { useEffect, useState } from "react";
import { iso, today } from "@/lib/cycle/utils";
import { SheetShell } from "./SheetShell";

type Props = {
  open: boolean;
  periodStart: string | null;
  onClose: () => void;
  onSave: (periodStart: string) => Promise<void>;
};

export function PeriodLogSheet({ open, periodStart, onClose, onSave }: Props) {
  const [date, setDate] = useState(periodStart ?? iso(today()));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setDate(periodStart ?? iso(today()));
  }, [open, periodStart]);

  async function save(d: string) {
    setSaving(true);
    await onSave(d);
    setSaving(false);
    onClose();
  }

  return (
    <SheetShell
      open={open}
      title="Log period"
      subtitle="When did bleeding start? This resets your cycle day count."
      onClose={onClose}
      footer={
        <div className="actions sheet-actions">
          <button
            type="button"
            className="btn btn-primary"
            disabled={saving}
            onClick={() => save(date)}
          >
            {saving ? "Saving…" : "Save"}
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => save(iso(today()))}
            disabled={saving}
          >
            Started today
          </button>
        </div>
      }
    >
      <label htmlFor="periodDate">First day of bleeding</label>
      <input
        id="periodDate"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />
    </SheetShell>
  );
}
