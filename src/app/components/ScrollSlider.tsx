"use client";

import { useRef, useEffect, useState, useCallback } from "react";

const sections = [
  { id: "home", label: "Home" },
  { id: "work", label: "Work" },
];

export default function ScrollSlider() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [metrics, setMetrics] = useState({ handleWidth: 50, handleLeft: 0 });
  const [sectionPositions, setSectionPositions] = useState<{ id: string; percent: number }[]>([]);

  const getScrollMetrics = useCallback(() => {
    if (!trackRef.current) return null;

    // Try multiple ways to get total width
    const container = document.querySelector(".horizontal-scroll-container") as HTMLElement;
    const html = document.documentElement;
    const body = document.body;

    const totalWidth = Math.max(
      container?.scrollWidth || 0,
      html.scrollWidth,
      body.scrollWidth
    );
    const viewportWidth = window.innerWidth;
    const scrollX = Math.max(window.scrollX, html.scrollLeft, body.scrollLeft);
    const trackWidth = trackRef.current.offsetWidth;
    const maxScroll = totalWidth - viewportWidth;

    return { totalWidth, viewportWidth, scrollX, trackWidth, maxScroll };
  }, []);

  const updateHandle = useCallback(() => {
    const m = getScrollMetrics();
    if (!m) return;

    if (m.maxScroll <= 0) {
      setMetrics({ handleWidth: m.trackWidth, handleLeft: 0 });
      return;
    }

    const ratio = m.viewportWidth / m.totalWidth;
    const handleWidth = Math.max(30, ratio * m.trackWidth);
    const scrollPercent = m.scrollX / m.maxScroll;
    const handleLeft = scrollPercent * (m.trackWidth - handleWidth);

    setMetrics({ handleWidth, handleLeft });
  }, [getScrollMetrics]);

  const updateSectionPositions = useCallback(() => {
    const m = getScrollMetrics();
    if (!m || m.maxScroll <= 0) return;

    const main = document.querySelector("main");
    const showcase = document.querySelector(".showcase-panel");

    const positions: { id: string; percent: number }[] = [];

    if (main) {
      positions.push({ id: "home", percent: 0 });
    }
    if (showcase) {
      const showcaseLeft = (showcase as HTMLElement).offsetLeft;
      positions.push({ id: "work", percent: showcaseLeft / m.totalWidth });
    }

    setSectionPositions(positions);
  }, [getScrollMetrics]);

  useEffect(() => {
    updateHandle();
    updateSectionPositions();
    const timers = [
      setTimeout(updateHandle, 100),
      setTimeout(updateHandle, 300),
      setTimeout(updateHandle, 600),
      setTimeout(updateHandle, 1000),
    ];
    setTimeout(updateSectionPositions, 500);

    const onScroll = () => {
      if (!isDragging) requestAnimationFrame(updateHandle);
    };

    window.addEventListener("scroll", onScroll);
    document.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", updateHandle);
    window.addEventListener("resize", updateSectionPositions);

    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", updateHandle);
      window.removeEventListener("resize", updateSectionPositions);
    };
  }, [isDragging, updateHandle, updateSectionPositions]);

  const scrollTo = useCallback((percent: number) => {
    const m = getScrollMetrics();
    if (!m || m.maxScroll <= 0) return;

    const target = Math.round(percent * m.maxScroll);
    // Try all methods
    window.scrollTo(target, 0);
    document.documentElement.scrollLeft = target;
    document.body.scrollLeft = target;
  }, [getScrollMetrics]);

  const onTrackClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).classList.contains("scroll-slider-handle")) return;
    if ((e.target as HTMLElement).classList.contains("scroll-slider-label")) return;
    if (!trackRef.current) return;

    const rect = trackRef.current.getBoundingClientRect();
    const clickPercent = (e.clientX - rect.left) / rect.width;
    scrollTo(Math.max(0, Math.min(1, clickPercent)));
  };

  const scrollToSection = (sectionId: string) => {
    const section = sectionPositions.find(s => s.id === sectionId);
    if (section) {
      scrollTo(section.percent);
    }
  };

  const startDrag = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  useEffect(() => {
    if (!isDragging) return;

    const onMove = (clientX: number) => {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const trackWidth = rect.width;
      const percent = (clientX - rect.left - metrics.handleWidth / 2) / (trackWidth - metrics.handleWidth);
      const clamped = Math.max(0, Math.min(1, percent));

      scrollTo(clamped);
      setMetrics(prev => ({
        ...prev,
        handleLeft: clamped * (trackWidth - prev.handleWidth)
      }));
    };

    const onMouseMove = (e: MouseEvent) => onMove(e.clientX);
    const onTouchMove = (e: TouchEvent) => onMove(e.touches[0].clientX);
    const onEnd = () => {
      setIsDragging(false);
      updateHandle();
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("mouseup", onEnd);
    window.addEventListener("touchend", onEnd);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("mouseup", onEnd);
      window.removeEventListener("touchend", onEnd);
    };
  }, [isDragging, metrics.handleWidth, scrollTo, updateHandle]);

  return (
    <div ref={trackRef} className="scroll-slider" onClick={onTrackClick}>
      <div className="scroll-slider-sections">
        {sections.map((section) => (
          <span
            key={section.id}
            className="scroll-slider-label"
            onClick={() => scrollToSection(section.id)}
          >
            {section.label}
          </span>
        ))}
      </div>
      <div
        className={`scroll-slider-handle ${isDragging ? "dragging" : ""}`}
        style={{
          width: metrics.handleWidth,
          left: metrics.handleLeft,
        }}
        onMouseDown={startDrag}
        onTouchStart={startDrag}
      />
    </div>
  );
}
