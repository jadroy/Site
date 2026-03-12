"use client";

import { useState, useLayoutEffect, useEffect } from "react";
import { themeDefinitions } from "../constants";


const allThemeKeys = ['--bg', '--text', '--text-muted', '--text-subtle', '--text-faint', '--border', '--grid-line', '--card-bg', '--cursor', '--accent', '--accent-warm', '--accent-gradient'];

export function useTheme() {
  const [activeTheme, setActiveTheme] = useState('Default');
  const [fontMode, setFontMode] = useState<'saans' | 'mono'>('saans');
  const [autoDarkNotice, setAutoDarkNotice] = useState<false | 'dark' | 'light'>(false);
  const [siteBg, setSiteBg] = useState('#ffffff');
  const [textLightness, setTextLightness] = useState(44);

  // Resolve theme synchronously before first paint
  useLayoutEffect(() => {
    const saved = localStorage.getItem('rj-theme-pref');
    if (saved) {
      setActiveTheme(saved);
    }
  }, []);

  // Load font preference
  useLayoutEffect(() => {
    const saved = localStorage.getItem('rj-font-pref');
    if (saved === 'mono') {
      setFontMode('mono');
      document.documentElement.dataset.font = 'mono';
    }
  }, []);

  // Apply font mode to DOM
  useLayoutEffect(() => {
    if (fontMode === 'mono') {
      document.documentElement.dataset.font = 'mono';
    } else {
      delete document.documentElement.dataset.font;
    }
  }, [fontMode]);

  // Auto-dismiss dark notice
  useEffect(() => {
    if (autoDarkNotice !== 'dark') return;
    const timer = setTimeout(() => setAutoDarkNotice(false), 8000);
    return () => clearTimeout(timer);
  }, [autoDarkNotice]);

  // Consolidated theme + appearance effect
  useLayoutEffect(() => {
    const root = document.documentElement;
    const theme = themeDefinitions.find(t => t.name === activeTheme);

    if (activeTheme === 'Default' || !theme || Object.keys(theme.vars).length === 0) {
      root.style.setProperty('--bg', siteBg);
      root.style.setProperty('--text', `hsl(0, 0%, ${textLightness}%)`);
      root.style.setProperty('--text-muted', `hsl(0, 0%, ${textLightness + 8}%)`);
      root.style.setProperty('--text-subtle', `hsl(0, 0%, ${textLightness + 13}%)`);
      root.style.setProperty('--text-faint', `hsl(0, 0%, ${textLightness + 20}%)`);
      ['--border', '--grid-line', '--card-bg', '--cursor', '--accent', '--accent-warm', '--accent-gradient'].forEach(k =>
        root.style.removeProperty(k)
      );
    } else {
      Object.entries(theme.vars).forEach(([key, value]) => {
        root.style.setProperty(key, value);
      });
    }

    const isDark = ['Ember', 'Slate', 'Void', 'Soot'].includes(activeTheme);
    root.dataset.theme = isDark ? 'dark' : 'light';

    return () => {
      allThemeKeys.forEach(k => root.style.removeProperty(k));
    };
  }, [activeTheme, siteBg, textLightness]);

  const handleThemeChange = (themeName: string) => {
    setActiveTheme(themeName);
    localStorage.setItem('rj-theme-pref', themeName);
    setAutoDarkNotice(false);
  };

  const handleFontChange = (mode: 'saans' | 'mono') => {
    setFontMode(mode);
    if (mode === 'mono') {
      localStorage.setItem('rj-font-pref', 'mono');
    } else {
      localStorage.removeItem('rj-font-pref');
    }
  };

  const switchToLight = () => {
    setActiveTheme('Default');
    localStorage.setItem('rj-theme-pref', 'Default');
    setAutoDarkNotice('light');
  };

  const switchToDark = () => {
    setActiveTheme('Slate');
    localStorage.setItem('rj-theme-pref', 'Slate');
    setAutoDarkNotice('dark');
  };

  return {
    activeTheme,
    setActiveTheme,
    fontMode,
    autoDarkNotice,
    setAutoDarkNotice,
    siteBg,
    setSiteBg,
    textLightness,
    setTextLightness,
    handleThemeChange,
    handleFontChange,
    switchToLight,
    switchToDark,
  };
}
