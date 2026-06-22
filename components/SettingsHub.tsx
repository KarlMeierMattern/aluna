"use client";

import { useEffect, useState } from "react";
import type { AlunaState, NotifPrefs } from "@/lib/db/types";
import { CycleSetupSheet } from "./sheets/CycleSetupSheet";
import { PartnerShareSheet } from "./sheets/PartnerShareSheet";
import { PeriodLogSheet } from "./sheets/PeriodLogSheet";
import { RemindersSheet } from "./sheets/RemindersSheet";
import { SettingsMenu } from "./sheets/SettingsMenu";
import { SheetShell } from "./sheets/SheetShell";
import { TrackingSheet } from "./sheets/TrackingSheet";

export type SheetView =
  | "menu"
  | "period"
  | "cycle"
  | "reminders"
  | "partner"
  | "tracking";

type Props = {
  view: SheetView | null;
  state: AlunaState;
  onClose: () => void;
  onSave: (patch: Partial<AlunaState>) => Promise<void>;
  onExport: () => void;
  onImport: () => void;
};

export function SettingsHub({
  view,
  state,
  onClose,
  onSave,
  onExport,
  onImport,
}: Props) {
  const [stack, setStack] = useState<SheetView>("menu");
  const open = view !== null;

  useEffect(() => {
    if (view) setStack(view);
  }, [view]);

  function closeAll() {
    setStack("menu");
    onClose();
  }

  function goMenu() {
    setStack("menu");
  }

  async function savePeriod(periodStart: string) {
    const logs = { ...state.logs };
    logs[periodStart] = {
      ...(logs[periodStart] || { symptoms: [] }),
      period: true,
    };
    await onSave({ periodStart, logs });
  }

  async function savePrefs(prefs: NotifPrefs) {
    await onSave({ notifPrefs: prefs });
  }

  return (
    <>
      <SheetShell
        open={open && stack === "menu"}
        title="Settings"
        subtitle="Each section does one thing — your logs always stay on this device."
        onClose={closeAll}
      >
        <SettingsMenu
          onSelect={(id) => setStack(id as SheetView)}
          onExport={() => {
            onExport();
            closeAll();
          }}
          onImport={() => {
            onImport();
            closeAll();
          }}
        />
      </SheetShell>

      <PeriodLogSheet
        open={open && stack === "period"}
        periodStart={state.periodStart}
        onClose={closeAll}
        onSave={savePeriod}
      />

      <CycleSetupSheet
        open={open && stack === "cycle"}
        state={state}
        onClose={closeAll}
        onBack={goMenu}
        onSave={onSave}
      />

      <RemindersSheet
        open={open && stack === "reminders"}
        state={state}
        onClose={closeAll}
        onBack={goMenu}
        onSavePrefs={savePrefs}
        onOpenCycle={() => setStack("cycle")}
      />

      <PartnerShareSheet
        open={open && stack === "partner"}
        state={state}
        onClose={closeAll}
        onBack={goMenu}
      />

      <TrackingSheet
        open={open && stack === "tracking"}
        state={state}
        onClose={closeAll}
        onBack={goMenu}
        onSave={(customSymptoms) => onSave({ customSymptoms })}
      />
    </>
  );
}
