# Roy Jad — Portfolio Site

## Stack
- Next.js 15, React 19, TypeScript
- Zero 3D / heavy dependencies — pure CSS + SVG for all visual effects
- Fonts: Saans (body), Geist Pixel Line (window bar titles)
- Deployed on Vercel

## Architecture
- `src/app/page.tsx` — single-page app, horizontal scroll layout with landing panel + home panel
- `src/app/globals.css` — all styles (no CSS modules, no Tailwind)
- `src/app/design-system.css` — design tokens + primitive component classes (imported before globals)
- `src/app/components/` — client components

## Key Components
- **StatusBar** (`StatusBar.tsx`) — fixed HUD at top. Shows aspect ratio, daylight remaining indicator, version, clock
- **BootSequence** (`BootSequence.tsx`) — startup animation before site loads
- **Crosshair** (`Crosshair.tsx`) — custom cursor (replaces native cursor via `cursor: none !important`)
- **ScrollSlider** (`ScrollSlider.tsx`) — horizontal scroll position indicator
- **ShowcaseSection** (`ShowcaseSection.tsx`) — project showcase cards

## Themes
9 themes defined in `page.tsx` → `themeDefinitions[]`. 5 light (Default, Cryo, Oxide, Phantom, Signal) + 4 dark (Ember, Slate, Void, Soot). Dark themes set `document.documentElement.dataset.theme = "dark"`. CSS uses `[data-theme="dark"]` selectors for overrides. Theme preference saved to `localStorage` key `rj-theme-pref`.

## CSS Variables (`:root`)
- Colors: `--bg`, `--text`, `--text-muted`, `--text-subtle`, `--text-faint`, `--border`, `--grid-line`, `--card-bg`, `--cursor`, `--accent`, `--accent-warm`, `--accent-gradient`
- Layout: `--grid-margin`, `--grid-gutter`, `--grid-columns`, `--grid-column-width`, `--content-padding-x`
- Design system tokens: `--ds-space-*`, `--ds-text-*`, `--ds-z-*`, `--ds-duration-*`, `--ds-ease-*`

## Daylight System
The site is daylight-aware. `getSunTimes(lat, lng)` computes sunrise/sunset using solar declination + equation of time. Used in two places:
1. **Auto dark mode** (`page.tsx`) — switches to Slate theme after sundown, with dismissable notice
2. **StatusBar daylight indicator** (`StatusBar.tsx`) — tiny semicircular arc showing sun position + text like "4h 12m of light" or "6h 23m to sunrise". Updates every 60s. Uses geolocation when available, falls back to timezone-based latitude estimate.

## Design Principles
- Reduced, minimal, Dieter Rams / Jony Ive aesthetic
- No emojis in UI
- Monospace-influenced typography, uppercase labels
- Window-bar pattern (OS-style title bars on content panels)
- Spatial/glass-like panels, noise grain overlay
- Prefer SVG + CSS over canvas/WebGL — keep bundle small
- All animations should be subtle, purposeful, and pausable
