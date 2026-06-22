export type BcType = {
  t: string;
  d: string;
  suppresses: boolean;
  note?: string;
};

export const BC_TYPES: Record<string, BcType> = {
  none: {
    t: "None / not tracking a method",
    d: "Natural cycle — full phase tracking.",
    suppresses: false,
  },
  copper: {
    t: "Copper IUD (non-hormonal)",
    d: "No hormones; your natural cycle continues.",
    suppresses: false,
  },
  fertility: {
    t: "Fertility awareness / barrier",
    d: "Condoms, diaphragm, tracking — cycle is natural.",
    suppresses: false,
  },
  combined: {
    t: "Combined pill / patch / ring",
    d: "Suppresses ovulation. Bleeds are withdrawal bleeds, not true periods.",
    suppresses: true,
    note: "On the combined pill, patch or ring, your natural hormone cycle is paused. The phases below describe a natural cycle for learning — they likely don't reflect what your body is doing right now. Any bleeding is usually a withdrawal bleed during your break week.",
  },
  mini: {
    t: "Progestogen-only pill (mini-pill)",
    d: "Often changes or stops ovulation; bleeding varies.",
    suppresses: true,
    note: "The mini-pill can stop or shift ovulation, and bleeding patterns vary a lot. Phase estimates may not match your body — treat them as general education.",
  },
  hormonal_iud: {
    t: "Hormonal IUD (Mirena, etc.)",
    d: "Often lightens or stops periods; ovulation varies.",
    suppresses: true,
    note: "A hormonal IUD often reduces or stops bleeding and may suppress ovulation for some people. Your cycle may not follow the phases below.",
  },
  implant: {
    t: "Implant (Nexplanon)",
    d: "Usually stops ovulation; bleeding unpredictable.",
    suppresses: true,
    note: "The implant usually prevents ovulation and bleeding can be irregular or absent. Phase predictions are unlikely to reflect your real cycle.",
  },
  injection: {
    t: "Injection (Depo-Provera)",
    d: "Stops ovulation; periods often stop over time.",
    suppresses: true,
    note: "The injection suppresses ovulation and periods often become light or stop. The phases below are for general learning, not your current state.",
  },
};
