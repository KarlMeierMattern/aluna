import {
  DAY_MS,
  getCycleSnapshot,
  getFertileWindow,
  iso,
  today,
} from "@/lib/cycle/utils";
import type { AlunaState } from "@/lib/db/types";

export type ReminderScheduleData = {
  nextBleedDate: string | null;
  fertileWindowStart: string | null;
  fertileWindowEnd: string | null;
};

export function computeReminderSchedule(
  state: AlunaState
): ReminderScheduleData {
  const snapshot = getCycleSnapshot(
    state.periodStart,
    state.cycleLen,
    state.bc
  );

  if (!state.periodStart || snapshot.daysToNext === null) {
    return {
      nextBleedDate: null,
      fertileWindowStart: null,
      fertileWindowEnd: null,
    };
  }

  const fertile = getFertileWindow(state.cycleLen);
  const t = today();
  const nextBleedDate = iso(
    new Date(t.getTime() + snapshot.daysToNext * DAY_MS)
  );

  if (snapshot.bcSuppresses) {
    return { nextBleedDate, fertileWindowStart: null, fertileWindowEnd: null };
  }

  const periodAnchor = new Date(state.periodStart + "T00:00:00");
  let fertileStart = new Date(
    periodAnchor.getTime() + (fertile.startDay - 1) * DAY_MS
  );
  let fertileEnd = new Date(
    periodAnchor.getTime() + (fertile.endDay - 1) * DAY_MS
  );

  if (fertileEnd < t) {
    const nextPeriod = new Date(nextBleedDate + "T00:00:00");
    fertileStart = new Date(
      nextPeriod.getTime() + (fertile.startDay - 1) * DAY_MS
    );
    fertileEnd = new Date(
      nextPeriod.getTime() + (fertile.endDay - 1) * DAY_MS
    );
  }

  return {
    nextBleedDate,
    fertileWindowStart: iso(fertileStart),
    fertileWindowEnd: iso(fertileEnd),
  };
}
