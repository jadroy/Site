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
  const tabRefs = useRef<Map<PanelId, HTMLButtonElement>>(new Map());

  const setTabRef = useCallback((id: PanelId) => (el: HTMLButtonElement | null) => {
    if (el) tabRefs.current.set(id, el);
    else tabRefs.current.delete(id);
  }, []);

  const indicatorStyle = useIndicatorStyle(activePanel, activeWorkSub, tabRefs, trackRef);

  const isWorkActive = activePanel === "work";

  // Drag to reposition horizontally
  const dragRef = useRef<{
    active: boolean;
    startX: number;
    startLeft: number;
    moved: boolean;
  } | null>(null);

  // Apply a left position (in px from left edge of viewport, representing bar center)
  const applyPosition = useCallback((centerX: number) => {
    const bar = barRef.current;
    if (!bar) return;
    const barW = bar.offsetWidth;
    const vw = window.innerWidth;
    const minLeft = barW / 2 + 16;
    const maxLeft = vw - barW / 2 - 16;
    const clamped = Math.max(minLeft, Math.min(maxLeft, centerX));
    bar.style.left = `${clamped}px`;
    bar.style.transform = "translateX(-50%)";
  }, []);

  // Initialize position from storage or center
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const pct = parseFloat(saved);
      if (!isNaN(pct)) {
        applyPosition(pct * window.innerWidth);
      }
    }
    // Re-clamp on resize
    const onResize = () => {
      const bar = barRef.current;
      if (!bar) return;
      const current = bar.getBoundingClientRect();
      const centerX = current.left + current.width / 2;
      applyPosition(centerX);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [applyPosition]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button !== 0) return;
    const bar = barRef.current;
    if (!bar) return;
    const rect = bar.getBoundingClientRect();
    const currentCenter = rect.left + rect.width / 2;
    dragRef.current = {
      active: true,
      startX: e.clientX,
      startLeft: currentCenter,
      moved: false,
    };
  }, []);

  useEffect(() => {
    const THRESHOLD = 8;

    const onMove = (e: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag?.active) return;
      const dx = e.clientX - drag.startX;
      if (!drag.moved && Math.abs(dx) > THRESHOLD) {
        drag.moved = true;
      }
      if (drag.moved) {
        applyPosition(drag.startLeft + dx);
      }
    };

    const onUp = () => {
      const drag = dragRef.current;
      if (!drag?.active) return;
      if (drag.moved) {
        // Save as percentage of viewport width
        const bar = barRef.current;
        if (bar) {
          const rect = bar.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const pct = centerX / window.innerWidth;
          localStorage.setItem(STORAGE_KEY, pct.toFixed(4));
        }
      }
      dragRef.current = null;
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [applyPosition]);

  const onTabClick = useCallback((id: PanelId) => {
    if (dragRef.current?.moved) return;
    onSelect(id);
  }, [onSelect]);

  return (
    <div
      ref={barRef}
      className="tab-bar"
      role="tablist"
      aria-label="Site navigation"
      onPointerDown={onPointerDown}
    >
      <div className="tab-bar__track" ref={trackRef}>
        {TAB_PANELS.map((id) => (
          <button
            key={id}
            ref={setTabRef(id)}
            role="tab"
            aria-selected={activePanel === id}
            className={`tab-bar__tab${activePanel === id ? " tab-bar__tab--active" : ""}`}
            onClick={() => onTabClick(id)}
          >
            {id === "work" && workSubCount > 0 ? (
              <span className={`tab-bar__dots tab-bar__dots--always`}>
                {Array.from({ length: workSubCount }, (_, i) => (
                  <span
                    key={i}
                    className={`tab-bar__dot${activeWorkSub === i ? " tab-bar__dot--active" : ""}`}
                  />
                ))}
              </span>
            ) : (
              <span className="tab-bar__label">{LABELS[id]}</span>
            )}
            {!isMobile && (
              <span className="tab-bar__hint">{TAB_PANELS.indexOf(id) + 1}</span>
            )}
          </button>
        ))}
        <div className="tab-bar__indicator" style={indicatorStyle} />
      </div>
    </div>
  );
}

/** Custom hook: compute indicator left + width + height from active tab element */
function useIndicatorStyle(
  activePanel: PanelId | null,
  activeWorkSub: number | null,
  tabRefs: React.MutableRefObject<Map<PanelId, HTMLButtonElement>>,
  trackRef: React.RefObject<HTMLDivElement | null>,
): React.CSSProperties {
  const [style, setStyle] = useState<React.CSSProperties>({});
  const resizeTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

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

      // When work is active, hide indicator — dots take over
      if (activePanel === "work") {
        setStyle((prev) => ({ ...prev, opacity: 0 }));
        return;
      }

      // Default: indicator hugs the tab label
      const tabRect = tab.getBoundingClientRect();
      const label = tab.querySelector(".tab-bar__label") as HTMLElement | null;
      const labelRect = label?.getBoundingClientRect();
      const left = tabRect.left - trackRect.left;
      const tabPadLeft = labelRect ? labelRect.left - tabRect.left : 14;
      const contentWidth = labelRect
        ? labelRect.width + tabPadLeft * 2
        : tabRect.width;

      setStyle({
        left,
        top: tabRect.top - trackRect.top,
        width: contentWidth,
        height: tabRect.height,
        opacity: 1,
      });
    };
    update();
    window.addEventListener("resize", update);

    const observer = new ResizeObserver(() => {
      if (!activePanel) return;
      clearTimeout(resizeTimerRef.current);
      resizeTimerRef.current = setTimeout(update, 420);
    });
    const workTab = tabRefs.current.get("work");
    if (workTab) observer.observe(workTab);
    const activeTab = activePanel ? tabRefs.current.get(activePanel) : null;
    if (activeTab && activeTab !== workTab) observer.observe(activeTab);

    return () => {
      clearTimeout(resizeTimerRef.current);
      window.removeEventListener("resize", update);
      observer.disconnect();
    };
  }, [activePanel, activeWorkSub, tabRefs, trackRef]);

  return style;
}
