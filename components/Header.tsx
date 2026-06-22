"use client";

type Props = {
  onSettings: () => void;
};

export function Header({ onSettings }: Props) {
  const dateStr = new Date().toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  return (
    <header className="app-header">
      <div className="brand brand-mobile">
        <div className="logo">Aluna</div>
        <div className="tagline">your inner tide</div>
      </div>
      <div className="header-actions">
        <div className="date">{dateStr}</div>
        <button className="gear" onClick={onSettings} aria-label="Settings">
          ☾
        </button>
      </div>
    </header>
  );
}
