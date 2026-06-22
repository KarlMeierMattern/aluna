"use client";

export type AppTab = "today" | "insights";

export function AppNav({
  tab,
  onChange,
}: {
  tab: AppTab;
  onChange: (t: AppTab) => void;
}) {
  return (
    <nav className="app-nav" aria-label="Main">
      <div className="app-nav-brand">
        <span className="logo">Aluna</span>
        <span className="tagline">your inner tide</span>
      </div>
      <div className="app-nav-links">
        <button
          type="button"
          className={tab === "today" ? "active" : ""}
          onClick={() => onChange("today")}
        >
          <span className="nav-icon">◐</span>
          Today
        </button>
        <button
          type="button"
          className={tab === "insights" ? "active" : ""}
          onClick={() => onChange("insights")}
        >
          <span className="nav-icon">◫</span>
          Insights
        </button>
      </div>
    </nav>
  );
}
