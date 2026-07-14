// ============================================================
// Handwriting Engine — THE CORE of WriteBook AI
// Renders text character-by-character with controlled
// randomness to simulate real human handwriting
// ============================================================
import type { HandwritingStyle, NotebookTemplate, InkColor, RenderOptions } from "@/types";
import {
  createRng,
  rngRange,
  rngSign,
  rngBool,
  rngGaussian,
  hexToRgba,
  PAGE_WIDTH_PX,
  PAGE_HEIGHT_PX,
} from "@/utils/canvas-utils";

// ============================================================
// Font loading cache
// ============================================================
const loadedFonts = new Set<string>();

export async function loadHandwritingFonts(style: HandwritingStyle): Promise<void> {
  if (loadedFonts.has(style.id)) return;

  // Extract font family names
  const fontFamilies = style.fontFamily.split(",").map((f) =>
    f.trim().replace(/['"]/g, "")
  );

  for (const fontFamily of fontFamilies) {
    if (fontFamily === "cursive" || fontFamily === "monospace") continue;
    try {
      await document.fonts.load(`${style.fontSize}px '${fontFamily}'`);
    } catch (e) {
      console.warn(`Font load failed: ${fontFamily}`);
    }
  }

  loadedFonts.add(style.id);
}

// ============================================================
// Main render function — draws one page of handwriting
// ============================================================
export async function renderHandwritingPage(
  ctx: CanvasRenderingContext2D,
  options: RenderOptions,
  pageText: string,
  scale: number = 1
): Promise<void> {
  const { template, style, inkColor, seed } = options;
  const rng = createRng(seed);

  const width = PAGE_WIDTH_PX * scale;
  const height = PAGE_HEIGHT_PX * scale;

  // Scaled dimensions
  const marginLeft = template.marginLeft * scale;
  const marginRight = template.marginRight * scale;
  const marginTop = template.marginTop * scale;
  const marginBottom = template.marginBottom * scale;
  const lineSpacing = template.lineSpacing * scale;
  const fontSize = style.fontSize * scale;
  const writableWidth = width - marginLeft - marginRight;

  // Ensure fonts are loaded
  await loadHandwritingFonts(style);

  // ============================================================
  // Split text into lines that fit the page width
  // ============================================================
  const lines = wrapTextToLines(ctx, pageText, style, template, scale, writableWidth);

  // ============================================================
  // Render each line
  // ============================================================
  let currentY = marginTop + lineSpacing;

  for (const line of lines) {
    if (currentY > height - marginBottom - lineSpacing * 0.5) break;

    renderLine(ctx, line, currentY, marginLeft, style, inkColor, scale, rng, seed);

    currentY += lineSpacing;
  }
}

// ============================================================
// Word-wrap text into lines
// ============================================================
function wrapTextToLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  style: HandwritingStyle,
  template: NotebookTemplate,
  scale: number,
  maxWidth: number
): string[] {
  const fontSize = style.fontSize * scale;
  ctx.font = `${fontSize}px ${style.fontFamily}`;

  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    // Handle newlines
    if (word.includes("\n")) {
      const parts = word.split("\n");
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const test = currentLine ? `${currentLine} ${part}` : part;
        const metrics = ctx.measureText(test);

        if (metrics.width > maxWidth * 0.95 && currentLine) {
          lines.push(currentLine);
          currentLine = part;
        } else {
          currentLine = test;
        }

        if (i < parts.length - 1) {
          lines.push(currentLine);
          currentLine = "";
        }
      }
      continue;
    }

    const test = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(test);

    if (metrics.width > maxWidth * 0.95 && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = test;
    }
  }

  if (currentLine) lines.push(currentLine);
  return lines;
}

