"use client";

import { useState, useCallback } from "react";

interface Slider {
  label: string;
  prop: string;
  min: number;
  max: number;
  step: number;
  default: number;
  unit: string;
}

const sliders: Slider[] = [
  { label: "Font Size", prop: "--socials-font-size", min: 24, max: 200, step: 1, default: 171, unit: "px" },
  { label: "Tracking", prop: "--socials-letter-spacing", min: -20, max: 10, step: 0.5, default: -16.5, unit: "px" },
  { label: "Line Height", prop: "--socials-line-height", min: 0.5, max: 1.5, step: 0.05, default: 0.9, unit: "" },
  { label: "Gap", prop: "--socials-gap", min: 0, max: 60, step: 1, default: 0, unit: "px" },
  { label: "Left Padding", prop: "--socials-panel-padding", min: 0, max: 300, step: 4, default: 244, unit: "px" },
  { label: "Lightness", prop: "--socials-lightness", min: 0, max: 100, step: 1, default: 44, unit: "%" },
  { label: "Opacity", prop: "--socials-opacity", min: 0, max: 1, step: 0.05, default: 0.15, unit: "" },
  { label: "Hover Opacity", prop: "--socials-hover-opacity", min: 0, max: 1, step: 0.05, default: 0.85, unit: "" },
];

export default function SocialsTuner() {
  const [values, setValues] = useState<Record<string, number>>(
    Object.fromEntries(sliders.map((s) => [s.prop, s.default]))
  );
  const [open, setOpen] = useState(true);

  const update = useCallback((prop: string, val: number, unit: string) => {
    setValues((prev) => ({ ...prev, [prop]: val }));
    document.documentElement.style.setProperty(prop, `${val}${unit}`);
  }, []);

  if (!open) {
    return (
      <button
        className="socials-tuner"
        style={{ minWidth: "auto", cursor: "pointer" }}
        onClick={() => setOpen(true)}
      >
        Socials
      </button>
    );
  }

  return (
    <div className="socials-tuner">
      <div className="socials-tuner-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>Socials Tuner</span>
        <button
          onClick={() => setOpen(false)}
          style={{ background: "none", border: "none", color: "#666", cursor: "pointer", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em" }}
        >
          Hide
        </button>
      </div>
      {sliders.map((s) => (
        <div className="socials-tuner-row" key={s.prop}>
          <label>{s.label}</label>
          <input
            type="range"
            min={s.min}
            max={s.max}
            step={s.step}
            value={values[s.prop]}
            onChange={(e) => update(s.prop, parseFloat(e.target.value), s.unit)}
          />
          <span className="socials-tuner-value">
            {s.unit === "" ? values[s.prop].toFixed(2) : `${values[s.prop]}${s.unit}`}
          </span>
        </div>
      ))}
    </div>
  );
}
