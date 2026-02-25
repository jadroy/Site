"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export type PanelId = "home" | "work" | "info" | "writing";

export const PANELS: PanelId[] = ["home", "info"];

const LABELS: Record<PanelId, string> = {
  home: "Home",
  work: "Work",
  info: "Info",
  writing: "Writing",
};

interface TabBarProps {
  activePanel: PanelId | null;
  onSelect: (panel: PanelId) => void;
  isMobile: boolean;
}

export default function TabBar({ activePanel, onSelect, isMobile }: TabBarProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Map<PanelId, HTMLButtonElement>>(new Map());

  const setTabRef = useCallback((id: PanelId) => (el: HTMLButtonElement | null) => {
    if (el) tabRefs.current.set(id, el);
    else tabRefs.current.delete(id);
  }, []);

  // Position the sliding highlight
  const indicatorStyle = useIndicatorStyle(activePanel, tabRefs, trackRef);

  return (
    <div className="tab-bar" role="tablist" aria-label="Site navigation">
      <div className="tab-bar__track" ref={trackRef}>
        {PANELS.map((id) => (
          <button
            key={id}
            ref={setTabRef(id)}
            role="tab"
            aria-selected={activePanel === id}
            className={`tab-bar__tab${activePanel === id ? " tab-bar__tab--active" : ""}`}
            onClick={() => onSelect(id)}
          >
            <span className="tab-bar__label">{LABELS[id]}</span>
            {!isMobile && (
              <span className="tab-bar__hint">{PANELS.indexOf(id) + 1}</span>
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
  tabRefs: React.MutableRefObject<Map<PanelId, HTMLButtonElement>>,
  trackRef: React.RefObject<HTMLDivElement | null>,
): React.CSSProperties {
  const [style, setStyle] = useState<React.CSSProperties>({});
  const lastPanelRef = useRef<PanelId | null>(null);

  useEffect(() => {
    const update = () => {
      const track = trackRef.current;
      if (!activePanel || !track) {
        const trackRect = track?.getBoundingClientRect();
        const trackH = trackRect?.height ?? 30;
        const trackW = trackRect?.width ?? 200;
        const squeezedH = trackH * 0.4;
        const fromRight = lastPanelRef.current === PANELS[PANELS.length - 1];
        setStyle({
          left: fromRight ? trackW - 16 - 3 : 3,
          top: (trackH - squeezedH) / 2,
          width: 16,
          height: squeezedH,
          opacity: 0,
        });
        return;
      }
      lastPanelRef.current = activePanel;
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
