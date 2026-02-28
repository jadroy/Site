"use client";

import { useState, useRef, useEffect } from "react";
import { type PanelId, PANELS } from "../components/TabBar";
import { playTick } from "../utils/audio";

export function usePanelNavigation(
  isMobile: boolean,
  showcaseActiveRef: React.RefObject<boolean>,
) {
  const [activePanel, setActivePanel] = useState<PanelId | null>(null);
  const [activeWorkSub, setActiveWorkSub] = useState<number | null>(null);
  const [showScrollHint, setShowScrollHint] = useState(false);
  const scrollLockRef = useRef(false);
  const scrollHintDismissed = useRef(false);

  const panelSelectorMap: Record<PanelId, string> = {
    home: '.home-panel',
    work: '.work-panel',
    info: '.info-panel',
    writing: '.writing-panel',
  };

  const scrollToPanel = (panelId: PanelId) => {
    setActivePanel(panelId);
    scrollLockRef.current = true;
    setTimeout(() => { scrollLockRef.current = false; }, 800);
    const el = document.querySelector(panelSelectorMap[panelId]) as HTMLElement;
    if (!el) return;
    if (isMobile) {
      window.scrollTo({ top: el.offsetTop, behavior: 'smooth' });
    } else {
      const panelCenter = el.offsetLeft + el.offsetWidth / 2;
      const target = panelCenter - window.innerWidth / 2;
      document.documentElement.scrollTo({ left: Math.max(0, target), behavior: 'smooth' });
    }
  };

  const scrollToWorkSub = (index: number) => {
    setActiveWorkSub(index);
    setActivePanel('work');
    scrollLockRef.current = true;
    setTimeout(() => { scrollLockRef.current = false; }, 800);
    const panels = document.querySelectorAll('.featured-panel');
    const panel = panels[index] as HTMLElement;
    if (!panel) return;
    if (isMobile) {
      window.scrollTo({ top: panel.offsetTop, behavior: 'smooth' });
    } else {
      const panelCenter = panel.offsetLeft + panel.offsetWidth / 2;
      const target = panelCenter - window.innerWidth / 2;
      document.documentElement.scrollTo({ left: Math.max(0, target), behavior: 'smooth' });
    }
  };

  // Dismiss hint on first panel change or after timeout
  useEffect(() => {
    const timer = setTimeout(() => setShowScrollHint(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (scrollHintDismissed.current) return;
    if (activePanel === 'home') {
      scrollHintDismissed.current = true;
      setShowScrollHint(false);
    }
  }, [activePanel]);

  // Keyboard navigation: arrow keys + number keys
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (showcaseActiveRef.current) return;

      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= PANELS.length) {
        e.preventDefault();
        scrollToPanel(PANELS[num - 1]);
        playTick();
        return;
      }

      if (!e.shiftKey) {
        const idx = activePanel ? PANELS.indexOf(activePanel) : -1;
        if (e.key === 'ArrowRight' && idx < PANELS.length - 1) {
          e.preventDefault();
          scrollToPanel(PANELS[idx + 1]);
          playTick();
        } else if (e.key === 'ArrowLeft' && idx > 0) {
          e.preventDefault();
          scrollToPanel(PANELS[idx - 1]);
          playTick();
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activePanel, isMobile]);

  // Sync active panel with scroll position
  useEffect(() => {
    const selectors: [PanelId, string][] = [
      ['home', '.home-panel'],
      ['info', '.info-panel'],
      ['work', '.work-panel'],
    ];
    const onScroll = () => {
      if (scrollLockRef.current || showcaseActiveRef.current) return;
      const scrollPos = isMobile ? window.scrollY : document.documentElement.scrollLeft;
      const allFeatured = document.querySelectorAll('.featured-panel');

      const firstPanel = document.querySelector(selectors[0][1]) as HTMLElement;
      if (firstPanel) {
        const firstStart = isMobile ? firstPanel.offsetTop : firstPanel.offsetLeft;
        if (scrollPos < firstStart * 0.4) {
          setActivePanel(null);
          setActiveWorkSub(null);
          return;
        }
      }

      const lastFeatured = allFeatured[allFeatured.length - 1] as HTMLElement | undefined;
      if (lastFeatured) {
        const lastEnd = isMobile
          ? lastFeatured.offsetTop + lastFeatured.offsetHeight
          : lastFeatured.offsetLeft + lastFeatured.offsetWidth;
        if (scrollPos > lastEnd - (isMobile ? window.innerHeight : window.innerWidth) * 0.6) {
          setActivePanel(null);
          setActiveWorkSub(null);
          return;
        }
      }

      let closest: PanelId = 'home';
      let minDist = Infinity;

      for (const [id, sel] of selectors) {
        if (id === 'work') continue;
        const el = document.querySelector(sel) as HTMLElement;
        if (!el) continue;
        const start = isMobile ? el.offsetTop : el.offsetLeft;
        const dist = Math.abs(scrollPos - start);
        if (dist < minDist) {
          minDist = dist;
          closest = id;
        }
      }

      for (const el of allFeatured) {
        const htmlEl = el as HTMLElement;
        const start = isMobile ? htmlEl.offsetTop : htmlEl.offsetLeft;
        const dist = Math.abs(scrollPos - start);
        if (dist < minDist) {
          minDist = dist;
          closest = 'work';
        }
      }

      setActivePanel(closest);

      if (closest === 'work') {
        const viewportCenter = isMobile
          ? window.scrollY + window.innerHeight / 2
          : document.documentElement.scrollLeft + window.innerWidth / 2;
        let closestSub = 0;
        let minSubDist = Infinity;
        allFeatured.forEach((el, idx) => {
          const htmlEl = el as HTMLElement;
          const center = isMobile
            ? htmlEl.offsetTop + htmlEl.offsetHeight / 2
            : htmlEl.offsetLeft + htmlEl.offsetWidth / 2;
          const dist = Math.abs(viewportCenter - center);
          if (dist < minSubDist) {
            minSubDist = dist;
            closestSub = idx;
          }
        });
        setActiveWorkSub(closestSub);
      } else {
        setActiveWorkSub(null);
      }
    };
    document.addEventListener('scroll', onScroll, { passive: true });
    return () => document.removeEventListener('scroll', onScroll);
  }, [isMobile]);

  return {
    activePanel,
    activeWorkSub,
    showScrollHint,
    scrollToPanel,
    scrollToWorkSub,
  };
}
