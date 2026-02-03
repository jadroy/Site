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

  // Line numbering mode
  type NumberingMode = 'all' | 'no-children' | 'children-only' | 'headers-01-02' | 'no-headers' | 'none';
  const [numberingMode, setNumberingMode] = useState<NumberingMode>('headers-01-02');

  const showNumber = (num: string, isChild: boolean, isHeader: boolean, headerIndex?: number, childIndex?: number) => {
    if (numberingMode === 'none') return '';
    if (numberingMode === 'all') return num;
    if (numberingMode === 'no-children') return isChild ? '' : num;
    if (numberingMode === 'children-only') return isChild ? String(childIndex).padStart(2, '0') : '';
    if (numberingMode === 'headers-01-02') return isHeader ? String(headerIndex).padStart(2, '0') : '';
    if (numberingMode === 'no-headers') return isHeader ? '' : num;
    return num;
  };

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

  // Smooth momentum horizontal scroll
  useEffect(() => {
    let velocity = 0;
    let animationId: number | null = null;
    const friction = 0.92;
    const minVelocity = 0.5;

    const animate = () => {
      if (Math.abs(velocity) > minVelocity) {
        document.documentElement.scrollLeft += velocity;
        document.body.scrollLeft += velocity;
        velocity *= friction;
        animationId = requestAnimationFrame(animate);
      } else {
        velocity = 0;
        animationId = null;
      }
    };

    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        velocity += e.deltaY * 0.8;
        if (!animationId) {
          animationId = requestAnimationFrame(animate);
        }
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      window.removeEventListener('wheel', handleWheel);
      if (animationId) cancelAnimationFrame(animationId);
    };
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

      {/* Line numbering toggle */}
      <div className="numbering-toggle">
        <button onClick={() => setNumberingMode('all')} className={numberingMode === 'all' ? 'active' : ''}>All</button>
        <button onClick={() => setNumberingMode('no-children')} className={numberingMode === 'no-children' ? 'active' : ''}>No Children</button>
        <button onClick={() => setNumberingMode('children-only')} className={numberingMode === 'children-only' ? 'active' : ''}>Children</button>
        <button onClick={() => setNumberingMode('headers-01-02')} className={numberingMode === 'headers-01-02' ? 'active' : ''}>Headers 01-02</button>
        <button onClick={() => setNumberingMode('no-headers')} className={numberingMode === 'no-headers' ? 'active' : ''}>No Headers</button>
        <button onClick={() => setNumberingMode('none')} className={numberingMode === 'none' ? 'active' : ''}>None</button>
      </div>

      <main ref={mainRef}>
        <div className="main-content">
          <div className="line"><span className="ln">{showNumber('01', false, true, 1)}</span><h1 className={`name ${isScrambling ? "name-scrambling" : ""}`} onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>{chars.map((c, i) => (<span key={i} style={{ opacity: c.opacity }}>{c.char}</span>))}</h1></div>
          <div className="line"><span className="ln">{showNumber('02', false, false)}</span><span className="location">San Francisco</span><span></span></div>
          <div className="line gap"><span className="ln"></span><span></span><span></span></div>
          <div className="line"><span className="ln">{showNumber('03', false, false)}</span><p className="about">Creative technologist, currently tinkering with</p><span></span></div>
          <div className="line"><span className="ln">{showNumber('04', false, false)}</span><p className="about">e-ink interfaces and coding stuff I'd like to exist.</p><span></span></div>
          <div className="line gap"><span className="ln"></span><span></span><span></span></div>
          <div className="line"><span className="ln">{showNumber('05', false, true, 2)}</span><h2 className="section-title"><span className="comment-prefix">//</span> Work</h2><span></span></div>
          <div className="line"><span className="ln">{showNumber('06', true, false, undefined, 1)}</span><a href="https://context.ai" className="company" target="_blank" rel="noopener noreferrer">Context</a><span className="years">2025</span></div>
          <div className="line"><span className="ln">{showNumber('07', true, false, undefined, 2)}</span><span className="role">Founding Designer</span><span></span></div>
          <div className="line"><span className="ln"></span><span></span><span></span></div>
          <div className="line"><span className="ln">{showNumber('08', true, false, undefined, 3)}</span><span className="company">Various companies</span><span className="years">2021–2025</span></div>
          <div className="line"><span className="ln">{showNumber('09', true, false, undefined, 4)}</span><span className="role">YC, a16z, 776</span><span></span></div>
          <div className="line"><span className="ln">{showNumber('10', true, false, undefined, 5)}</span><span className="role">Independent Contractor</span><span></span></div>
          <div className="line gap"><span className="ln"></span><span></span><span></span></div>
          <div className="line"><span className="ln">{showNumber('11', false, true, 3)}</span><h2 className="section-title"><span className="comment-prefix">//</span> Convictions</h2><span></span></div>
          <div className="line"><span className="ln">{showNumber('12', true, false, undefined, 6)}</span><span className="conviction-item">Self-driving cars are necessary</span><span></span></div>
          <div className="line"><span className="ln">{showNumber('13', true, false, undefined, 7)}</span><span className="conviction-item">Clarity and intentionality are core to a good life</span><span></span></div>
          <div className="line"><span className="ln">{showNumber('14', true, false, undefined, 8)}</span><span className="conviction-item">Spatial computing is the future of interfaces</span><span></span></div>
          <div className="line gap"><span className="ln"></span><span></span><span></span></div>
          <div className="line"><span className="ln">{showNumber('15', false, true, 4)}</span><h2 className="section-title"><span className="comment-prefix">//</span> Contact</h2><span></span></div>
          <div className="line">
            <span className="ln">{showNumber('16', true, false, undefined, 9)}</span>
            <div className="social-links">
              <a href="mailto:jadroy77@gmail.com" className="social-box">Email</a>
              <a href="https://x.com/jadroy2" target="_blank" rel="noopener noreferrer" className="social-box">Twitter</a>
              <a href="https://www.linkedin.com/in/royjad/" target="_blank" rel="noopener noreferrer" className="social-box">LinkedIn</a>
            </div>
          </div>
        </div>
      </main>
      <section className="showcase-panel" ref={showcaseRef}>
        <ShowcaseSection />
      </section>
    </div>
  );
}
