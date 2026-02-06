"use client";

import { useState, useRef, useEffect } from "react";
import ShowcaseSection from "./components/ShowcaseSection";
import ScrollSlider from "./components/ScrollSlider";
import StatusBar from "./components/StatusBar";

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
  const [fontSize, setFontSize] = useState(15);
  const [lineHeight, setLineHeight] = useState(1.25);
  const [gapSize, setGapSize] = useState(2.1);
  const [treeBranchSize, setTreeBranchSize] = useState(12);

  // Draggable content position
  const [contentOffset, setContentOffset] = useState({ x: 0, y: 0 }); // Fine-tune with Shift+drag
  const [isDragging, setIsDragging] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const dragStart = useRef({ x: 0, y: 0, offsetX: 0, offsetY: 0 });

  const handleDragStart = (e: React.MouseEvent) => {
    if (!e.shiftKey) return; // Hold shift to drag
    e.preventDefault();
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      offsetX: contentOffset.x,
      offsetY: contentOffset.y
    };
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      setContentOffset({
        x: dragStart.current.offsetX + dx,
        y: dragStart.current.offsetY + dy
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // Hide controls
  const [showControls, setShowControls] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '.' && e.metaKey) {
        e.preventDefault();
        setShowControls(prev => !prev);
      }
      if (e.key === 'Escape') {
        document.body.style.cursor = 'auto';
      }
      if (e.shiftKey && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
        e.preventDefault();
        const amount = e.key === 'ArrowRight' ? 400 : -400;
        window.scrollBy({ left: amount, behavior: 'instant' });
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
      <StatusBar currentSection={currentSection} />
      {/* 12-Column Grid Overlay */}
      {showGrid && showControls && (
        <div className="design-grid">
          <div className="design-grid-columns">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="design-grid-column">
                <span className="design-grid-column-number">{i + 1}</span>
              </div>
            ))}
          </div>
          {/* Center line */}
          <div className="grid-line grid-line-v grid-line-center" style={{ left: '50%' }} />
        </div>
      )}

      {/* Position indicator */}
      {showControls && (
        <div className="position-indicator">
          <span>x: {contentOffset.x}px | y: {contentOffset.y}px</span>
          <button onClick={() => setShowGrid(!showGrid)}>{showGrid ? 'Hide' : 'Show'} Grid</button>
          <span style={{ opacity: 0.5, fontSize: '10px' }}>Hold Shift + drag to move</span>
        </div>
      )}

      {/* Controls toggle button - always visible */}
      <button
        className={`controls-toggle ${showControls ? 'active' : ''}`}
        onClick={() => setShowControls(prev => !prev)}
        title={showControls ? 'Hide controls (⌘.)' : 'Show controls (⌘.)'}
      >
        <span className="controls-toggle-icon" />
      </button>
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

      <main
        ref={mainRef}
        onMouseDown={handleDragStart}
        style={{
          '--base-font-size': `${fontSize}px`,
          '--line-height': lineHeight,
          '--gap-multiplier': gapSize,
          '--tree-branch-size': `${treeBranchSize}px`,
          transform: `translate(${contentOffset.x}px, ${contentOffset.y}px)`,
          cursor: isDragging ? 'grabbing' : undefined
        } as React.CSSProperties}>
        <div className="main-content intro-fade grid-col-11 grid-start-1 lg:grid-start-2 lg:grid-col-6">
          <div className="line"><span className="ln">{showNumber('01')}</span><h1 className={`name ${isScrambling ? "name-scrambling" : ""}`} onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>{chars.map((c, i) => (<span key={i} style={{ opacity: c.opacity }}>{c.char}</span>))}:</h1></div>
          <div className="line"><span className="ln">{showNumber('02')}</span><span className="location"><span className="tree-branch">⎿</span> San Francisco</span></div>
          <div className="line"><span className="ln">{showNumber('03')}</span><span className="about"><span className="tree-branch">⎿</span> Creative technologist, currently tinkering with e-ink interfaces and making stuff I'd like to exist.</span></div>
          <div className="line gap"><span className="ln"></span></div>
          <div className="line"><span className="ln">{showNumber('05', true)}</span><h2 className="section-title section-title-muted">Convictions:</h2></div>
          <div className="line"><span className="ln">{showNumber('06')}</span><span className="conviction-item"><span className="tree-branch">⎿</span> Self-driving cars are necessary</span></div>
          <div className="line"><span className="ln">{showNumber('07')}</span><span className="conviction-item"><span className="tree-branch">⎿</span> Clarity and intentionality are core to a good life</span></div>
          <div className="line"><span className="ln">{showNumber('08')}</span><span className="conviction-item"><span className="tree-branch">⎿</span> Spatial computing is the future of interfaces</span></div>
          <div className="line gap"><span className="ln"></span></div>
          <div className="line"><span className="ln">{showNumber('09', true)}</span><h2 className="section-title section-title-muted">Work:</h2></div>
          <div className="line"><span className="ln">{showNumber('10')}</span><span className="work-item"><span className="tree-branch">⎿</span> <a href="https://context.ai" className="company" target="_blank" rel="noopener noreferrer">Context</a>, Founding Designer <span className="years-inline">2025</span></span></div>
          <div className="line"><span className="ln">{showNumber('11')}</span><span className="work-item"><span className="tree-branch">⎿</span> <span className="company">Various companies</span>, Independent Contractor <span className="years-inline">2021–2025</span></span></div>
          <div className="line gap"><span className="ln"></span></div>
          <div className="line">
            <span className="ln">{showNumber('12')}</span>
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
      <ScrollSlider />
    </div>
  );
}
