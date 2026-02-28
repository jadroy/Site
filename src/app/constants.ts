export type ThemeVars = Record<string, string>;

export const themeDefinitions: { name: string; vars: ThemeVars }[] = [
  { name: 'Default', vars: {} },
  {
    name: 'Cryo',
    vars: {
      '--bg': '#f5f8fc',
      '--text': 'hsl(210, 15%, 50%)',
      '--text-muted': 'hsl(210, 12%, 58%)',
      '--text-subtle': 'hsl(210, 10%, 63%)',
      '--text-faint': 'hsl(210, 8%, 72%)',
      '--border': 'hsl(210, 15%, 90%)',
      '--grid-line': 'hsl(210, 12%, 95%)',
      '--card-bg': 'hsl(210, 15%, 97%)',
      '--cursor': 'hsl(200, 65%, 58%)',
      '--accent': 'hsl(200, 65%, 58%)',
      '--accent-warm': 'hsl(210, 60%, 52%)',
      '--accent-gradient': 'linear-gradient(135deg, hsl(200, 65%, 62%) 0%, hsl(210, 60%, 55%) 50%, hsl(195, 65%, 58%) 100%)',
    },
  },
  {
    name: 'Oxide',
    vars: {
      '--bg': '#fdf8f2',
      '--text': 'hsl(25, 15%, 48%)',
      '--text-muted': 'hsl(25, 12%, 56%)',
      '--text-subtle': 'hsl(25, 10%, 62%)',
      '--text-faint': 'hsl(25, 8%, 70%)',
      '--border': 'hsl(25, 15%, 88%)',
      '--grid-line': 'hsl(25, 12%, 94%)',
      '--card-bg': 'hsl(25, 15%, 96%)',
      '--cursor': 'hsl(22, 75%, 52%)',
      '--accent': 'hsl(22, 75%, 52%)',
      '--accent-warm': 'hsl(15, 70%, 46%)',
      '--accent-gradient': 'linear-gradient(135deg, hsl(25, 75%, 55%) 0%, hsl(15, 70%, 48%) 50%, hsl(30, 75%, 52%) 100%)',
    },
  },
  {
    name: 'Phantom',
    vars: {
      '--bg': '#f8f6fc',
      '--text': 'hsl(260, 10%, 50%)',
      '--text-muted': 'hsl(260, 8%, 58%)',
      '--text-subtle': 'hsl(260, 6%, 63%)',
      '--text-faint': 'hsl(260, 4%, 72%)',
      '--border': 'hsl(260, 12%, 90%)',
      '--grid-line': 'hsl(260, 8%, 95%)',
      '--card-bg': 'hsl(260, 12%, 97%)',
      '--cursor': 'hsl(265, 45%, 62%)',
      '--accent': 'hsl(265, 45%, 62%)',
      '--accent-warm': 'hsl(275, 40%, 56%)',
      '--accent-gradient': 'linear-gradient(135deg, hsl(265, 45%, 65%) 0%, hsl(275, 40%, 58%) 50%, hsl(255, 45%, 62%) 100%)',
    },
  },
  {
    name: 'Signal',
    vars: {
      '--bg': '#f4f9f5',
      '--text': 'hsl(150, 12%, 46%)',
      '--text-muted': 'hsl(150, 10%, 54%)',
      '--text-subtle': 'hsl(150, 8%, 60%)',
      '--text-faint': 'hsl(150, 5%, 68%)',
      '--border': 'hsl(150, 10%, 88%)',
      '--grid-line': 'hsl(150, 8%, 94%)',
      '--card-bg': 'hsl(150, 10%, 96%)',
      '--cursor': 'hsl(155, 55%, 45%)',
      '--accent': 'hsl(155, 55%, 45%)',
      '--accent-warm': 'hsl(160, 50%, 40%)',
      '--accent-gradient': 'linear-gradient(135deg, hsl(155, 55%, 48%) 0%, hsl(160, 50%, 42%) 50%, hsl(150, 55%, 45%) 100%)',
    },
  },
  {
    name: 'Ember',
    vars: {
      '--bg': '#1a1614',
      '--text': 'hsl(30, 15%, 68%)',
      '--text-muted': 'hsl(30, 12%, 58%)',
      '--text-subtle': 'hsl(30, 10%, 50%)',
      '--text-faint': 'hsl(30, 8%, 42%)',
      '--border': 'hsl(30, 10%, 24%)',
      '--grid-line': 'hsl(30, 8%, 16%)',
      '--card-bg': 'hsl(30, 10%, 13%)',
      '--cursor': 'hsl(35, 80%, 50%)',
      '--accent': 'hsl(35, 80%, 50%)',
      '--accent-warm': 'hsl(25, 75%, 45%)',
      '--accent-gradient': 'linear-gradient(135deg, hsl(35, 80%, 52%) 0%, hsl(25, 75%, 47%) 50%, hsl(40, 80%, 50%) 100%)',
    },
  },
  {
    name: 'Slate',
    vars: {
      '--bg': '#151a1e',
      '--text': 'hsl(210, 15%, 68%)',
      '--text-muted': 'hsl(210, 12%, 58%)',
      '--text-subtle': 'hsl(210, 10%, 50%)',
      '--text-faint': 'hsl(210, 8%, 42%)',
      '--border': 'hsl(210, 10%, 24%)',
      '--grid-line': 'hsl(210, 8%, 16%)',
      '--card-bg': 'hsl(210, 10%, 13%)',
      '--cursor': 'hsl(200, 60%, 52%)',
      '--accent': 'hsl(200, 60%, 52%)',
      '--accent-warm': 'hsl(210, 55%, 48%)',
      '--accent-gradient': 'linear-gradient(135deg, hsl(200, 60%, 55%) 0%, hsl(210, 55%, 50%) 50%, hsl(195, 60%, 52%) 100%)',
    },
  },
  {
    name: 'Void',
    vars: {
      '--bg': '#171717',
      '--text': 'hsl(0, 0%, 68%)',
      '--text-muted': 'hsl(0, 0%, 58%)',
      '--text-subtle': 'hsl(0, 0%, 50%)',
      '--text-faint': 'hsl(0, 0%, 42%)',
      '--border': 'hsl(0, 0%, 24%)',
      '--grid-line': 'hsl(0, 0%, 16%)',
      '--card-bg': 'hsl(0, 0%, 13%)',
      '--cursor': 'hsl(0, 0%, 65%)',
      '--accent': 'hsl(0, 0%, 65%)',
      '--accent-warm': 'hsl(0, 0%, 58%)',
      '--accent-gradient': 'linear-gradient(135deg, hsl(0, 0%, 68%) 0%, hsl(0, 0%, 58%) 50%, hsl(0, 0%, 65%) 100%)',
    },
  },
  {
    name: 'Soot',
    vars: {
      '--bg': '#0e0e0e',
      '--text': 'hsl(0, 0%, 52%)',
      '--text-muted': 'hsl(0, 0%, 45%)',
      '--text-subtle': 'hsl(0, 0%, 38%)',
      '--text-faint': 'hsl(0, 0%, 30%)',
      '--border': 'hsl(0, 0%, 18%)',
      '--grid-line': 'hsl(0, 0%, 11%)',
      '--card-bg': 'hsl(0, 0%, 8%)',
      '--cursor': 'hsl(0, 0%, 42%)',
      '--accent': 'hsl(0, 0%, 42%)',
      '--accent-warm': 'hsl(0, 0%, 36%)',
      '--accent-gradient': 'linear-gradient(135deg, hsl(0, 0%, 44%) 0%, hsl(0, 0%, 36%) 50%, hsl(0, 0%, 42%) 100%)',
    },
  },
];

