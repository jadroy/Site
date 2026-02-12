"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";

type Phase = "idle" | "holding" | "snapping" | "settling";
type VisualPos = "home" | "info";

export interface PanelLeverHandle {
  triggerSnap: () => void;
}

interface PanelLeverProps {
  onHome: boolean;
  onToggle: () => void;
  isMobile: boolean;
  shiftHeld: boolean;
  onSnap?: () => void;
}

const PanelLever = forwardRef<PanelLeverHandle, PanelLeverProps>(
  function PanelLever({ onHome, onToggle, isMobile, shiftHeld, onSnap }, ref) {
    const [phase, setPhase] = useState<Phase>("idle");
    const [visualPos, setVisualPos] = useState<VisualPos>(
      onHome ? "home" : "info"
    );

    // Sync visual position with prop when idle
    useEffect(() => {
      if (phase === "idle") {
        setVisualPos(onHome ? "home" : "info");
      }
    }, [onHome, phase]);

    const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const snapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const clearTimers = useCallback(() => {
      if (holdTimer.current) { clearTimeout(holdTimer.current); holdTimer.current = null; }
      if (snapTimer.current) { clearTimeout(snapTimer.current); snapTimer.current = null; }
      if (settleTimer.current) { clearTimeout(settleTimer.current); settleTimer.current = null; }
    }, []);

    useEffect(() => clearTimers, [clearTimers]);

    const doSnap = useCallback(() => {
      clearTimers();
      onSnap?.();
      const target: VisualPos = visualPos === "home" ? "info" : "home";
      setVisualPos(target);
      setPhase("snapping");
      onToggle();

      snapTimer.current = setTimeout(() => {
        setPhase("settling");
        settleTimer.current = setTimeout(() => {
          setPhase("idle");
        }, 150);
      }, 300);
    }, [visualPos, onToggle, onSnap, clearTimers]);

    useImperativeHandle(ref, () => ({ triggerSnap: doSnap }), [doSnap]);

    const handlePointerDown = useCallback(
      (e: React.PointerEvent) => {
        if (isMobile) {
          doSnap();
          return;
        }
        if (phase === "snapping" || phase === "settling") {
          // Rapid click — interrupt and snap immediately
          doSnap();
          return;
        }
        if (phase !== "idle") return;
        e.preventDefault();
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
        setPhase("holding");
      },
      [isMobile, phase, doSnap]
    );

    const handlePointerUp = useCallback(() => {
      if (phase === "holding") {
        doSnap();
      }
    }, [phase, doSnap]);

    const handlePointerLeave = useCallback(() => {
      if (phase === "holding") {
        clearTimers();
        setPhase("idle");
      }
    }, [phase, clearTimers]);

    // Left = landing, right = home
    const isLeft = visualPos === "home";

    const leverClasses = [
      "panel-lever",
      `panel-lever--${phase}`,
      isLeft ? "panel-lever--left" : "panel-lever--right",
      shiftHeld && phase === "idle" ? "panel-lever--ready" : "",
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div
        className={leverClasses}
        role="switch"
        aria-checked={!onHome}
        aria-label={`Switch to ${onHome ? "info" : "home"} panel`}
        tabIndex={0}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            doSnap();
          }
        }}
      >
        {/* Left label */}
        <span className="panel-lever__label panel-lever__label--left">
          Home
        </span>

        {/* Track with handle */}
        <div className="panel-lever__track">
          <div className="panel-lever__handle" />
        </div>

        {/* Right label */}
        <span className="panel-lever__label panel-lever__label--right">
          Info
        </span>

        {/* Keyboard shortcut hint (desktop only) */}
        {!isMobile && (
          <span className="panel-lever__hint">Shift + Enter</span>
        )}
      </div>
    );
  }
);

export default PanelLever;
