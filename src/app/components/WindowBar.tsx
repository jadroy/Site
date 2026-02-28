"use client";

import { ReactNode } from "react";

export function WindowBar({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="window-bar">
      <span className="window-bar-title">{title}</span>
      {children && <div className="window-bar-controls">{children}</div>}
    </div>
  );
}

export function BarButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button className="bar-btn" onClick={onClick}>
      {label}
    </button>
  );
}

export function BarToggle<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: T }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="bar-toggle">
      {options.map((opt) => (
        <button
          key={opt.value}
          className={`bar-toggle-btn ${value === opt.value ? "active" : ""}`}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
