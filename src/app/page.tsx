"use client";

import { useState, useRef, useEffect } from "react";
import ShowcaseSection from "./components/ShowcaseSection";

type CharData = { char: string; opacity: number };

export default function Home() {
  const originalName = "Roy Jad";
  const [chars, setChars] = useState<CharData[]>(
    originalName.split("").map((c) => ({ char: c, opacity: 1 }))
  );
  const [isHovering, setIsHovering] = useState(false);
  const [isScrambling, setIsScrambling] = useState(false);

  const scrambleIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const cycleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const stopTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startScramble = (duration?: number) => {
    if (scrambleIntervalRef.current) clearInterval(scrambleIntervalRef.current);
    if (stopTimeoutRef.current) clearTimeout(stopTimeoutRef.current);

    setIsScrambling(true);
    scrambleIntervalRef.current = setInterval(() => {
      setChars(
        originalName.split("").map((c) => ({
          char: c === " " ? " " : "#",
          opacity: Math.random() * 0.7 + 0.3,
        }))
      );
    }, 70);

    if (duration) {
      stopTimeoutRef.current = setTimeout(() => {
        if (scrambleIntervalRef.current) {
          clearInterval(scrambleIntervalRef.current);
          scrambleIntervalRef.current = null;
        }
        setIsScrambling(false);
        setChars(originalName.split("").map((c) => ({ char: c, opacity: 1 })));
      }, duration);
    }
  };

  const stopScramble = () => {
    if (scrambleIntervalRef.current) {
      clearInterval(scrambleIntervalRef.current);
      scrambleIntervalRef.current = null;
    }
    if (stopTimeoutRef.current) {
      clearTimeout(stopTimeoutRef.current);
      stopTimeoutRef.current = null;
    }
    setIsScrambling(false);
    setChars(originalName.split("").map((c) => ({ char: c, opacity: 1 })));
  };

  // Intermittent scramble effect
  useEffect(() => {
    const scheduleCycle = () => {
      const delay = 3000 + Math.random() * 3000;
      cycleTimeoutRef.current = setTimeout(() => {
        if (!isHovering) {
          startScramble(400 + Math.random() * 400);
        }
        scheduleCycle();
      }, delay);
    };

    cycleTimeoutRef.current = setTimeout(() => {
      if (!isHovering) {
        startScramble(400 + Math.random() * 400);
      }
      scheduleCycle();
    }, 2000);

    return () => {
      if (cycleTimeoutRef.current) clearTimeout(cycleTimeoutRef.current);
    };
  }, [isHovering]);

  // Hover effect
  useEffect(() => {
    if (isHovering) {
      startScramble();
    } else {
      stopScramble();
    }
  }, [isHovering]);

  const containerRef = useRef<HTMLDivElement>(null);
  const showcaseRef = useRef<HTMLDivElement>(null);

  // Track current section for nav visibility
  const [currentSection, setCurrentSection] = useState<'home' | 'work'>('home');

  useEffect(() => {
    const handleScroll = () => {
      const scrollX = window.scrollX || document.documentElement.scrollLeft || document.body.scrollLeft;
      const showcaseLeft = showcaseRef.current?.offsetLeft || 0;

      if (scrollX < showcaseLeft - 200) {
        setCurrentSection('home');
      } else {
        setCurrentSection('work');
      }
    };
    document.addEventListener('scroll', handleScroll, true);
    return () => document.removeEventListener('scroll', handleScroll, true);
  }, []);

  const mainRef = useRef<HTMLElement>(null);

  const scrollToWork = () => {
    showcaseRef.current?.scrollIntoView({ behavior: "smooth", inline: "start" });
  };

  const scrollToHome = () => {
    mainRef.current?.scrollIntoView({ behavior: "smooth", inline: "start" });
  };

  return (
    <div className="horizontal-scroll-container" ref={containerRef}>
      {/* Global fixed nav - left corner */}
      <div className="global-nav global-nav-left">
        {currentSection !== 'home' && (
          <a className="nav-btn" onClick={scrollToHome}>
            <span className="nav-arrow nav-arrow-left"><span className="nav-arrow-head-left" /></span>
            Home
          </a>
        )}
      </div>

      {/* Global fixed nav - right corner */}
      <div className="global-nav global-nav-right">
        {currentSection === 'home' && (
          <a className="nav-btn" onClick={scrollToWork}>
            See work
            <span className="nav-arrow"><span className="nav-arrow-head" /></span>
          </a>
        )}
      </div>

      <main ref={mainRef}>
        <div className="main-content">
          <div className="line"><span className="ln">01</span><h1 className={`name ${isScrambling ? "name-scrambling" : ""}`} onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>{chars.map((c, i) => (<span key={i} style={{ opacity: c.opacity }}>{c.char}</span>))}</h1></div>
        <div className="line"><span className="ln">02</span><span className="location">San Francisco</span><span></span></div>
        <div className="line gap"><span className="ln"></span><span></span><span></span></div>
        <div className="line"><span className="ln">03</span><p className="about">Creative technologist, currently tinkering with</p><span></span></div>
        <div className="line"><span className="ln">04</span><p className="about">e-ink interfaces and coding stuff I'd like to exist.</p><span></span></div>
        <div className="line gap"><span className="ln"></span><span></span><span></span></div>
        <div className="line"><span className="ln">05</span><h2 className="section-title">Convictions</h2><span></span></div>
        <div className="line"><span className="ln">06</span><span className="content">Self-driving cars are necessary</span><span></span></div>
        <div className="line"><span className="ln">07</span><span className="content">Clarity and intentionality are core to a good life</span><span></span></div>
        <div className="line"><span className="ln">08</span><span className="content">Spatial computing is the future of interfaces</span><span></span></div>
        <div className="line gap"><span className="ln"></span><span></span><span></span></div>
        <div className="line"><span className="ln">09</span><h2 className="section-title">Work</h2><span></span></div>
        <div className="line"><span className="ln">10</span><a href="https://context.ai" className="company" target="_blank" rel="noopener noreferrer">Context</a><span className="years">2025</span></div>
        <div className="line"><span className="ln">11</span><span className="role">Founding Designer</span><span></span></div>
        <div className="line"><span className="ln"></span><span></span><span></span></div>
        <div className="line"><span className="ln">12</span><span className="company">Various companies</span><span className="years">2021–2025</span></div>
        <div className="line"><span className="ln">13</span><span className="role">YC, a16z, 776</span><span></span></div>
        <div className="line"><span className="ln">14</span><span className="role">Independent Contractor</span><span></span></div>
        <div className="line gap"><span className="ln"></span><span></span><span></span></div>
        <div className="line"><span className="ln">15</span><a href="mailto:jadroy77@gmail.com">Email</a><span></span></div>
        <div className="line"><span className="ln">16</span><a href="https://x.com/jadroy2" target="_blank" rel="noopener noreferrer">Twitter</a><span></span></div>
        <div className="line"><span className="ln">17</span><a href="https://www.linkedin.com/in/royjad/" target="_blank" rel="noopener noreferrer">LinkedIn</a><span></span></div>
        </div>
      </main>
      <section className="showcase-panel" ref={showcaseRef}>
        <ShowcaseSection />
      </section>
    </div>
  );
}
