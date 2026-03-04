"use client";

import { useEffect, useRef } from "react";

export default function Crosshair() {
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dot = dotRef.current;
    if (!dot) return;

    let currentX = 0;
    let currentY = 0;
    let targetX = 0;
    let targetY = 0;
    let currentSize = 12;
    let targetSize = 12;
    let raf: number;

    const getTargetSize = (target: Element | null): number => {
      if (!target) return 12;

      const el = target.closest(
        "a, button, .showcase-card, .nav-btn, .social-box, .scroll-slider-handle"
      );
      if (el) return 56;

      return 36;
    };

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const animate = () => {
      currentX = targetX;
      currentY = targetY;
      currentSize = lerp(currentSize, targetSize, 0.7);

      dot.style.transform = `translate(${currentX - currentSize / 2}px, ${currentY - currentSize / 2}px)`;
      dot.style.width = `${currentSize}px`;
      dot.style.height = `${currentSize}px`;

      raf = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      targetSize = getTargetSize(document.elementFromPoint(e.clientX, e.clientY));
      dot.style.opacity = "1";
    };

    const handleMouseLeave = () => {
      dot.style.opacity = "0";
    };

    raf = requestAnimationFrame(animate);
    window.addEventListener("mousemove", handleMouseMove);
    document.documentElement.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", handleMouseMove);
      document.documentElement.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return <div ref={dotRef} className="cursor-dot" />;
}
