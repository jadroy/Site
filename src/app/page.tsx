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
  type NumberingMode = 'none' | 'numbers' | 'slashes' | 'header-slashes';
  const [numberingMode, setNumberingMode] = useState<NumberingMode>('slashes');

  const showNumber = (num: string, isHeader?: boolean) => {
    if (numberingMode === 'none') return '';
    if (numberingMode === 'numbers') return num;
    if (numberingMode === 'slashes') return '//';
    if (numberingMode === 'header-slashes') return isHeader ? '//' : '';
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

  // Smooth horizontal scroll
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        document.documentElement.scrollLeft += e.deltaY;
        document.body.scrollLeft += e.deltaY;
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
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
        <button onClick={() => setNumberingMode('none')} className={numberingMode === 'none' ? 'active' : ''}>None</button>
        <button onClick={() => setNumberingMode('numbers')} className={numberingMode === 'numbers' ? 'active' : ''}>Numbers</button>
        <button onClick={() => setNumberingMode('slashes')} className={numberingMode === 'slashes' ? 'active' : ''}>//</button>
        <button onClick={() => setNumberingMode('header-slashes')} className={numberingMode === 'header-slashes' ? 'active' : ''}>// Headers</button>
      </div>

      <main ref={mainRef}>
        <div className="main-content">
          <div className="line"><span className="ln">{showNumber('01')}</span><h1 className={`name ${isScrambling ? "name-scrambling" : ""}`} onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>{chars.map((c, i) => (<span key={i} style={{ opacity: c.opacity }}>{c.char}</span>))}</h1></div>
          <div className="line"><span className="ln">{showNumber('02')}</span><span className="location">San Francisco</span></div>
          <div className="line gap"><span className="ln"></span></div>
          <div className="line"><span className="ln">{showNumber('03')}</span><p className="about">Creative technologist, currently tinkering with</p></div>
          <div className="line"><span className="ln">{showNumber('04')}</span><p className="about">e-ink interfaces and coding stuff I'd like to exist.</p></div>
          <div className="line gap"><span className="ln"></span></div>
          <div className="line"><span className="ln">{showNumber('05', true)}</span><h2 className="section-title">Work</h2></div>
          <div className="line"><span className="ln">{showNumber('06')}</span><a href="https://context.ai" className="company" target="_blank" rel="noopener noreferrer">Context</a><span className="years">2025</span></div>
          <div className="line"><span className="ln">{showNumber('07')}</span><span className="role">Founding Designer</span></div>
          <div className="line gap"><span className="ln"></span></div>
          <div className="line"><span className="ln">{showNumber('08')}</span><span className="company">Various companies</span><span className="years">2021–2025</span></div>
          <div className="line"><span className="ln">{showNumber('09')}</span><span className="role">YC, a16z, 776</span></div>
          <div className="line"><span className="ln">{showNumber('10')}</span><span className="role">Independent Contractor</span></div>
          <div className="line gap"><span className="ln"></span></div>
          <div className="line"><span className="ln">{showNumber('11', true)}</span><h2 className="section-title">Convictions</h2></div>
          <div className="line"><span className="ln">{showNumber('12')}</span><span className="conviction-item"><span className="tree-branch">⎿</span> Self-driving cars are necessary</span></div>
          <div className="line"><span className="ln">{showNumber('13')}</span><span className="conviction-item"><span className="tree-branch">⎿</span> Clarity and intentionality are core to a good life</span></div>
          <div className="line"><span className="ln">{showNumber('14')}</span><span className="conviction-item"><span className="tree-branch">⎿</span> Spatial computing is the future of interfaces</span></div>
          <div className="line gap"><span className="ln"></span></div>
          <div className="line"><span className="ln">{showNumber('15', true)}</span><h2 className="section-title">Contact</h2></div>
          <div className="line">
            <span className="ln">{showNumber('16')}</span>
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
