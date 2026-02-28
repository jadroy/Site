"use client";

import { useRef, useEffect } from "react";

type SandParticle = {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  vx: number;
  vy: number;
  size: number;
  layer: number;
};

export type DuneTone = "warm" | "golden" | "rose" | "cool";

type ToneColors = { dune: string[]; particle: string };

export const DUNE_TONES: Record<DuneTone, { light: ToneColors; dark: ToneColors; swatch: string }> = {
  warm: {
    light: {
      dune: ["#dcbe94", "#d4ad7c", "#c9a06e", "#bf9360"],
      particle: "rgba(175, 140, 95, 0.5)",
    },
    dark: {
      dune: ["rgba(90,75,55,0.4)", "rgba(105,85,60,0.5)", "rgba(120,95,65,0.65)", "rgba(135,108,72,0.8)"],
      particle: "rgba(160, 135, 100, 0.3)",
    },
    swatch: "#d4ad7c",
  },
  golden: {
    light: {
      dune: ["#e8d5a0", "#e0c888", "#d6ba72", "#ccac5c"],
      particle: "rgba(195, 170, 90, 0.5)",
    },
    dark: {
      dune: ["rgba(95,80,40,0.4)", "rgba(110,92,48,0.5)", "rgba(125,105,55,0.65)", "rgba(140,118,62,0.8)"],
      particle: "rgba(170, 150, 90, 0.3)",
    },
    swatch: "#e0c888",
  },
  rose: {
    light: {
      dune: ["#e0c4a8", "#d8b498", "#cfA488", "#c69478"],
      particle: "rgba(185, 145, 120, 0.5)",
    },
    dark: {
      dune: ["rgba(95,70,55,0.4)", "rgba(110,80,62,0.5)", "rgba(125,90,70,0.65)", "rgba(140,100,78,0.8)"],
      particle: "rgba(165, 130, 110, 0.3)",
    },
    swatch: "#d8b498",
  },
  cool: {
    light: {
      dune: ["#d0c4b0", "#c4b8a2", "#b8ac96", "#aca08a"],
      particle: "rgba(160, 150, 130, 0.5)",
    },
    dark: {
      dune: ["rgba(75,70,60,0.4)", "rgba(88,82,70,0.5)", "rgba(100,94,80,0.65)", "rgba(112,105,90,0.8)"],
      particle: "rgba(145, 138, 120, 0.3)",
    },
    swatch: "#c4b8a2",
  },
};

const PARTICLE_COUNT = 300;
const GRAVITY = 0.12;
const WIND_STRENGTH = 0.4;
const DAMPING = 0.94;
const CLICK_RADIUS = 180;
const CLICK_FORCE = 6;
const DRIFT_SPEED = 0.00008;

const DUNE_LAYERS = [
  { yOff: 0.42, amp: 0.09, freq: 0.7, speed: 0.7, parallax: 0.01, alpha: 0.4 },
  { yOff: 0.54, amp: 0.11, freq: 0.9, speed: 0.85, parallax: 0.02, alpha: 0.6 },
  { yOff: 0.66, amp: 0.13, freq: 1.2, speed: 1.0, parallax: 0.03, alpha: 0.8 },
  { yOff: 0.80, amp: 0.06, freq: 1.5, speed: 1.2, parallax: 0.04, alpha: 1.0 },
];

function duneY(
  x: number,
  w: number,
  h: number,
  layer: typeof DUNE_LAYERS[number],
  phase: number,
  mouseOffsetX: number,
): number {
  const nx = x / w;
  const px = nx + mouseOffsetX * layer.parallax;
  const p = phase * layer.speed;
  return (
    h * layer.yOff +
    h * layer.amp * (
      Math.sin((px * layer.freq * Math.PI * 2) + p) * 0.5 +
      Math.sin((px * layer.freq * 1.7 * Math.PI * 2) + p * 1.3) * 0.3 +
      Math.sin((px * layer.freq * 3.1 * Math.PI * 2) + p * 0.7) * 0.2
    )
  );
}

