import { StripFrame } from "@/types";

// ─── Frame presets ──────────────────────────────────────────
// Frames are plain data objects rendered onto the canvas — not CSS.
// Add a new preset here (or later, an `overlayUrl` for SVG/PNG frames)
// and it will work without touching the render code.
export const STRIP_FRAMES: StripFrame[] = [
  {
    id: "classic-white",
    name: "Classic White",
    background: "#ffffff",
    titleColor: "#111111",
    metaColor: "#9ca3af",
    title: "Framio",
  },
  {
    id: "noir",
    name: "Noir",
    background: "#101010",
    titleColor: "#f5f5f5",
    metaColor: "#6b7280",
    title: "Framio",
  },
  {
    id: "blush",
    name: "Blush",
    background: "#fce7ef",
    titleColor: "#9d2449",
    metaColor: "#c98da1",
    title: "Framio",
  },
];

export const STRIP_PHOTO_COUNT = 3;

// ─── Layout constants (canvas px) ───────────────────────────
const STRIP_WIDTH = 640;
const PADDING = 32;
const GAP = 20;
const HEADER_H = 60;
const FOOTER_H = 64;
const PHOTO_W = STRIP_WIDTH - PADDING * 2; // 576
const PHOTO_ASPECT = 4 / 3;
const PHOTO_H = Math.round(PHOTO_W / PHOTO_ASPECT); // 432

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
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
  const images = await Promise.all(dataUrls.map(loadImage));

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

  // Header — small mark left, title right (like the reference)
  ctx.fillStyle = frame.metaColor;
  ctx.font = "500 13px system-ui, -apple-system, sans-serif";
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  ctx.fillText("✦ · ·", PADDING, HEADER_H / 2 + 4);

  ctx.fillStyle = frame.titleColor;
  ctx.font = "600 22px system-ui, -apple-system, sans-serif";
  ctx.textAlign = "right";
  ctx.fillText(frame.title, STRIP_WIDTH - PADDING, HEADER_H / 2 + 4);

  // Photos (theme filter baked in)
  images.forEach((img, i) => {
    const y = HEADER_H + i * (PHOTO_H + GAP);
    ctx.save();
    if (filterCSS) ctx.filter = filterCSS;
    drawCover(ctx, img, PADDING, y, PHOTO_W, PHOTO_H);
    ctx.restore();
  });

  // Footer — date centered
  const footerY = height - FOOTER_H / 2;
  ctx.fillStyle = frame.metaColor;
  ctx.font = "400 13px system-ui, -apple-system, sans-serif";
  ctx.textAlign = "center";
  const date = new Date().toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  ctx.fillText(date, STRIP_WIDTH / 2, footerY);

  return canvas.toDataURL("image/jpeg", 0.92);
}
