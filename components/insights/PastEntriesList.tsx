"use client";

import { useMemo, useState } from "react";
import type { LogEntry } from "@/lib/insights/analytics";
import { formatEntryDate } from "@/lib/insights/analytics";

const PHASE_LABELS: Record<string, string> = {
  menstrual: "Resting",
  follicular: "Rising",
  ovulatory: "Peak",
  luteal: "Winding down",
};

export function PastEntriesList({ entries }: { entries: LogEntry[] }) {
  const months = useMemo(() => {
    const set = new Set<string>();
    for (const e of entries) {
      set.add(e.date.slice(0, 7));
    }
    return [...set].sort().reverse();
  }, [entries]);

  const [filter, setFilter] = useState<string | "all">("all");

  const filtered =
    filter === "all"
      ? entries
      : entries.filter((e) => e.date.startsWith(filter));

  if (!entries.length) {
    return (
      <p className="chart-empty">No past entries yet — save a day from the home screen.</p>
    );
  }

  return (
    <div className="past-entries">
      <div className="entry-filters">
        <button
          type="button"
          className={filter === "all" ? "sel" : ""}
          onClick={() => setFilter("all")}
        >
          All
        </button>
        {months.slice(0, 6).map((m) => {
          const label = new Date(m + "-01T12:00:00").toLocaleDateString(undefined, {
            month: "short",
            year: "numeric",
          });
          return (
            <button
              key={m}
              type="button"
              className={filter === m ? "sel" : ""}
              onClick={() => setFilter(m)}
            >
              {label}
            </button>
          );
        })}
      </div>
      <ul className="entry-list">
        {filtered.map((entry) => (
          <li key={entry.date} className="entry-card">
            <div className="entry-head">
              <span className="entry-date">{formatEntryDate(entry.date)}</span>
              {entry.log.period && <span className="entry-badge">Period</span>}
              {entry.phase && (
                <span className="entry-phase">{PHASE_LABELS[entry.phase]}</span>
              )}
            </div>
            {entry.log.symptoms?.length > 0 && (
              <div className="entry-symptoms">
                {entry.log.symptoms.map((s) => (
                  <span key={s} className="entry-tag">
                    {s}
                  </span>
                ))}
              </div>
            )}
            {entry.log.note && <p className="entry-note">{entry.log.note}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}
