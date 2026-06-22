export type PhaseKey = "menstrual" | "follicular" | "ovulatory" | "luteal";

export type Phase = {
  name: string;
  eyebrow: string;
  desc: string;
  b1: string;
  b2: string;
  b3: string;
  drift: string;
  e: number;
  p: number;
  brief: string;
  expect: string[];
  tips: string[];
};

export const PHASES: Record<PhaseKey, Phase> = {
  menstrual: {
    name: "Resting",
    eyebrow: "menstrual phase",
    desc: "Your body is shedding and renewing. Permission to slow down, wrap up warm, and ask less of yourself.",
    b1: "var(--plum)",
    b2: "var(--wine)",
    b3: "var(--berry)",
    drift: "34s",
    e: 18,
    p: 12,
    brief:
      "<strong>Estrogen</strong> and <strong>progesterone</strong> are both at their lowest. This dip is what triggers your bleed — and why energy often feels low.",
    expect: [
      "Lower energy and a pull toward rest",
      "Possible cramps as the uterus sheds its lining",
      "Mood can dip with the low hormones",
    ],
    tips: [
      "Gentle movement — walking, stretching, yoga",
      "Iron-rich foods to replace what's lost",
      "Earlier nights; your body wants the rest",
    ],
  },
  follicular: {
    name: "Rising",
    eyebrow: "follicular phase",
    desc: "Energy is building back up. A good window for starting things, planning, and reaching outward.",
    b1: "var(--mint)",
    b2: "var(--sky)",
    b3: "var(--gold)",
    drift: "24s",
    e: 55,
    p: 12,
    brief:
      "<strong>Estrogen</strong> is climbing as a new egg matures. Rising estrogen lifts mood, energy and mental sharpness.",
    expect: [
      "Energy and motivation returning",
      "Clearer thinking and better mood",
      "Skin often looks its best",
    ],
    tips: [
      "Start new projects — momentum is on your side",
      "Schedule harder workouts; strength builds well now",
      "Lean into social plans and creative work",
    ],
  },
  ovulatory: {
    name: "Peak",
    eyebrow: "ovulatory phase",
    desc: "Your brightest, most outward-facing days. Energy, clarity and warmth at their fullest — make the most of it.",
    b1: "var(--gold)",
    b2: "var(--blush)",
    b3: "var(--sky)",
    drift: "16s",
    e: 90,
    p: 20,
    brief:
      "<strong>Estrogen</strong> peaks and a surge of <strong>LH</strong> releases the egg. This is your most fertile, highest-energy window.",
    expect: [
      "Peak energy, confidence and libido",
      "Most fertile days of your cycle",
      "Feeling social and at your most outward",
    ],
    tips: [
      "Schedule big conversations and presentations now",
      "Note this window if fertility matters to you",
      "Channel the energy — it's the high point",
    ],
  },
  luteal: {
    name: "Winding down",
    eyebrow: "luteal phase",
    desc: "Settling inward again. Comfort, rest and gentleness serve you now as you move toward your next cycle.",
    b1: "var(--rust)",
    b2: "var(--berry)",
    b3: "var(--plum)",
    drift: "30s",
    e: 45,
    p: 75,
    brief:
      "<strong>Progesterone</strong> rises to its peak, then both hormones fall if there's no pregnancy. That fall brings PMS for many.",
    expect: [
      "Energy gradually tapering off",
      "PMS possible later: mood shifts, cravings, tender breasts",
      "A natural pull inward and toward comfort",
    ],
    tips: [
      "Wind down intensity; favour steady over strenuous",
      "Magnesium and complex carbs can ease PMS",
      "Protect your calm — say no to what drains you",
    ],
  },
};

export const DEFAULT_SYMPTOMS = [
  "Cramps",
  "Tender",
  "Tired",
  "Energised",
  "Moody",
  "Calm",
  "Headache",
  "Bloated",
  "Craving",
  "Focused",
  "Restless",
  "Glowy",
] as const;
