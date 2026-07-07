import { Theme } from "@/types";

export const DEFAULT_THEMES: Theme[] = [
  {
    id: "none",
    name: "Original",
    emoji: "📷",
    filter: {},
    favourite: false,
  },
  {
    id: "bw",
    name: "Black & White",
    emoji: "🖤",
    filter: { grayscale: 100 },
    favourite: false,
  },
  {
    id: "sepia",
    name: "Sepia",
    emoji: "🟤",
    filter: { sepia: 100 },
    favourite: false,
  },
  {
    id: "vivid",
    name: "Vivid",
    emoji: "🌈",
    filter: { saturate: 200, contrast: 110 },
    favourite: false,
  },
  {
    id: "cool",
    name: "Cool",
    emoji: "🧊",
    filter: { hue: 200, saturate: 120 },
    favourite: false,
  },
  {
    id: "warm",
    name: "Warm",
    emoji: "🔥",
    filter: { sepia: 40, saturate: 150, brightness: 105 },
    favourite: false,
  },
  {
    id: "dreamy",
    name: "Dreamy",
    emoji: "✨",
    filter: { brightness: 115, contrast: 85, saturate: 120, blur: 0.5 },
    favourite: false,
  },
  {
    id: "dramatic",
    name: "Dramatic",
    emoji: "🎭",
    filter: { contrast: 160, brightness: 90, saturate: 80 },
    favourite: false,
  },
  {
    id: "vintage",
    name: "Vintage",
    emoji: "📼",
    filter: { sepia: 60, contrast: 110, brightness: 95, saturate: 80 },
    favourite: false,
  },
  {
    id: "fade",
    name: "Fade",
    emoji: "🌫",
    filter: { brightness: 115, contrast: 80, saturate: 70 },
    favourite: false,
  },
  {
    id: "noir",
    name: "Noir",
    emoji: "🕵️",
    filter: { grayscale: 100, contrast: 150, brightness: 85 },
    favourite: false,
  },
  {
    id: "pop",
    name: "Pop Art",
    emoji: "🎨",
    filter: { saturate: 300, contrast: 130 },
    favourite: false,
  },
];

// ─── Theme swatch styles (Figma: Container Active / Default) ─
// Vertical gradient pattern from the design:
// dark 0% → mid 47.6% → mid 54.3% → light 100%
export type ThemeSwatch = {
  gradient: string;    // CSS background-image
  dotGradient: string; // reversed gradient for the inner squircle dot
  border: string;      // swatch border color
  icon: string;        // squircle icon color
};

const swatch = (
  dark: string,
  mid1: string,
  mid2: string,
  light: string,
  border: string,
  icon: string
): ThemeSwatch => ({
  gradient: `linear-gradient(180deg, ${dark} 0%, ${mid1} 47.596%, ${mid2} 54.327%, ${light} 100%)`,
  dotGradient: `linear-gradient(180deg, ${light} 0%, ${mid2} 47.596%, ${mid1} 54.327%, ${dark} 100%)`,
  border,
  icon,
});

export const THEME_SWATCHES: Record<string, ThemeSwatch> = {
  // Original — neutral gray (exact values from Figma)
  none: swatch("rgb(87,87,87)", "rgb(77,77,77)", "rgb(76,76,76)", "rgb(189,189,189)", "#5f5f5f", "#d4d4d4"),
  // Black & White — hard mono ramp
  bw: swatch("rgb(26,26,26)", "rgb(51,51,51)", "rgb(56,56,56)", "rgb(232,232,232)", "#4a4a4a", "#f0f0f0"),
  // Sepia — warm browns
  sepia: swatch("rgb(112,74,36)", "rgb(138,97,54)", "rgb(143,101,56)", "rgb(217,185,138)", "#8a6136", "#f3e3c3"),
  // Vivid — saturated magenta → amber
  vivid: swatch("rgb(168,28,160)", "rgb(219,39,119)", "rgb(225,49,125)", "rgb(251,176,64)", "#d63384", "#ffe3f1"),
  // Cool — deep blue → ice
  cool: swatch("rgb(21,60,110)", "rgb(29,88,150)", "rgb(30,92,155)", "rgb(125,211,252)", "#2e6da8", "#dbeeff"),
  // Warm — ember orange
  warm: swatch("rgb(146,64,14)", "rgb(194,90,25)", "rgb(200,94,27)", "rgb(252,196,120)", "#c25a19", "#ffe8cc"),
  // Dreamy — soft lavender haze
  dreamy: swatch("rgb(129,102,166)", "rgb(167,139,201)", "rgb(172,144,205)", "rgb(240,215,245)", "#a78bc9", "#f8ecff"),
  // Dramatic — crushed blacks
  dramatic: swatch("rgb(23,23,23)", "rgb(40,40,40)", "rgb(42,42,42)", "rgb(120,120,120)", "#3d3d3d", "#cfcfcf"),
  // Vintage — faded khaki
  vintage: swatch("rgb(107,84,44)", "rgb(140,113,66)", "rgb(145,117,69)", "rgb(214,190,141)", "#8c7142", "#efe2c4"),
  // Fade — washed neutrals
  fade: swatch("rgb(120,120,116)", "rgb(150,150,145)", "rgb(154,154,149)", "rgb(215,213,205)", "#9a9a95", "#f2f1ec"),
  // Noir — near-black
  noir: swatch("rgb(8,8,8)", "rgb(20,20,20)", "rgb(22,22,22)", "rgb(95,95,95)", "#333333", "#bdbdbd"),
  // Pop Art — hot pink → yellow
  pop: swatch("rgb(157,23,77)", "rgb(219,39,119)", "rgb(225,45,120)", "rgb(250,204,21)", "#db2777", "#fff3b0"),
};

export const FALLBACK_SWATCH = THEME_SWATCHES.none;

export function filterToCSS(filter: Theme["filter"]): string {
  const parts: string[] = [];
  if (filter.brightness !== undefined) parts.push(`brightness(${filter.brightness}%)`);
  if (filter.contrast !== undefined) parts.push(`contrast(${filter.contrast}%)`);
  if (filter.saturate !== undefined) parts.push(`saturate(${filter.saturate}%)`);
  if (filter.grayscale !== undefined) parts.push(`grayscale(${filter.grayscale}%)`);
  if (filter.sepia !== undefined) parts.push(`sepia(${filter.sepia}%)`);
  if (filter.hue !== undefined) parts.push(`hue-rotate(${filter.hue}deg)`);
  if (filter.blur !== undefined) parts.push(`blur(${filter.blur}px)`);
  if (filter.invert !== undefined) parts.push(`invert(${filter.invert}%)`);
  return parts.join(" ");
}
