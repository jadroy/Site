"use client";

import { useState, useRef, useEffect, useLayoutEffect, ReactNode } from "react";
import StatusBar from "./components/StatusBar";
import BootSequence from "./components/BootSequence";
import PanelLever, { type PanelLeverHandle } from "./components/PanelLever";
import DotField from "./components/DotField";

type CharData = { char: string; opacity: number };
type ThemeVars = Record<string, string>;

/** Compute sunrise/sunset in local decimal hours for a given lat/lng and today's date. */
function getSunTimes(lat: number, lng: number): { sunrise: number; sunset: number } {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((now.getTime() - start.getTime()) / 86400000) + 1;

  const toRad = (d: number) => (d * Math.PI) / 180;
  const toDeg = (r: number) => (r * 180) / Math.PI;

  const declination = -23.45 * Math.cos(toRad((360 / 365) * (dayOfYear + 10)));
  const decRad = toRad(declination);
  const latRad = toRad(lat);

  const cosHA =
    (Math.sin(toRad(-0.83)) - Math.sin(latRad) * Math.sin(decRad)) /
    (Math.cos(latRad) * Math.cos(decRad));

  // Polar edge cases
  if (cosHA > 1) return { sunrise: 7, sunset: 17 };
  if (cosHA < -1) return { sunrise: 3, sunset: 23 };

  const ha = toDeg(Math.acos(cosHA));

  // Equation of time correction
  const B = toRad((360 / 365) * (dayOfYear - 81));
  const EoT = 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);

  const solarNoon = 12 - lng / 15 - EoT / 60; // UTC hours
  const tzOffset = now.getTimezoneOffset() / -60;

  return {
    sunrise: solarNoon - ha / 15 + tzOffset,
    sunset: solarNoon + ha / 15 + tzOffset,
  };
}

/** Returns true if current local time is past sunset or before sunrise. */
function isPastSundown(lat: number, lng: number): boolean {
  const { sunrise, sunset } = getSunTimes(lat, lng);
  const now = new Date();
  const currentHour = now.getHours() + now.getMinutes() / 60;
  return currentHour >= sunset || currentHour < sunrise;
}

const themeDefinitions: { name: string; vars: ThemeVars }[] = [
  { name: 'Default', vars: {} },
  {
    name: 'Cryo',
    vars: {
      '--bg': '#f5f8fc',
      '--text': 'hsl(210, 15%, 50%)',
      '--text-muted': 'hsl(210, 12%, 58%)',
      '--text-subtle': 'hsl(210, 10%, 63%)',
      '--text-faint': 'hsl(210, 8%, 72%)',
      '--border': 'hsl(210, 15%, 90%)',
      '--grid-line': 'hsl(210, 12%, 95%)',
      '--card-bg': 'hsl(210, 15%, 97%)',
      '--cursor': 'hsl(200, 65%, 58%)',
      '--accent': 'hsl(200, 65%, 58%)',
      '--accent-warm': 'hsl(210, 60%, 52%)',
      '--accent-gradient': 'linear-gradient(135deg, hsl(200, 65%, 62%) 0%, hsl(210, 60%, 55%) 50%, hsl(195, 65%, 58%) 100%)',
    },
  },
  {
    name: 'Oxide',
    vars: {
      '--bg': '#fdf8f2',
      '--text': 'hsl(25, 15%, 48%)',
      '--text-muted': 'hsl(25, 12%, 56%)',
      '--text-subtle': 'hsl(25, 10%, 62%)',
      '--text-faint': 'hsl(25, 8%, 70%)',
      '--border': 'hsl(25, 15%, 88%)',
      '--grid-line': 'hsl(25, 12%, 94%)',
      '--card-bg': 'hsl(25, 15%, 96%)',
      '--cursor': 'hsl(22, 75%, 52%)',
      '--accent': 'hsl(22, 75%, 52%)',
      '--accent-warm': 'hsl(15, 70%, 46%)',
      '--accent-gradient': 'linear-gradient(135deg, hsl(25, 75%, 55%) 0%, hsl(15, 70%, 48%) 50%, hsl(30, 75%, 52%) 100%)',
    },
  },
  {
    name: 'Phantom',
    vars: {
      '--bg': '#f8f6fc',
      '--text': 'hsl(260, 10%, 50%)',
      '--text-muted': 'hsl(260, 8%, 58%)',
      '--text-subtle': 'hsl(260, 6%, 63%)',
      '--text-faint': 'hsl(260, 4%, 72%)',
      '--border': 'hsl(260, 12%, 90%)',
      '--grid-line': 'hsl(260, 8%, 95%)',
      '--card-bg': 'hsl(260, 12%, 97%)',
      '--cursor': 'hsl(265, 45%, 62%)',
      '--accent': 'hsl(265, 45%, 62%)',
      '--accent-warm': 'hsl(275, 40%, 56%)',
      '--accent-gradient': 'linear-gradient(135deg, hsl(265, 45%, 65%) 0%, hsl(275, 40%, 58%) 50%, hsl(255, 45%, 62%) 100%)',
    },
  },
  {
    name: 'Signal',
    vars: {
      '--bg': '#f4f9f5',
      '--text': 'hsl(150, 12%, 46%)',
      '--text-muted': 'hsl(150, 10%, 54%)',
      '--text-subtle': 'hsl(150, 8%, 60%)',
      '--text-faint': 'hsl(150, 5%, 68%)',
      '--border': 'hsl(150, 10%, 88%)',
      '--grid-line': 'hsl(150, 8%, 94%)',
      '--card-bg': 'hsl(150, 10%, 96%)',
      '--cursor': 'hsl(155, 55%, 45%)',
      '--accent': 'hsl(155, 55%, 45%)',
      '--accent-warm': 'hsl(160, 50%, 40%)',
      '--accent-gradient': 'linear-gradient(135deg, hsl(155, 55%, 48%) 0%, hsl(160, 50%, 42%) 50%, hsl(150, 55%, 45%) 100%)',
    },
  },
  {
    name: 'Ember',
    vars: {
      '--bg': '#1a1614',
      '--text': 'hsl(30, 15%, 68%)',
      '--text-muted': 'hsl(30, 12%, 58%)',
      '--text-subtle': 'hsl(30, 10%, 50%)',
      '--text-faint': 'hsl(30, 8%, 42%)',
      '--border': 'hsl(30, 10%, 24%)',
      '--grid-line': 'hsl(30, 8%, 16%)',
      '--card-bg': 'hsl(30, 10%, 13%)',
      '--cursor': 'hsl(35, 80%, 50%)',
      '--accent': 'hsl(35, 80%, 50%)',
      '--accent-warm': 'hsl(25, 75%, 45%)',
      '--accent-gradient': 'linear-gradient(135deg, hsl(35, 80%, 52%) 0%, hsl(25, 75%, 47%) 50%, hsl(40, 80%, 50%) 100%)',
    },
  },
  {
    name: 'Slate',
    vars: {
      '--bg': '#151a1e',
      '--text': 'hsl(210, 15%, 68%)',
      '--text-muted': 'hsl(210, 12%, 58%)',
      '--text-subtle': 'hsl(210, 10%, 50%)',
      '--text-faint': 'hsl(210, 8%, 42%)',
      '--border': 'hsl(210, 10%, 24%)',
      '--grid-line': 'hsl(210, 8%, 16%)',
      '--card-bg': 'hsl(210, 10%, 13%)',
      '--cursor': 'hsl(200, 60%, 52%)',
      '--accent': 'hsl(200, 60%, 52%)',
      '--accent-warm': 'hsl(210, 55%, 48%)',
      '--accent-gradient': 'linear-gradient(135deg, hsl(200, 60%, 55%) 0%, hsl(210, 55%, 50%) 50%, hsl(195, 60%, 52%) 100%)',
    },
  },
  {
    name: 'Void',
    vars: {
      '--bg': '#171717',
      '--text': 'hsl(0, 0%, 68%)',
      '--text-muted': 'hsl(0, 0%, 58%)',
      '--text-subtle': 'hsl(0, 0%, 50%)',
      '--text-faint': 'hsl(0, 0%, 42%)',
      '--border': 'hsl(0, 0%, 24%)',
      '--grid-line': 'hsl(0, 0%, 16%)',
      '--card-bg': 'hsl(0, 0%, 13%)',
      '--cursor': 'hsl(0, 0%, 65%)',
      '--accent': 'hsl(0, 0%, 65%)',
      '--accent-warm': 'hsl(0, 0%, 58%)',
      '--accent-gradient': 'linear-gradient(135deg, hsl(0, 0%, 68%) 0%, hsl(0, 0%, 58%) 50%, hsl(0, 0%, 65%) 100%)',
    },
  },
  {
    name: 'Soot',
    vars: {
      '--bg': '#0e0e0e',
      '--text': 'hsl(0, 0%, 52%)',
      '--text-muted': 'hsl(0, 0%, 45%)',
      '--text-subtle': 'hsl(0, 0%, 38%)',
      '--text-faint': 'hsl(0, 0%, 30%)',
      '--border': 'hsl(0, 0%, 18%)',
      '--grid-line': 'hsl(0, 0%, 11%)',
      '--card-bg': 'hsl(0, 0%, 8%)',
      '--cursor': 'hsl(0, 0%, 42%)',
      '--accent': 'hsl(0, 0%, 42%)',
      '--accent-warm': 'hsl(0, 0%, 36%)',
      '--accent-gradient': 'linear-gradient(135deg, hsl(0, 0%, 44%) 0%, hsl(0, 0%, 36%) 50%, hsl(0, 0%, 42%) 100%)',
    },
  },
];