export default function SandDunes({ tone = "warm" }: { tone?: DuneTone }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<SandParticle[]>([]);
  const mouse = useRef({ x: -9999, y: -9999, vx: 0, vy: 0 });
  const clickPulse = useRef({ x: -9999, y: -9999, strength: 0 });
  const phase = useRef(0);
  const rafId = useRef(0);
  const parentRef = useRef<HTMLElement | null>(null);
  const toneRef = useRef(tone);
  toneRef.current = tone;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const parent = canvas.parentElement;
    parentRef.current = parent;

    const getColors = () => {
      const isDark = document.documentElement.dataset.theme === "dark";
      const t = DUNE_TONES[toneRef.current];
      return isDark ? t.dark : t.light;
    };

    let colors = getColors();

    const initParticles = (w: number, h: number) => {
      const pts: SandParticle[] = [];
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const layerIdx = Math.floor(Math.random() * DUNE_LAYERS.length);
        const x = Math.random() * w;
        const y = duneY(x, w, h, DUNE_LAYERS[layerIdx], phase.current, 0) + (Math.random() - 0.5) * 10;
        pts.push({
          x, y, baseX: x, baseY: y,
          vx: 0, vy: 0,
          size: 1 + Math.random() * 1.5,
          layer: layerIdx,
        });
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
      colors = getColors();
      initParticles(rect.width, rect.height);
    };

    resize();

    const drawDunes = (w: number, h: number, p: number, mx: number) => {
      for (let li = 0; li < DUNE_LAYERS.length; li++) {
        const layer = DUNE_LAYERS[li];
        ctx.fillStyle = colors.dune[li];
        ctx.globalAlpha = layer.alpha;
        ctx.beginPath();
        ctx.moveTo(0, h);
        for (let x = 0; x <= w; x += 4) {
          ctx.lineTo(x, duneY(x, w, h, layer, p, mx));
        }
        ctx.lineTo(w, h);
        ctx.closePath();
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    // Static render for reduced motion
    if (motionQuery.matches) {
      const w = canvas.width / (window.devicePixelRatio || 1);
      const h = canvas.height / (window.devicePixelRatio || 1);
      drawDunes(w, h, 0, 0);
      window.addEventListener("resize", resize);
      return () => { window.removeEventListener("resize", resize); };
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      const nx = e.clientX - rect.left;
      const ny = e.clientY - rect.top;
      mouse.current.vx = nx - mouse.current.x;
      mouse.current.vy = ny - mouse.current.y;
      mouse.current.x = nx;
      mouse.current.y = ny;
    };

    const handleMouseLeave = () => {
      mouse.current.x = -9999;
      mouse.current.y = -9999;
      mouse.current.vx = 0;
      mouse.current.vy = 0;
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
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      ctx.clearRect(0, 0, w, h);

      colors = getColors();
      phase.current += DRIFT_SPEED;

      const mouseOffsetX = mouse.current.x > -9000 ? (mouse.current.x / w - 0.5) : 0;
      const windX = mouse.current.vx * WIND_STRENGTH;
      const windY = mouse.current.vy * WIND_STRENGTH * 0.3;

      drawDunes(w, h, phase.current, mouseOffsetX);

      const pulse = clickPulse.current;
      const pts = particles.current;

      ctx.fillStyle = colors.particle;
      ctx.beginPath();

      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        const layer = DUNE_LAYERS[p.layer];
        const targetY = duneY(p.x, w, h, layer, phase.current, mouseOffsetX);

        if (mouse.current.x > -9000) {
          const dx = p.x - mouse.current.x;
          const dy = p.y - mouse.current.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 200) {
            const falloff = 1 - dist / 200;
            p.vx += windX * falloff * 0.15;
            p.vy += windY * falloff * 0.15 - Math.abs(windX) * falloff * 0.08;
          }
        }

        if (pulse.strength > 0.01) {
          const dx = p.x - pulse.x;
          const dy = p.y - pulse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CLICK_RADIUS && dist > 1) {
            const force = CLICK_FORCE * pulse.strength * (1 - dist / CLICK_RADIUS);
            p.vx += (dx / dist) * force;
            p.vy += (dy / dist) * force;
          }
        }

        p.vy += (targetY - p.y) * GRAVITY * 0.1;
        p.vy += GRAVITY * 0.3;

        if (p.y > targetY + 2) {
          p.vy -= (p.y - targetY) * 0.08;
        }

        p.vx *= DAMPING;
        p.vy *= DAMPING;
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x += w;
        if (p.x > w) p.x -= w;

        ctx.moveTo(p.x + p.size, p.y);
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      }
      ctx.fill();

      if (pulse.strength > 0.01) {
        pulse.strength *= 0.9;
      } else {
        pulse.strength = 0;
      }

      mouse.current.vx *= 0.85;
      mouse.current.vy *= 0.85;

      rafId.current = requestAnimationFrame(animate);
    };

    rafId.current = requestAnimationFrame(animate);

    const observer = new MutationObserver(() => {
      colors = getColors();
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

  return <canvas ref={canvasRef} className="sand-dunes" aria-hidden="true" />;
}
