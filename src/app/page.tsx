"use client";

import { useState, useRef, useEffect, useLayoutEffect, ReactNode } from "react";
import StatusBar from "./components/StatusBar";
import BootSequence from "./components/BootSequence";

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
      '--text': 'hsl(30, 15%, 55%)',
      '--text-muted': 'hsl(30, 12%, 48%)',
      '--text-subtle': 'hsl(30, 10%, 42%)',
      '--text-faint': 'hsl(30, 8%, 34%)',
      '--border': 'hsl(30, 10%, 22%)',
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
      '--text': 'hsl(210, 15%, 55%)',
      '--text-muted': 'hsl(210, 12%, 48%)',
      '--text-subtle': 'hsl(210, 10%, 42%)',
      '--text-faint': 'hsl(210, 8%, 34%)',
      '--border': 'hsl(210, 10%, 22%)',
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
      '--text': 'hsl(0, 0%, 55%)',
      '--text-muted': 'hsl(0, 0%, 48%)',
      '--text-subtle': 'hsl(0, 0%, 42%)',
      '--text-faint': 'hsl(0, 0%, 34%)',
      '--border': 'hsl(0, 0%, 22%)',
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
      '--text': 'hsl(0, 0%, 38%)',
      '--text-muted': 'hsl(0, 0%, 33%)',
      '--text-subtle': 'hsl(0, 0%, 28%)',
      '--text-faint': 'hsl(0, 0%, 22%)',
      '--border': 'hsl(0, 0%, 16%)',
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

  const [onLanding, setOnLanding] = useState(true);

  const smoothScrollTo = (targetX: number, duration = 500) => {
    const html = document.documentElement;
    const body = document.body;
    const startX = html.scrollLeft || body.scrollLeft || window.scrollX;
    const diff = targetX - startX;
    if (Math.abs(diff) < 1) return;
    const startTime = performance.now();

    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = progress < 1
        ? 1 - Math.pow(1 - progress, 3) * (1 - progress * 0.3)
        : 1;
      const val = startX + diff * ease;
      html.scrollLeft = val;
      body.scrollLeft = val;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const scrollToHome = () => {
    const homePanel = document.querySelector('.home-panel') as HTMLElement;
    if (homePanel) smoothScrollTo(homePanel.offsetLeft);
    setOnLanding(false);
  };

  const scrollToLanding = () => {
    smoothScrollTo(0);
    setOnLanding(true);
  };

  // Enter key toggles between panels
  useEffect(() => {
    const handleEnterKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && e.shiftKey && !e.metaKey && !e.ctrlKey && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        if (onLanding) scrollToHome();
        else scrollToLanding();
      }
    };
    window.addEventListener('keydown', handleEnterKey);
    return () => window.removeEventListener('keydown', handleEnterKey);
  }, [onLanding]);

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

  const statementText = "Roy Jad, San Francisco — Designer building tools, interfaces, and objects. Drawn to things that feel considered and stay out of the way. Currently exploring calm technology.";

  if (!booted) {
    return <BootSequence onComplete={handleBootComplete} />;
  }

  return (
    <div
      className="horizontal-scroll-container"
      ref={containerRef}
    >
      <StatusBar currentSection="home" />
      <div className="noise-overlay" />

      {/* Landing — typewriter intro */}
      <div className="landing-panel">
        <div className="landing-text">
          <div>
            <p>Roy Jad</p>
            <p>San Francisco, CA</p>
            <p className="landing-clock">{currentTime}</p>
          </div>
        </div>
        <button
          className="landing-enter"
          onClick={scrollToHome}
        >
          <span className="landing-enter-icon">&#x21C6;</span>
          Shift + Enter to switch
        </button>
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


      {/* Controls toggle button - always visible */}
      <button
        className={`controls-toggle ${showControls ? 'active' : ''}`}
        onClick={() => setShowControls(prev => !prev)}
        title={showControls ? 'Hide controls (⌘.)' : 'Show controls (⌘.)'}
      >
        <span className="controls-toggle-icon" />
      </button>
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
          <span className="control-panel-label">Grid</span>
          <button
            className={`control-panel-toggle ${showGrid ? 'active' : ''}`}
            onClick={() => setShowGrid(prev => !prev)}
          >
            {showGrid ? 'On' : 'Off'}
          </button>
        </div>
      </div>}

      <main
        ref={mainRef}
        className="home-panel"
        onMouseDown={handleDragStart}
        style={{
          '--base-font-size': `${fontSize}px`,
          '--line-height': lineHeight,
          '--gap-multiplier': gapSize,
          '--tree-branch-size': `${treeBranchSize}px`,
        } as React.CSSProperties}
      >
        <div className="home-top-row">
          {/* Statement */}
          <div className="statement-box spatial-panel intro-fade">
            <WindowBar title="Statement">
              <BarToggle
                options={[
                  { label: 'Light', value: 'light' as const },
                  { label: 'Regular', value: 'regular' as const },
                  { label: 'Medium', value: 'medium' as const },
                ]}
                value={statementWeight}
                onChange={setStatementWeight}
              />
            </WindowBar>
            <p className={`statement-text statement-weight-${statementWeight}`}>{statementText}</p>
          </div>

          {/* Convictions */}
          <div className="home-cluster home-cluster-convictions spatial-panel intro-fade">
            <WindowBar title="Convictions">
              <BarButton
                label={convictionsCollapsed ? 'Expand' : 'Collapse'}
                onClick={() => setConvictionsCollapsed(prev => !prev)}
              />
            </WindowBar>
            {!convictionsCollapsed && (
              <>
                <div className="line"><span className="conviction-item"><span className="tree-branch">⎿</span> Self-driving cars are necessary</span></div>
                <div className="line"><span className="conviction-item"><span className="tree-branch">⎿</span> Clarity and intentionality are core to a good life</span></div>
                <div className="line"><span className="conviction-item"><span className="tree-branch">⎿</span> Spatial computing is the future of interfaces</span></div>
              </>
            )}
          </div>

          {/* Work */}
          <div className="home-cluster home-cluster-work spatial-panel intro-fade">
            <WindowBar title="Work">
              <BarButton
                label={showYears ? 'Hide years' : 'Show years'}
                onClick={() => setShowYears(prev => !prev)}
              />
            </WindowBar>
            <div className="line"><span className="work-item"><span className="tree-branch">⎿</span> <a href="https://context.ai" className="company" target="_blank" rel="noopener noreferrer">Context</a>, Founding Designer {showYears && <span className="years-inline">2025</span>}</span></div>
            <div className="line"><span className="work-item"><span className="tree-branch">⎿</span> <span className="company">Various companies</span>, Independent Contractor {showYears && <span className="years-inline">2021–2025</span>}</span></div>
          </div>

          {/* Links */}
          <div className="home-cluster home-cluster-links spatial-panel intro-fade">
            <WindowBar title="Links" />
            <div className="social-links">
              <a href="mailto:jadroy77@gmail.com" className="social-box">Email</a>
              <a href="https://x.com/jadroy2" target="_blank" rel="noopener noreferrer" className="social-box">Twitter</a>
              <a href="https://www.linkedin.com/in/royjad/" target="_blank" rel="noopener noreferrer" className="social-box">LinkedIn</a>
            </div>
          </div>
        </div>

        {/* Case Studies — second row */}
        <div className="home-cluster home-cluster-cases spatial-panel intro-fade">
          <WindowBar title="Case Studies" />
          <div className="case-cards">
            <a href="https://humanoid-index.com" className="case-card" target="_blank" rel="noopener noreferrer">
              <div className="case-card-text"><span className="company">Humanoid Index</span><span className="years-inline">A catalog of humanoid robots</span></div>
              <img className="case-card-img" src="/Humanoid Index/CleanShot 2026-02-06 at 14.40.42@2x.png" alt="Humanoid Index" />
            </a>
            <a href="https://context.ai" className="case-card" target="_blank" rel="noopener noreferrer">
              <div className="case-card-text"><span className="company">Context</span><span className="years-inline">Founding Designer</span></div>
              <img className="case-card-img" src="/Context/Landing Hero.png" alt="Context" />
            </a>
            <div className="case-card">
              <div className="case-card-text"><span className="company">Share</span><span className="years-inline">Phone-native work sharing</span></div>
              <img className="case-card-img" src="/Share/Share Work - Cover (1).png" alt="Share" />
            </div>
            <div className="case-card">
              <div className="case-card-text"><span className="company">IRL Projects</span><span className="years-inline">Doorknob, Weather Display</span></div>
              <img className="case-card-img" src="/New doorknob/ABB6539D-6BC7-402E-A838-A11E432C84B8_1_105_c.jpeg" alt="IRL Projects" />
            </div>
          </div>
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
    </div>
  );
}
