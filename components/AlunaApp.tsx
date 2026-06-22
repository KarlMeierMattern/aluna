"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { Background } from "@/components/Background";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { CycleRing } from "@/components/CycleRing";
import { HormoneCard } from "@/components/HormoneCard";
import { SymptomCells } from "@/components/SymptomCells";
import { CycleHistory } from "@/components/CycleHistory";
import { SettingsSheet } from "@/components/SettingsSheet";
import { DEFAULT_SYMPTOMS } from "@/lib/cycle/phases";
import {
  getCycleSnapshot,
  getFertileWindow,
  iso,
  particleMoodForPhase,
  today,
} from "@/lib/cycle/utils";
import { loadState, saveState, exportState, importState } from "@/lib/db/indexed";
import type { AlunaState } from "@/lib/db/types";
import { BC_TYPES } from "@/lib/cycle/bc";

export function AlunaApp() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const [state, setState] = useState<AlunaState | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [saveVisible, setSaveVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    loadState(userId).then((s) => {
      setState(s);
      const t = iso(today());
      setSelectedSymptoms(s.logs[t]?.symptoms ?? []);
      setLoading(false);
    });
  }, [userId]);

  const snapshot = useMemo(
    () =>
      state
        ? getCycleSnapshot(state.periodStart, state.cycleLen, state.bc)
        : null,
    [state]
  );

  const symptoms = useMemo(() => {
    if (!state) return [...DEFAULT_SYMPTOMS];
    return [
      ...DEFAULT_SYMPTOMS.filter((s) => !state.hiddenSymptoms.includes(s)),
      ...state.customSymptoms,
    ];
  }, [state]);

  const bg = snapshot?.phase
    ? {
        b1: snapshot.phase.b1,
        b2: snapshot.phase.b2,
        b3: snapshot.phase.b3,
        drift: snapshot.phase.drift,
      }
    : undefined;

  const mood = snapshot?.phaseKey
    ? particleMoodForPhase(snapshot.phaseKey)
    : "rising";

  const persist = useCallback(
    async (next: AlunaState) => {
      if (!userId) return;
      setState(next);
      await saveState(userId, next);
    },
    [userId]
  );

  async function handleSaveToday() {
    if (!state || !userId) return;
    const t = iso(today());
    const next = {
      ...state,
      logs: {
        ...state.logs,
        [t]: { ...(state.logs[t] || {}), symptoms: selectedSymptoms },
      },
    };
    await persist(next);
    setSaveVisible(true);
    setTimeout(() => setSaveVisible(false), 1800);
  }

  async function handleSettingsSave(patch: Partial<AlunaState>) {
    if (!state) return;
    await persist({ ...state, ...patch });
  }

  async function handleExport() {
    if (!userId) return;
    const json = await exportState(userId);
    const blob = new Blob([json], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `aluna-backup-${iso(today())}.json`;
    a.click();
  }

  async function handleImport() {
    if (!userId) return;
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const text = await file.text();
      const imported = await importState(userId, text);
      setState(imported);
      setSelectedSymptoms(imported.logs[iso(today())]?.symptoms ?? []);
    };
    input.click();
  }

  if (loading || !state || !snapshot) {
    return (
      <div className="wrap">
        <p style={{ opacity: 0.7, textAlign: "center", marginTop: 40 }}>Loading…</p>
      </div>
    );
  }

  const bc = BC_TYPES[state.bc] ?? BC_TYPES.none;
  const fertile = getFertileWindow(state.cycleLen);
  const showFertile =
    state.ttcMode && !bc.suppresses && snapshot.cycleDay !== null;

  return (
    <>
      <Background bg={bg} mood={mood} />
      <div className="wrap">
        <Header onSettings={() => setSheetOpen(true)} />
        <Hero snapshot={snapshot} />
        <CycleRing snapshot={snapshot} cycleLen={state.cycleLen} />
        <HormoneCard
          snapshot={snapshot}
          cycleLen={state.cycleLen}
          detail={state.detail}
          onToggleDetail={() => persist({ ...state, detail: !state.detail })}
        />
        {showFertile && (
          <>
            <h2 className="section-title">Fertile window</h2>
            <div className="info-card">
              <div className="ic-body">
                Estimated fertile days: <strong>day {fertile.startDay}</strong> to{" "}
                <strong>day {fertile.endDay}</strong> (ovulation ~day{" "}
                {fertile.ovulationDay}). Estimates only — not contraception.
              </div>
            </div>
          </>
        )}
        <h2 className="section-title">How are you feeling?</h2>
        <SymptomCells
          symptoms={symptoms}
          selected={selectedSymptoms}
          onChange={setSelectedSymptoms}
        />
        <div className="actions">
          <button className="btn btn-primary" onClick={handleSaveToday}>
            Save today
          </button>
          <button className="btn btn-ghost" onClick={() => setSheetOpen(true)}>
            Log period
          </button>
        </div>
        <div className={`save-note${saveVisible ? " show" : ""}`}>Saved ✓</div>
        <h2 className="section-title">This cycle</h2>
        <CycleHistory state={state} />
        <div className="actions" style={{ marginTop: 20 }}>
          <button className="btn btn-ghost" onClick={handleExport}>
            Export backup
          </button>
          <button className="btn btn-ghost" onClick={handleImport}>
            Import backup
          </button>
        </div>
        <p className="small">
          Aluna keeps your cycle data on this device. Sign in syncs your account
          only — not your logs. Phase and hormone information is general
          education, not medical advice. Export a backup regularly.
        </p>
      </div>
      <SettingsSheet
        open={sheetOpen}
        state={state}
        onClose={() => setSheetOpen(false)}
        onSave={handleSettingsSave}
      />
    </>
  );
}
