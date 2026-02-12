"use client";
import { useState, useEffect, useRef } from "react";

/** Compute sunrise/sunset in local decimal hours. */
function getSunTimes(lat: number, lng: number) {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((now.getTime() - start.getTime()) / 86400000) + 1;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const toDeg = (r: number) => (r * 180) / Math.PI;
  const declination = -23.45 * Math.cos(toRad((360 / 365) * (dayOfYear + 10)));
  const decRad = toRad(declination);
  const latRad = toRad(lat);
  const cosHA =
    (Math.sin(toRad(-0.83)) - Math.sin(latRad) * Math.sin(decRad)) /
    (Math.cos(latRad) * Math.cos(decRad));
  if (cosHA > 1) return { sunrise: 7, sunset: 17 };
  if (cosHA < -1) return { sunrise: 3, sunset: 23 };
  const ha = toDeg(Math.acos(cosHA));
  const B = toRad((360 / 365) * (dayOfYear - 81));
  const EoT = 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);
  const solarNoon = 12 - lng / 15 - EoT / 60;
  const tzOffset = now.getTimezoneOffset() / -60;
  return {
    sunrise: solarNoon - ha / 15 + tzOffset,
    sunset: solarNoon + ha / 15 + tzOffset,
  };
}

function formatRemaining(hours: number) {
  const h = Math.floor(hours);
  const m = Math.floor((hours - h) * 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

/** Tiny semicircular arc showing sun position through the day. */
function DaylightArc({ progress, isNight }: { progress: number; isNight: boolean }) {
  // Arc from left to right (π to 0), progress 0→1 maps sunrise→sunset
  const w = 26;
  const h = 16;
  const cx = w / 2;
  const r = 10;
  const baseY = h - 2;

  // Clamp
  const p = Math.max(0, Math.min(1, progress));
  // Angle along the arc: π (left) to 0 (right)
  const angle = Math.PI * (1 - p);
  const dotX = cx + r * Math.cos(angle);
  const dotY = baseY - r * Math.sin(angle);

  return (
    <svg
      className="daylight-arc"
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      fill="none"
    >
      {/* Arc path: semicircle from left to right */}
      <path
        d={`M ${cx - r} ${baseY} A ${r} ${r} 0 0 1 ${cx + r} ${baseY}`}
        stroke="var(--text-muted)"
        strokeWidth="0.8"
        opacity={isNight ? "0.5" : "0.7"}
      />
      {/* Sun dot */}
      <circle cx={dotX} cy={dotY} r="2.5" fill="var(--accent-warm, #e07830)" />
    </svg>
  );
}

export default function StatusBar({ currentSection }: { currentSection: string }) {
  const [time, setTime] = useState("--:--");
  const [mounted, setMounted] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [aspectRatio, setAspectRatio] = useState({ w: 16, h: 9 });
  const [daylight, setDaylight] = useState<{
    remaining: string;
    progress: number;
    isNight: boolean;
  } | null>(null);

  const scrollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const geoIntervalRef = useRef<NodeJS.Timeout | null>(null);

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
      const hours = now.getHours();
      const h12 = hours % 12 || 12;
      const m = String(now.getMinutes()).padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      setTime(`${h12}:${m} ${ampm}`);
    };
    updateTime();
    const timeInterval = setInterval(updateTime, 1000);

    // Daylight — timezone fallback, refined with geolocation
    const updateDaylight = (lat: number, lng: number) => {
      const { sunrise, sunset } = getSunTimes(lat, lng);
      const now = new Date();
      const currentHour = now.getHours() + now.getMinutes() / 60;
      const isNight = currentHour >= sunset || currentHour < sunrise;

      if (isNight) {
        // Time until sunrise
        let untilSunrise = sunrise - currentHour;
        if (untilSunrise < 0) untilSunrise += 24;
        setDaylight({
          remaining: formatRemaining(untilSunrise),
          progress: 0,
          isNight: true,
        });
      } else {
        const totalDaylight = sunset - sunrise;
        const elapsed = currentHour - sunrise;
        const left = sunset - currentHour;
        setDaylight({
          remaining: formatRemaining(left),
          progress: elapsed / totalDaylight,
          isNight: false,
        });
      }
    };

    // Initial: timezone-based estimate
    const tzOffset = new Date().getTimezoneOffset() / -60;
    updateDaylight(40, tzOffset * 15);
    const daylightInterval = setInterval(() => {
      updateDaylight(40, tzOffset * 15);
    }, 60_000);

    // Refine with geolocation if available
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          updateDaylight(latitude, longitude);
          clearInterval(daylightInterval);
          geoIntervalRef.current = setInterval(() => {
            updateDaylight(latitude, longitude);
          }, 60_000);
        },
        () => {}, // fallback already active
        { timeout: 3000 }
      );
    }

    const onScroll = () => {
      setIsScrolling(true);
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
      scrollTimerRef.current = setTimeout(() => setIsScrolling(false), 800);
    };
    document.addEventListener("scroll", onScroll, true);

    return () => {
      window.removeEventListener("resize", updateScreenInfo);
      clearInterval(timeInterval);
      clearInterval(daylightInterval);
      if (geoIntervalRef.current) clearInterval(geoIntervalRef.current);
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
      <div className="status-bar-group">
        {currentSection === 'home' ? (
          daylight && (
            <>
              <DaylightArc progress={daylight.progress} isNight={daylight.isNight} />
              <span className="status-text status-text-dim">
                {daylight.isNight ? `${daylight.remaining} to sunrise` : `${daylight.remaining} of light`}
              </span>
            </>
          )
        ) : (
          <span className="status-text status-text-dim">v0.2</span>
        )}
      </div>
    </div>
  );
}
