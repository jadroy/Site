"use client";

import { useState, useRef, useEffect } from "react";

export function usePanelReveal(
  isMobile: boolean,
  booted: boolean,
  showcaseActiveRef: React.RefObject<boolean>,
  overscrollXRef: React.RefObject<number>,
  isInputActiveRef: React.RefObject<boolean>,
  mainRef: React.RefObject<HTMLDivElement | null>,
  workPanelRef: React.RefObject<HTMLDivElement | null>,
) {
  const [revealed, setRevealed] = useState(false);
  const homePanelRef = useRef<HTMLDivElement>(null);
  const closingPanelRef = useRef<HTMLDivElement>(null);

  // Scroll-position-driven panel reveal + edge compression physics
  useEffect(() => {
    if (isMobile || !booted) return;

    const homeEl = homePanelRef.current;
    const infoEl = mainRef.current;
    const workEl = workPanelRef.current;
    if (!homeEl || !infoEl) return;

    const allPanelEls = [homeEl, infoEl, ...(workEl ? [workEl] : [])];

    let rafId: number;
    let prevScroll = window.scrollX;
    let velocity = 0;
    const springs = {
      home: { value: 0, target: 0 },
      info: { value: 0, target: 0 },
      work: { value: 0, target: 0 },
    };
    let revealedLocal = false;

    // Swoop-in: info panel slides in from the right
    const SWOOP_DELAY = 1282;
    const SWOOP_DURATION = 750;
    const SWOOP_TARGET = -window.innerWidth * 0.1; // pull into viewport
    const swoopStart = performance.now();
    const swoopEase = (t: number) => 1 - Math.pow(1 - t, 2.5);

    const SPRING_STIFFNESS = 0.15;
    const SPRING_DAMPING = 0.75;
    const MAX_COMPRESSION = 0.04;
    const EDGE_ZONE = 150;
    const REVEAL_THRESHOLD = window.innerHeight * 0.12;
    const REVEAL_PROGRESS_TRIGGER = 0.15;

    const computeProgress = (el: HTMLElement): number => {
      const rect = el.getBoundingClientRect();
      const vw = window.innerWidth;
      const raw = 1 - Math.max(0, rect.left) / vw;
      return Math.max(0, Math.min(1, raw));
    };

    const tick = () => {
      if (showcaseActiveRef.current) { rafId = requestAnimationFrame(tick); return; }
      const currentScroll = window.scrollX;
      velocity = currentScroll - prevScroll;
      prevScroll = currentScroll;

      const maxScroll = document.documentElement.scrollWidth - window.innerWidth;
      const distToLeft = currentScroll;

      if (distToLeft < EDGE_ZONE && velocity < 0 && maxScroll > 0) {
        const proximity = 1 - distToLeft / EDGE_ZONE;
        springs.home.target = proximity * Math.min(Math.abs(velocity) / 20, 1) * MAX_COMPRESSION;
      } else {
        springs.home.target = 0;
      }

      springs.info.target = 0;

      if (!isInputActiveRef.current && overscrollXRef.current > 0) {
        (overscrollXRef as React.MutableRefObject<number>).current *= 0.88;
        if (overscrollXRef.current < 0.5) (overscrollXRef as React.MutableRefObject<number>).current = 0;
      }

      for (const s of Object.values(springs)) {
        s.value += (s.target - s.value) * SPRING_STIFFNESS;
        s.value *= SPRING_DAMPING;
        if (Math.abs(s.value) < 0.0001) s.value = 0;
      }

      const panelSpringPairs: [HTMLElement, typeof springs.home][] = [
        [homeEl, springs.home],
        [infoEl, springs.info],
        ...(workEl ? [[workEl, springs.work] as [HTMLElement, typeof springs.home]] : []),
      ];

      for (const [panel, spring] of panelSpringPairs) {
        const progress = computeProgress(panel);
        const smoothed = progress * progress * (3 - 2 * progress);
        const ty = REVEAL_THRESHOLD * (1 - smoothed);
        const scaleY = 1 - spring.value;

        const rotate = panel === infoEl ? (1 - smoothed) * -2.5 : 0;

        // Swoop-in offset for info panel
        let swoopX = 0;
        let swoopRotate = 0;
        if (panel === infoEl) {
          const elapsed = performance.now() - swoopStart;
          if (elapsed >= SWOOP_DELAY) {
            const t = Math.min((elapsed - SWOOP_DELAY) / SWOOP_DURATION, 1);
            swoopX = SWOOP_TARGET * swoopEase(t);
            swoopRotate = -1.5 * (1 - swoopEase(t));
          }
        }

        const totalRotate = rotate + swoopRotate;
        panel.style.transformOrigin = panel === infoEl ? 'center bottom' : '';
        panel.style.transform = totalRotate || swoopX
          ? `translateX(${swoopX}px) translateY(${ty}px) rotate(${totalRotate}deg) scaleY(${scaleY})`
          : `translateY(${ty}px) scaleY(${scaleY})`;
        panel.style.opacity = '1';

        if (progress > REVEAL_PROGRESS_TRIGGER && !revealedLocal) {
          revealedLocal = true;
          setRevealed(true);
        }
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafId);
      for (const el of allPanelEls) {
        el.style.transform = '';
        el.style.opacity = '';
      }
    };
  }, [isMobile, booted]);

  // Mobile fallback: reveal immediately (homePanelRef is display:none)
  useEffect(() => {
    if (!isMobile || !booted) return;
    setRevealed(true);
  }, [isMobile, booted]);

  // Closing panel reveal
  useEffect(() => {
    if (!booted) return;
    const el = closingPanelRef.current;
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

  return { revealed, homePanelRef, closingPanelRef };
}
