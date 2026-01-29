"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";

// Configure card order here - rearrange to change display order
const showcaseItems = [
  { src: "/Humanoid Index.png", alt: "Humanoid Index", caption: "Humanoid Index", link: "https://humanoid-index.com" },
  { src: "/CleanShot 2025-12-02 at 14.18.43@2x (1).png", alt: "CleanShot", caption: "CleanShot" },
  { src: "/Landing Hero.png", alt: "Landing Hero", caption: "Landing Hero" },
  { src: "/Core chat - new empty state.png", alt: "Core Chat Empty State", caption: "Core Chat" },
  { src: "/Choose your plan page-2.png", alt: "Choose Your Plan", caption: "Choose Your Plan" },
  { src: "/Share this project 2.png", alt: "Share Project", caption: "Share Project" },
];

export default function ShowcaseSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [translateX, setTranslateX] = useState(0);

  const cards = showcaseItems;

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;

      const section = sectionRef.current;
      const rect = section.getBoundingClientRect();
      const sectionHeight = section.offsetHeight;
      const viewportHeight = window.innerHeight;

      // Calculate scroll progress within the section (0 to 1)
      const scrollStart = rect.top;
      const scrollEnd = rect.bottom - viewportHeight;
      const scrollRange = sectionHeight - viewportHeight;

      if (scrollStart <= 0 && scrollEnd >= 0) {
        const progress = Math.abs(scrollStart) / scrollRange;
        const clampedProgress = Math.max(0, Math.min(1, progress));

        // Calculate max translate based on cards width
        const cardWidth = window.innerWidth <= 768 ? 500 : 900;
        const gap = 12;
        const paddingLeft = window.innerWidth <= 768 ? 24 : 280;
        const totalCardsWidth = showcaseItems.length * cardWidth + (showcaseItems.length - 1) * gap;
        const maxTranslate = Math.max(0, totalCardsWidth - window.innerWidth + paddingLeft + gap);

        setTranslateX(-clampedProgress * maxTranslate);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="showcase" ref={sectionRef}>
      <div className="showcase-sticky">
        <h2 className="section-title">Showcase</h2>
        <div
          className="showcase-cards"
          style={{ transform: `translateX(${translateX}px)` }}
        >
          {cards.map((item, index) => {
            const cardImage = (
              <div className="showcase-card">
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  style={{ objectFit: "contain" }}
                />
              </div>
            );
            return (
              <div key={index} className="showcase-item">
                {item.link ? (
                  <a href={item.link} target="_blank" rel="noopener noreferrer">
                    {cardImage}
                  </a>
                ) : (
                  cardImage
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
