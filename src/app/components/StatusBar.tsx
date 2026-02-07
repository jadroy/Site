"use client";
import { useState, useEffect, useRef } from "react";

export default function StatusBar({ currentSection }: { currentSection: string }) {
  const [time, setTime] = useState("--:--");
  const [mounted, setMounted] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [aspectRatio, setAspectRatio] = useState({ w: 16, h: 9 });

  const scrollTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);

    const updateScreenInfo = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;

      const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
      const d = gcd(w, h);
      let rw = w / d;
      let rh = h / d;
      if (rw > 50 || rh > 50) {
        const raw = w / h;
        if (Math.abs(raw - 16 / 9) < 0.1) { rw = 16; rh = 9; }
        else if (Math.abs(raw - 16 / 10) < 0.1) { rw = 16; rh = 10; }
        else if (Math.abs(raw - 4 / 3) < 0.1) { rw = 4; rh = 3; }
        else if (Math.abs(raw - 21 / 9) < 0.1) { rw = 21; rh = 9; }
        else { rw = Math.round(raw * 10); rh = 10; }
      }
      setAspectRatio({ w: rw, h: rh });
    };
    updateScreenInfo();
    window.addEventListener("resize", updateScreenInfo);

    const updateTime = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, "0");
      const m = String(now.getMinutes()).padStart(2, "0");
      setTime(`${h}:${m}`);
    };
    updateTime();
    const timeInterval = setInterval(updateTime, 1000);

    const onScroll = () => {
      setIsScrolling(true);
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
      scrollTimerRef.current = setTimeout(() => setIsScrolling(false), 800);
    };
    document.addEventListener("scroll", onScroll, true);

    return () => {
      window.removeEventListener("resize", updateScreenInfo);
      clearInterval(timeInterval);
      document.removeEventListener("scroll", onScroll, true);
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
    };
  }, []);

  if (!mounted) return null;

  const arMaxH = 10;
  const arW = Math.round((aspectRatio.w / aspectRatio.h) * arMaxH);
  const arH = arMaxH;

  return (
    <div className={`status-bar ${isScrolling ? "status-bar-hidden" : ""}`}>
      <div className="status-bar-group status-bar-left">
        <span
          className="aspect-ratio-box"
          style={{ width: arW, height: arH }}
        />
        <span className="status-text status-text-dim">{aspectRatio.w}:{aspectRatio.h}</span>
      </div>

      <div className="status-bar-group status-bar-right">
        <span className="status-text">{time}</span>
      </div>
    </div>
  );
}
