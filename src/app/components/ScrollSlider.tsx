"use client";

import { useRef, useEffect, useState, useCallback, RefObject } from "react";

interface ScrollSliderProps {
  containerRef: RefObject<HTMLDivElement | null>;
}

export default function ScrollSlider({ containerRef }: ScrollSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [handleWidth, setHandleWidth] = useState(40);
  const [handleLeft, setHandleLeft] = useState(0);

  const updateSlider = useCallback(() => {
    if (!trackRef.current || !containerRef.current) return;

    const scrollX = window.scrollX;
    const totalWidth = containerRef.current.scrollWidth;
    const viewportWidth = window.innerWidth;
    const trackWidth = trackRef.current.offsetWidth;

    // Only update if there's actual horizontal scroll
    if (totalWidth <= viewportWidth) return;

    // Handle width proportional to viewport/total
    const ratio = viewportWidth / totalWidth;
    const newHandleWidth = Math.max(40, ratio * trackWidth);
    setHandleWidth(newHandleWidth);

    // Handle position
    const maxScroll = totalWidth - viewportWidth;
    const scrollPercent = maxScroll > 0 ? scrollX / maxScroll : 0;
    const maxHandleLeft = trackWidth - newHandleWidth;
    setHandleLeft(scrollPercent * maxHandleLeft);
  }, [containerRef]);

  // Initial setup and scroll sync
  useEffect(() => {
    // Wait for layout to be ready
    const initTimeout = setTimeout(updateSlider, 200);

    const onScroll = () => {
      if (!isDragging) {
        requestAnimationFrame(updateSlider);
      }
    };

    document.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", updateSlider);

    return () => {
      clearTimeout(initTimeout);
      document.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", updateSlider);
    };
  }, [isDragging, updateSlider]);

  // Click on track to scroll
  const onTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!trackRef.current || !containerRef.current) return;
    if ((e.target as HTMLElement).classList.contains("scroll-slider-handle")) return;

    const rect = trackRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const trackWidth = rect.width;

    const totalWidth = containerRef.current.scrollWidth;
    const viewportWidth = window.innerWidth;
    const maxScroll = totalWidth - viewportWidth;

    const targetScroll = (clickX / trackWidth) * maxScroll;
    window.scrollTo({ left: targetScroll, behavior: "smooth" });
  };

  // Drag start
  const onHandleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  // Mouse drag
  useEffect(() => {
    if (!isDragging) return;

    const onMouseMove = (e: MouseEvent) => {
      if (!trackRef.current || !containerRef.current) return;

      const rect = trackRef.current.getBoundingClientRect();
      const trackWidth = rect.width;
      const relativeX = e.clientX - rect.left - handleWidth / 2;
      const clampedX = Math.max(0, Math.min(relativeX, trackWidth - handleWidth));

      const totalWidth = containerRef.current.scrollWidth;
      const viewportWidth = window.innerWidth;
      const maxScroll = totalWidth - viewportWidth;
      const scrollPercent = clampedX / (trackWidth - handleWidth);

      window.scrollTo({ left: scrollPercent * maxScroll });
      setHandleLeft(clampedX);
    };

    const onMouseUp = () => {
      setIsDragging(false);
      updateSlider();
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, [isDragging, handleWidth, containerRef, updateSlider]);

  // Touch drag
  const onHandleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    setIsDragging(true);
  };

  useEffect(() => {
    if (!isDragging) return;

    const onTouchMove = (e: TouchEvent) => {
      if (!trackRef.current || !containerRef.current) return;

      const rect = trackRef.current.getBoundingClientRect();
      const trackWidth = rect.width;
      const relativeX = e.touches[0].clientX - rect.left - handleWidth / 2;
      const clampedX = Math.max(0, Math.min(relativeX, trackWidth - handleWidth));

      const totalWidth = containerRef.current.scrollWidth;
      const viewportWidth = window.innerWidth;
      const maxScroll = totalWidth - viewportWidth;
      const scrollPercent = clampedX / (trackWidth - handleWidth);

      window.scrollTo({ left: scrollPercent * maxScroll });
      setHandleLeft(clampedX);
    };

    const onTouchEnd = () => {
      setIsDragging(false);
      updateSlider();
    };

    document.addEventListener("touchmove", onTouchMove, { passive: true });
    document.addEventListener("touchend", onTouchEnd);

    return () => {
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
    };
  }, [isDragging, handleWidth, containerRef, updateSlider]);

  return (
    <div
      ref={trackRef}
      className="scroll-slider"
      onClick={onTrackClick}
    >
      <div
        className={`scroll-slider-handle ${isDragging ? "dragging" : ""}`}
        style={{
          width: handleWidth,
          left: handleLeft,
        }}
        onMouseDown={onHandleMouseDown}
        onTouchStart={onHandleTouchStart}
      />
    </div>
  );
}
