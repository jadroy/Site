"use client";

import { useState, useRef, useEffect } from "react";
import ShowcaseSection from "./components/ShowcaseSection";
import ScrollSlider from "./components/ScrollSlider";

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
  const [numberingMode, setNumberingMode] = useState<NumberingMode>('none');

  // Layout sliders
  const [contentWidth, setContentWidth] = useState(570);
  const [fontSize, setFontSize] = useState(15);
  const [lineHeight, setLineHeight] = useState(1.25);
  const [gapSize, setGapSize] = useState(2.1);
  const [treeBranchSize, setTreeBranchSize] = useState(12);

  // Hide controls
  const [showControls, setShowControls] = useState(true);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '.' && e.metaKey) {
        e.preventDefault();
        setShowControls(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
      {showControls && <div className="numbering-toggle">
        <button onClick={() => setNumberingMode('none')} className={numberingMode === 'none' ? 'active' : ''}>None</button>
        <button onClick={() => setNumberingMode('numbers')} className={numberingMode === 'numbers' ? 'active' : ''}>Numbers</button>
        <button onClick={() => setNumberingMode('slashes')} className={numberingMode === 'slashes' ? 'active' : ''}>//</button>
        <button onClick={() => setNumberingMode('header-slashes')} className={numberingMode === 'header-slashes' ? 'active' : ''}>// Headers</button>
        <span className="width-slider">
          <span className="slider-label">W</span>
          <input type="range" min="400" max="700" value={contentWidth} onChange={(e) => setContentWidth(Number(e.target.value))} />
          <span className="width-value">{contentWidth}</span>
        </span>
        <span className="width-slider">
          <span className="slider-label">Font</span>
          <input type="range" min="12" max="20" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} />
          <span className="width-value">{fontSize}</span>
        </span>
        <span className="width-slider">
          <span className="slider-label">LH</span>
          <input type="range" min="1" max="2" step="0.05" value={lineHeight} onChange={(e) => setLineHeight(Number(e.target.value))} />
          <span className="width-value">{lineHeight.toFixed(2)}</span>
        </span>
        <span className="width-slider">
          <span className="slider-label">Gap</span>
          <input type="range" min="1" max="3" step="0.1" value={gapSize} onChange={(e) => setGapSize(Number(e.target.value))} />
          <span className="width-value">{gapSize.toFixed(1)}</span>
        </span>
        <span className="width-slider">
          <span className="slider-label">⎿</span>
          <input type="range" min="8" max="16" value={treeBranchSize} onChange={(e) => setTreeBranchSize(Number(e.target.value))} />
          <span className="width-value">{treeBranchSize}</span>
        </span>
      </div>}

      <main ref={mainRef} style={{
          '--content-max-width': `${contentWidth}px`,
          '--base-font-size': `${fontSize}px`,
          '--line-height': lineHeight,
          '--gap-multiplier': gapSize,
          '--tree-branch-size': `${treeBranchSize}px`
        } as React.CSSProperties}>
        <div className="main-content">
          <div className="line"><span className="ln">{showNumber('01')}</span><h1 className={`name ${isScrambling ? "name-scrambling" : ""}`} onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>{chars.map((c, i) => (<span key={i} style={{ opacity: c.opacity }}>{c.char}</span>))}</h1></div>
          <div className="line"><span className="ln">{showNumber('02')}</span><span className="location"><span className="tree-branch">⎿</span> San Francisco</span></div>
          <div className="line gap"><span className="ln"></span></div>
          <div className="line"><span className="ln">{showNumber('03')}</span><p className="about">Creative technologist, currently tinkering with</p></div>
          <div className="line"><span className="ln">{showNumber('04')}</span><p className="about">e-ink interfaces and making stuff I'd like to exist.</p></div>
          <div className="line gap"><span className="ln"></span></div>
          <div className="line"><span className="ln">{showNumber('05', true)}</span><h2 className="section-title section-title-muted">Convictions</h2></div>
          <div className="line"><span className="ln">{showNumber('06')}</span><span className="conviction-item"><span className="tree-branch">⎿</span> Self-driving cars are necessary</span></div>
          <div className="line"><span className="ln">{showNumber('07')}</span><span className="conviction-item"><span className="tree-branch">⎿</span> Clarity and intentionality are core to a good life</span></div>
          <div className="line"><span className="ln">{showNumber('08')}</span><span className="conviction-item"><span className="tree-branch">⎿</span> Spatial computing is the future of interfaces</span></div>
          <div className="line gap"><span className="ln"></span></div>
          <div className="line"><span className="ln">{showNumber('09')}</span><span className="company-row"><a href="https://context.ai" className="company" target="_blank" rel="noopener noreferrer">Context</a><span className="years">2025</span></span></div>
          <div className="line"><span className="ln">{showNumber('10')}</span><span className="role"><span className="tree-branch">⎿</span> Founding Designer</span></div>
          <div className="line gap"><span className="ln"></span></div>
          <div className="line"><span className="ln">{showNumber('11')}</span><span className="company-row"><span className="company">Various companies</span><span className="years">2021–2025</span></span></div>
          <div className="line"><span className="ln">{showNumber('12')}</span><span className="role"><span className="tree-branch">⎿</span> YC, a16z, 776</span></div>
          <div className="line"><span className="ln">{showNumber('13')}</span><span className="role"><span className="tree-branch">⎿</span> Independent Contractor</span></div>
          <div className="line gap"><span className="ln"></span></div>
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
      <ScrollSlider
        containerRef={containerRef}
        mainRef={mainRef}
        showcaseRef={showcaseRef}
      />
    </div>
  );
}
