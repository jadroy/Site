"use client";

import { useState, useRef, useEffect } from "react";

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

  return (
    <main>
      <div className="line"><span className="ln">01</span><h1 className={`name ${isScrambling ? "name-scrambling" : ""}`} onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>{chars.map((c, i) => (<span key={i} style={{ opacity: c.opacity }}>{c.char}</span>))}</h1></div>
      <div className="line"><span className="ln">02</span><span className="location">San Francisco</span></div>
      <div className="line gap"><span className="ln"></span></div>
      <div className="line"><span className="ln">03</span><p className="about">Creative technologist, currently tinkering with</p></div>
      <div className="line"><span className="ln">04</span><p className="about">e-ink interfaces and coding stuff i want to exist.</p></div>
      <div className="line gap"><span className="ln"></span></div>
      <div className="line"><span className="ln">05</span><h2 className="section-title">Convictions</h2></div>
      <div className="line"><span className="ln">06</span><span className="content">Self-driving cars are necessary</span></div>
      <div className="line"><span className="ln">07</span><span className="content">Clarity and intentionality are core to a good life</span></div>
      <div className="line"><span className="ln">08</span><span className="content">Spatial computing is the future of interfaces</span></div>
      <div className="line gap"><span className="ln"></span></div>
      <div className="line"><span className="ln">09</span><h2 className="section-title">Experience</h2></div>
      <div className="line"><span className="ln">10</span><a href="https://context.ai" className="company" target="_blank" rel="noopener noreferrer">Context</a><span className="years">2025</span></div>
      <div className="line"><span className="ln">11</span><span className="role">Founding Designer</span></div>
      <div className="line"><span className="ln"></span></div>
      <div className="line"><span className="ln">12</span><span className="company">Various companies</span><span className="years">2021–2025</span></div>
      <div className="line"><span className="ln">13</span><span className="role">YC, a16z, 776</span></div>
      <div className="line"><span className="ln">14</span><span className="role">Independent Contractor</span></div>
      <div className="line gap"><span className="ln"></span></div>
      <div className="line"><span className="ln">15</span><a href="mailto:jadroy77@gmail.com">Email</a></div>
      <div className="line"><span className="ln">16</span><a href="https://x.com/jadroy2" target="_blank" rel="noopener noreferrer">Twitter</a></div>
      <div className="line"><span className="ln">17</span><a href="https://www.linkedin.com/in/royjad/" target="_blank" rel="noopener noreferrer">LinkedIn</a></div>
    </main>
  );
}
