"use client";

import { useRef, useEffect } from "react";

export function useCrosshair(isMobile: boolean) {
  const crosshairRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isMobile) return;
    const el = crosshairRef.current;
    if (!el) return;

    const handleMouseMove = (e: MouseEvent) => {
      el.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;

      const target = e.target as HTMLElement;
      const isLink = target.closest('a, button, [role="button"]');
      const isCard = target.closest('.featured-container');
      const isPanel = target.closest('.spatial-panel, .statement-box');

      if (isCard) el.dataset.size = 'xl';
      else if (isLink) el.dataset.size = 'lg';
      else if (isPanel) el.dataset.size = 'md';
      else el.dataset.size = 'sm';
    };

    const handleMouseLeave = () => { el.style.opacity = '0'; };
    const handleMouseEnter = () => { el.style.opacity = '1'; };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [isMobile]);

  return { crosshairRef };
}
