"use client";

import { useRef, useEffect, useState, useCallback } from "react";

export default function ScrollSlider({ trackVertical = false }: { trackVertical?: boolean }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [metrics, setMetrics] = useState({ handleSize: 50, handleOffset: 0 });

  const getScrollMetrics = useCallback(() => {
    if (!trackRef.current) return null;

    const container = document.querySelector(".horizontal-scroll-container") as HTMLElement;
    const html = document.documentElement;
    const body = document.body;

    if (trackVertical) {
      const totalHeight = Math.max(html.scrollHeight, body.scrollHeight);
      const viewportHeight = window.innerHeight;
      const scrollY = window.scrollY;
      const trackSize = trackRef.current.offsetWidth;
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
  }, [trackVertical]);

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

  useEffect(() => {
    updateHandle();
    const timers = [
      setTimeout(updateHandle, 100),
      setTimeout(updateHandle, 300),
      setTimeout(updateHandle, 600),
      setTimeout(updateHandle, 1000),
    ];

    const onScroll = () => {
      if (!isDragging) requestAnimationFrame(updateHandle);
    };

    window.addEventListener("scroll", onScroll);
    window.addEventListener("resize", updateHandle);

    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updateHandle);
    };
  }, [isDragging, updateHandle]);

  const scrollTo = useCallback((percent: number) => {
    const m = getScrollMetrics();
    if (!m || m.maxScroll <= 0) return;

    const target = Math.round(percent * m.maxScroll);
    if (trackVertical) {
      window.scrollTo(0, target);
    } else {
      window.scrollTo(target, 0);
      document.documentElement.scrollLeft = target;
      document.body.scrollLeft = target;
    }
  }, [getScrollMetrics, trackVertical]);

  const onTrackClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).classList.contains("scroll-slider-handle")) return;
    if (!trackRef.current) return;

    const rect = trackRef.current.getBoundingClientRect();
    const clickPercent = (e.clientX - rect.left) / rect.width;
    scrollTo(Math.max(0, Math.min(1, clickPercent)));
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
      const trackSize = rect.width;
      const offset = clientPos - rect.left;
      const percent = (offset - metrics.handleSize / 2) / (trackSize - metrics.handleSize);
      const clamped = Math.max(0, Math.min(1, percent));

      scrollTo(clamped);
      setMetrics(prev => ({
        ...prev,
        handleOffset: clamped * (trackSize - prev.handleSize)
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
  }, [isDragging, metrics.handleSize, scrollTo, updateHandle, trackVertical]);

  const handleStyle = { width: metrics.handleSize, left: metrics.handleOffset };

  return (
    <div ref={trackRef} className="scroll-slider" onClick={onTrackClick}>
      <div
        className={`scroll-slider-handle ${isDragging ? "dragging" : ""}`}
        style={handleStyle}
        onMouseDown={startDrag}
        onTouchStart={startDrag}
      />
    </div>
  );
}
