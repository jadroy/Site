"use client";

import { useRef, useEffect } from "react";

export function useScrollPhysics(
  isMobile: boolean,
  booted: boolean,
  showcaseActiveRef: React.RefObject<boolean>,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const overscrollXRef = useRef(0);
  const isInputActiveRef = useRef(false);

  // Reset scroll to left edge on mount
  useEffect(() => {
    if (!isMobile) {
      document.documentElement.scrollLeft = 0;
    }
  }, []);

  // Add .scroll-driven class on mount (desktop only)
  useEffect(() => {
    if (isMobile || !booted) return;
    const container = containerRef.current;
    if (!container) return;
    container.classList.add('scroll-driven');
    return () => container.classList.remove('scroll-driven');
  }, [isMobile, booted]);

  // Vertical scroll → horizontal scroll (desktop only)
  useEffect(() => {
    if (isMobile) return;
    let wheelReleaseTimer: ReturnType<typeof setTimeout>;
    const onWheel = (e: WheelEvent) => {
      if (showcaseActiveRef.current) { e.preventDefault(); return; }
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        const maxScroll = document.documentElement.scrollWidth - window.innerWidth;
        if (maxScroll > 0) {
          e.preventDefault();
          const currentScroll = document.documentElement.scrollLeft;
          if (currentScroll >= maxScroll - 1 && e.deltaY > 0) {
            isInputActiveRef.current = true;
            clearTimeout(wheelReleaseTimer);
            wheelReleaseTimer = setTimeout(() => { isInputActiveRef.current = false; }, 120);
            const resistance = 1 / (1 + overscrollXRef.current / 300);
            overscrollXRef.current = Math.max(0, overscrollXRef.current + e.deltaY * resistance * 0.5);
          } else {
            if (overscrollXRef.current > 0 && e.deltaY < 0) {
              overscrollXRef.current = Math.max(0, overscrollXRef.current + e.deltaY * 0.5);
              if (overscrollXRef.current <= 0) {
                overscrollXRef.current = 0;
                isInputActiveRef.current = false;
              }
            } else {
              isInputActiveRef.current = false;
              document.documentElement.scrollLeft += e.deltaY;
            }
          }
        }
      }
    };
    window.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      window.removeEventListener('wheel', onWheel);
      clearTimeout(wheelReleaseTimer);
    };
  }, [isMobile]);

  // Drag-to-scroll with momentum (desktop only)
  useEffect(() => {
    if (isMobile) return;

    let isPointerDown = false;
    let isDragActive = false;
    let startX = 0;
    let startScrollLeft = 0;
    let velocityX = 0;
    let momentumRaf: number;
    const velocityHistory: { dx: number; dt: number }[] = [];

    const DRAG_THRESHOLD = 4;
    const FRICTION = 0.95;
    const MIN_VELOCITY = 0.5;
    const MAX_HISTORY = 5;

    const cancelMomentum = () => {
      cancelAnimationFrame(momentumRaf);
      velocityX = 0;
    };

    const onPointerDown = (e: MouseEvent) => {
      if (showcaseActiveRef.current) return;
      if (e.button !== 0) return;
      if (e.shiftKey) return;
      const target = e.target as HTMLElement;
      if (target.closest('a, button, input, select, textarea, label, .scroll-slider-handle, .scroll-slider-track, [role="button"], .control-panel, .panel-lever')) return;

      cancelMomentum();
      isPointerDown = true;
      isDragActive = false;
      startX = e.clientX;
      startScrollLeft = document.documentElement.scrollLeft;
      velocityHistory.length = 0;
    };

    let lastX = 0;
    let lastTime = 0;

    const onPointerMove = (e: MouseEvent) => {
      if (!isPointerDown) return;

      const dx = e.clientX - startX;

      if (!isDragActive) {
        if (Math.abs(dx) < DRAG_THRESHOLD) return;
        isDragActive = true;
        document.body.classList.add('drag-scrolling');
        lastX = e.clientX;
        lastTime = performance.now();
      }

      e.preventDefault();

      const now = performance.now();
      const dt = now - lastTime;
      const moveDx = e.clientX - lastX;

      if (dt > 0) {
        velocityHistory.push({ dx: moveDx, dt });
        if (velocityHistory.length > MAX_HISTORY) velocityHistory.shift();
      }

      lastX = e.clientX;
      lastTime = now;

      const intendedScroll = startScrollLeft - dx;
      const maxScroll = document.documentElement.scrollWidth - window.innerWidth;
      if (intendedScroll > maxScroll) {
        document.documentElement.scrollLeft = maxScroll;
        const overAmount = intendedScroll - maxScroll;
        const resistance = 1 / (1 + overAmount / 400);
        overscrollXRef.current = overAmount * resistance;
        isInputActiveRef.current = true;
      } else {
        overscrollXRef.current = 0;
        isInputActiveRef.current = false;
        document.documentElement.scrollLeft = intendedScroll;
      }
    };

    let didDrag = false;
    const onClick = (e: MouseEvent) => {
      if (didDrag) {
        e.preventDefault();
        e.stopPropagation();
        didDrag = false;
      }
    };

    const onPointerUp = () => {
      if (!isPointerDown) return;
      isPointerDown = false;
      isInputActiveRef.current = false;

      if (!isDragActive) return;
      isDragActive = false;
      didDrag = true;
      document.body.classList.remove('drag-scrolling');

      let totalDx = 0;
      let totalDt = 0;
      for (const v of velocityHistory) {
        totalDx += v.dx;
        totalDt += v.dt;
      }
      velocityX = totalDt > 0 ? (totalDx / totalDt) * 16 : 0;

      const applyMomentum = () => {
        if (Math.abs(velocityX) < MIN_VELOCITY) {
          isInputActiveRef.current = false;
          return;
        }

        const before = document.documentElement.scrollLeft;
        document.documentElement.scrollLeft -= velocityX;
        const after = document.documentElement.scrollLeft;

        if (before === after && velocityX < 0) {
          const resistance = 1 / (1 + overscrollXRef.current / 300);
          overscrollXRef.current = Math.max(0, overscrollXRef.current + Math.abs(velocityX) * resistance * 0.6);
          isInputActiveRef.current = true;
          velocityX *= 0.85;
          momentumRaf = requestAnimationFrame(applyMomentum);
          return;
        }

        if (before === after) {
          velocityX = 0;
          isInputActiveRef.current = false;
          return;
        }

        velocityX *= FRICTION;
        momentumRaf = requestAnimationFrame(applyMomentum);
      };

      momentumRaf = requestAnimationFrame(applyMomentum);
    };

    const onWheel = () => cancelMomentum();

    window.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove, { passive: false });
    window.addEventListener('mouseup', onPointerUp);
    window.addEventListener('click', onClick, true);
    window.addEventListener('wheel', onWheel, { passive: true });

    return () => {
      window.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      window.removeEventListener('click', onClick, true);
      window.removeEventListener('wheel', onWheel);
      cancelMomentum();
    };
  }, [isMobile]);

  return { containerRef, overscrollXRef, isInputActiveRef };
}
