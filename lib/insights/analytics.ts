import { phaseKeyFor, DAY_MS, iso } from "@/lib/cycle/utils";
import type { PhaseKey } from "@/lib/cycle/phases";
import type { AlunaState, DailyLog } from "@/lib/db/types";

export type LogEntry = {
  date: string;
  log: DailyLog;
  phase: PhaseKey | null;
  cycleDay: number | null;
};

export type SymptomCount = { symptom: string; count: number };

export type PhaseSymptomCount = {
  phase: PhaseKey;
  label: string;
  count: number;
};

export type CycleLengthPoint = {
  start: string;
  length: number;
};

export type MonthDay = {
  date: string;
  day: number;
  inMonth: boolean;
  logged: boolean;
  period: boolean;
};

export type InsightsData = {
  entries: LogEntry[];
  totalLoggedDays: number;
  symptomCounts: SymptomCount[];
  phaseSymptomCounts: PhaseSymptomCount[];
  cycleLengths: CycleLengthPoint[];
  avgCycleLength: number | null;
  avgPeriodLength: number | null;
};

const PHASE_LABELS: Record<PhaseKey, string> = {
  menstrual: "Resting",
  follicular: "Rising",
  ovulatory: "Peak",
  luteal: "Winding down",
};

function daysBetween(a: string, b: string): number {
  const ta = new Date(a + "T00:00:00").getTime();
  const tb = new Date(b + "T00:00:00").getTime();
  return Math.round((tb - ta) / DAY_MS);
}

export function getPeriodStarts(state: AlunaState): string[] {
  const fromLogs = Object.entries(state.logs)
    .filter(([, log]) => log.period)
    .map(([date]) => date);
  const set = new Set(fromLogs);
  if (state.periodStart) set.add(state.periodStart);
  return [...set].sort();
}

function periodAnchorForDate(date: string, starts: string[]): string | null {
  const before = starts.filter((s) => s <= date);
  return before.length ? before[before.length - 1] : null;
}

function cycleDayForDate(
  date: string,
  anchor: string,
  cycleLen: number
): number {
  const ds = daysBetween(anchor, date);
  if (ds < 0) return 1;
  return (ds % cycleLen) + 1;
}

export function buildInsights(state: AlunaState): InsightsData {
  const periodStarts = getPeriodStarts(state);
  const cycleLen = state.cycleLen;

  const entries: LogEntry[] = Object.entries(state.logs)
    .filter(([, log]) => log.symptoms?.length || log.note || log.period)
    .map(([date, log]) => {
      const anchor = periodAnchorForDate(date, periodStarts);
      let phase: PhaseKey | null = null;
      let cycleDay: number | null = null;
      if (anchor) {
        cycleDay = cycleDayForDate(date, anchor, cycleLen);
        phase = phaseKeyFor(cycleDay - 1, cycleLen);
      }
      return { date, log, phase, cycleDay };
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  const symptomMap = new Map<string, number>();
  const phaseMap = new Map<PhaseKey, number>();

  for (const entry of entries) {
    for (const s of entry.log.symptoms ?? []) {
      symptomMap.set(s, (symptomMap.get(s) ?? 0) + 1);
    }
    if (entry.phase && entry.log.symptoms?.length) {
      phaseMap.set(entry.phase, (phaseMap.get(entry.phase) ?? 0) + 1);
    }
  }

  const symptomCounts = [...symptomMap.entries()]
    .map(([symptom, count]) => ({ symptom, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const phaseSymptomCounts = (["menstrual", "follicular", "ovulatory", "luteal"] as PhaseKey[]).map(
    (phase) => ({
      phase,
      label: PHASE_LABELS[phase],
      count: phaseMap.get(phase) ?? 0,
    })
  );

  const cycleLengths: CycleLengthPoint[] = [];
  for (let i = 1; i < periodStarts.length; i++) {
    const length = daysBetween(periodStarts[i - 1], periodStarts[i]);
    if (length >= 18 && length <= 45) {
      cycleLengths.push({ start: periodStarts[i], length });
    }
  }

  const avgCycleLength =
    cycleLengths.length > 0
      ? Math.round(
          cycleLengths.reduce((s, c) => s + c.length, 0) / cycleLengths.length
        )
      : null;

  const periodLengths: number[] = [];
  for (let i = 0; i < periodStarts.length; i++) {
    const start = periodStarts[i];
    const nextStart = periodStarts[i + 1];
    let bleedDays = 0;
    const end = nextStart
      ? new Date(nextStart + "T00:00:00")
      : new Date(Date.now() + DAY_MS);
    for (
      let d = new Date(start + "T00:00:00");
      d < end;
      d = new Date(d.getTime() + DAY_MS)
    ) {
      const key = iso(d);
      if (state.logs[key]?.period) bleedDays++;
      else if (bleedDays > 0) break;
    }
    if (bleedDays === 0) bleedDays = 1;
    if (bleedDays <= 10) periodLengths.push(bleedDays);
  }

  const avgPeriodLength =
    periodLengths.length > 0
      ? Math.round(
          periodLengths.reduce((s, n) => s + n, 0) / periodLengths.length
        )
      : null;

  return {
    entries,
    totalLoggedDays: entries.length,
    symptomCounts,
    phaseSymptomCounts,
    cycleLengths: cycleLengths.slice(-6),
    avgCycleLength,
    avgPeriodLength,
  };
}

export function getMonthGrid(year: number, month: number, state: AlunaState): MonthDay[] {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startPad = (first.getDay() + 6) % 7;
  const days: MonthDay[] = [];

  for (let i = 0; i < startPad; i++) {
    days.push({ date: "", day: 0, inMonth: false, logged: false, period: false });
  }

  for (let d = 1; d <= last.getDate(); d++) {
    const date = iso(new Date(year, month, d));
    const log = state.logs[date];
    days.push({
      date,
      day: d,
      inMonth: true,
      logged: !!(log?.symptoms?.length || log?.note),
      period: !!log?.period,
    });
  }

  return days;
}

export function formatEntryDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
