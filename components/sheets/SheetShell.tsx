"use client";

import { useEffect } from "react";

type Props = {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  onBack?: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export function SheetShell({
  open,
  title,
  subtitle,
  onClose,
  onBack,
  children,
  footer,
}: Props) {
  useEffect(() => {
    if (!open) return;

    const scrollY = window.scrollY;
    const { style } = document.body;
    const prev = {
      position: style.position,
      top: style.top,
      left: style.left,
      right: style.right,
      width: style.width,
      overflow: style.overflow,
    };

    style.position = "fixed";
    style.top = `-${scrollY}px`;
    style.left = "0";
    style.right = "0";
    style.width = "100%";
    style.overflow = "hidden";

    return () => {
      style.position = prev.position;
      style.top = prev.top;
      style.left = prev.left;
      style.right = prev.right;
      style.width = prev.width;
      style.overflow = prev.overflow;
      window.scrollTo(0, scrollY);
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="scrim open"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="sheet">
        <div className="sheet-head">
          {onBack ? (
            <button type="button" className="sheet-back" onClick={onBack} aria-label="Back">
              ←
            </button>
          ) : (
            <span className="sheet-back-spacer" />
          )}
          <button type="button" className="sheet-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <h3>{title}</h3>
        {subtitle && <p className="sheet-sub">{subtitle}</p>}
        {children}
        {footer}
      </div>
    </div>
  );
}
