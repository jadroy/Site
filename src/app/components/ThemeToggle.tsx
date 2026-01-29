"use client";

import { useState, useEffect, useRef } from "react";

// Drum sounds using Web Audio API
const createDrumSound = (type: "kick" | "snare" | "hihat") => {
  const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  if (type === "kick") {
    oscillator.frequency.setValueAtTime(150, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
    gainNode.gain.setValueAtTime(1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.15);
  } else if (type === "snare") {
    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  } else {
    oscillator.type = "square";
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.05);
  }
};

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "warm">("light");
  const [blur, setBlur] = useState(false);
  const [focus, setFocus] = useState(false);
  const [drums, setDrums] = useState(false);
  const [scanlines, setScanlines] = useState(false);
  const [bgImage, setBgImage] = useState(false);
  const drumsRef = useRef(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme") as "light" | "warm" | null;
    if (saved) {
      setTheme(saved);
      document.documentElement.setAttribute("data-theme", saved);
    }
  }, []);

  useEffect(() => {
    drumsRef.current = drums;
  }, [drums]);

  useEffect(() => {
    if (!drums) return;

    const sounds: Array<"kick" | "snare" | "hihat"> = ["kick", "snare", "hihat"];

    const handleClick = () => {
      if (drumsRef.current) {
        createDrumSound(sounds[Math.floor(Math.random() * sounds.length)]);
      }
    };

    const handleKeydown = () => {
      if (drumsRef.current) {
        createDrumSound("hihat");
      }
    };

    document.addEventListener("click", handleClick);
    document.addEventListener("keydown", handleKeydown);

    return () => {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("keydown", handleKeydown);
    };
  }, [drums]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "warm" : "light";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const toggleBlur = () => {
    const newBlur = !blur;
    setBlur(newBlur);
    document.body.classList.toggle("blur-mode", newBlur);
  };

  const toggleFocus = () => {
    const newFocus = !focus;
    setFocus(newFocus);
    document.body.classList.toggle("focus-mode", newFocus);
  };

  const toggleDrums = () => {
    setDrums(!drums);
  };

  const toggleScanlines = () => {
    const newScanlines = !scanlines;
    setScanlines(newScanlines);
    document.body.classList.toggle("scanlines-mode", newScanlines);
  };

  const toggleBgImage = () => {
    const newBgImage = !bgImage;
    setBgImage(newBgImage);
    document.body.classList.toggle("bg-image-mode", newBgImage);
  };

  const [breathe, setBreathe] = useState(false);

  const toggleBreathe = () => {
    const newBreathe = !breathe;
    setBreathe(newBreathe);
    document.body.classList.toggle("breathe-mode", newBreathe);
  };

  return (
    <div className="toggles-container">
      <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme" title="Warm mode">
        <span className="theme-toggle-inner" />
      </button>
      <button
        className={`theme-toggle ${blur ? "active" : ""}`}
        onClick={toggleBlur}
        aria-label="Toggle blur"
        title="Blur"
      >
        <span className="toggle-icon">◯</span>
      </button>
      <button
        className={`theme-toggle ${focus ? "active" : ""}`}
        onClick={toggleFocus}
        aria-label="Toggle focus mode"
        title="Focus mode"
      >
        <span className="toggle-icon">◎</span>
      </button>
      <button
        className={`theme-toggle ${drums ? "active" : ""}`}
        onClick={toggleDrums}
        aria-label="Toggle drums"
        title="Drums"
      >
        <span className="toggle-icon">♪</span>
      </button>
      <button
        className={`theme-toggle ${scanlines ? "active" : ""}`}
        onClick={toggleScanlines}
        aria-label="Toggle scanlines"
        title="Scanlines"
      >
        <span className="toggle-icon">▤</span>
      </button>
      <button
        className={`theme-toggle ${bgImage ? "active" : ""}`}
        onClick={toggleBgImage}
        aria-label="Toggle background image"
        title="Picture background"
      >
        <span className="toggle-icon">▣</span>
      </button>
      <button
        className={`theme-toggle ${breathe ? "active" : ""}`}
        onClick={toggleBreathe}
        aria-label="Toggle breathe mode"
        title="Breathe"
      >
        <span className="toggle-icon">◠</span>
      </button>
    </div>
  );
}
