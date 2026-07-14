// ============================================================
// Seeded Pseudo-Random Number Generator (Mulberry32)
// Ensures reproducible randomness per page seed
// ============================================================
export function createRng(seed: number) {
  let s = seed >>> 0;
  return function (): number {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ============================================================
// Seeded random helpers
// ============================================================
export function rngRange(rng: () => number, min: number, max: number): number {
  return min + rng() * (max - min);
}

export function rngSign(rng: () => number): number {
  return rng() > 0.5 ? 1 : -1;
}

export function rngBool(rng: () => number, probability = 0.5): boolean {
  return rng() < probability;
}

// ============================================================
// Canvas utility: draw rounded rectangle
// ============================================================
export function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// ============================================================
// Hex to RGBA conversion
// ============================================================
export function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// ============================================================
// Generate a random int hash from string seed
// ============================================================
export function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

// ============================================================
// Gaussian-like approximation (Box-Muller using rng)
// ============================================================
export function rngGaussian(rng: () => number, mean = 0, std = 1): number {
  const u1 = rng();
  const u2 = rng();
  const z = Math.sqrt(-2.0 * Math.log(u1 + 0.0001)) * Math.cos(2 * Math.PI * u2);
  return mean + std * z;
}

// ============================================================
// Canvas scale helper for 300 DPI
// ============================================================
export const DPI_SCALE = 3; // 96dpi * 3 = 288 ≈ 300dpi

// Standard A4-like notebook page dimensions (CSS pixels at 96dpi)
export const PAGE_WIDTH_PX = 680;
export const PAGE_HEIGHT_PX = 880;

export const DESK_PADDING_X = 40;
export const DESK_PADDING_Y = 40;
export const CANVAS_WIDTH_PX = PAGE_WIDTH_PX + DESK_PADDING_X * 2;
export const CANVAS_HEIGHT_PX = PAGE_HEIGHT_PX + DESK_PADDING_Y * 2;
