import { GameboySettings } from "@/types";

// 4-tone palettes, ordered dark → light
export type GameboyPalette = {
  id: string;
  name: string;
  colors: [string, string, string, string];
};

export const GAMEBOY_PALETTES: GameboyPalette[] = [
  { id: "classic", name: "Classic DMG", colors: ["#0f380f", "#306230", "#8bac0f", "#9bbc0f"] },
  { id: "bgb", name: "BGB Teal", colors: ["#081820", "#346856", "#88c070", "#e0f8d0"] },
  { id: "pocket", name: "Pocket Gray", colors: ["#1a1a1a", "#565656", "#a3a3a3", "#e6e6e6"] },
  { id: "lava", name: "Lava", colors: ["#1a0505", "#7a1f1f", "#d0603a", "#f8cf9f"] },
];

export const DEFAULT_GAMEBOY_SETTINGS: GameboySettings = {
  enabled: false,
  resolution: 160, // authentic Game Boy horizontal resolution
  paletteId: "classic",
  dither: "bayer",
  brightness: 0,
  contrast: 100,
  invert: false,
};

// Bayer 4×4 ordered-dithering threshold matrix
const BAYER4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

type DrawableSource = HTMLVideoElement | HTMLImageElement | HTMLCanvasElement;

function getSourceSize(source: DrawableSource) {
  if (source instanceof HTMLVideoElement) {
    return { width: source.videoWidth, height: source.videoHeight };
  }
  if (source instanceof HTMLImageElement) {
    return { width: source.naturalWidth, height: source.naturalHeight };
  }
  return { width: source.width, height: source.height };
}

/**
 * Renders `source` as Game Boy Camera-style 4-tone dithered pixel art
 * onto `output`, using `sampleCanvas` as the low-res working buffer.
 */
export function renderGameboyFrame(
  source: DrawableSource,
  output: HTMLCanvasElement,
  sampleCanvas: HTMLCanvasElement,
  settings: GameboySettings,
  mirror = false
) {
  const { width: srcWidth, height: srcHeight } = getSourceSize(source);
  if (srcWidth === 0 || srcHeight === 0) return;

  const cols = Math.max(16, Math.round(settings.resolution));
  const rows = Math.max(16, Math.round(cols * (srcHeight / srcWidth)));

  sampleCanvas.width = cols;
  sampleCanvas.height = rows;
  const sampleCtx = sampleCanvas.getContext("2d", { willReadFrequently: true });
  if (!sampleCtx) return;
  sampleCtx.imageSmoothingEnabled = true;
  sampleCtx.save();
  if (mirror) {
    sampleCtx.translate(cols, 0);
    sampleCtx.scale(-1, 1);
  }
  sampleCtx.drawImage(source, 0, 0, cols, rows);
  sampleCtx.restore();

  let imageData: ImageData;
  try {
    imageData = sampleCtx.getImageData(0, 0, cols, rows);
  } catch {
    return;
  }
  const pixels = imageData.data;

  const palette = (
    GAMEBOY_PALETTES.find((p) => p.id === settings.paletteId) ??
    GAMEBOY_PALETTES[0]
  ).colors.map(hexToRgb);

  const brightnessOffset = (settings.brightness / 100) * 128;
  const contrastAmount = (settings.contrast - 100) * 2.55;
  const contrastFactor =
    (259 * (contrastAmount + 255)) / (255 * (259 - contrastAmount));

  // Luminance pass (float buffer so error diffusion can accumulate)
  const lums = new Float32Array(cols * rows);
  for (let i = 0, p = 0; i < lums.length; i++, p += 4) {
    let lum =
      0.299 * pixels[p] + 0.587 * pixels[p + 1] + 0.114 * pixels[p + 2];
    lum = contrastFactor * (lum - 128) + 128 + brightnessOffset;
    if (settings.invert) lum = 255 - lum;
    lums[i] = Math.min(255, Math.max(0, lum));
  }

  // Quantize to 4 levels (step 85) with the chosen dithering
  const STEP = 85;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const i = y * cols + x;
      let level: number;

      if (settings.dither === "bayer") {
        const threshold = ((BAYER4[y % 4][x % 4] + 0.5) / 16 - 0.5) * STEP;
        level = Math.round((lums[i] + threshold) / STEP);
      } else if (settings.dither === "diffusion") {
        level = Math.round(lums[i] / STEP);
        const err = lums[i] - level * STEP;
        // Floyd–Steinberg error diffusion
        if (x + 1 < cols) lums[i + 1] += (err * 7) / 16;
        if (y + 1 < rows) {
          if (x > 0) lums[i + cols - 1] += (err * 3) / 16;
          lums[i + cols] += (err * 5) / 16;
          if (x + 1 < cols) lums[i + cols + 1] += (err * 1) / 16;
        }
      } else {
        level = Math.round(lums[i] / STEP);
      }

      const [r, g, b] = palette[Math.min(3, Math.max(0, level))];
      const p = i * 4;
      pixels[p] = r;
      pixels[p + 1] = g;
      pixels[p + 2] = b;
      pixels[p + 3] = 255;
    }
  }

  sampleCtx.putImageData(imageData, 0, 0);

  const outCtx = output.getContext("2d");
  if (!outCtx) return;
  outCtx.imageSmoothingEnabled = false; // crisp chunky pixels
  outCtx.drawImage(sampleCanvas, 0, 0, output.width, output.height);
}
