"use client";

import { useState, useEffect } from "react";
import { memoryImages, type MemoryFx } from "../constants";

export default function MemorySlideshow({ fx }: { fx: MemoryFx }) {
  const [active, setActive] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setActive((prev) => (prev + 1) % memoryImages.length);
        setFade(true);
      }, 1200);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const cssFilter = [
    fx.grayscale > 0 ? `grayscale(${fx.grayscale}%)` : '',
    fx.contrast !== 1 ? `contrast(${fx.contrast})` : '',
    fx.brightness !== 1 ? `brightness(${fx.brightness})` : '',
    fx.blur > 0 ? `blur(${fx.blur}px)` : '',
  ].filter(Boolean).join(' ') || 'none';

  const svgFilter = [
    fx.dither > 0 ? 'url(#memory-dither)' : '',
    fx.halftone > 0 ? 'url(#memory-halftone)' : '',
  ].filter(Boolean).join(' ');

  const combinedFilter = [cssFilter !== 'none' ? cssFilter : '', svgFilter].filter(Boolean).join(' ') || 'none';

  const maskGrad = `radial-gradient(ellipse 65% 65% at center, black 15%, transparent ${fx.maskSoftness}%)`;

  return (
    <div className="home-memory" aria-hidden="true">
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <filter id="memory-dither" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="1.5" numOctaves="1" seed="2" result="noise" />
            <feComponentTransfer in="noise" result="threshNoise">
              <feFuncR type="discrete" tableValues={`${0.5 - fx.dither * 0.4} ${0.5 + fx.dither * 0.4}`} />
              <feFuncG type="discrete" tableValues={`${0.5 - fx.dither * 0.4} ${0.5 + fx.dither * 0.4}`} />
              <feFuncB type="discrete" tableValues={`${0.5 - fx.dither * 0.4} ${0.5 + fx.dither * 0.4}`} />
            </feComponentTransfer>
            <feBlend in="SourceGraphic" in2="threshNoise" mode="multiply" />
          </filter>
          <filter id="memory-halftone" colorInterpolationFilters="sRGB">
            <feTurbulence type="turbulence" baseFrequency={0.05 + fx.halftone * 0.05} numOctaves="1" seed="0" result="dots" />
            <feComponentTransfer in="dots" result="pattern">
              <feFuncR type="discrete" tableValues="0 1" />
              <feFuncG type="discrete" tableValues="0 1" />
              <feFuncB type="discrete" tableValues="0 1" />
            </feComponentTransfer>
            <feBlend in="SourceGraphic" in2="pattern" mode="multiply" />
          </filter>
        </defs>
      </svg>

      <div className="home-memory-glow">
        <img
          src={memoryImages[active]}
          alt=""
          className={fade ? "memory-visible" : "memory-hidden"}
        />
      </div>
      <div
        className="home-memory-sharp"
        style={{
          filter: combinedFilter,
          imageRendering: fx.pixelate > 0 ? 'pixelated' : undefined,
        } as React.CSSProperties}
      >
        <img
          src={memoryImages[active]}
          alt=""
          className={fade ? "memory-visible" : "memory-hidden"}
          style={{
            maskImage: maskGrad,
            WebkitMaskImage: maskGrad,
            ...(fx.pixelate > 0 ? {
              imageRendering: 'pixelated' as const,
              width: `${100 / (1 + fx.pixelate * 0.5)}%`,
              height: `${100 / (1 + fx.pixelate * 0.5)}%`,
              transform: `scale(${1 + fx.pixelate * 0.5})`,
            } : {}),
          }}
        />
      </div>
      {fx.grain > 0 && (
        <div className="home-memory-grain" style={{ opacity: fx.grain }} />
      )}
    </div>
  );
}