// ============================================================
// Render a single line of text character by character
// ============================================================
function renderLine(
  ctx: CanvasRenderingContext2D,
  line: string,
  baseY: number,
  startX: number,
  style: HandwritingStyle,
  inkColor: InkColor,
  scale: number,
  rng: () => number,
  seed: number
) {
  const fontSize = style.fontSize * scale;
  ctx.font = `${fontSize}px ${style.fontFamily}`;
  ctx.textBaseline = "alphabetic";

  let x = startX;

  // Line-level randomness: slight overall line baseline drift
  const lineBaselineDrift = rngGaussian(rng, 0, style.baselineRange * scale * 0.3);
  // Line-level angle: slight tilt per line
  const lineAngle = rngGaussian(rng, 0, 0.003 * style.shakiness);
  let angleAccum = lineAngle;

  // Track ink level (starts fresh each line, depletes slightly)
  let inkLevel = 1.0;

  const chars = line.split("");

  for (let i = 0; i < chars.length; i++) {
    const char = chars[i];

    // Per-character randomness
    const charRotation = rngGaussian(rng, 0, style.rotationRange * 0.4) * (Math.PI / 180);
    const baselineShift = rngGaussian(rng, 0, style.baselineRange * scale * 0.5);
    const spacingJitter = rngGaussian(rng, 0, style.spacingJitter * scale * 0.3);
    const pressureScale = 1 - rngRange(rng, 0, style.pressureVariation * 0.5);

    // Ink fade simulation
    inkLevel = Math.max(0.7, inkLevel - rng() * style.inkFade * 0.01);
    if (rngBool(rng, 0.02)) inkLevel = Math.min(1.0, inkLevel + 0.15); // Re-ink occasionally

    // Shakiness — micro jitter in x/y
    const shakeX = rngGaussian(rng, 0, style.shakiness * scale * 0.3);
    const shakeY = rngGaussian(rng, 0, style.shakiness * scale * 0.2);

    // Slant effect
    const slantOffset = fontSize * Math.tan(style.slant * Math.PI / 180) * 0.08;

    // Compute character position
    const charY = baseY + lineBaselineDrift + baselineShift + shakeY;
    const charX = x + spacingJitter + shakeX;

    // Ink color with pressure variation and fade
    const alpha = inkColor.opacity * pressureScale * inkLevel;
    ctx.fillStyle = hexToRgba(inkColor.hex, alpha);

    // Apply per-character transform
    ctx.save();
    ctx.translate(charX, charY);
    ctx.rotate(charRotation);

    // Slight x-scale for pressure (wider under more pressure)
    const scaleX = 1 + (pressureScale - 0.8) * 0.2;
    const scaleY = 1 / (1 + (pressureScale - 0.8) * 0.1);
    ctx.scale(scaleX, scaleY);

    // Draw character
    ctx.fillText(char, 0, 0);

    ctx.restore();

    // Advance x by character width + spacing jitter
    const charWidth = ctx.measureText(char).width;
    x += charWidth + spacingJitter * 0.2;

    // Word spacing variation
    if (char === " ") {
      x += rngGaussian(rng, 0, style.wordSpacingJitter * scale * 0.3);
    }
  }
}

// ============================================================
// Measure lines per page (for page splitting)
// ============================================================
export function measureLinesPerPage(
  template: NotebookTemplate,
  pageHeight: number = PAGE_HEIGHT_PX
): number {
  const usableHeight =
    pageHeight - template.marginTop - template.marginBottom;
  return Math.floor(usableHeight / template.lineSpacing);
}

// ============================================================
// Compute character width on canvas for a given style
// ============================================================
let _measureCanvas: HTMLCanvasElement | null = null;
let _measureCtx: CanvasRenderingContext2D | null = null;

function getMeasureCtx(): CanvasRenderingContext2D {
  if (!_measureCtx) {
    _measureCanvas = document.createElement("canvas");
    _measureCanvas.width = 100;
    _measureCanvas.height = 50;
    _measureCtx = _measureCanvas.getContext("2d")!;
  }
  return _measureCtx;
}

export function measureTextWidth(
  text: string,
  style: HandwritingStyle
): number {
  const ctx = getMeasureCtx();
  ctx.font = `${style.fontSize}px ${style.fontFamily}`;
  return ctx.measureText(text).width;
}
