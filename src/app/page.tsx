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
  const [theme, setTheme] = useState<"light" | "warm">("light");

  useEffect(() => {
    const saved = localStorage.getItem("theme") as "light" | "warm" | null;
    if (saved) {
      setTheme(saved);
      document.documentElement.setAttribute("data-theme", saved);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "warm" : "light";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };
  const scrambleIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const cycleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const stopTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startScramble = (duration?: number) => {
    if (scrambleIntervalRef.current) clearInterval(scrambleIntervalRef.current);
    if (stopTimeoutRef.current) clearTimeout(stopTimeoutRef.current);

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
    <>
      <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
        <span className="theme-toggle-inner" />
      </button>
      <main>
      <header className="header">
        <h1
          className="name"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          {chars.map((c, i) => (
            <span key={i} style={{ opacity: c.opacity }}>{c.char}</span>
          ))}
        </h1>
        <p className="location">San Francisco</p>
      </header>

      <section className="experience">
        <h2 className="section-title">Experience</h2>
        <div className="experience-item">
          <div className="experience-left">
            <a href="https://context.ai" className="company" target="_blank" rel="noopener noreferrer">Context</a>
            <span className="role">Founding Designer</span>
          </div>
          <span className="years">2025</span>
        </div>
        <div className="experience-item">
          <div className="experience-left">
            <span className="company">Various companies</span>
            <span className="role">YC, a16z, 776</span>
            <span className="role">Independent Contractor</span>
          </div>
          <span className="years">2021–2025</span>
        </div>
      </section>

      <ShowcaseSection />

      <footer className="footer">
        <div className="footer-links">
          <a href="mailto:jadroy77@gmail.com">Email</a>
          <a href="https://x.com/jadroy2" target="_blank" rel="noopener noreferrer">Twitter</a>
          <a href="https://www.linkedin.com/in/royjad/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
        </div>
        <a href="#" className="back-to-top" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
          Back to top
        </a>
        <p className="copyright">&copy; 2025 Roy Jad</p>
      </footer>
    </main>
    </>
  );
}
