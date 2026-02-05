"use client";

import { useRef, useEffect, useState, useCallback } from "react";

export default function ScrollSlider() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [metrics, setMetrics] = useState({ handleWidth: 50, handleLeft: 0 });

  const getScrollMetrics = useCallback(() => {
    const container = document.querySelector(".horizontal-scroll-container");
    if (!container || !trackRef.current) return null;

    const totalWidth = container.scrollWidth;
    const viewportWidth = window.innerWidth;
    const scrollX = window.scrollX || document.documentElement.scrollLeft || document.body.scrollLeft;
    const trackWidth = trackRef.current.offsetWidth;
    const maxScroll = totalWidth - viewportWidth;

    return { totalWidth, viewportWidth, scrollX, trackWidth, maxScroll };
  }, []);

  const updateHandle = useCallback(() => {
    const m = getScrollMetrics();
    if (!m || m.maxScroll <= 0) return;

    const ratio = m.viewportWidth / m.totalWidth;
    const handleWidth = Math.max(30, ratio * m.trackWidth);
    const scrollPercent = m.scrollX / m.maxScroll;
    const handleLeft = scrollPercent * (m.trackWidth - handleWidth);

    setMetrics({ handleWidth, handleLeft });
  }, [getScrollMetrics]);

  // Initialize and listen to scroll
  useEffect(() => {
    updateHandle();
    const timers = [
      setTimeout(updateHandle, 50),
      setTimeout(updateHandle, 200),
      setTimeout(updateHandle, 500),
      setTimeout(updateHandle, 1000),
    ];

    const onScroll = () => {
      if (!isDragging) requestAnimationFrame(updateHandle);
    };

    window.addEventListener("scroll", onScroll);
    document.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", updateHandle);

    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", updateHandle);
    };
  }, [isDragging, updateHandle]);

  const scrollTo = useCallback((percent: number) => {
    const m = getScrollMetrics();
    if (!m || m.maxScroll <= 0) return;

    const target = percent * m.maxScroll;
    document.documentElement.scrollLeft = target;
    document.body.scrollLeft = target;
  }, [getScrollMetrics]);

  // Click track
  const onTrackClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).classList.contains("scroll-slider-handle")) return;
    if (!trackRef.current) return;

    const rect = trackRef.current.getBoundingClientRect();
    const clickPercent = (e.clientX - rect.left) / rect.width;
    scrollTo(Math.max(0, Math.min(1, clickPercent)));
  };

  // Drag
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
