"use client";

import { signOut } from "next-auth/react";

export function Header({ onSettings }: { onSettings: () => void }) {
  const dateStr = new Date().toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  return (
    <header className="app-header">
      <div className="brand">
        <div className="logo">Aluna</div>
        <div className="tagline">your inner tide</div>
      </div>
      <div style={{ display: "flex", alignItems: "center" }}>
        <div className="date">{dateStr}</div>
        <button className="gear" onClick={onSettings} aria-label="Settings">
          ☾
        </button>
        <button
          className="gear"
          onClick={() => signOut({ callbackUrl: "/login" })}
          aria-label="Sign out"
          style={{ fontSize: 14 }}
        >
          ↪
        </button>
      </div>
    </header>
  );
}
