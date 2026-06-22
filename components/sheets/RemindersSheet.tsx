"use client";

import { useEffect, useState } from "react";
import type { AlunaState, NotifPrefs } from "@/lib/db/types";
import {
  hasPushSubscription,
  pushSupported,
  subscribeToPush,
  updatePushPrefs,
} from "@/lib/push/client";
import { syncReminderSchedule } from "@/lib/sync/client";
import { SheetShell } from "./SheetShell";

type Props = {
  open: boolean;
  state: AlunaState;
  onClose: () => void;
  onBack: () => void;
  onSavePrefs: (prefs: NotifPrefs) => Promise<void>;
  onOpenCycle: () => void;
};

export function RemindersSheet({
  open,
  state,
  onClose,
  onBack,
  onSavePrefs,
  onOpenCycle,
}: Props) {
  const [prefs, setPrefs] = useState(state.notifPrefs);
  const [enabled, setEnabled] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setPrefs(state.notifPrefs);
    setMsg(null);
    hasPushSubscription().then(setEnabled);
  }, [open, state.notifPrefs]);

  async function enable() {
    setMsg(null);
    const result = await subscribeToPush(prefs);
    if (result.ok) {
      setEnabled(true);
      setMsg("Reminders turned on for this device.");
      await onSavePrefs(prefs);
      await syncReminderSchedule({ ...state, notifPrefs: prefs });
    } else {
      setMsg(result.error);
    }
  }

  async function updatePrefs(next: NotifPrefs) {
    setPrefs(next);
    await onSavePrefs(next);
    if (!enabled) return;
    const result = await updatePushPrefs(next);
    setMsg(result.ok ? "Updated." : result.error);
  }

  const supported = pushSupported();
  const hasCycle = !!state.periodStart;

  return (
    <SheetShell
      open={open}
      title="Reminders"
      subtitle="Optional push alerts. On iPhone, install Aluna to your Home Screen first."
      onClose={onClose}
      onBack={onBack}
    >
      {!hasCycle ? (
        <div className="sheet-callout">
          <p>
            Period and fertile alerts are based on your cycle settings — log a
            period first.
          </p>
          <button type="button" className="sheet-link" onClick={onOpenCycle}>
            Set up cycle →
          </button>
        </div>
      ) : (
        <p className="sheet-hint">
          Schedules use your cycle settings.{" "}
          <button type="button" className="sheet-link inline" onClick={onOpenCycle}>
            Edit cycle
          </button>
        </p>
      )}
      {!supported && (
        <p className="sheet-hint">This browser does not support push notifications.</p>
      )}
      {supported && (
        <>
          <label>Notify me before my period</label>
          <div className="seg">
            {[0, 1, 2, 3].map((n) => (
              <button
                key={n}
                type="button"
                className={prefs.periodDaysBefore === n ? "sel" : ""}
                onClick={() =>
                  updatePrefs({ ...prefs, periodDaysBefore: n })
                }
              >
                {n === 0 ? "Off" : `${n}d`}
              </button>
            ))}
          </div>
          <label className="check">
            <input
              type="checkbox"
              checked={prefs.fertileAlert}
              onChange={(e) =>
                updatePrefs({ ...prefs, fertileAlert: e.target.checked })
              }
            />
            Alert when fertile window starts
          </label>
          <label className="check">
            <input
              type="checkbox"
              checked={prefs.dailyNudge}
              onChange={(e) =>
                updatePrefs({ ...prefs, dailyNudge: e.target.checked })
              }
            />
            Daily nudge to log how I feel
          </label>
          {!enabled ? (
            <button
              type="button"
              className="btn btn-primary sheet-full-btn"
              onClick={enable}
            >
              Turn on notifications
            </button>
          ) : (
            <p className="sheet-hint ok">Active on this device</p>
          )}
          {msg && <p className="sheet-hint">{msg}</p>}
        </>
      )}
    </SheetShell>
  );
}
