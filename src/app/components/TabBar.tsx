"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export type PanelId = "welcome" | "info" | "work" | "socials";

export const PANELS: PanelId[] = ["info", "work", "socials"];
export const TAB_PANELS: PanelId[] = ["info", "work"];

const LABELS: Record<PanelId, string> = {
  welcome: "Welcome",
  info: "Info",
  work: "Work",
  socials: "Socials",
};

const STORAGE_KEY = "rj-tabbar-x";

interface TabBarProps {
  activePanel: PanelId | null;
  onSelect: (panel: PanelId) => void;
  isMobile: boolean;
  workSubCount?: number;
  activeWorkSub?: number | null;
  onSelectWorkSub?: (index: number) => void;
}

export default function TabBar({
  activePanel,
  onSelect,
  isMobile,
  workSubCount = 0,
  activeWorkSub = null,
  onSelectWorkSub,
}: TabBarProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const dragzoneRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Map<PanelId, HTMLButtonElement>>(new Map());

  const setTabRef = useCallback((id: PanelId) => (el: HTMLButtonElement | null) => {
    if (el) tabRefs.current.set(id, el);
    else tabRefs.current.delete(id);
  }, []);

  const indicatorStyle = useIndicatorStyle(activePanel, tabRefs, trackRef);

  // Snap positions as percentages of viewport width
  const SNAP_POINTS = [0.15, 0.35, 0.5, 0.65, 0.85];

  const getSnapPct = useCallback((pct: number) => {
    let closest = SNAP_POINTS[0];
    let minDist = Infinity;
    for (const sp of SNAP_POINTS) {
      const dist = Math.abs(pct - sp);
      if (dist < minDist) { minDist = dist; closest = sp; }
    }
    return closest;
  }, []);

  const applyPct = useCallback((pct: number) => {
    const bar = barRef.current;
    if (!bar) return;
    bar.style.left = `${pct * 100}%`;
    bar.style.transform = "translateX(-50%)";
    // Map bar position into the dragzone's coordinate space (10%–90% of viewport)
    const zonePos = ((pct - 0.1) / 0.8) * 100;
    dragzoneRef.current?.style.setProperty("--bar-pos", `${zonePos}%`);
  }, []);

  // Drag state
  const dragRef = useRef<{
    active: boolean;
    startX: number;
    startY: number;
    startPct: number;
    moved: boolean;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Initialize from storage (desktop only)
  useEffect(() => {
    if (isMobile) return;
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const pct = parseFloat(saved);
      if (!isNaN(pct)) applyPct(pct);
    }
  }, [applyPct, isMobile]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (isMobile || e.button !== 0) return;
    const bar = barRef.current;
    if (!bar) return;
    bar.setPointerCapture(e.pointerId);
    const rect = bar.getBoundingClientRect();
    const currentPct = (rect.left + rect.width / 2) / window.innerWidth;
    dragRef.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      startPct: currentPct,
      moved: false,
    };
  }, [isMobile]);

  useEffect(() => {
    const THRESHOLD = 8;

    const MAX_Y = 12;

    const onMove = (e: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag?.active) return;
      const dx = e.clientX - drag.startX;
      const dy = e.clientY - drag.startY;
      if (!drag.moved && Math.abs(dx) > THRESHOLD) {
        drag.moved = true;
        setIsDragging(true);
      }
      if (drag.moved) {
        const pct = drag.startPct + dx / window.innerWidth;
        applyPct(Math.max(0.1, Math.min(0.9, pct)));
        // Dampened Y float — resists more the further you pull
        const dampedY = MAX_Y * Math.tanh(dy / 80);
        const bar = barRef.current;
        if (bar) bar.style.translate = `0 ${dampedY}px`;
      }
    };

    const onUp = (e: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag?.active) return;
      barRef.current?.releasePointerCapture(e.pointerId);
      if (drag.moved) {
        const bar = barRef.current;
        if (bar) {
          bar.style.translate = "";
          const rect = bar.getBoundingClientRect();
          const rawPct = (rect.left + rect.width / 2) / window.innerWidth;
          const snapped = getSnapPct(rawPct);
          applyPct(snapped);
          localStorage.setItem(STORAGE_KEY, snapped.toFixed(4));
        }
      }
      dragRef.current = null;
      setIsDragging(false);
    };

    const bar = barRef.current;
    if (!bar) return;
    bar.addEventListener("pointermove", onMove);
    bar.addEventListener("pointerup", onUp);
    return () => {
      bar.removeEventListener("pointermove", onMove);
      bar.removeEventListener("pointerup", onUp);
    };
  }, [applyPct, getSnapPct]);

  const onTabClick = useCallback((id: PanelId) => {
    if (dragRef.current?.moved) return;
    onSelect(id);
  }, [onSelect]);

  return (
    <>
      <div ref={dragzoneRef} className={`tab-bar__dragzone${isDragging ? " tab-bar__dragzone--visible" : ""}`}>
        {SNAP_POINTS.map((sp) => (
          <span key={sp} className="tab-bar__snapmark" style={{ left: `${sp * 100}%` }} />
        ))}
      </div>
      <div
        ref={barRef}
        className={`tab-bar${isDragging ? " tab-bar--dragging" : ""}`}
        role="tablist"
        aria-label="Site navigation"
        onPointerDown={onPointerDown}
      >
        <div className="tab-bar__track" ref={trackRef}>
          <span className="tab-bar__handle" aria-hidden="true" />
          {TAB_PANELS.map((id) => (
            <button
              key={id}
              ref={setTabRef(id)}
              role="tab"
              aria-selected={activePanel === id}
              className={`tab-bar__tab${activePanel === id ? " tab-bar__tab--active" : ""}`}
              onClick={() => onTabClick(id)}
            >
              <span className="tab-bar__label">{LABELS[id]}</span>
              {!isMobile && (
                <span className="tab-bar__hint">{TAB_PANELS.indexOf(id) + 1}</span>
              )}
            </button>
          ))}
          <div className="tab-bar__indicator" style={indicatorStyle} />
        </div>
      </div>
    </>
  );
}

/** Compute indicator position from active tab element */
function useIndicatorStyle(
  activePanel: PanelId | null,
  tabRefs: React.MutableRefObject<Map<PanelId, HTMLButtonElement>>,
  trackRef: React.RefObject<HTMLDivElement | null>,
): React.CSSProperties {
  const [style, setStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    const update = () => {
      const track = trackRef.current;
      if (!activePanel || !track) {
        setStyle((prev) => ({ ...prev, opacity: 0 }));
        return;
      }
      const tab = tabRefs.current.get(activePanel);
      if (!tab) return;
      const trackRect = track.getBoundingClientRect();
      const tabRect = tab.getBoundingClientRect();

      setStyle({
        left: tabRect.left - trackRect.left,
        top: tabRect.top - trackRect.top,
        width: tabRect.width,
        height: tabRect.height,
        opacity: 1,
      });
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [activePanel, tabRefs, trackRef]);

  return style;
}
