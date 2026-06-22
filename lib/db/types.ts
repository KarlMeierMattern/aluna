export type DailyLog = {
  symptoms: string[];
  note?: string;
  period?: boolean;
};

export type CycleRecord = {
  periodStart: string;
  periodEnd?: string;
  length?: number;
};

export type NotifPrefs = {
  periodDaysBefore: number;
  fertileAlert: boolean;
  dailyNudge: boolean;
};

export type AlunaState = {
  periodStart: string | null;
  cycleLen: number;
  bc: string;
  detail: boolean;
  customSymptoms: string[];
  hiddenSymptoms: string[];
  ttcMode: boolean;
  logs: Record<string, DailyLog>;
  cycles: CycleRecord[];
  notifPrefs: NotifPrefs;
};

export const DEFAULT_STATE: AlunaState = {
  periodStart: null,
  cycleLen: 28,
  bc: "none",
  detail: false,
  customSymptoms: [],
  hiddenSymptoms: [],
  ttcMode: false,
  logs: {},
  cycles: [],
  notifPrefs: {
    periodDaysBefore: 2,
    fertileAlert: true,
    dailyNudge: false,
  },
};
