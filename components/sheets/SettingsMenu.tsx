"use client";

import { signOut } from "next-auth/react";

type Item = {
  id: string;
  label: string;
  desc: string;
};

const ITEMS: Item[] = [
  {
    id: "cycle",
    label: "Cycle & birth control",
    desc: "Period start, length, and how estimates work",
  },
  {
    id: "reminders",
    label: "Reminders",
    desc: "Push notifications for period and logging",
  },
  {
    id: "partner",
    label: "Share with partner",
    desc: "Read-only link to your phase and countdown",
  },
  {
    id: "tracking",
    label: "Custom symptoms",
    desc: "Add your own feeling tags",
  },
];

type Props = {
  onSelect: (id: string) => void;
  onExport: () => void;
  onImport: () => void;
};

export function SettingsMenu({ onSelect, onExport, onImport }: Props) {
  return (
    <>
      <ul className="menu-list">
        {ITEMS.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              className="menu-item"
              onClick={() => onSelect(item.id)}
            >
              <span className="menu-item-label">{item.label}</span>
              <span className="menu-item-desc">{item.desc}</span>
            </button>
          </li>
        ))}
      </ul>
      <p className="menu-section-label">Backup (device only)</p>
      <div className="menu-backup">
        <button type="button" className="btn btn-ghost" onClick={onExport}>
          Export JSON
        </button>
        <button type="button" className="btn btn-ghost" onClick={onImport}>
          Import JSON
        </button>
      </div>
      <button
        type="button"
        className="menu-signout"
        onClick={() => signOut({ callbackUrl: "/login" })}
      >
        Sign out
      </button>
    </>
  );
}
