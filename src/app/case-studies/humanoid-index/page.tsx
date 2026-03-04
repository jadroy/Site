"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { WindowBar } from "../../components/WindowBar";

const humanoidMedia = [
  {
    title: "WALKTHROUGH",
    src: "/Humanoid Index/Humanoid Index walkthrough.mp4",
    alt: "Humanoid Index – Full walkthrough",
    type: "video" as const,
  },
  {
    title: "CAROUSEL VIEW",
    src: "/Humanoid Index/CleanShot 2026-02-06 at 14.40.46@2x.png",
    alt: "Humanoid Index – Carousel view showing Neo by 1X Technologies",
    type: "image" as const,
  },
  {
    title: "ROBOT DETAIL",
    src: "/Humanoid Index/CleanShot 2026-02-06 at 14.41.36@2x.png",
    alt: "Humanoid Index – Robot detail page",
    type: "image" as const,
  },
  {
    title: "GRID VIEW",
    src: "/Humanoid Index/CleanShot 2026-02-06 at 14.40.53@2x.png",
    alt: "Humanoid Index – Grid view of all humanoid robots",
    type: "image" as const,
  },
  {
    title: "DEMO",
    src: "/Humanoid Index/CleanShot 2026-02-06 at 14.41.55.mp4",
    alt: "Humanoid Index – Demo walkthrough",
    type: "video" as const,
  },
];

export default function HumanoidIndexCaseStudy() {
  const [revealed, setRevealed] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    requestAnimationFrame(() => setRevealed(true));
  }, []);

  /* Translate vertical wheel → horizontal scroll */
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  /* Theme — sync dark mode from localStorage */
  useEffect(() => {
    const saved = localStorage.getItem("rj-theme-pref");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.dark) {
          document.documentElement.dataset.theme = "dark";
        }
      } catch {}
    }
  }, []);

  return (
    <div className={`cs-page${revealed ? " cs-revealed" : ""}`} ref={scrollRef}>
      {/* Header panel */}
      <header className="cs-header">
        <Link href="/" className="cs-back">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.2" />
          </svg>
          Back
        </Link>
        <h1 className="cs-title">Humanoid Index</h1>
        <p className="cs-subtitle">A catalog of humanoid robots</p>
        <a
          href="https://humanoids-index.com"
          target="_blank"
          rel="noopener noreferrer"
          className="cs-visit-link"
        >
          Visit humanoids-index.com
          <svg className="external-arrow" width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M1 9L9 1M9 1H3M9 1V7" stroke="currentColor" strokeWidth="1.2" />
          </svg>
        </a>
      </header>

      {/* Window panels */}
      {humanoidMedia.map((item, i) => (
        <div key={i} className="cs-window" style={{ animationDelay: `${0.1 + i * 0.08}s` }}>
          <div className="cs-window-strip">
            <span>{i + 1}</span>
          </div>
          <div className="cs-window-content">
            {item.type === "video" ? (
              <video
                src={item.src}
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.src} alt={item.alt} />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
