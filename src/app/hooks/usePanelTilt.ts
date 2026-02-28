"use client";

import { useEffect } from "react";

export function usePanelTilt(
  ref: React.RefObject<HTMLElement | null>,
  enabled: boolean,
  booted: boolean = true,
) {
  useEffect(() => {
    if (!enabled || !booted) return;
    const el = ref.current;
    if (!el) return;

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      el.style.transform = `perspective(1200px) rotateX(${-y * 0.4}deg) rotateY(${x * 0.4}deg) scale(1.005) translateY(-2px)`;
    };

    const onLeave = () => {
      el.style.transform = '';
    };

    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
      el.style.transform = '';
    };
  }, [enabled, booted]);
}
