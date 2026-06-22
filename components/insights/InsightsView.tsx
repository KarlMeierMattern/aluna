"use client";

import { useMemo } from "react";
import type { AlunaState } from "@/lib/db/types";
import { buildInsights } from "@/lib/insights/analytics";
import { CycleLengthChart } from "./CycleLengthChart";
import { LogCalendar } from "./LogCalendar";
import { PastEntriesList } from "./PastEntriesList";
import { PhaseChart } from "./PhaseChart";
import { StatCards } from "./StatCards";
import { SymptomChart } from "./SymptomChart";

export function InsightsView({ state }: { state: AlunaState }) {
  const data = useMemo(() => buildInsights(state), [state]);

  return (
    <div className="insights">
      <h2 className="section-title">Overview</h2>
      <StatCards data={data} />

      <h2 className="section-title">Calendar</h2>
      <div className="info-card">
        <LogCalendar state={state} />
      </div>

      <div className="insights-grid">
        <h2 className="section-title">Symptom patterns</h2>
        <div className="info-card">
          <SymptomChart data={data.symptomCounts} />
        </div>

        <h2 className="section-title">By phase</h2>
        <div className="info-card">
          <PhaseChart data={data.phaseSymptomCounts} />
        </div>

        <h2 className="section-title">Cycle length</h2>
        <div className="info-card">
          <CycleLengthChart data={data.cycleLengths} />
        </div>
      </div>

      <h2 className="section-title insights-past-title">Past entries</h2>
      <PastEntriesList entries={data.entries} />
    </div>
  );
}
