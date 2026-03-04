"use client";

import { useState, useEffect, useCallback } from "react";

const fonts = [
  { name: "Geist Mono", cssVar: "--font-geist-mono" },
  { name: "JetBrains Mono", cssVar: "--font-jetbrains-mono" },
  { name: "Fira Code", cssVar: "--font-fira-code" },
  { name: "Source Code Pro", cssVar: "--font-source-code-pro" },
  { name: "IBM Plex Mono", cssVar: "--font-ibm-plex-mono" },
  { name: "Space Mono", cssVar: "--font-space-mono" },
  { name: "Inconsolata", cssVar: "--font-inconsolata" },
  { name: "Roboto Mono", cssVar: "--font-roboto-mono" },
  { name: "Ubuntu Mono", cssVar: "--font-ubuntu-mono" },
  { name: "Anonymous Pro", cssVar: "--font-anonymous-pro" },
  { name: "Cousine", cssVar: "--font-cousine" },
];

export default function FontSwitcher() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightness, setLightness] = useState(30);

  useEffect(() => {
    const savedFont = localStorage.getItem("fontIndex");
    const savedLightness = localStorage.getItem("fontLightness");
    let index = savedFont ? parseInt(savedFont, 10) : 0;
    if (index >= fonts.length) index = 0;
    const light = savedLightness ? parseInt(savedLightness, 10) : 30;
    setCurrentIndex(index);
    setLightness(light);
    applyFont(index);
    applyLightness(light);
  }, []);

  const applyFont = (index: number) => {
    document.body.style.fontFamily = `var(${fonts[index].cssVar}), monospace`;
  };

  const applyLightness = (value: number) => {
    const inverted = 90 - value;
    document.documentElement.style.setProperty("--text", `hsl(0, 0%, ${inverted}%)`);
    document.documentElement.style.setProperty("--text-muted", `hsl(0, 0%, ${inverted + 20}%)`);
  };

  const prev = useCallback(() => {
    const newIndex = currentIndex === 0 ? fonts.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
    applyFont(newIndex);
    localStorage.setItem("fontIndex", newIndex.toString());
  }, [currentIndex]);

  const next = useCallback(() => {
    const newIndex = currentIndex === fonts.length - 1 ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
    applyFont(newIndex);
    localStorage.setItem("fontIndex", newIndex.toString());
  }, [currentIndex]);

  const handleLightness = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    setLightness(value);
    applyLightness(value);
    localStorage.setItem("fontLightness", value.toString());
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.key === "ArrowLeft") {
        prev();
      } else if (e.key === "ArrowRight") {
        next();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [prev, next]);

  return (
    <div className="font-switcher">
      <button onClick={prev} aria-label="Previous font">&larr;</button>
      <span className="font-name">{fonts[currentIndex].name}</span>
      <button onClick={next} aria-label="Next font">&rarr;</button>
      <input
        type="range"
        min="20"
        max="70"
        value={lightness}
        onChange={handleLightness}
        className="lightness-slider"
        aria-label="Font lightness"
      />
    </div>
  );
}
