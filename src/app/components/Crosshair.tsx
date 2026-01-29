"use client";

import { useEffect, useRef } from "react";

export default function Crosshair() {
  const squareRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const square = squareRef.current;
    if (!square) return;

    const handleMouseMove = (e: MouseEvent) => {
      square.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      square.style.opacity = "1";
    };

    const handleMouseLeave = () => {
      square.style.opacity = "0";
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.documentElement.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.documentElement.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return <div ref={squareRef} className="cursor-square" />;
}
