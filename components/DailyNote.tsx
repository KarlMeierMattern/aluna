"use client";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export function DailyNote({ value, onChange }: Props) {
  return (
    <div className="daily-note">
      <label htmlFor="dailyNote">Today&apos;s note</label>
      <textarea
        id="dailyNote"
        rows={2}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Optional — a few words in your own voice"
      />
    </div>
  );
}
