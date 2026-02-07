"use client";

import { useRef, useEffect, useState, useCallback } from "react";

const sections = [
  { id: "home", label: "Home" },
  { id: "work", label: "Work" },
];

export default function ScrollSlider({ vertical = false }: { vertical?: boolean }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [metrics, setMetrics] = useState({ handleSize: 50, handleOffset: 0 });
  const [sectionPositions, setSectionPositions] = useState<{ id: string; percent: number }[]>([]);

  const getScrollMetrics = useCallback(() => {
    if (!trackRef.current) return null;

    const container = document.querySelector(".horizontal-scroll-container") as HTMLElement;
    const html = document.documentElement;
    const body = document.body;

    if (vertical) {
      const totalHeight = Math.max(html.scrollHeight, body.scrollHeight);
      const viewportHeight = window.innerHeight;
      const scrollY = window.scrollY;
      const trackSize = trackRef.current.offsetHeight;
      const maxScroll = totalHeight - viewportHeight;
      return { totalSize: totalHeight, viewportSize: viewportHeight, scrollPos: scrollY, trackSize, maxScroll };
    }

    const totalSize = Math.max(
      container?.scrollWidth || 0,
      html.scrollWidth,
      body.scrollWidth
    );
    const viewportSize = window.innerWidth;
    const scrollPos = Math.max(window.scrollX, html.scrollLeft, body.scrollLeft);
    const trackSize = trackRef.current.offsetWidth;
    const maxScroll = totalSize - viewportSize;

    return { totalSize, viewportSize, scrollPos, trackSize, maxScroll };
  }, [vertical]);

  const updateHandle = useCallback(() => {
    const m = getScrollMetrics();
    if (!m) return;

    if (m.maxScroll <= 0) {
      setMetrics({ handleSize: m.trackSize, handleOffset: 0 });
      return;
    }

    const ratio = m.viewportSize / m.totalSize;
    const handleSize = Math.max(30, ratio * m.trackSize);
    const scrollPercent = m.scrollPos / m.maxScroll;
    const handleOffset = scrollPercent * (m.trackSize - handleSize);

    setMetrics({ handleSize, handleOffset });
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
      if (vertical) {
        const showcaseTop = (showcase as HTMLElement).offsetTop;
        positions.push({ id: "work", percent: showcaseTop / m.totalSize });
      } else {
        const showcaseLeft = (showcase as HTMLElement).offsetLeft;
        positions.push({ id: "work", percent: showcaseLeft / m.totalSize });
      }
    }

    setSectionPositions(positions);
  }, [getScrollMetrics, vertical]);

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
    if (vertical) {
      window.scrollTo(0, target);
    } else {
      window.scrollTo(target, 0);
      document.documentElement.scrollLeft = target;
      document.body.scrollLeft = target;
    }
  }, [getScrollMetrics, vertical]);

  const onTrackClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).classList.contains("scroll-slider-handle")) return;
    if ((e.target as HTMLElement).classList.contains("scroll-slider-label")) return;
    if (!trackRef.current) return;

    const rect = trackRef.current.getBoundingClientRect();
    const clickPercent = vertical
      ? (e.clientY - rect.top) / rect.height
      : (e.clientX - rect.left) / rect.width;
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

    const onMove = (clientPos: number) => {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const trackSize = vertical ? rect.height : rect.width;
      const offset = vertical ? (clientPos - rect.top) : (clientPos - rect.left);
      const percent = (offset - metrics.handleSize / 2) / (trackSize - metrics.handleSize);
      const clamped = Math.max(0, Math.min(1, percent));

      scrollTo(clamped);
      setMetrics(prev => ({
        ...prev,
        handleOffset: clamped * (trackSize - prev.handleSize)
      }));
    };

    const onMouseMove = (e: MouseEvent) => onMove(vertical ? e.clientY : e.clientX);
    const onTouchMove = (e: TouchEvent) => onMove(vertical ? e.touches[0].clientY : e.touches[0].clientX);
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
  }, [isDragging, metrics.handleSize, scrollTo, updateHandle, vertical]);

  const handleStyle = vertical
    ? { height: metrics.handleSize, top: metrics.handleOffset }
    : { width: metrics.handleSize, left: metrics.handleOffset };

  return (
    <div ref={trackRef} className={`scroll-slider ${vertical ? 'scroll-slider-vertical' : ''}`} onClick={onTrackClick}>
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
        style={handleStyle}
        onMouseDown={startDrag}
        onTouchStart={startDrag}
      />
    </div>
  );
}
