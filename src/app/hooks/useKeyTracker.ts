"use client";

import { useState, useRef, useEffect } from "react";
import { type PanelId, PANELS } from "../components/TabBar";
import { playTick } from "../utils/audio";

export function useKeyTracker(
  isMobile: boolean,
  scrollToPanel: (panelId: PanelId) => void,
  activePanelRef: React.RefObject<PanelId | null>,
) {
  const [heldKeys, setHeldKeys] = useState<string[]>([]);
  const [showWatModal, setShowWatModal] = useState(false);
  const [devMode, setDevMode] = useState(false);
  const shiftEnterStart = useRef<number | null>(null);
  const watTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Key tracker
  useEffect(() => {
    if (isMobile) return;
    const keys = new Set<string>();

    const fmt = (key: string) => {
      if (key === 'Meta') return 'Cmd';
      if (key === 'Control') return 'Ctrl';
      if (key === ' ') return 'Space';
      if (key === 'ArrowUp') return '\u2191';
      if (key === 'ArrowDown') return '\u2193';
      if (key === 'ArrowLeft') return '\u2190';
      if (key === 'ArrowRight') return '\u2192';
      if (key === 'Escape') return 'Esc';
      if (key.length === 1) return key.toUpperCase();
      return key;
    };

    const sync = () => setHeldKeys([...keys]);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      keys.add(fmt(e.key));
      sync();
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keys.delete(fmt(e.key));
      sync();
    };
    const onMouseDown = (e: MouseEvent) => {
      keys.add(e.button === 2 ? 'Right Click' : 'Click');
      sync();
    };
    const onMouseUp = (e: MouseEvent) => {
      keys.delete(e.button === 2 ? 'Right Click' : 'Click');
      sync();
    };
    const onBlur = () => { keys.clear(); sync(); };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('blur', onBlur);
    };
  }, [isMobile]);

  // Cmd+. toggles dev mode
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === '.' && e.metaKey) {
        e.preventDefault();
        setDevMode(prev => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Shift+Enter cycles to next panel + easter egg
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        if (e.shiftKey && !e.metaKey && !e.ctrlKey) {
          e.preventDefault();
          const currentIdx = PANELS.indexOf(activePanelRef.current as PanelId);
          const next = PANELS[(currentIdx + 1) % PANELS.length];
          scrollToPanel(next);
          playTick();
          if (!shiftEnterStart.current) {
            shiftEnterStart.current = Date.now();
            watTimer.current = setTimeout(() => {
              setShowWatModal(true);
              shiftEnterStart.current = null;
            }, 5700);
          }
        }
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === 'Shift') {
        shiftEnterStart.current = null;
        if (watTimer.current) { clearTimeout(watTimer.current); watTimer.current = null; }
      }
    };
    const handleBlur = () => {
      shiftEnterStart.current = null;
      if (watTimer.current) { clearTimeout(watTimer.current); watTimer.current = null; }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
      if (watTimer.current) clearTimeout(watTimer.current);
    };
  }, []);

  return { heldKeys, showWatModal, setShowWatModal, devMode };
}
