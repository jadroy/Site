"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";

// Configure card order here - rearrange to change display order
const showcaseItems = [
  { src: "/Humanoids (1).png", alt: "Humanoids", caption: "Humanoids", link: "https://humanoid-index.com", type: "image" },
  { src: "/share-soren-NEWSITE-animation.mov", alt: "Share Animation", caption: "Share Animation", type: "video", playbackRate: 1.25 },
  { src: "/Landing Hero.png", alt: "Landing Hero", caption: "Landing Hero", type: "image" },
  { src: "/Send button animation.mov", alt: "Send Button Animation", caption: "Send Button Animation", type: "video" },
];

export default function ShowcaseSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const [translateX, setTranslateX] = useState(0);
  const [sectionHeight, setSectionHeight] = useState("100vh");
  const [maxTranslate, setMaxTranslate] = useState(0);

  const cards = showcaseItems;

  useEffect(() => {
    const calculateDimensions = () => {
      if (!cardsRef.current) return;

      const paddingLeft = window.innerWidth <= 768 ? 24 : 280;
      const totalCardsWidth = cardsRef.current.scrollWidth;
      const scrollableWidth = Math.max(0, totalCardsWidth - window.innerWidth + paddingLeft);

      setMaxTranslate(scrollableWidth);

      // Convert horizontal scroll distance to vertical height
      const scrollMultiplier = 1.5;
      const height = window.innerHeight + scrollableWidth * scrollMultiplier;
      setSectionHeight(`${height}px`);
    };

    const handleScroll = () => {
      if (!sectionRef.current) return;

      const section = sectionRef.current;
      const rect = section.getBoundingClientRect();
      const sectionHeightPx = section.offsetHeight;
      const viewportHeight = window.innerHeight;

      const scrollStart = rect.top;
      const scrollEnd = rect.bottom - viewportHeight;
      const scrollRange = sectionHeightPx - viewportHeight;

      if (scrollStart <= 0 && scrollEnd >= 0 && scrollRange > 0) {
        const progress = Math.abs(scrollStart) / scrollRange;
        const clampedProgress = Math.max(0, Math.min(1, progress));
        setTranslateX(-clampedProgress * maxTranslate);
      }
    };

    // Wait for media to load before calculating
    const timer = setTimeout(calculateDimensions, 100);

    window.addEventListener("resize", calculateDimensions);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", calculateDimensions);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [maxTranslate]);

  return (
    <section className="showcase" ref={sectionRef} style={{ height: sectionHeight }}>
      <div className="showcase-sticky">
        <h2 className="section-title">Showcase</h2>
        <div
          ref={cardsRef}
          className="showcase-cards"
          style={{ transform: `translateX(${translateX}px)` }}
        >
          {cards.map((item, index) => {
            const cardContent = item.type === "video" ? (
              <div className="showcase-card">
                <video
                  src={item.src}
                  autoPlay
                  loop
                  muted
                  playsInline
                  ref={(el) => {
                    if (el && item.playbackRate) {
                      el.playbackRate = item.playbackRate;
                    }
                  }}
                />
              </div>
            ) : (
              <div className="showcase-card">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.src}
                  alt={item.alt}
                />
              </div>
            );
            return (
              <div key={index} className="showcase-item">
                {item.link ? (
                  <a href={item.link} target="_blank" rel="noopener noreferrer">
                    {cardContent}
                  </a>
                ) : (
                  cardContent
                )}
                {item.link ? (
                  <a href={item.link} className="showcase-caption showcase-caption-link" target="_blank" rel="noopener noreferrer">
                    {item.caption} ↗
                  </a>
                ) : (
                  <p className="showcase-caption">{item.caption}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
