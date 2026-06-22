import type { PhaseKey } from "./phases";
import { BC_TYPES } from "./bc";
import { PHASES } from "./phases";

export const DAY_MS = 86400000;

export function iso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function today(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function daysSince(periodStart: string | null): number | null {
  if (!periodStart) return null;
  return Math.floor(
    (today().getTime() - new Date(periodStart + "T00:00:00").getTime()) / DAY_MS
  );
}

export function phaseKeyFor(dayInCycle: number, len: number): PhaseKey {
  const d = ((dayInCycle % len) + len) % len + 1;
  const ovu = len - 14;
  if (d <= 5) return "menstrual";
  if (d <= ovu - 2) return "follicular";
  if (d <= ovu + 2) return "ovulatory";
  return "luteal";
}

export type CycleSnapshot = {
  dayInCycle: number | null;
  cycleDay: number | null;
  phaseKey: PhaseKey | null;
  phase: (typeof PHASES)[PhaseKey] | null;
  daysToNext: number | null;
  bcSuppresses: boolean;
  bcNote: string | null;
};

export function getCycleSnapshot(
  periodStart: string | null,
  cycleLen: number,
  bc: string
): CycleSnapshot {
  const ds = daysSince(periodStart);
  const bcInfo = BC_TYPES[bc] ?? BC_TYPES.none;

  if (ds === null) {
    return {
      dayInCycle: null,
      cycleDay: null,
      phaseKey: null,
      phase: null,
      daysToNext: null,
      bcSuppresses: bcInfo.suppresses,
      bcNote: bcInfo.note ?? null,
    };
  }

  const dayInCycle = ((ds % cycleLen) + cycleLen) % cycleLen;
  const key = phaseKeyFor(dayInCycle, cycleLen);
  const daysToNext = (cycleLen - dayInCycle) % cycleLen || cycleLen;

  return {
    dayInCycle,
    cycleDay: dayInCycle + 1,
    phaseKey: key,
    phase: PHASES[key],
    daysToNext,
    bcSuppresses: bcInfo.suppresses,
    bcNote: bcInfo.note ?? null,
  };
}

export type FertileWindow = {
  startDay: number;
  endDay: number;
  ovulationDay: number;
};

export function getFertileWindow(cycleLen: number): FertileWindow {
  const ovulationDay = cycleLen - 14;
  return {
    ovulationDay,
    startDay: Math.max(1, ovulationDay - 5),
    endDay: Math.min(cycleLen, ovulationDay + 1),
  };
}

export function isInFertileWindow(cycleDay: number, cycleLen: number): boolean {
  const { startDay, endDay } = getFertileWindow(cycleLen);
  return cycleDay >= startDay && cycleDay <= endDay;
}

export type ParticleMood = "rest" | "rising" | "peak" | "wind";

export function particleMoodForPhase(key: PhaseKey): ParticleMood {
  const map: Record<PhaseKey, ParticleMood> = {
    menstrual: "rest",
    follicular: "rising",
    ovulatory: "peak",
    luteal: "wind",
  };
  return map[key];
}
