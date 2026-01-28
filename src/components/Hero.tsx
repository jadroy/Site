"use client";

import { useEffect, useRef } from "react";

export function Hero() {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return;
      const scrolled = window.scrollY;
      if (scrolled < window.innerHeight) {
        contentRef.current.style.transform = `translateY(${scrolled * 0.3}px)`;
        contentRef.current.style.opacity = String(1 - scrolled / window.innerHeight);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="hero">
      <div className="hero-content" ref={contentRef}>
        <h1>Your Name</h1>
        <p className="subtitle">Designer & Developer</p>
      </div>
      <div className="scroll-hint">
        <span>Scroll</span>
        <div className="scroll-line"></div>
      </div>
    </section>
  );
}
