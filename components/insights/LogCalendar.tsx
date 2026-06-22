"use client";

import { useMemo, useState } from "react";
import type { AlunaState } from "@/lib/db/types";
import { getMonthGrid } from "@/lib/insights/analytics";

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];

export function LogCalendar({ state }: { state: AlunaState }) {
  const now = new Date();
  const [offset, setOffset] = useState(0);

  const { year, month, label } = useMemo(() => {
    const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    return {
      year: d.getFullYear(),
      month: d.getMonth(),
      label: d.toLocaleDateString(undefined, { month: "long", year: "numeric" }),
    };
  }, [offset, now]);

  const days = getMonthGrid(year, month, state);

  return (
    <div className="log-calendar">
      <div className="cal-nav">
        <button type="button" onClick={() => setOffset((o) => o - 1)} aria-label="Previous month">
          ←
        </button>
        <span>{label}</span>
        <button
          type="button"
          onClick={() => setOffset((o) => o + 1)}
          disabled={offset >= 0}
          aria-label="Next month"
        >
          →
        </button>
      </div>
      <div className="cal-weekdays">
        {WEEKDAYS.map((w, i) => (
          <span key={i}>{w}</span>
        ))}
      </div>
      <div className="cal-grid">
        {days.map((cell, i) => (
          <div
            key={i}
            className={`cal-cell${cell.inMonth ? "" : " empty"}${cell.period ? " period" : ""}${cell.logged ? " logged" : ""}`}
          >
            {cell.inMonth ? cell.day : ""}
          </div>
        ))}
      </div>
      <div className="cal-legend">
        <span><i className="dot period" /> period</span>
        <span><i className="dot logged" /> logged</span>
      </div>
    </div>
  );
}
