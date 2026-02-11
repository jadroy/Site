"use client";

import { useState, useEffect, useRef, useCallback } from "react";

type BootLine = {
  text: string;
  delay: number; // ms to wait BEFORE showing this line
  className?: string;
};

const bootScript: BootLine[] = [
  { text: "RJ-OS v0.2", delay: 200, className: "boot-line-bright" },
  { text: "Copyright (c) 2025 Roy Jad. All rights reserved.", delay: 60 },
  { text: "", delay: 150 },
  { text: "BIOS Date 02/09/26", delay: 40 },
  { text: "Checking system memory .......... 32768 MB OK", delay: 350 },
  { text: "Detecting display adapter ........ found", delay: 200 },
  { text: "", delay: 80 },
  { text: "Loading kernel modules", delay: 150, className: "boot-line-bright" },
  { text: "  ├ typography.sys ............... loaded", delay: 100 },
  { text: "  ├ layout.sys .................. loaded", delay: 70 },
  { text: "  ├ themes.sys .................. loaded", delay: 60 },
  { text: "  └ dock.sys .................... loaded", delay: 80 },
  { text: "", delay: 100 },
  { text: "Mounting /portfolio .............. OK", delay: 250 },
  { text: "Establishing connection .......... San Francisco", delay: 300 },
  { text: "", delay: 80 },
  { text: "SYSTEM READY", delay: 150, className: "boot-line-ready" },
];

export default function BootSequence({ onComplete }: { onComplete: () => void }) {
  const [visibleLines, setVisibleLines] = useState<number>(0);
  const [phase, setPhase] = useState<"boot" | "fade">("boot");
  const completedRef = useRef(false);
  const cancelledRef = useRef(false);

  const finish = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    cancelledRef.current = true;
    setPhase("fade");
    setTimeout(onComplete, 500);
  }, [onComplete]);

  // Skip on click or keypress
  useEffect(() => {
    const skip = () => finish();
    window.addEventListener("click", skip);
    window.addEventListener("keydown", skip);
    return () => {
      window.removeEventListener("click", skip);
      window.removeEventListener("keydown", skip);
    };
  }, [finish]);

  // Play boot lines using chained timeouts
  useEffect(() => {
    cancelledRef.current = false;

    const playLines = async () => {
      for (let i = 0; i < bootScript.length; i++) {
        if (cancelledRef.current) return;
        await new Promise<void>((resolve) =>
          setTimeout(resolve, bootScript[i].delay)
        );
        if (cancelledRef.current) return;
        setVisibleLines(i + 1);
      }

      // Done — brief pause then finish
      if (!cancelledRef.current) {
        setTimeout(() => {
          if (!cancelledRef.current) finish();
        }, 400);
      }
    };

    playLines();

    return () => {
      cancelledRef.current = true;
    };
  }, [finish]);

  return (
    <div className={`boot-screen ${phase === "fade" ? "boot-screen-fade" : ""}`}>
      <div className="boot-content">
        {bootScript.slice(0, visibleLines).map((line, i) => (
          <div key={i} className={`boot-line ${line.className || ""}`}>
            {line.text || "\u00A0"}
          </div>
        ))}
        {phase === "boot" && visibleLines < bootScript.length && (
          <span className="boot-cursor">_</span>
        )}
      </div>
      <div className="boot-skip">Press any key to skip</div>
    </div>
  );
}