/* ── Mini window-bar components ── */
function WindowBar({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="window-bar">
      <span className="window-bar-title">{title}</span>
      {children && <div className="window-bar-controls">{children}</div>}
    </div>
  );
}

function BarButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button className="bar-btn" onClick={onClick}>
      {label}
    </button>
  );
}

function BarToggle<T extends string>({
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

const memoryImages = [
  "/photos/me/DABF7F66-A96C-4DD8-A99E-844411C4FA0D_1_105_c.jpeg",
  "/photos/image_2.jpg",
  "/Context/Landing Hero.png",
  "/photos/me/4CD50948-9950-4963-90A7-B8E053E7EF43_1_105_c.jpeg",
  "/Humanoid Index/CleanShot 2026-02-06 at 14.40.42@2x.png",
  "/photos/image_1.jpg",
  "/Share/Share Work - Cover (1).png",
];

type MemoryFx = {
  grayscale: number;
  contrast: number;
  brightness: number;
  blur: number;
  dither: number;
  grain: number;
  halftone: number;
  pixelate: number;
  maskSoftness: number;
};

const defaultFx: MemoryFx = {
  grayscale: 0,
  contrast: 1,
  brightness: 1,
  blur: 0,
  dither: 0,
  grain: 0,
  halftone: 0,
  pixelate: 0,
  maskSoftness: 70,
};

const memoryPresets: { name: string; fx: Partial<MemoryFx> }[] = [
  { name: "Clean", fx: {} },
  { name: "Dither", fx: { dither: 0.8, grayscale: 80, contrast: 1.6 } },
  { name: "Newsprint", fx: { halftone: 1, grayscale: 100, contrast: 1.3 } },
  { name: "Grain", fx: { grain: 0.6, contrast: 1.1, brightness: 1.05 } },
  { name: "Faded", fx: { grayscale: 60, contrast: 0.85, brightness: 1.15, blur: 1 } },
  { name: "Pixel", fx: { pixelate: 8, contrast: 1.2 } },
  { name: "Stark", fx: { grayscale: 100, contrast: 2.2, brightness: 1.1, dither: 0.5 } },
];

function MemorySlideshow({ fx }: { fx: MemoryFx }) {
  const [active, setActive] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setActive((prev) => (prev + 1) % memoryImages.length);
        setFade(true);
      }, 1200);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const cssFilter = [
    fx.grayscale > 0 ? `grayscale(${fx.grayscale}%)` : '',
    fx.contrast !== 1 ? `contrast(${fx.contrast})` : '',
    fx.brightness !== 1 ? `brightness(${fx.brightness})` : '',
    fx.blur > 0 ? `blur(${fx.blur}px)` : '',
  ].filter(Boolean).join(' ') || 'none';

  const svgFilter = [
    fx.dither > 0 ? 'url(#memory-dither)' : '',
    fx.halftone > 0 ? 'url(#memory-halftone)' : '',
  ].filter(Boolean).join(' ');

  const combinedFilter = [cssFilter !== 'none' ? cssFilter : '', svgFilter].filter(Boolean).join(' ') || 'none';

  const maskGrad = `radial-gradient(ellipse 65% 65% at center, black 15%, transparent ${fx.maskSoftness}%)`;

  return (
    <div className="home-memory" aria-hidden="true">
      {/* SVG filter definitions */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <filter id="memory-dither" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="1.5" numOctaves="1" seed="2" result="noise" />
            <feComponentTransfer in="noise" result="threshNoise">
              <feFuncR type="discrete" tableValues={`${0.5 - fx.dither * 0.4} ${0.5 + fx.dither * 0.4}`} />
              <feFuncG type="discrete" tableValues={`${0.5 - fx.dither * 0.4} ${0.5 + fx.dither * 0.4}`} />
              <feFuncB type="discrete" tableValues={`${0.5 - fx.dither * 0.4} ${0.5 + fx.dither * 0.4}`} />
            </feComponentTransfer>
            <feBlend in="SourceGraphic" in2="threshNoise" mode="multiply" />
          </filter>
          <filter id="memory-halftone" colorInterpolationFilters="sRGB">
            <feTurbulence type="turbulence" baseFrequency={0.05 + fx.halftone * 0.05} numOctaves="1" seed="0" result="dots" />
            <feComponentTransfer in="dots" result="pattern">
              <feFuncR type="discrete" tableValues="0 1" />
              <feFuncG type="discrete" tableValues="0 1" />
              <feFuncB type="discrete" tableValues="0 1" />
            </feComponentTransfer>
            <feBlend in="SourceGraphic" in2="pattern" mode="multiply" />
          </filter>
        </defs>
      </svg>

      <div className="home-memory-glow">
        <img
          src={memoryImages[active]}
          alt=""
          className={fade ? "memory-visible" : "memory-hidden"}
        />
      </div>
      <div
        className="home-memory-sharp"
        style={{
          filter: combinedFilter,
          imageRendering: fx.pixelate > 0 ? 'pixelated' : undefined,
        } as React.CSSProperties}
      >
        <img
          src={memoryImages[active]}
          alt=""
          className={fade ? "memory-visible" : "memory-hidden"}
          style={{
            maskImage: maskGrad,
            WebkitMaskImage: maskGrad,
            ...(fx.pixelate > 0 ? {
              imageRendering: 'pixelated' as const,
              width: `${100 / (1 + fx.pixelate * 0.5)}%`,
              height: `${100 / (1 + fx.pixelate * 0.5)}%`,
              transform: `scale(${1 + fx.pixelate * 0.5})`,
            } : {}),
          }}
        />
      </div>
      {/* Grain overlay */}
      {fx.grain > 0 && (
        <div className="home-memory-grain" style={{ opacity: fx.grain }} />
      )}
    </div>
  );
}

let audioCtx: AudioContext | null = null;
function playTick() {
  if (!audioCtx) audioCtx = new AudioContext();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.type = 'sine';
  osc.frequency.setValueAtTime(1200, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.04);
  gain.gain.setValueAtTime(0.006, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
  osc.start(audioCtx.currentTime);
  osc.stop(audioCtx.currentTime + 0.05);
}

export default function Home() {
  const [booted, setBooted] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const fmt = () => new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    setCurrentTime(fmt());
    const id = setInterval(() => setCurrentTime(fmt()), 10000);
    return () => clearInterval(id);
  }, []);

  const handleBootComplete = () => {
    setBooted(true);
  };

  const originalName = "Roy Jad";
  const [chars, setChars] = useState<CharData[]>(
    originalName.split("").map((c) => ({ char: c, opacity: 1 }))
  );
  const [isHovering, setIsHovering] = useState(false);
  const [isScrambling, setIsScrambling] = useState(false);

  const scrambleIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const cycleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const stopTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startScramble = (duration?: number) => {
    if (scrambleIntervalRef.current) clearInterval(scrambleIntervalRef.current);
    if (stopTimeoutRef.current) clearTimeout(stopTimeoutRef.current);

    setIsScrambling(true);
    scrambleIntervalRef.current = setInterval(() => {
      setChars(
        originalName.split("").map((c) => ({
          char: c === " " ? " " : "#",
          opacity: Math.random() * 0.7 + 0.3,
        }))
      );
    }, 120);

    if (duration) {
      stopTimeoutRef.current = setTimeout(() => {
        if (scrambleIntervalRef.current) {
          clearInterval(scrambleIntervalRef.current);
          scrambleIntervalRef.current = null;
        }
        setIsScrambling(false);
        setChars(originalName.split("").map((c) => ({ char: c, opacity: 1 })));
      }, duration);
    }
  };

  const stopScramble = () => {
    if (scrambleIntervalRef.current) {
      clearInterval(scrambleIntervalRef.current);
      scrambleIntervalRef.current = null;
    }
    if (stopTimeoutRef.current) {
      clearTimeout(stopTimeoutRef.current);
      stopTimeoutRef.current = null;
    }
    setIsScrambling(false);
    setChars(originalName.split("").map((c) => ({ char: c, opacity: 1 })));
  };

  // Intermittent scramble effect
  useEffect(() => {
    const scheduleCycle = () => {
      const delay = 3000 + Math.random() * 3000;
      cycleTimeoutRef.current = setTimeout(() => {
        if (!isHovering) {
          startScramble(400 + Math.random() * 400);
        }
        scheduleCycle();
      }, delay);
    };

    cycleTimeoutRef.current = setTimeout(() => {
      if (!isHovering) {
        startScramble(400 + Math.random() * 400);
      }
      scheduleCycle();
    }, 2000);

    return () => {
      if (cycleTimeoutRef.current) clearTimeout(cycleTimeoutRef.current);
    };
  }, [isHovering]);

  // Hover effect
  useEffect(() => {
    if (isHovering) {
      startScramble();
    } else {
      stopScramble();
    }
  }, [isHovering]);

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia("(max-width: 767px)");
    const onChange = (e: MediaQueryListEvent | MediaQueryList) => setIsMobile(e.matches);
    onChange(mql);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange as (e: MediaQueryListEvent) => void);
  }, []);

  // Window-bar state
  const [statementWeight, setStatementWeight] = useState<'light' | 'regular' | 'medium'>('regular');
  const [convictionsCollapsed, setConvictionsCollapsed] = useState(false);
  const [showYears, setShowYears] = useState(true);
  const [activeTheme, setActiveTheme] = useState('Default');
  const [fontMode, setFontMode] = useState<'saans' | 'mono'>('saans');
  const [autoDarkNotice, setAutoDarkNotice] = useState(false);

  // Resolve theme synchronously before first paint (localStorage + timezone fallback)
  useLayoutEffect(() => {
    const saved = localStorage.getItem('rj-theme-pref');
    if (saved) {
      setActiveTheme(saved);
      return;
    }
    const tzOffset = new Date().getTimezoneOffset() / -60;
    if (isPastSundown(40, tzOffset * 15)) {
      setActiveTheme('Slate');
      setAutoDarkNotice(true);
    }
  }, []);

  // Load font preference
  useLayoutEffect(() => {
    const saved = localStorage.getItem('rj-font-pref');
    if (saved === 'mono') {
      setFontMode('mono');
      document.documentElement.dataset.font = 'mono';
    }
  }, []);

  // Apply font mode to DOM
  useLayoutEffect(() => {
    if (fontMode === 'mono') {
      document.documentElement.dataset.font = 'mono';
    } else {
      delete document.documentElement.dataset.font;
    }
  }, [fontMode]);

  // Refine with precise geolocation if available (async, fires after paint)
  useEffect(() => {
    if (localStorage.getItem('rj-theme-pref')) return;
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const night = isPastSundown(pos.coords.latitude, pos.coords.longitude);
        const tzOffset = new Date().getTimezoneOffset() / -60;
        const fallbackNight = isPastSundown(40, tzOffset * 15);
        // Only update if geolocation disagrees with the timezone estimate
        if (night !== fallbackNight) {
          if (night) {
            setActiveTheme('Slate');
            setAutoDarkNotice(true);
          } else {
            setActiveTheme('Default');
            setAutoDarkNotice(false);
          }
        }
      },
      () => {}, // fallback already applied
      { timeout: 3000 }
    );
  }, []);

  // Auto-dismiss the notice
  useEffect(() => {
    if (!autoDarkNotice) return;
    const timer = setTimeout(() => setAutoDarkNotice(false), 8000);
    return () => clearTimeout(timer);
  }, [autoDarkNotice]);

  const handleThemeChange = (themeName: string) => {
    setActiveTheme(themeName);
    localStorage.setItem('rj-theme-pref', themeName);
    setAutoDarkNotice(false);
  };

  const handleFontChange = (mode: 'saans' | 'mono') => {
    setFontMode(mode);
    if (mode === 'mono') {
      localStorage.setItem('rj-font-pref', 'mono');
    } else {
      localStorage.removeItem('rj-font-pref');
    }
  };

  const switchToLight = () => {
    handleThemeChange('Default');
  };

  const containerRef = useRef<HTMLDivElement>(null);

  // Layout sliders
  const [fontSize, setFontSize] = useState(14.4);
  const [lineHeight, setLineHeight] = useState(1.25);
  const [gapSize, setGapSize] = useState(2.1);
  const [treeBranchSize, setTreeBranchSize] = useState(12);
  const [contentWidth, setContentWidth] = useState(420);


  // Text appearance
  const [textLightness, setTextLightness] = useState(44);

  // Site background color
  const bgOptions = [
    { label: 'White', value: '#ffffff' },
    { label: 'Snow', value: '#fefefe' },
    { label: 'Frost', value: '#fcfcfc' },
    { label: 'Mist', value: '#fafafa' },
    { label: 'Fog', value: '#f8f8f8' },
    { label: 'Cloud', value: '#f5f5f5' },
    { label: 'Ash', value: '#f2f2f2' },
    { label: 'Stone', value: '#efefef' },
  ];
  const [siteBg, setSiteBg] = useState('#ffffff');

  // Consolidated theme + appearance effect (layout to avoid flash)
  const allThemeKeys = ['--bg', '--text', '--text-muted', '--text-subtle', '--text-faint', '--border', '--grid-line', '--card-bg', '--cursor', '--accent', '--accent-warm', '--accent-gradient'];
  useLayoutEffect(() => {
    const root = document.documentElement;
    const theme = themeDefinitions.find(t => t.name === activeTheme);

    if (activeTheme === 'Default' || !theme || Object.keys(theme.vars).length === 0) {
      // Default: apply manual controls, remove theme-only vars
      root.style.setProperty('--bg', siteBg);
      root.style.setProperty('--text', `hsl(0, 0%, ${textLightness}%)`);
      root.style.setProperty('--text-muted', `hsl(0, 0%, ${textLightness + 8}%)`);
      root.style.setProperty('--text-subtle', `hsl(0, 0%, ${textLightness + 13}%)`);
      root.style.setProperty('--text-faint', `hsl(0, 0%, ${textLightness + 20}%)`);
      ['--border', '--grid-line', '--card-bg', '--cursor', '--accent', '--accent-warm', '--accent-gradient'].forEach(k =>
        root.style.removeProperty(k)
      );
    } else {
      Object.entries(theme.vars).forEach(([key, value]) => {
        root.style.setProperty(key, value);
      });
    }

    const isDark = ['Ember', 'Slate', 'Void', 'Soot'].includes(activeTheme);
    root.dataset.theme = isDark ? 'dark' : 'light';

    return () => {
      allThemeKeys.forEach(k => root.style.removeProperty(k));
    };
  }, [activeTheme, siteBg, textLightness]);

  // TV scanlines on home
  const [showTV, setShowTV] = useState(false);

  // Dot field on home
  const [showDotField, setShowDotField] = useState(false);

  // Memory effect controls
  const [showMemory, setShowMemory] = useState(false);
  const [memoryFx, setMemoryFx] = useState<MemoryFx>({ ...defaultFx });
  const [showMemoryFx, setShowMemoryFx] = useState(false);
  const updateFx = (key: keyof MemoryFx, val: number) =>
    setMemoryFx((prev) => ({ ...prev, [key]: val }));
  const applyMemoryPreset = (p: Partial<MemoryFx>) =>
    setMemoryFx({ ...defaultFx, ...p });

  // Draggable content position
  const [contentOffset, setContentOffset] = useState({ x: 0, y: 0 }); // Fine-tune with Shift+drag
  const [isDragging, setIsDragging] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, offsetX: 0, offsetY: 0 });

  const handleDragStart = (e: React.MouseEvent) => {
    if (isMobile) return;
    if (!e.shiftKey) return; // Hold shift to drag
    e.preventDefault();
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      offsetX: contentOffset.x,
      offsetY: contentOffset.y
    };
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      setContentOffset({
        x: dragStart.current.offsetX + dx,
        y: dragStart.current.offsetY + dy
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // Distortion lens (runtime disabled, state kept for control panel)
  const [lensSize, setLensSize] = useState(53);
  const [lensBlur, setLensBlur] = useState(8);
  const [lensHueRotate, setLensHueRotate] = useState(0);
  const [lensSepia, setLensSepia] = useState(0);
  const [lensSaturate, setLensSaturate] = useState(1);
  const [lensContrast, setLensContrast] = useState(1);
  const [lensBrightness, setLensBrightness] = useState(1);
  const [lensInvert, setLensInvert] = useState(0);
  const [lensBorder, setLensBorder] = useState(0);
  const [lensBgTint, setLensBgTint] = useState(0);
  const [showLensControls, setShowLensControls] = useState(false);

  const applyLensPreset = (p: { size: number; blur: number; hue: number; sepia: number; saturate: number; contrast: number; brightness: number; invert: number; border: number; tint: number }) => {
    setLensSize(p.size); setLensBlur(p.blur); setLensHueRotate(p.hue); setLensSepia(p.sepia);
    setLensSaturate(p.saturate); setLensContrast(p.contrast); setLensBrightness(p.brightness);
    setLensInvert(p.invert); setLensBorder(p.border); setLensBgTint(p.tint);
  };

  const lensPresets = [
    { name: "Warm", size: 75, blur: 0.5, hue: 34, sepia: 0, saturate: 3, contrast: 1, brightness: 1.25, invert: 0, border: 0.04, tint: 0.30 },
    { name: "Frost", size: 120, blur: 4, hue: 0, sepia: 0, saturate: 1, contrast: 1, brightness: 1.1, invert: 0, border: 0.08, tint: 0 },
    { name: "Circle", size: 120, blur: 1, hue: 0, sepia: 0, saturate: 1, contrast: 1.3, brightness: 1.05, invert: 0, border: 0.12, tint: 0 },
    { name: "Coral", size: 90, blur: 1.5, hue: 350, sepia: 0, saturate: 1.8, contrast: 1.15, brightness: 1, invert: 0, border: 0.1, tint: 0.05 },
    { name: "Cyan", size: 120, blur: 6, hue: 180, sepia: 0, saturate: 1, contrast: 1, brightness: 1.2, invert: 0, border: 0, tint: 0.1 },
  ];

  // Lens runtime disabled — state kept for control panel

  // Hide controls
  const [showControls, setShowControls] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '.' && e.metaKey) {
        e.preventDefault();
        setShowControls(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const mainRef = useRef<HTMLDivElement>(null);
  const infoContainerRef = useRef<HTMLDivElement>(null);
  const homeContainerRef = useRef<HTMLDivElement>(null);
  const [docExpanded, setDocExpanded] = useState(false);

  // Drag-to-scroll between panels (with momentum)
  const dragScrollRef = useRef({ startX: 0, startScroll: 0, hasMoved: false, lastX: 0, lastTime: 0, velocity: 0 });

  const handleScrollDragStart = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isMobile) return;
    if (e.shiftKey) return; // Shift+drag = content position
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (target.closest('a, button, input, [role="button"], [role="switch"]')) return;

    const html = document.documentElement;
    const scrollPos = html.scrollLeft || document.body.scrollLeft || window.scrollX;
    dragScrollRef.current = { startX: e.clientX, startScroll: scrollPos, hasMoved: false, lastX: e.clientX, lastTime: performance.now(), velocity: 0 };

    const onMove = (ev: PointerEvent) => {
      const now = performance.now();
      const dt = now - dragScrollRef.current.lastTime;
      const dx = ev.clientX - dragScrollRef.current.startX;
      if (Math.abs(dx) > 5) {
        dragScrollRef.current.hasMoved = true;
        document.body.style.cursor = 'grabbing';
        document.body.style.userSelect = 'none';
      }
      // Track velocity (px/ms) with smoothing
      if (dt > 0) {
        const instantV = (ev.clientX - dragScrollRef.current.lastX) / dt;
        dragScrollRef.current.velocity = dragScrollRef.current.velocity * 0.4 + instantV * 0.6;
      }
      dragScrollRef.current.lastX = ev.clientX;
      dragScrollRef.current.lastTime = now;

      const newScroll = dragScrollRef.current.startScroll - dx;
      html.scrollLeft = newScroll;
      document.body.scrollLeft = newScroll;
    };

    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';

      if (dragScrollRef.current.hasMoved) {
        // Prevent the click that follows pointerup
        const preventClick = (ev: MouseEvent) => { ev.stopPropagation(); ev.preventDefault(); };
        window.addEventListener('click', preventClick, { capture: true, once: true });

        // Momentum: project scroll position based on release velocity
        const v = dragScrollRef.current.velocity; // px/ms (negative = scrolling right)
        const momentumPx = -v * 600; // project ~600ms of coast (generous)
        const currentScroll = html.scrollLeft || document.body.scrollLeft || window.scrollX;
        const projected = currentScroll + momentumPx;

        const infoPanel = document.querySelector('.info-panel') as HTMLElement;
        if (infoPanel) {
          const threshold = infoPanel.offsetLeft * 0.335;
          if (projected > threshold) {
            scrollToInfo();
          } else {
            scrollToHome();
          }
        }
      }
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  // Subtle tilt on info container (disabled when expanded)
  useEffect(() => {
    if (isMobile || docExpanded) return;
    const el = infoContainerRef.current;
    if (!el) return;

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      el.style.transform = `perspective(1200px) rotateX(${-y * 0.4}deg) rotateY(${x * 0.4}deg) scale(1.005) translateY(-2px)`;
    };

    const onLeave = () => {
      el.style.transform = '';
    };

    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
      el.style.transform = '';
    };
  }, [isMobile, booted, docExpanded]);

  // Subtle tilt on home container
  useEffect(() => {
    if (isMobile) return;
    const el = homeContainerRef.current;
    if (!el) return;

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      el.style.transform = `perspective(1200px) rotateX(${-y * 0.4}deg) rotateY(${x * 0.4}deg) scale(1.005) translateY(-2px)`;
    };

    const onLeave = () => {
      el.style.transform = '';
    };

    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
      el.style.transform = '';
    };
  }, [isMobile, booted]);

  // Escape to close expanded doc
  useEffect(() => {
    if (!docExpanded) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDocExpanded(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [docExpanded]);

  const [onHome, setOnHome] = useState(true);
  const leverRef = useRef<PanelLeverHandle>(null);
  const programmaticScroll = useRef(false);

  const smoothScrollTo = (target: number, duration = 800) => {
    const html = document.documentElement;
    const body = document.body;
    const vertical = isMobile;
    const start = vertical
      ? (window.scrollY || html.scrollTop || body.scrollTop)
      : (html.scrollLeft || body.scrollLeft || window.scrollX);
    const diff = target - start;
    if (Math.abs(diff) < 1) return;
    programmaticScroll.current = true;
    const startTime = performance.now();

    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = progress < 1
        ? 1 - Math.pow(1 - progress, 3) * (1 - progress * 0.3)
        : 1;
      const val = start + diff * ease;
      if (vertical) {
        window.scrollTo(0, val);
      } else {
        html.scrollLeft = val;
        body.scrollLeft = val;
      }
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        programmaticScroll.current = false;
      }
    };
    requestAnimationFrame(step);
  };

  const scrollToInfo = () => {
    const infoPanel = document.querySelector('.info-panel') as HTMLElement;
    if (infoPanel) {
      smoothScrollTo(isMobile ? infoPanel.offsetTop : infoPanel.offsetLeft);
    }
    setOnHome(false);
  };

  const scrollToHome = () => {
    smoothScrollTo(0);
    setOnHome(true);
  };

  // Sync lever with scroll position (only for user-initiated scroll)
  useEffect(() => {
    const onScroll = () => {
      if (programmaticScroll.current) return;
      const infoPanel = document.querySelector('.info-panel') as HTMLElement;
      if (!infoPanel) return;
      const scrollPos = isMobile
        ? window.scrollY
        : (document.documentElement.scrollLeft || document.body.scrollLeft || window.scrollX);
      const threshold = isMobile ? infoPanel.offsetTop : infoPanel.offsetLeft;
      const halfway = threshold / 2;
      setOnHome(scrollPos < halfway);
    };
    document.addEventListener('scroll', onScroll, true);
    return () => document.removeEventListener('scroll', onScroll, true);
  }, [isMobile]);

  // Key tracker
  const [heldKeys, setHeldKeys] = useState<string[]>([]);

  useEffect(() => {
    if (isMobile) return;
    const keys = new Set<string>();

    const fmt = (key: string) => {
      if (key === 'Meta') return 'Cmd';
      if (key === 'Control') return 'Ctrl';
      if (key === ' ') return 'Space';
      if (key === 'ArrowUp') return '\u2191';
      if (key === 'ArrowDown') return '\u2193';
      if (key === 'ArrowLeft') return '\u2190';
      if (key === 'ArrowRight') return '\u2192';
      if (key === 'Escape') return 'Esc';
      if (key.length === 1) return key.toUpperCase();
      return key;
    };

    const sync = () => setHeldKeys([...keys]);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      keys.add(fmt(e.key));
      sync();
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keys.delete(fmt(e.key));
      sync();
    };
    const onMouseDown = (e: MouseEvent) => {
      keys.add(e.button === 2 ? 'Right Click' : 'Click');
      sync();
    };
    const onMouseUp = (e: MouseEvent) => {
      keys.delete(e.button === 2 ? 'Right Click' : 'Click');
      sync();
    };
    const onBlur = () => { keys.clear(); sync(); };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('blur', onBlur);
    };
  }, [isMobile]);

  // Shift-held state for visual feedback
  const [shiftHeld, setShiftHeld] = useState(false);

  // Easter egg: hold Shift+Enter for 5s
  const [showWatModal, setShowWatModal] = useState(false);
  const shiftEnterStart = useRef<number | null>(null);
  const watTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Enter key toggles between panels + track shift
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift') setShiftHeld(true);
      if (e.key === 'Enter' && e.shiftKey && !e.metaKey && !e.ctrlKey && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        leverRef.current?.triggerSnap();
        if (!shiftEnterStart.current) {
          shiftEnterStart.current = Date.now();
          watTimer.current = setTimeout(() => {
            setShowWatModal(true);
            shiftEnterStart.current = null;
          }, 5000);
        }
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') setShiftHeld(false);
      if (e.key === 'Enter' || e.key === 'Shift') {
        shiftEnterStart.current = null;
        if (watTimer.current) { clearTimeout(watTimer.current); watTimer.current = null; }
      }
    };
    const handleBlur = () => {
      setShiftHeld(false);
      shiftEnterStart.current = null;
      if (watTimer.current) { clearTimeout(watTimer.current); watTimer.current = null; }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
      if (watTimer.current) clearTimeout(watTimer.current);
    };
  }, []);

  // Custom crosshair cursor
  const crosshairRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isMobile) return;
    const el = crosshairRef.current;
    if (!el) return;

    const handleMouseMove = (e: MouseEvent) => {
      el.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;

      const target = e.target as HTMLElement;
      const isLink = target.closest('a, button, [role="button"]');
      const isCard = target.closest('.case-card');
      const isPanel = target.closest('.spatial-panel, .statement-box');

      if (isCard) el.dataset.size = 'xl';
      else if (isLink) el.dataset.size = 'lg';
      else if (isPanel) el.dataset.size = 'md';
      else el.dataset.size = 'sm';
    };

    const handleMouseLeave = () => { el.style.opacity = '0'; };
    const handleMouseEnter = () => { el.style.opacity = '1'; };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [isMobile]);

  const statementLines: (string | ReactNode)[] = [
    "Creative technologist building tools, interfaces, and objects",
    "Drawn to things that feel considered and stay out of the way",
    <>Currently exploring <a href="https://en.wikipedia.org/wiki/Calm_technology" target="_blank" rel="noopener noreferrer">calm technology<svg className="external-arrow" width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 9L9 1M9 1H3M9 1V7" stroke="currentColor" strokeWidth="1.2"/></svg></a></>,
  ];

  if (!booted) {
    return <BootSequence onComplete={handleBootComplete} />;
  }

  return (
    <div
      className="horizontal-scroll-container"
      ref={containerRef}
      onPointerDown={handleScrollDragStart}
    >
      <StatusBar currentSection={onHome ? "home" : "info"} />
      <PanelLever
        ref={leverRef}
        onHome={onHome}
        onToggle={() => { if (onHome) scrollToInfo(); else scrollToHome(); }}
        isMobile={isMobile}
        shiftHeld={shiftHeld}
        onSnap={playTick}
      />
      {!isMobile && showControls && heldKeys.length > 0 && (
        <div className="key-tracker">
          {heldKeys.map((k) => (
            <span key={k} className="key-tracker-key">{k}</span>
          ))}
          {heldKeys.includes('Shift') && !heldKeys.includes('Enter') && (
            <span className="key-tracker-hint">Enter</span>
          )}
          {heldKeys.includes('Enter') && !heldKeys.includes('Shift') && (
            <span className="key-tracker-hint">Shift</span>
          )}
        </div>
      )}
      <div className="noise-overlay" />

      {/* Home — typewriter intro */}
      <div className={`home-panel${showTV ? ' home-tv' : ''}`}>
        {showTV && <div className="home-scanbar" />}
        {showMemory && <MemorySlideshow fx={memoryFx} />}
        <div className="home-container" ref={homeContainerRef} onClick={() => { if (!onHome) { scrollToHome(); } }}>
          {!isMobile && showDotField && <DotField />}
          <div className="home-text">
            <div>
              <p className="home-clock">{currentTime}</p>
              <p className="home-subtitle">Roy Jad <span className="home-sep">/</span> SF, CA</p>
            </div>
          </div>
        </div>
      </div>
      {/* 12-Column Grid Overlay (debug) */}
      {showGrid && (
        <div className="design-grid">
          <div className="design-grid-columns">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="design-grid-column">
                <span className="design-grid-column-number">{i + 1}</span>
              </div>
            ))}
          </div>
          {/* Center line */}
          <div className="grid-line grid-line-v grid-line-center" style={{ left: '50%' }} />
        </div>
      )}


      {/* Controls toggle button - hidden, use ⌘. to open */}
      {/* Appearance controls panel */}
      {showControls && <div className="control-panel control-panel-appearance">
        <div className="control-panel-row">
          <span className="control-panel-label">Site</span>
          <span className="bg-swatches">
            {bgOptions.map((opt) => (
              <button
                key={opt.value}
                className={`bg-swatch ${siteBg === opt.value ? 'active' : ''}`}
                style={{ background: opt.value }}
                onClick={() => { setSiteBg(opt.value); setActiveTheme('Default'); }}
                title={`${opt.label} (${opt.value})`}
              />
            ))}
          </span>
        </div>
        <div className="control-panel-slider">
          <span className="control-panel-label">Text</span>
          <input
            type="range"
            min="0"
            max="85"
            step="1"
            value={textLightness}
            onChange={(e) => { setTextLightness(parseInt(e.target.value)); setActiveTheme('Default'); }}
          />
          <span className="control-panel-value">{textLightness}%</span>
        </div>
        <div className="control-panel-slider">
          <span className="control-panel-label">Size</span>
          <input
            type="range"
            min="10"
            max="48"
            step="0.1"
            value={fontSize}
            onChange={(e) => setFontSize(parseFloat(e.target.value))}
          />
          <span className="control-panel-value">{fontSize}px</span>
        </div>
        <div className="control-panel-slider">
          <span className="control-panel-label">Width</span>
          <input
            type="range"
            min="280"
            max="800"
            step="1"
            value={contentWidth}
            onChange={(e) => setContentWidth(parseInt(e.target.value))}
          />
          <span className="control-panel-value">{contentWidth}px</span>
        </div>
        <div className="control-panel-divider" />
        <div className="control-panel-row">
          <span className="control-panel-label">Theme</span>
          <span className="bg-swatches">
            {themeDefinitions.map((t) => (
              <button
                key={t.name}
                className={`bg-swatch ${activeTheme === t.name ? 'active' : ''}`}
                style={t.vars['--bg'] ? { background: t.vars['--bg'] } : undefined}
                onClick={() => handleThemeChange(t.name)}
                title={t.name}
              />
            ))}
          </span>
        </div>
        <div className="control-panel-row">
          <span className="control-panel-label">Font</span>
          <button
            className={`control-panel-toggle ${fontMode === 'saans' ? 'active' : ''}`}
            onClick={() => handleFontChange('saans')}
          >
            Saans
          </button>
          <button
            className={`control-panel-toggle ${fontMode === 'mono' ? 'active' : ''}`}
            onClick={() => handleFontChange('mono')}
          >
            Mono
          </button>
        </div>
        <div className="control-panel-divider" />
        <div className="control-panel-row">
          <span className="control-panel-label">Lens</span>
          <button
            className={`control-panel-toggle ${showLensControls ? 'active' : ''}`}
            onClick={() => setShowLensControls(prev => !prev)}
          >
            {showLensControls ? 'On' : 'Off'}
          </button>
        </div>
        <div className="control-panel-row">
          <span className="control-panel-label">Memory</span>
          <button
            className={`control-panel-toggle ${showMemory ? 'active' : ''}`}
            onClick={() => setShowMemory(prev => !prev)}
          >
            {showMemory ? 'On' : 'Off'}
          </button>
          {showMemory && <button
            className={`control-panel-toggle ${showMemoryFx ? 'active' : ''}`}
            onClick={() => setShowMemoryFx(prev => !prev)}
          >
            FX
          </button>}
        </div>
        <div className="control-panel-row">
          <span className="control-panel-label">Dots</span>
          <button
            className={`control-panel-toggle ${showDotField ? 'active' : ''}`}
            onClick={() => setShowDotField(prev => !prev)}
          >
            {showDotField ? 'On' : 'Off'}
          </button>
        </div>
        <div className="control-panel-row">
          <span className="control-panel-label">TV</span>
          <button
            className={`control-panel-toggle ${showTV ? 'active' : ''}`}
            onClick={() => setShowTV(prev => !prev)}
          >
            {showTV ? 'On' : 'Off'}
          </button>
        </div>
        <div className="control-panel-row">
          <span className="control-panel-label">Grid</span>
          <button
            className={`control-panel-toggle ${showGrid ? 'active' : ''}`}
            onClick={() => setShowGrid(prev => !prev)}
          >
            {showGrid ? 'On' : 'Off'}
          </button>
        </div>
      </div>}

      {/* Memory FX panel */}
      {showMemoryFx && (
        <div className="control-panel control-panel-memory">
          <div className="control-panel-presets">
            {memoryPresets.map((p) => (
              <button key={p.name} className="control-panel-preset-btn" onClick={() => applyMemoryPreset(p.fx)}>
                {p.name}
              </button>
            ))}
          </div>
          <div className="control-panel-slider">
            <span className="control-panel-label">Grayscale</span>
            <input type="range" min="0" max="100" step="1" value={memoryFx.grayscale} onChange={e => updateFx('grayscale', parseInt(e.target.value))} />
            <span className="control-panel-value">{memoryFx.grayscale}%</span>
          </div>
          <div className="control-panel-slider">
            <span className="control-panel-label">Contrast</span>
            <input type="range" min="0.5" max="3" step="0.05" value={memoryFx.contrast} onChange={e => updateFx('contrast', parseFloat(e.target.value))} />
            <span className="control-panel-value">{memoryFx.contrast.toFixed(2)}</span>
          </div>
          <div className="control-panel-slider">
            <span className="control-panel-label">Bright</span>
            <input type="range" min="0.5" max="2" step="0.05" value={memoryFx.brightness} onChange={e => updateFx('brightness', parseFloat(e.target.value))} />
            <span className="control-panel-value">{memoryFx.brightness.toFixed(2)}</span>
          </div>
          <div className="control-panel-slider">
            <span className="control-panel-label">Blur</span>
            <input type="range" min="0" max="8" step="0.5" value={memoryFx.blur} onChange={e => updateFx('blur', parseFloat(e.target.value))} />
            <span className="control-panel-value">{memoryFx.blur}px</span>
          </div>
          <div className="control-panel-divider" />
          <div className="control-panel-slider">
            <span className="control-panel-label">Dither</span>
            <input type="range" min="0" max="1" step="0.05" value={memoryFx.dither} onChange={e => updateFx('dither', parseFloat(e.target.value))} />
            <span className="control-panel-value">{memoryFx.dither.toFixed(2)}</span>
          </div>
          <div className="control-panel-slider">
            <span className="control-panel-label">Halftone</span>
            <input type="range" min="0" max="1" step="0.05" value={memoryFx.halftone} onChange={e => updateFx('halftone', parseFloat(e.target.value))} />
            <span className="control-panel-value">{memoryFx.halftone.toFixed(2)}</span>
          </div>
          <div className="control-panel-slider">
            <span className="control-panel-label">Grain</span>
            <input type="range" min="0" max="1" step="0.05" value={memoryFx.grain} onChange={e => updateFx('grain', parseFloat(e.target.value))} />
            <span className="control-panel-value">{memoryFx.grain.toFixed(2)}</span>
          </div>
          <div className="control-panel-slider">
            <span className="control-panel-label">Pixelate</span>
            <input type="range" min="0" max="16" step="1" value={memoryFx.pixelate} onChange={e => updateFx('pixelate', parseInt(e.target.value))} />
            <span className="control-panel-value">{memoryFx.pixelate}</span>
          </div>
          <div className="control-panel-divider" />
          <div className="control-panel-slider">
            <span className="control-panel-label">Mask</span>
            <input type="range" min="30" max="100" step="1" value={memoryFx.maskSoftness} onChange={e => updateFx('maskSoftness', parseInt(e.target.value))} />
            <span className="control-panel-value">{memoryFx.maskSoftness}%</span>
          </div>
          <button className="control-panel-reset-btn" onClick={() => setMemoryFx({ ...defaultFx })}>
            Reset
          </button>
        </div>
      )}

      <main
        ref={mainRef}
        className={`info-panel${docExpanded ? ' doc-expanded' : ''}`}
        onMouseDown={handleDragStart}
        style={{
          '--base-font-size': `${fontSize}px`,
          '--line-height': lineHeight,
          '--gap-multiplier': gapSize,
          '--tree-branch-size': `${treeBranchSize}px`,
        } as React.CSSProperties}
      >
        <div
          className="info-container"
          ref={infoContainerRef}
          onClick={() => { if (onHome) { scrollToInfo(); } }}
        >
        <div className="info-grid">
          {/* Statement — spans full width */}
          <section className="info-section info-section-statement intro-fade">
            <h2 className="section-label">About</h2>
            <div className={`statement-text statement-weight-${statementWeight}`}>
              {statementLines.map((line, i) => <div key={i}>{line}</div>)}
            </div>
          </section>

          {/* Work */}
          <section className="info-section info-section-full intro-fade">
            <h2 className="section-label">Work</h2>
            <div className="work-row">
              <a href="https://context.ai" className="work-card" target="_blank" rel="noopener noreferrer">
                <span className="company">Context<svg className="external-arrow" width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 9L9 1M9 1H3M9 1V7" stroke="currentColor" strokeWidth="1.2"/></svg></span>
                <span className="years-inline">Founding Designer</span>
                {showYears && <span className="years-inline">2025</span>}
              </a>
              <div className="work-card">
                <span className="company">Various companies</span>
                <span className="years-inline">Independent Contractor</span>
                {showYears && <span className="years-inline">2021–2025</span>}
              </div>
            </div>
          </section>

          {/* Convictions */}
          <section className="info-section info-section-full intro-fade">
            <h2 className="section-label">Convictions</h2>
            <div className="conviction-item">Self-driving cars are necessary</div>
            <div className="conviction-item">Clarity and intentionality are core to a good life</div>
            <div className="conviction-item">Spatial computing is the future of interfaces</div>
          </section>

          {/* Case Studies */}
          <section className="info-section info-section-cases intro-fade">
            <h2 className="section-label">Case Studies</h2>
            <div className="case-cards">
              {[
                { href: "https://humanoid-index.com", img: "/Humanoid Index/CleanShot 2026-02-06 at 14.40.42@2x.png", alt: "Humanoid Index", title: "Humanoid Index", sub: "A catalog of humanoid robots" },
                { href: "https://context.ai", img: "/Context/Context landing hero.png", alt: "Context", title: "Context", sub: "Founding Designer", imgStyle: { objectFit: 'contain' as const, background: '#f7f7f7' } },
                { img: "/Share/Share Work - Cover (1).png", alt: "Share", title: "Share", sub: "Phone-native work sharing" },
                { img: "/Esp32-weatherdisplay/B83BE970-9380-4464-A007-CD0E7A8B7CD2_1_105_c.jpeg", alt: "IRL Projects", title: "IRL Projects", sub: "ESP32 E-Ink Weather Display", imgStyle: { objectPosition: 'bottom' } },
              ].map((card, i) => {
                const Tag = card.href ? 'a' : 'div';
                const linkProps = card.href ? { href: card.href, target: "_blank" as const, rel: "noopener noreferrer" } : {};
                return (
                  <Tag
                    key={i}
                    className="case-card"
                    {...linkProps}
                    onMouseEnter={(e: React.MouseEvent<HTMLElement>) => {
                      const angle = (Math.random() - 0.5) * 0.8;
                      e.currentTarget.style.transform = `translateY(-2px) rotate(${angle}deg)`;
                    }}
                    onMouseLeave={(e: React.MouseEvent<HTMLElement>) => {
                      e.currentTarget.style.transform = '';
                    }}
                  >
                    <img className="case-card-img" src={card.img} alt={card.alt} style={card.imgStyle} />
                    <div className="case-card-text">
                      <span className="company">{card.title}{card.href && <svg className="external-arrow" width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 9L9 1M9 1H3M9 1V7" stroke="currentColor" strokeWidth="1.2"/></svg>}</span>
                      <span className="years-inline">{card.sub}</span>
                    </div>
                  </Tag>
                );
              })}
            </div>
          </section>


        </div>
        <div className="page-links">
          <a href="mailto:jadroy77@gmail.com">Email</a>
          <a href="https://x.com/jadroy2" target="_blank" rel="noopener noreferrer">Twitter<svg className="external-arrow" width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 9L9 1M9 1H3M9 1V7" stroke="currentColor" strokeWidth="1.2"/></svg></a>
          <a href="https://www.linkedin.com/in/royjad/" target="_blank" rel="noopener noreferrer">LinkedIn<svg className="external-arrow" width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 9L9 1M9 1H3M9 1V7" stroke="currentColor" strokeWidth="1.2"/></svg></a>
        </div>
        {isMobile && (
          <div className="mobile-theme-picker">
            <span className="mobile-theme-picker-label">Theme</span>
            <div className="mobile-theme-dots">
              {themeDefinitions.map((t) => (
                <button
                  key={t.name}
                  className={`mobile-theme-dot${activeTheme === t.name ? ' active' : ''}`}
                  style={{ background: t.vars['--bg'] || '#ebe9e8' }}
                  onClick={() => handleThemeChange(t.name)}
                  aria-label={t.name}
                />
              ))}
            </div>
          </div>
        )}
        </div>
      </main>

      {/* Auto-dark mode notification */}
      {autoDarkNotice && (
        <div className="auto-dark-notice">
          <span className="auto-dark-notice-text">Dark mode — it's past sundown</span>
          <button className="auto-dark-notice-cta" onClick={switchToLight}>Switch to light</button>
          <button className="auto-dark-notice-dismiss" onClick={() => setAutoDarkNotice(false)}>✕</button>
        </div>
      )}
      {showLensControls && (
        <div className="control-panel control-panel-lens">
          <div className="control-panel-presets">
            {lensPresets.map((p) => (
              <button key={p.name} className="control-panel-preset-btn" onClick={() => applyLensPreset(p)}>
                {p.name}
              </button>
            ))}
          </div>
          <div className="control-panel-slider">
            <span className="control-panel-label">Size</span>
            <input type="range" min="40" max="300" step="1" value={lensSize} onChange={e => setLensSize(parseInt(e.target.value))} />
            <span className="control-panel-value">{lensSize}px</span>
          </div>
          <div className="control-panel-slider">
            <span className="control-panel-label">Blur</span>
            <input type="range" min="0" max="12" step="0.5" value={lensBlur} onChange={e => setLensBlur(parseFloat(e.target.value))} />
            <span className="control-panel-value">{lensBlur}</span>
          </div>
          <div className="control-panel-slider">
            <span className="control-panel-label">Hue</span>
            <input type="range" min="0" max="360" step="1" value={lensHueRotate} onChange={e => setLensHueRotate(parseInt(e.target.value))} />
            <span className="control-panel-value">{lensHueRotate}°</span>
          </div>
          <div className="control-panel-slider">
            <span className="control-panel-label">Sepia</span>
            <input type="range" min="0" max="1" step="0.05" value={lensSepia} onChange={e => setLensSepia(parseFloat(e.target.value))} />
            <span className="control-panel-value">{lensSepia.toFixed(2)}</span>
          </div>
          <div className="control-panel-slider">
            <span className="control-panel-label">Saturate</span>
            <input type="range" min="0" max="3" step="0.1" value={lensSaturate} onChange={e => setLensSaturate(parseFloat(e.target.value))} />
            <span className="control-panel-value">{lensSaturate.toFixed(1)}</span>
          </div>
          <div className="control-panel-slider">
            <span className="control-panel-label">Contrast</span>
            <input type="range" min="0.5" max="2" step="0.05" value={lensContrast} onChange={e => setLensContrast(parseFloat(e.target.value))} />
            <span className="control-panel-value">{lensContrast.toFixed(2)}</span>
          </div>
          <div className="control-panel-slider">
            <span className="control-panel-label">Bright</span>
            <input type="range" min="0.5" max="2" step="0.05" value={lensBrightness} onChange={e => setLensBrightness(parseFloat(e.target.value))} />
            <span className="control-panel-value">{lensBrightness.toFixed(2)}</span>
          </div>
          <div className="control-panel-slider">
            <span className="control-panel-label">Invert</span>
            <input type="range" min="0" max="1" step="0.05" value={lensInvert} onChange={e => setLensInvert(parseFloat(e.target.value))} />
            <span className="control-panel-value">{lensInvert.toFixed(2)}</span>
          </div>
          <div className="control-panel-slider">
            <span className="control-panel-label">Border</span>
            <input type="range" min="0" max="0.4" step="0.01" value={lensBorder} onChange={e => setLensBorder(parseFloat(e.target.value))} />
            <span className="control-panel-value">{lensBorder.toFixed(2)}</span>
          </div>
          <div className="control-panel-slider">
            <span className="control-panel-label">Tint</span>
            <input type="range" min="0" max="0.3" step="0.01" value={lensBgTint} onChange={e => setLensBgTint(parseFloat(e.target.value))} />
            <span className="control-panel-value">{lensBgTint.toFixed(2)}</span>
          </div>
          <button className="control-panel-reset-btn" onClick={() => {
            setLensSize(76); setLensBlur(8); setLensHueRotate(0); setLensSepia(0);
            setLensSaturate(1); setLensContrast(1); setLensBrightness(1);
            setLensInvert(0); setLensBorder(0); setLensBgTint(0);
          }}>
            Reset
          </button>
        </div>
      )}

      {/* Easter egg modal */}
      {showWatModal && (
        <div className="wat-modal-overlay" onClick={() => setShowWatModal(false)}>
          <div className="wat-modal" onClick={(e) => e.stopPropagation()}>
            <p>what are you doing</p>
            <button onClick={() => setShowWatModal(false)}>sorry</button>
          </div>
        </div>
      )}
    </div>
  );
}
