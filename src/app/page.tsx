"use client";

import { useState, useRef, useEffect, ReactNode } from "react";
import StatusBar from "./components/StatusBar";
import TabBar, { type PanelId, PANELS } from "./components/TabBar";
import SandDunes from "./components/SandDunes";
import BootSequence from "./components/BootSequence";
import MemorySlideshow from "./components/MemorySlideshow";
import { themeDefinitions, bgOptions, defaultFx, memoryPresets, type MemoryFx } from "./constants";
import { playTick, playWhoosh } from "./utils/audio";
import { useScrollPhysics } from "./hooks/useScrollPhysics";
import { useTheme } from "./hooks/useTheme";
import { useNameScramble } from "./hooks/useNameScramble";
import { usePanelReveal } from "./hooks/usePanelReveal";
import { usePanelTilt } from "./hooks/usePanelTilt";
import { usePanelNavigation } from "./hooks/usePanelNavigation";
import { useCrosshair } from "./hooks/useCrosshair";
import { useKeyTracker } from "./hooks/useKeyTracker";
import SocialsTuner from "./components/SocialsTuner";

export default function Home() {
  /* ── Boot gate ── */
  const [booted, setBooted] = useState(false);

  /* ── Clock ── */
  const [currentTime, setCurrentTime] = useState('');
  useEffect(() => {
    const fmt = () => new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    setCurrentTime(fmt());
    const id = setInterval(() => setCurrentTime(fmt()), 10000);
    return () => clearInterval(id);
  }, []);

  /* ── Mobile detection ── */
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia("(max-width: 767px)");
    const onChange = (e: MediaQueryListEvent | MediaQueryList) => setIsMobile(e.matches);
    onChange(mql);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange as (e: MediaQueryListEvent) => void);
  }, []);

  /* ── Showcase easter egg ── */
  const [showcaseActive, setShowcaseActive] = useState(false);
  const showcaseActiveRef = useRef(false);

  /* ── Core hooks ── */
  const { containerRef, overscrollXRef, isInputActiveRef } = useScrollPhysics(isMobile, booted, showcaseActiveRef);
  const theme = useTheme();
  const { chars, setIsHovering } = useNameScramble();

  const mainRef = useRef<HTMLDivElement>(null);
  const workPanelRef = useRef<HTMLDivElement>(null);

  const { revealed, homePanelRef, closingPanelRef } = usePanelReveal(
    isMobile, booted, showcaseActiveRef, overscrollXRef, isInputActiveRef, mainRef, workPanelRef,
  );

  const infoContainerRef = useRef<HTMLDivElement>(null);
  const homeContainerRef = useRef<HTMLDivElement>(null);
  const outroPanelRef = useRef<HTMLElement>(null);

  // Outro panel reveal
  useEffect(() => {
    if (!booted) return;
    const el = outroPanelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('revealed');
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [booted]);

  const { activePanel, activeWorkSub, showScrollHint, scrollToPanel, scrollToWorkSub } = usePanelNavigation(
    isMobile, showcaseActiveRef,
  );

  const activePanelRef = useRef(activePanel);
  activePanelRef.current = activePanel;

  const { heldKeys, showWatModal, setShowWatModal, devMode } = useKeyTracker(isMobile, scrollToPanel, activePanelRef);
  const { crosshairRef } = useCrosshair(isMobile);

  /* ── Panel tilt ── */
  const [docExpanded, setDocExpanded] = useState(false);
  usePanelTilt(infoContainerRef, !isMobile && !docExpanded, booted);
  usePanelTilt(homeContainerRef, !isMobile, booted);

  // Escape to close expanded doc
  useEffect(() => {
    if (!docExpanded) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDocExpanded(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [docExpanded]);

  /* ── Window-bar state ── */
  const [statementWeight, setStatementWeight] = useState<'light' | 'regular' | 'medium'>('regular');
  const [convictionsCollapsed, setConvictionsCollapsed] = useState(false);
  const [showYears, setShowYears] = useState(true);

  /* ── Mobile accordion ── */
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['about']));
  const toggleSection = (id: string) => {
    setOpenSections(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  /* ── Layout sliders ── */
  const [fontSize, setFontSize] = useState(13.6);
  const [lineHeight, setLineHeight] = useState(1.25);
  const [gapSize, setGapSize] = useState(2.1);
  const [treeBranchSize, setTreeBranchSize] = useState(12);
  const [contentWidth, setContentWidth] = useState(420);
  const [sectionSpacing, setSectionSpacing] = useState(40);
  const ditherStyles = ['barcode', 'dotmatrix', 'halftone', 'zigzag'] as const;
  const [ditherStyle, setDitherStyle] = useState<typeof ditherStyles[number]>('barcode');
  const [welcomeWidth, setWelcomeWidth] = useState(100);
  const [infoPadTop, setInfoPadTop] = useState(22);

  /* ── Home panel effects ── */
  const [showTV, setShowTV] = useState(false);
  const [showDunes, setShowDunes] = useState(true);
  const [showMemory, setShowMemory] = useState(false);
  const [memoryFx, setMemoryFx] = useState<MemoryFx>({ ...defaultFx });
  const [showMemoryFx, setShowMemoryFx] = useState(false);
  const updateFx = (key: keyof MemoryFx, val: number) =>
    setMemoryFx((prev) => ({ ...prev, [key]: val }));
  const applyMemoryPreset = (p: Partial<MemoryFx>) =>
    setMemoryFx({ ...defaultFx, ...p });
  const [showGrid, setShowGrid] = useState(false);


  /* ── Controls visibility ── */
  const [showControls, setShowControls] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '.' && e.metaKey) {
        e.preventDefault();
        setShowControls(prev => !prev);
      }
      if (e.key === '/' && e.metaKey && e.shiftKey) {
        e.preventDefault();
        triggerShowcase();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  /* ── Panel showcase easter egg ── */
  const triggerShowcaseRef = useRef<() => void>(() => {});
  const triggerShowcase = () => triggerShowcaseRef.current();
  triggerShowcaseRef.current = () => {
    if (showcaseActiveRef.current || isMobile) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const container = containerRef.current;
    if (!container) return;

    showcaseActiveRef.current = true;
    setShowcaseActive(true);

    const savedScroll = document.documentElement.scrollLeft;
    const maxScroll = Math.max(1, document.documentElement.scrollWidth - window.innerWidth);
    const panels = Array.from(container.querySelectorAll(
      '.welcome-panel, .home-panel, .info-panel, .closing-panel'
    )) as HTMLElement[];

    playWhoosh();

    const startTime = performance.now();
    const TOTAL = 2500;
    const LIFT_END = 300;
    const SPIN_END = 2000;

    const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
    const easeInOut = (x: number) => x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;

    const applyCarousel = (intensity: number) => {
      panels.forEach((panel) => {
        const rect = panel.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const off = (cx - window.innerWidth / 2) / window.innerWidth;
        const ry = off * 50 * intensity;
        const tz = -Math.abs(off) * 150 * intensity;
        panel.style.transform = `perspective(800px) rotateY(${ry}deg) translateZ(${tz}px)`;
        panel.style.transformOrigin = 'center center';
      });
    };

    const cleanup = () => {
      container.style.transform = '';
      container.style.transformOrigin = '';
      container.style.filter = '';
      panels.forEach((panel) => {
        panel.style.transform = '';
        panel.style.transformOrigin = '';
      });
      document.documentElement.scrollLeft = savedScroll;
      showcaseActiveRef.current = false;
      setShowcaseActive(false);
    };

    const animate = (now: number) => {
      const elapsed = now - startTime;

      if (elapsed <= LIFT_END) {
        const p = easeOut(elapsed / LIFT_END);
        container.style.transform = `scale(${1 - 0.15 * p})`;
        container.style.transformOrigin = '50% 50%';
        applyCarousel(p * 0.3);
      } else if (elapsed <= SPIN_END) {
        const rawP = (elapsed - LIFT_END) / (SPIN_END - LIFT_END);
        const p = easeInOut(rawP);
        document.documentElement.scrollLeft = maxScroll * Math.sin(p * Math.PI);
        const speed = Math.abs(Math.cos(p * Math.PI));
        container.style.filter = speed > 0.1 ? `blur(${speed * 3}px)` : '';
        container.style.transform = 'scale(0.85)';
        container.style.transformOrigin = '50% 50%';
        applyCarousel(1);
      } else if (elapsed <= TOTAL) {
        const rawP = (elapsed - SPIN_END) / (TOTAL - SPIN_END);
        const p = easeOut(rawP);
        const bounce = 1 + Math.sin(rawP * Math.PI) * 0.02 * (1 - rawP);
        container.style.transform = `scale(${Math.min(0.85 + 0.15 * p * bounce, 1.02)})`;
        container.style.transformOrigin = '50% 50%';
        container.style.filter = '';
        document.documentElement.scrollLeft = savedScroll * easeOut(rawP);
        applyCarousel(1 - p);
      }

      if (elapsed < TOTAL) {
        requestAnimationFrame(animate);
      } else {
        cleanup();
      }
    };

    requestAnimationFrame(animate);
  };

  /* ── Statement lines ── */
  const statementLines: (string | ReactNode)[] = [
    "Creative technologist building tools, interfaces, and objects",
    "Drawn to things that feel considered and stay out of the way",
    <>Currently exploring <span className="link-preview-wrap"><a href="https://en.wikipedia.org/wiki/Calm_technology" target="_blank" rel="noopener noreferrer">calm technology<svg className="external-arrow" width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 9L9 1M9 1H3M9 1V7" stroke="currentColor" strokeWidth="1.2"/></svg></a><span className="link-preview" aria-hidden="true"><span className="link-preview-title">Calm technology</span><span className="link-preview-desc">Technology designed to inform without demanding attention. Coined by Mark Weiser &amp; John Seely Brown at Xerox PARC, 1995.</span><span className="link-preview-url">en.wikipedia.org</span></span></span></>,
  ];

  /* ── Boot gate render ── */
  if (!booted) {
    return <BootSequence onComplete={() => setBooted(true)} />;
  }

  /* ── Main render ── */
  return (
    <>
    {/* Home — hidden for now, ref kept for hooks */}
    <div ref={homePanelRef} className="home-panel" style={{ display: 'none' }} />
    <div
      className={`horizontal-scroll-container${showcaseActive ? ' showcase-active' : ''}${activePanel === 'work' || activePanel === 'socials' ? ' work-expanded' : ''}`}
      ref={containerRef}
    >
      <StatusBar currentSection={activePanel ?? 'welcome'} />
      <TabBar
        activePanel={activePanel}
        onSelect={(panel) => { scrollToPanel(panel); playTick(); }}
        isMobile={isMobile}
        workSubCount={3}
        activeWorkSub={activeWorkSub}
        onSelectWorkSub={(i) => { scrollToWorkSub(i); playTick(); }}
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

      {/* Welcome — entrance */}
      <div className="welcome-panel" onClick={() => scrollToPanel('info')} style={{ width: `${welcomeWidth}vw`, minWidth: `${welcomeWidth}vw` }}>
        <span className="welcome-name">Roy Jad</span>
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
          <div className="grid-line grid-line-v grid-line-center" style={{ left: '50%' }} />
        </div>
      )}

      {/* Appearance controls panel */}
      {showControls && <div className="control-panel control-panel-appearance">
        <div className="control-panel-row">
          <span className="control-panel-label">Site</span>
          <span className="bg-swatches">
            {bgOptions.map((opt) => (
              <button
                key={opt.value}
                className={`bg-swatch ${theme.siteBg === opt.value ? 'active' : ''}`}
                style={{ background: opt.value }}
                onClick={() => { theme.setSiteBg(opt.value); theme.setActiveTheme('Default'); }}
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
            value={theme.textLightness}
            onChange={(e) => { theme.setTextLightness(parseInt(e.target.value)); theme.setActiveTheme('Default'); }}
          />
          <span className="control-panel-value">{theme.textLightness}%</span>
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
        <div className="control-panel-slider">
          <span className="control-panel-label">Sections</span>
          <input
            type="range"
            min="4"
            max="48"
            step="1"
            value={sectionSpacing}
            onChange={(e) => setSectionSpacing(parseInt(e.target.value))}
          />
          <span className="control-panel-value">{sectionSpacing}px</span>
        </div>
        <div className="control-panel-slider">
          <span className="control-panel-label">Welcome</span>
          <input
            type="range"
            min="40"
            max="95"
            step="1"
            value={welcomeWidth}
            onChange={(e) => setWelcomeWidth(parseInt(e.target.value))}
          />
          <span className="control-panel-value">{welcomeWidth}vw</span>
        </div>
        <div className="control-panel-slider">
          <span className="control-panel-label">Card Y</span>
          <input
            type="range"
            min="0"
            max="50"
            step="1"
            value={infoPadTop}
            onChange={(e) => setInfoPadTop(parseInt(e.target.value))}
          />
          <span className="control-panel-value">{infoPadTop}vh</span>
        </div>
        <div className="control-panel-row">
          <span className="control-panel-label">Header</span>
          {ditherStyles.map((s) => (
            <button
              key={s}
              className={`control-panel-toggle ${ditherStyle === s ? 'active' : ''}`}
              onClick={() => setDitherStyle(s)}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="control-panel-divider" />
        <div className="control-panel-row">
          <span className="control-panel-label">Theme</span>
          <span className="bg-swatches">
            {themeDefinitions.map((t) => (
              <button
                key={t.name}
                className={`bg-swatch ${theme.activeTheme === t.name ? 'active' : ''}`}
                style={t.vars['--bg'] ? { background: t.vars['--bg'] } : undefined}
                onClick={() => theme.handleThemeChange(t.name)}
                title={t.name}
              />
            ))}
          </span>
        </div>
        <div className="control-panel-row">
          <span className="control-panel-label">Font</span>
          <button
            className={`control-panel-toggle ${theme.fontMode === 'saans' ? 'active' : ''}`}
            onClick={() => theme.handleFontChange('saans')}
          >
            Saans
          </button>
          <button
            className={`control-panel-toggle ${theme.fontMode === 'mono' ? 'active' : ''}`}
            onClick={() => theme.handleFontChange('mono')}
          >
            Mono
          </button>
        </div>
        <div className="control-panel-divider" />
        <div className="control-panel-row">
          <span className="control-panel-label">Dunes</span>
          <button
            className={`control-panel-toggle ${showDunes ? 'active' : ''}`}
            onClick={() => setShowDunes(prev => !prev)}
          >
            {showDunes ? 'On' : 'Off'}
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
        className={`info-panel${docExpanded ? ' doc-expanded' : ''}${revealed ? ' revealed' : ''}`}
        style={{
          '--base-font-size': `${fontSize}px`,
          '--line-height': lineHeight,
          '--gap-multiplier': gapSize,
          '--tree-branch-size': `${treeBranchSize}px`,
          '--section-spacing': `${sectionSpacing}px`,
          paddingTop: `${infoPadTop}vh`,
        } as React.CSSProperties}
      >
        <div className="panel-title">Info</div>
        <div
          className="info-container"
          ref={infoContainerRef}
          onClick={() => { if (activePanel !== 'info') { scrollToPanel('info'); } }}
        >
        <div className="info-grid">
          {/* Statement */}
          <section className={`info-section info-section-statement intro-fade${openSections.has('about') ? ' section-open' : ''}`}>
            <h2 className="section-label" style={{ '--print-idx': 0 } as React.CSSProperties} onClick={() => isMobile && toggleSection('about')}>About</h2>
            <div className="section-body">
              <div className="statement-text">
                {statementLines.map((line, i) => <div key={i} style={{ '--print-idx': i + 1 } as React.CSSProperties}>{line}</div>)}
              </div>
            </div>
          </section>

          {/* Work */}
          <section className={`info-section info-section-full intro-fade${openSections.has('work') ? ' section-open' : ''}`}>
            <h2 className="section-label" style={{ '--print-idx': 4 } as React.CSSProperties} onClick={() => isMobile && toggleSection('work')}>Work</h2>
            <div className="section-body">
              <div className="work-row">
                <a href="https://context.ai" className="work-card" target="_blank" rel="noopener noreferrer" style={{ '--print-idx': 5 } as React.CSSProperties}>
                  <span className="company">Context<svg className="external-arrow" width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 9L9 1M9 1H3M9 1V7" stroke="currentColor" strokeWidth="1.2"/></svg></span>
                  <span className="years-inline">Founding Designer</span>
                  {showYears && <span className="years-inline">2025</span>}
                </a>
                <div className="work-card" style={{ '--print-idx': 6 } as React.CSSProperties}>
                  <span className="company">Various companies</span>
                  <span className="years-inline">Independent Contractor</span>
                  {showYears && <span className="years-inline">2021–2025</span>}
                </div>
              </div>
            </div>
          </section>

          {/* Convictions */}
          <section className={`info-section info-section-full intro-fade${openSections.has('convictions') ? ' section-open' : ''}`}>
            <h2 className="section-label" style={{ '--print-idx': 7 } as React.CSSProperties} onClick={() => isMobile && toggleSection('convictions')}>Convictions</h2>
            <div className="section-body">
              <div className="conviction-list">
                <div className="conviction-item" style={{ '--print-idx': 8 } as React.CSSProperties}>Self-driving cars are necessary</div>
                <div className="conviction-item" style={{ '--print-idx': 9 } as React.CSSProperties}>Clarity and intentionality are core to a good life</div>
                <div className="conviction-item" style={{ '--print-idx': 10 } as React.CSSProperties}>Spatial computing is the future of interfaces</div>
              </div>
            </div>
          </section>

        </div>
        </div>
      </main>

      {/* Project panels */}
      {[
        { title: "Humanoid Index", sub: "A catalog of humanoid robots", href: "https://humanoids-index.com", src: "https://pub-ff9c525507d54313857d813d5a8fe712.r2.dev/videos/humanoid-walkthrough.mp4", poster: "https://pub-ff9c525507d54313857d813d5a8fe712.r2.dev/videos/humanoid-poster.jpg", video: true },
        { title: "Context", sub: "Founding Designer", href: "https://context.ai", src: "https://pub-ff9c525507d54313857d813d5a8fe712.r2.dev/videos/context-walkthrough.mp4", poster: "https://pub-ff9c525507d54313857d813d5a8fe712.r2.dev/videos/context-poster.jpg", video: true },
        { title: "Share", sub: "Phone-native work sharing", src: "https://pub-ff9c525507d54313857d813d5a8fe712.r2.dev/videos/share-video.mp4", poster: "https://pub-ff9c525507d54313857d813d5a8fe712.r2.dev/videos/share-poster.jpg", video: true, speed: 1.3 },
        // { title: "IRL Projects", sub: "ESP32 E-Ink Weather Display", src: "", textOnly: true },
      ].map((project, i) => (
        <div key={i} ref={i === 0 ? workPanelRef : undefined} className={`featured-panel${i === 0 ? ' work-panel' : ''}${revealed ? ' revealed' : ''}`} style={{ '--stack-idx': i } as React.CSSProperties}>
          <div className="featured-hover-zone">
            <div className="featured-container" onClick={() => { scrollToWorkSub(i); playTick(); }}>
                {project.video ? (
                  <video
                    ref={(el) => { if (el) el.playbackRate = (project as any).speed ?? 1.8; }}
                    src={project.src}
                    poster={(project as any).poster}
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="auto"
                  />
                ) : (
                  <img src={project.src} alt={project.title} />
                )}
              </div>
            <div className="featured-info-below">
              <div className="featured-meta">
                <span className="featured-title">{project.title}</span>
                <span className="featured-sub">{project.sub}</span>
              </div>
              {project.href && (
                <a href={project.href} target="_blank" rel="noopener noreferrer" className="featured-link" onClick={(e) => e.stopPropagation()}>
                  Visit
                  <svg className="external-arrow" width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 9L9 1M9 1H3M9 1V7" stroke="currentColor" strokeWidth="1.2"/></svg>
                </a>
              )}
            </div>
          </div>
        </div>
      ))}

{/* Closing — bookend */}
      <div className="closing-panel" ref={closingPanelRef} onClick={() => scrollToPanel('info')}>
        <div className="closing-socials" onClick={(e) => e.stopPropagation()}
          onMouseLeave={() => {
            const caret = document.querySelector('.closing-socials-caret') as HTMLElement;
            if (caret) caret.style.opacity = '0';
          }}
        >
          <span className="closing-socials-caret">›</span>
          {[
            { href: "mailto:jadroy77@gmail.com", label: "Email" },
            { href: "https://x.com/jadroy2", label: "X", external: true },
            { href: "https://www.linkedin.com/in/royjad/", label: "LinkedIn", external: true },
          ].map((link) => (
            <a
              key={link.label}
              href={link.href}
              {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              onMouseEnter={(e) => {
                const caret = e.currentTarget.parentElement?.querySelector('.closing-socials-caret') as HTMLElement;
                if (!caret) return;
                const container = e.currentTarget.parentElement!;
                const linkRect = e.currentTarget.getBoundingClientRect();
                const containerRect = container.getBoundingClientRect();
                const top = linkRect.top - containerRect.top + linkRect.height / 2;
                caret.style.top = `${top}px`;
                caret.style.transform = link.external ? 'translateY(-50%) rotate(-45deg)' : 'translateY(-50%) rotate(0deg)';
                caret.style.opacity = '1';
              }}
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>

      {/* Auto-dark mode notification */}
      {theme.autoDarkNotice && (
        <div className="auto-dark-notice">
          <span className="auto-dark-notice-text">
            {theme.autoDarkNotice === 'dark' ? 'Dark mode — it\u2019s past sundown' : 'Light mode'}
          </span>
          <button className="auto-dark-notice-cta" onClick={theme.autoDarkNotice === 'dark' ? theme.switchToLight : theme.switchToDark}>
            {theme.autoDarkNotice === 'dark' ? 'Switch to light' : 'Switch to dark'}
          </button>
          <button className="auto-dark-notice-dismiss" onClick={() => theme.setAutoDarkNotice(false)}>✕</button>
        </div>
      )}

      {/* Scroll hint */}
      {!isMobile && showScrollHint && (
        <div className="scroll-hint" onClick={() => scrollToPanel('info')}>
          <span className="scroll-hint-arrow">&larr;</span>
          <span className="scroll-hint-text">SCROLL</span>
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
    {devMode && <SocialsTuner />}
    </>
  );
}
