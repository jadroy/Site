"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

const photos = [
  { src: "/photos/image_1.jpg", caption: "Photo 1" },
  { src: "/photos/image_2.jpg", caption: "Photo 2" },
];

export default function PhotosPage() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const [translateX, setTranslateX] = useState(0);
  const [sectionHeight, setSectionHeight] = useState("100vh");
  const [maxTranslate, setMaxTranslate] = useState(0);

  useEffect(() => {
    const calculateDimensions = () => {
      if (!cardsRef.current) return;

      const paddingLeft = window.innerWidth <= 768 ? 24 : 280;
      const totalCardsWidth = cardsRef.current.scrollWidth;
      const scrollableWidth = Math.max(0, totalCardsWidth - window.innerWidth + paddingLeft);

      setMaxTranslate(scrollableWidth);

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
    <>
      <header className="page-header" style={{ padding: "160px 0 0 280px" }}>
        <Link href="/" className="back-link">
          &larr; Back
        </Link>
        <h1 className="page-title">Photos</h1>
      </header>

      <section className="photos-showcase" ref={sectionRef} style={{ height: sectionHeight }}>
        <div className="photos-showcase-sticky">
          <div
            ref={cardsRef}
            className="photos-showcase-cards"
            style={{ transform: `translateX(${translateX}px)` }}
          >
            {photos.map((photo, index) => (
              <div key={index} className="photo-item">
                <div className="photo-card">
                  <Image
                    src={photo.src}
                    alt={photo.caption}
                    fill
                    style={{ objectFit: "cover" }}
                  />
                </div>
                <p className="photo-caption">{photo.caption}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
