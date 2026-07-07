import { AsciiSettings } from "@/types";

// Character ramps ordered from sparse (dark) → dense (bright).
export const ASCII_CHARSET_PRESETS: Record<
  Exclude<AsciiSettings["charset"], "custom">,
  { label: string; ramp: string }
> = {
  full: { label: "Full", ramp: " .:-=+*#%@" },
  minimal: { label: "Minimal", ramp: " .:#" },
  blocks: { label: "Blocks", ramp: " ░▒▓█" },
  simple: { label: "Simple", ramp: " .+#" },
};

export const DEFAULT_ASCII_SETTINGS: AsciiSettings = {
  enabled: false,
  resolution: 100,
  charset: "full",
  customChars: "",
  colorMode: "mono",
  textColor: "#e5e5e5",
  backgroundColor: "#0a0a0a",
  brightness: 0,
  contrast: 100,
  invert: false,
};

// Monospace glyph cells are roughly twice as tall as they are wide.
const CHAR_ASPECT = 0.5;

export function getAsciiRamp(settings: AsciiSettings): string {
  if (settings.charset === "custom") {
    return settings.customChars.length > 0
      ? settings.customChars
      : ASCII_CHARSET_PRESETS.full.ramp;
  }
  return ASCII_CHARSET_PRESETS[settings.charset].ramp;
}

export function getAsciiGridSize(
  cols: number,
  srcWidth: number,
  srcHeight: number
) {
  const rows = Math.max(
    1,
    Math.round(cols * (srcHeight / srcWidth) * CHAR_ASPECT)
  );
  return { cols: Math.max(1, Math.round(cols)), rows };
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
 * Samples `source` into an ASCII character grid and paints it onto `output`,
 * sized to fill `output`'s current width/height.
 */
export function renderAsciiFrame(
  source: DrawableSource,
  output: HTMLCanvasElement,
  sampleCanvas: HTMLCanvasElement,
  settings: AsciiSettings,
  mirror = false
) {
  const { width: srcWidth, height: srcHeight } = getSourceSize(source);
  if (srcWidth === 0 || srcHeight === 0) return;

  const { cols, rows } = getAsciiGridSize(settings.resolution, srcWidth, srcHeight);

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

  let pixels: Uint8ClampedArray;
  try {
    pixels = sampleCtx.getImageData(0, 0, cols, rows).data;
  } catch {
    return;
  }

  const outCtx = output.getContext("2d");
  if (!outCtx) return;

  const cellWidth = output.width / cols;
  const cellHeight = output.height / rows;
  const fontSize = Math.max(4, cellHeight * 1.1);

  const ramp = getAsciiRamp(settings);
  const brightnessOffset = (settings.brightness / 100) * 128;
  const contrastAmount = (settings.contrast - 100) * 2.55;
  const contrastFactor =
    (259 * (contrastAmount + 255)) / (255 * (259 - contrastAmount));

  const isMono = settings.colorMode === "mono";

  outCtx.fillStyle = isMono ? settings.backgroundColor : "#000000";
  outCtx.fillRect(0, 0, output.width, output.height);

  outCtx.font = `${fontSize}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
  outCtx.textAlign = "center";
  outCtx.textBaseline = "middle";
  if (isMono) outCtx.fillStyle = settings.textColor;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const i = (row * cols + col) * 4;
      let r = pixels[i];
      let g = pixels[i + 1];
      let b = pixels[i + 2];

      let lum = 0.299 * r + 0.587 * g + 0.114 * b;
      lum = contrastFactor * (lum - 128) + 128 + brightnessOffset;
      if (settings.invert) lum = 255 - lum;
      lum = Math.min(255, Math.max(0, lum));

      if (lum < 8) continue; // skip near-empty background cells

      const charIndex = Math.min(
        ramp.length - 1,
        Math.floor((lum / 255) * ramp.length)
      );
      const char = ramp[charIndex];
      if (char === " ") continue;

      if (!isMono) {
        if (settings.invert) {
          r = 255 - r;
          g = 255 - g;
          b = 255 - b;
        }
        outCtx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      }

      const x = col * cellWidth + cellWidth / 2;
      const y = row * cellHeight + cellHeight / 2;
      outCtx.fillText(char, x, y);
    }
  }
}
