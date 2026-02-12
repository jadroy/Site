"use client";

import { useRef, useEffect } from "react";

type Particle = {
  x: number;
  y: number;
  hx: number;
  hy: number;
  vx: number;
  vy: number;
};

const DOT_SPACING = 28;
const DOT_RADIUS = 1.5;
const REPEL_RADIUS = 120;
const REPEL_STRENGTH = 8000;
const CLICK_RADIUS = 200;
const CLICK_STRENGTH = 60000;
const CLICK_DECAY = 0.92;
const SPRING = 0.015;
const DAMPING = 0.88;

export default function DotField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const mouse = useRef({ x: -9999, y: -9999 });
  const clickPulse = useRef({ x: -9999, y: -9999, strength: 0 });
  const rafId = useRef<number>(0);
  const parentRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Respect prefers-reduced-motion
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motionQuery.matches) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const parent = canvas.parentElement;
    parentRef.current = parent;

    // Read dot color from CSS variable
    const getDotColor = () => {
      const style = getComputedStyle(document.documentElement);
      return style.getPropertyValue("--text-faint").trim() || "#bbb";
    };

    let dotColor = getDotColor();

    const buildGrid = () => {
      const w = canvas.width;
      const h = canvas.height;
      const cols = Math.floor(w / DOT_SPACING);
      const rows = Math.floor(h / DOT_SPACING);
      const offsetX = (w - (cols - 1) * DOT_SPACING) / 2;
      const offsetY = (h - (rows - 1) * DOT_SPACING) / 2;

      const pts: Particle[] = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = offsetX + c * DOT_SPACING;
          const y = offsetY + r * DOT_SPACING;
          pts.push({ x, y, hx: x, hy: y, vx: 0, vy: 0 });
        }
      }
      particles.current = pts;
    };

    const resize = () => {
      if (!parent) return;
      const dpr = window.devicePixelRatio || 1;
      const rect = parent.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      dotColor = getDotColor();
      buildGrid();
    };

    resize();

    const handleMouseMove = (e: MouseEvent) => {
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      mouse.current.x = e.clientX - rect.left;
      mouse.current.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.current.x = -9999;
      mouse.current.y = -9999;
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      clickPulse.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        strength: 1,
      };
    };

    const animate = () => {
      const w = canvas.width / (window.devicePixelRatio || 1);
      const h = canvas.height / (window.devicePixelRatio || 1);
      ctx.clearRect(0, 0, w, h);

      const mx = mouse.current.x;
      const my = mouse.current.y;
      const pulse = clickPulse.current;
      const pts = particles.current;

      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];

        // Repulsion from cursor
        const dx = p.x - mx;
        const dy = p.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < REPEL_RADIUS && dist > 0.1) {
          const force = REPEL_STRENGTH / (dist * dist);
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }

        // Click pulse — expanding burst
        if (pulse.strength > 0.01) {
          const cdx = p.x - pulse.x;
          const cdy = p.y - pulse.y;
          const cdist = Math.sqrt(cdx * cdx + cdy * cdy);
          if (cdist < CLICK_RADIUS && cdist > 0.1) {
            const force = (CLICK_STRENGTH * pulse.strength) / (cdist * cdist);
            p.vx += (cdx / cdist) * force;
            p.vy += (cdy / cdist) * force;
          }
        }

        // Spring back to home
        p.vx += (p.hx - p.x) * SPRING;
        p.vy += (p.hy - p.y) * SPRING;

        // Damping
        p.vx *= DAMPING;
        p.vy *= DAMPING;

        // Integrate
        p.x += p.vx;
        p.y += p.vy;
      }

      // Decay click pulse
      if (pulse.strength > 0.01) {
        pulse.strength *= CLICK_DECAY;
      } else {
        pulse.strength = 0;
      }

      // Batch draw
      ctx.fillStyle = dotColor;
      ctx.beginPath();
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        ctx.moveTo(p.x + DOT_RADIUS, p.y);
        ctx.arc(p.x, p.y, DOT_RADIUS, 0, Math.PI * 2);
      }
      ctx.fill();

      rafId.current = requestAnimationFrame(animate);
    };

    rafId.current = requestAnimationFrame(animate);

    // Observe theme changes to update dot color
    const observer = new MutationObserver(() => {
      dotColor = getDotColor();
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["style", "data-theme"],
    });

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(rafId.current);
      observer.disconnect();
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="dot-field" aria-hidden="true" />;
}