export const memoryImages = [
  "/photos/me/DABF7F66-A96C-4DD8-A99E-844411C4FA0D_1_105_c.jpeg",
  "/photos/image_2.jpg",
  "/Context/Landing Hero.png",
  "/photos/me/4CD50948-9950-4963-90A7-B8E053E7EF43_1_105_c.jpeg",
  "/Humanoid Index/CleanShot 2026-02-06 at 14.40.42@2x.png",
  "/photos/image_1.jpg",
  "/Share/Share Work - Cover (1).png",
];

export type MemoryFx = {
  grayscale: number;
  contrast: number;
  brightness: number;
  blur: number;
  dither: number;
  grain: number;
  halftone: number;
  pixelate: number;
  maskSoftness: number;
};

export const defaultFx: MemoryFx = {
  grayscale: 0,
  contrast: 1,
  brightness: 1,
  blur: 0,
  dither: 0,
  grain: 0,
  halftone: 0,
  pixelate: 0,
  maskSoftness: 70,
};

export const memoryPresets: { name: string; fx: Partial<MemoryFx> }[] = [
  { name: "Clean", fx: {} },
  { name: "Dither", fx: { dither: 0.8, grayscale: 80, contrast: 1.6 } },
  { name: "Newsprint", fx: { halftone: 1, grayscale: 100, contrast: 1.3 } },
  { name: "Grain", fx: { grain: 0.6, contrast: 1.1, brightness: 1.05 } },
  { name: "Faded", fx: { grayscale: 60, contrast: 0.85, brightness: 1.15, blur: 1 } },
  { name: "Pixel", fx: { pixelate: 8, contrast: 1.2 } },
  { name: "Stark", fx: { grayscale: 100, contrast: 2.2, brightness: 1.1, dither: 0.5 } },
];

export const bgOptions = [
  { label: 'White', value: '#ffffff' },
  { label: 'Snow', value: '#fefefe' },
  { label: 'Frost', value: '#fcfcfc' },
  { label: 'Mist', value: '#fafafa' },
  { label: 'Fog', value: '#f8f8f8' },
  { label: 'Cloud', value: '#f5f5f5' },
  { label: 'Ash', value: '#f2f2f2' },
  { label: 'Stone', value: '#efefef' },
];
