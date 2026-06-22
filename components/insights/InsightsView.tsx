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

function InsightBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="insight-block">
      <h2 className="section-title">{title}</h2>
      <div className="info-card">{children}</div>
    </section>
  );
}

export function InsightsView({ state }: { state: AlunaState }) {
  const data = useMemo(() => buildInsights(state), [state]);

  return (
    <div className="insights">
      <section className="insight-block insight-block-full">
        <h2 className="section-title">Overview</h2>
        <StatCards data={data} />
      </section>

      <section className="insight-block insight-block-full">
        <h2 className="section-title">Calendar</h2>
        <div className="info-card">
          <LogCalendar state={state} />
        </div>
      </section>

      <div className="insights-charts">
        <InsightBlock title="Symptom patterns">
          <SymptomChart data={data.symptomCounts} />
        </InsightBlock>
        <InsightBlock title="By phase">
          <PhaseChart data={data.phaseSymptomCounts} />
        </InsightBlock>
        <InsightBlock title="Cycle length">
          <CycleLengthChart data={data.cycleLengths} />
        </InsightBlock>
      </div>

      <section className="insight-block insight-block-full">
        <h2 className="section-title">Past entries</h2>
        <PastEntriesList entries={data.entries} />
      </section>
    </div>
  );
}
