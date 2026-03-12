"use client";

import { useState, useRef, useEffect, useCallback } from "react";
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
  const scrollLockTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollHintDismissed = useRef(false);
  const activePanelRef = useRef<PanelId | null>(null);
  activePanelRef.current = activePanel;

  const panelSelectorMap: Record<PanelId, string> = {
    welcome: '.welcome-panel',
    info: '.info-panel',
    work: '.work-panel',
    socials: '.closing-panel',
  };

  const engageScrollLock = useCallback((ms = 1200) => {
    if (scrollLockTimer.current) clearTimeout(scrollLockTimer.current);
    scrollLockRef.current = true;
    scrollLockTimer.current = setTimeout(() => { scrollLockRef.current = false; }, ms);
  }, []);

  const scrollToPanel = useCallback((panelId: PanelId) => {
    setActivePanel(panelId);
    engageScrollLock();
    const el = document.querySelector(panelSelectorMap[panelId]) as HTMLElement;
    if (!el) return;
    if (isMobile) {
      window.scrollTo({ top: el.offsetTop, behavior: 'smooth' });
    } else {
      const panelCenter = el.offsetLeft + el.offsetWidth / 2;
      const target = panelCenter - window.innerWidth / 2;
      document.documentElement.scrollTo({ left: Math.max(0, target), behavior: 'smooth' });
    }
  }, [isMobile, engageScrollLock]);

  const scrollToWorkSub = (index: number) => {
    setActiveWorkSub(index);
    setActivePanel('work');
    engageScrollLock();
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
    if (activePanel !== null) {
      scrollHintDismissed.current = true;
      setShowScrollHint(false);
    }
  }, [activePanel]);

  // Build a flat list of all scroll stops from the DOM
  const getScrollStops = useCallback((): HTMLElement[] => {
    const stops: HTMLElement[] = [];
    const welcome = document.querySelector('.welcome-panel') as HTMLElement;
    if (welcome) stops.push(welcome);
    const info = document.querySelector('.info-panel') as HTMLElement;
    if (info) stops.push(info);
    const featured = document.querySelectorAll('.featured-panel');
    featured.forEach(el => stops.push(el as HTMLElement));
    const closing = document.querySelector('.closing-panel') as HTMLElement;
    if (closing) stops.push(closing);
    return stops;
  }, []);

  // Find which scroll stop is closest to current scroll position
  const getCurrentStopIndex = useCallback((): number => {
    const stops = getScrollStops();
    if (stops.length === 0) return -1;
    const scrollPos = isMobile
      ? window.scrollY + window.innerHeight / 2
      : document.documentElement.scrollLeft + window.innerWidth / 2;
    let closest = 0;
    let minDist = Infinity;
    stops.forEach((el, i) => {
      const center = isMobile
        ? el.offsetTop + el.offsetHeight / 2
        : el.offsetLeft + el.offsetWidth / 2;
      const dist = Math.abs(scrollPos - center);
      if (dist < minDist) {
        minDist = dist;
        closest = i;
      }
    });
    return closest;
  }, [isMobile, getScrollStops]);

  // Scroll to a specific stop element (centered in viewport)
  const scrollToStop = useCallback((el: HTMLElement) => {
    engageScrollLock();
    if (isMobile) {
      const target = el.offsetTop + el.offsetHeight / 2 - window.innerHeight / 2;
      window.scrollTo({ top: Math.max(0, target), behavior: 'smooth' });
    } else {
      const panelCenter = el.offsetLeft + el.offsetWidth / 2;
      const target = panelCenter - window.innerWidth / 2;
      document.documentElement.scrollTo({ left: Math.max(0, target), behavior: 'smooth' });
    }
  }, [isMobile, engageScrollLock]);

  // Derive activePanel/activeWorkSub from a stop element
  const syncPanelFromStop = useCallback((el: HTMLElement) => {
    if (el.classList.contains('welcome-panel')) {
      setActivePanel('welcome');
      setActiveWorkSub(null);
    } else if (el.classList.contains('closing-panel')) {
      setActivePanel('socials');
      setActiveWorkSub(null);
    } else if (el.classList.contains('info-panel')) {
      setActivePanel('info');
      setActiveWorkSub(null);
    } else if (el.classList.contains('featured-panel')) {
      setActivePanel('work');
      const allFeatured = document.querySelectorAll('.featured-panel');
      const idx = Array.from(allFeatured).indexOf(el);
      setActiveWorkSub(idx >= 0 ? idx : 0);
    }
  }, []);

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

      if (!e.shiftKey && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
        const stops = getScrollStops();
        if (stops.length === 0) return;
        const idx = getCurrentStopIndex();
        if (e.key === 'ArrowRight' && idx < stops.length - 1) {
          e.preventDefault();
          const target = stops[idx + 1];
          syncPanelFromStop(target);
          scrollToStop(target);
          playTick();
        } else if (e.key === 'ArrowLeft' && idx > 0) {
          e.preventDefault();
          const target = stops[idx - 1];
          syncPanelFromStop(target);
          scrollToStop(target);
          playTick();
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [scrollToPanel, getScrollStops, getCurrentStopIndex, scrollToStop, syncPanelFromStop]);

  // Sync active panel with scroll position
  useEffect(() => {
    const onScroll = () => {
      if (scrollLockRef.current || showcaseActiveRef.current) return;
      const viewportCenter = isMobile
        ? window.scrollY + window.innerHeight / 2
        : document.documentElement.scrollLeft + window.innerWidth / 2;

      const stops = getScrollStops();
      if (stops.length === 0) return;

      let closestIdx = 0;
      let minDist = Infinity;
      stops.forEach((el, i) => {
        const center = isMobile
          ? el.offsetTop + el.offsetHeight / 2
          : el.offsetLeft + el.offsetWidth / 2;
        const dist = Math.abs(viewportCenter - center);
        if (dist < minDist) {
          minDist = dist;
          closestIdx = i;
        }
      });

      syncPanelFromStop(stops[closestIdx]);
    };
    document.addEventListener('scroll', onScroll, { passive: true });
    return () => document.removeEventListener('scroll', onScroll);
  }, [isMobile, getScrollStops]);

  return {
    activePanel,
    activeWorkSub,
    showScrollHint,
    scrollToPanel,
    scrollToWorkSub,
  };
}
