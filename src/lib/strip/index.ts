import { StripFrame } from "@/types";

// ─── Frame presets (Figma 25:2 / 25:12 / 25:22) ─────────────
// Frames are plain data objects rendered onto the canvas — not CSS.
export const STRIP_FRAMES: StripFrame[] = [
  {
    id: "classic-white",
    name: "Classic White",
    background: "#ffffff",
    titleColor: "#111111",
    metaColor: "#9ca3af",
    dateColor: "#9ca3af",
    title: "Framio",
    logoUrl: "/strips/logo-classic-white.png",
    caption: "Stay Closer",
    captionColor: "#161616",
  },
  {
    id: "noir",
    name: "Noir",
    background: "#101010",
    titleColor: "#f5f5f5",
    metaColor: "#6b7280",
    dateColor: "#9ca3af",
    title: "Framio",
    logoUrl: "/strips/logo-noir.png",
    caption: "Stay Closer",
    captionColor: "#dadada",
  },
  {
    id: "blush",
    name: "Blush",
    background: "#fce7ef",
    titleColor: "#9d2449",
    metaColor: "#c98da1",
    dateColor: "#c98da1",
    title: "Framio",
    logoUrl: "/strips/logo-blush.png",
    caption: "Stay Closer",
    captionColor: "#f22e98",
  },
];

export const STRIP_PHOTO_COUNT = 3;

// ─── Layout constants (canvas px, from Figma) ───────────────
const STRIP_WIDTH = 640;
const PADDING = 32;
const GAP = 20;
const HEADER_H = 60;
const FOOTER_H = 200; // taller footer: date + script caption
const FOOTER_PY = 24;
const PHOTO_W = STRIP_WIDTH - PADDING * 2; // 576
const PHOTO_H = 432;
const LOGO_W = 93;
const LOGO_H = 27;

// Tape decorations — same placement on every theme (Figma 41:457/460/463)
// cx/cy = rotation center in strip coordinates, deg = rotation
const TAPES = [
  { src: "/strips/tape1.png", cx: 95.36, cy: 90.36, w: 265.21, h: 86.52, deg: -45 },
  { src: "/strips/tape2.png", cx: 590.72, cy: 511.56, w: 209.42, h: 99.2, deg: 60.51 },
  { src: "/strips/tape3.png", cx: 59.91, cy: 1365.31, w: 215.72, h: 64, deg: 26.18 },
];

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/** Like loadImage but resolves null when the asset is missing. */
async function loadImageSafe(src: string): Promise<HTMLImageElement | null> {
  try {
    return await loadImage(src);
  } catch {
    return null;
  }
}

/** Draw `img` into the dest rect with object-fit: cover semantics. */
function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  dx: number,
  dy: number,
  dw: number,
  dh: number
) {
  const srcAspect = img.width / img.height;
  const destAspect = dw / dh;
  let sx = 0,
    sy = 0,
    sw = img.width,
    sh = img.height;

  if (srcAspect > destAspect) {
    sw = img.height * destAspect;
    sx = (img.width - sw) / 2;
  } else {
    sh = img.width / destAspect;
    sy = (img.height - sh) / 2;
  }
  ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
}

/**
 * Compose 3 captured photos into a framed vertical strip.
 * `filterCSS` (e.g. from filterToCSS) is baked into the photos via ctx.filter.
 * Returns a JPEG data URL.
 */
export async function composeStrip(
  dataUrls: string[],
  frame: StripFrame,
  filterCSS?: string
): Promise<string> {
  // Load photos, logo, tapes and the caption font in parallel.
  // Logo/tapes degrade gracefully if their PNGs aren't in public/ yet.
  const [images, logo, tapes] = await Promise.all([
    Promise.all(dataUrls.map(loadImage)),
    loadImageSafe(frame.logoUrl),
    Promise.all(TAPES.map((t) => loadImageSafe(t.src))),
    typeof document !== "undefined" && document.fonts
      ? document.fonts.load('62px "Freehand"').catch(() => undefined)
      : Promise.resolve(undefined),
  ]);

  const height =
    HEADER_H +
    images.length * PHOTO_H +
    (images.length - 1) * GAP +
    FOOTER_H;

  const canvas = document.createElement("canvas");
  canvas.width = STRIP_WIDTH;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D not supported");

  // Frame background
  ctx.fillStyle = frame.background;
  ctx.fillRect(0, 0, STRIP_WIDTH, height);

  // Header — small mark left, Framio logo right (Figma 26:98)
  ctx.fillStyle = frame.metaColor;
  ctx.font = "500 13px system-ui, -apple-system, sans-serif";
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  ctx.fillText("✦ · ·", PADDING, HEADER_H / 2 + 4);

  if (logo) {
    ctx.drawImage(
      logo,
      STRIP_WIDTH - PADDING - LOGO_W,
      (HEADER_H - LOGO_H) / 2,
      LOGO_W,
      LOGO_H
    );
  } else {
    // fallback: text title until the logo PNG is added
    ctx.fillStyle = frame.titleColor;
    ctx.font = "600 22px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(frame.title, STRIP_WIDTH - PADDING, HEADER_H / 2 + 4);
  }

  // Photos (theme filter baked in)
  images.forEach((img, i) => {
    const y = HEADER_H + i * (PHOTO_H + GAP);
    ctx.save();
    if (filterCSS) ctx.filter = filterCSS;
    drawCover(ctx, img, PADDING, y, PHOTO_W, PHOTO_H);
    ctx.restore();
  });

  // Footer — date on top, script caption beneath (Figma 25:10)
  const footerTop = height - FOOTER_H;
  ctx.fillStyle = frame.dateColor;
  ctx.font = "400 13px system-ui, -apple-system, sans-serif";
  ctx.textAlign = "center";
  const date = new Date().toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  ctx.fillText(date, STRIP_WIDTH / 2, footerTop + FOOTER_PY + 8);

  ctx.fillStyle = frame.captionColor;
  ctx.font = '400 62px "Freehand", cursive';
  ctx.fillText(frame.caption, STRIP_WIDTH / 2, footerTop + FOOTER_PY + 16 + 44);

  // Tape decorations on top of everything
  TAPES.forEach((t, i) => {
    const img = tapes[i];
    if (!img) return;
    ctx.save();
    ctx.translate(t.cx, t.cy);
    ctx.rotate((t.deg * Math.PI) / 180);
    ctx.drawImage(img, -t.w / 2, -t.h / 2, t.w, t.h);
    ctx.restore();
  });

  return canvas.toDataURL("image/jpeg", 0.92);
}
