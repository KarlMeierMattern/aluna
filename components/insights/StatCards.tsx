"use client";

import type { InsightsData } from "@/lib/insights/analytics";

export function StatCards({ data }: { data: InsightsData }) {
  return (
    <div className="stat-row">
      <div className="stat-card">
        <div className="stat-num">{data.totalLoggedDays}</div>
        <div className="stat-label">days logged</div>
      </div>
      <div className="stat-card">
        <div className="stat-num">{data.avgCycleLength ?? "—"}</div>
        <div className="stat-label">avg cycle (days)</div>
      </div>
      <div className="stat-card">
        <div className="stat-num">{data.avgPeriodLength ?? "—"}</div>
        <div className="stat-label">avg bleed (days)</div>
      </div>
    </div>
  );
}
