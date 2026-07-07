export type ThemeFilter = {
  brightness?: number;  // 0–200 (100 = normal)
  contrast?: number;    // 0–200
  saturate?: number;    // 0–200
  grayscale?: number;   // 0–100
  sepia?: number;       // 0–100
  hue?: number;         // 0–360
  blur?: number;        // 0–10px
  invert?: number;      // 0–100
};

export type Theme = {
  id: string;
  name: string;
  emoji: string;
  filter: ThemeFilter;
  favourite: boolean;
};

export type StripFrame = {
  id: string;
  name: string;
  background: string; // frame color behind/around photos
  titleColor: string;
  metaColor: string; // date + small header marks
  title: string;
};

export type CapturedPhoto = {
  id: string;
  dataUrl: string;
  themeId: string;
  capturedAt: Date;
};

export type AsciiCharset = "full" | "minimal" | "blocks" | "simple" | "custom";
export type AsciiColorMode = "mono" | "color";

export type AsciiSettings = {
  enabled: boolean;
  resolution: number; // columns of characters across the frame
  charset: AsciiCharset;
  customChars: string;
  colorMode: AsciiColorMode;
  textColor: string; // used in mono mode
  backgroundColor: string;
  brightness: number; // -100–100
  contrast: number; // 0–200 (100 = normal)
  invert: boolean;
};
