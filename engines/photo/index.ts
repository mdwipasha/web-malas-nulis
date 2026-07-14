"use client";

import type {
  HandwritingStyle,
  InkColor,
  NotebookPack,
  NotebookTemplate,
  PhotoRenderOptions,
} from "@/types";
import { applyPaperEffects } from "@/lib/paper-engine";
import { loadHandwritingFonts } from "@/lib/handwriting-engine";
import { createRng, hexToRgba, rngBool, rngGaussian, rngRange } from "@/utils/canvas-utils";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`PhotoRenderer: failed to load ${src}`));
    img.src = src;
  });
}

function templateFromPack(pack: NotebookPack): NotebookTemplate {
  const height = pack.writeArea.top + pack.writeArea.usableHeight + pack.writeArea.bottom;

  return {
    id: pack.id,
    label: pack.name,
    category: pack.category,
    paperColor: pack.metadata.paperColor,
    lineColor: pack.lines.color,
    marginColor: "rgba(210, 80, 90, 0.55)",
    lineSpacing: pack.lines.lineSpacing,
    marginLeft: pack.writeArea.left,
    marginRight: pack.writeArea.right,
    marginTop: Math.max(0, pack.lines.firstLine - pack.lines.lineSpacing),
    marginBottom: Math.max(0, height - pack.lines.lastLine),
    hasLines: true,
    hasMargin: pack.writeArea.left > 40,
    hasGrid: false,
    hasHoles: pack.spiral,
    hasHeader: pack.metadata.header,
    hasCheckboxes: pack.metadata.checkbox,
    paperTexture: "smooth",
    shadowIntensity: 0.35,
    description: pack.metadata.description ?? pack.name,
  };
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  style: HandwritingStyle,
  fontSize: number,
  maxWidth: number
): string[] {
  ctx.font = `${fontSize}px ${style.fontFamily}`;

  const lines: string[] = [];
  let currentLine = "";

  for (const token of text.split(/(\s+)/)) {
    if (token.includes("\n")) {
      const parts = token.split("\n");
      for (let i = 0; i < parts.length; i++) {
        if (currentLine.trim()) lines.push(currentLine.trimEnd());
        currentLine = parts[i];
      }
      continue;
    }

    const testLine = `${currentLine}${token}`;
    if (ctx.measureText(testLine).width > maxWidth && currentLine.trim()) {
      lines.push(currentLine.trimEnd());
      currentLine = token.trimStart();
    } else {
      currentLine = testLine;
    }
  }

  if (currentLine.trim()) lines.push(currentLine.trimEnd());
  return lines;
}

function renderGlyphLine(
  ctx: CanvasRenderingContext2D,
  line: string,
  xStart: number,
  baseline: number,
  maxWidth: number,
  style: HandwritingStyle,
  inkColor: InkColor,
  fontSize: number,
  scale: number,
  seed: number
) {
  const rng = createRng(seed);
  ctx.font = `${fontSize}px ${style.fontFamily}`;
  ctx.textBaseline = "alphabetic";

  let x = xStart;
  let inkLevel = 1;
  const lineDrift = rngGaussian(rng, 0, style.baselineRange * scale * 0.28);

  for (const char of line) {
    const charWidth = ctx.measureText(char).width;
    if (x + charWidth > xStart + maxWidth) break;

    const rotation = rngGaussian(rng, 0, style.rotationRange * 0.45) * (Math.PI / 180);
    const baselineShift = rngGaussian(rng, 0, style.baselineRange * scale * 0.42);
    const spacingJitter = rngGaussian(rng, 0, style.spacingJitter * scale * 0.28);
    const shakeX = rngGaussian(rng, 0, style.shakiness * scale * 0.22);
    const shakeY = rngGaussian(rng, 0, style.shakiness * scale * 0.18);
    const pressureScale = 1 - rngRange(rng, 0, style.pressureVariation * 0.45);

    inkLevel = Math.max(0.72, inkLevel - rng() * style.inkFade * 0.01);
    if (rngBool(rng, 0.02)) inkLevel = Math.min(1, inkLevel + 0.12);

    ctx.fillStyle = hexToRgba(inkColor.hex, inkColor.opacity * pressureScale * inkLevel);

    ctx.save();
    ctx.translate(x + shakeX + spacingJitter, baseline + lineDrift + baselineShift + shakeY);
    ctx.rotate(rotation);
    ctx.scale(1 + (pressureScale - 0.8) * 0.18, 1 / (1 + (pressureScale - 0.8) * 0.08));
    ctx.fillText(char, 0, 0);
    ctx.restore();

    x += charWidth + spacingJitter * 0.2;
    if (char === " ") {
      x += rngGaussian(rng, 0, style.wordSpacingJitter * scale * 0.25);
    }
  }
}

async function renderHeaderFields(
  ctx: CanvasRenderingContext2D,
  options: PhotoRenderOptions,
  scale: number
) {
  const { pack, headerInfo, style, inkColor, seed } = options;
  if (!headerInfo || !pack.metadata.header) return;

  await loadHandwritingFonts(style);

  const rng = createRng(seed + 55555);
  const pageWidth = ctx.canvas.width;
  const fontSize = Math.max(10, Math.round(style.fontSize * scale * 0.72));
  const yTop = Math.max(14 * scale, (pack.lines.firstLine - pack.lines.lineSpacing * 1.7) * scale);
  const leftX = pack.writeArea.left * scale;
  const rightX = pageWidth * 0.64;

  ctx.font = `${fontSize}px ${style.fontFamily}`;
  ctx.fillStyle = hexToRgba(inkColor.hex, inkColor.opacity * 0.88);
  ctx.textBaseline = "alphabetic";

  const drawValue = (value: string, x: number, y: number) => {
    let cursor = x;
    for (const char of value) {
      const dy = rngGaussian(rng, 0, style.baselineRange * scale * 0.2);
      const dr = rngGaussian(rng, 0, style.rotationRange * 0.18) * (Math.PI / 180);
      ctx.save();
      ctx.translate(cursor, y + dy);
      ctx.rotate(dr);
      ctx.fillText(char, 0, 0);
      ctx.restore();
      cursor += ctx.measureText(char).width;
    }
  };

  drawValue(headerInfo.name, leftX + 46 * scale, yTop);
  drawValue(headerInfo.no, rightX + 24 * scale, yTop);
  drawValue(headerInfo.class, leftX + 46 * scale, yTop + 18 * scale);
  drawValue(headerInfo.date, rightX + 34 * scale, yTop + 18 * scale);
}

export class PhotoRenderer {
  async render(canvas: HTMLCanvasElement, options: PhotoRenderOptions): Promise<void> {
    const scale = options.scale ?? 1;
    const image = await loadImage(options.pack.pagePath);
    const width = image.naturalWidth * scale;
    const height = image.naturalHeight * scale;

    canvas.width = width;
    canvas.height = height;
    canvas.style.width = `${image.naturalWidth}px`;
    canvas.style.height = `${image.naturalHeight}px`;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    ctx.drawImage(image, 0, 0, width, height);
    await renderHeaderFields(ctx, options, scale);
    await this.renderHandwriting(ctx, options, scale);
    applyPaperEffects(ctx, options.effects, width, height, options.seed);
  }

  private async renderHandwriting(
    ctx: CanvasRenderingContext2D,
    options: PhotoRenderOptions,
    scale: number
  ) {
    const { pack, style, inkColor, text, seed } = options;
    await loadHandwritingFonts(style);

    const x = pack.writeArea.left * scale;
    const maxWidth = pack.writeArea.usableWidth * scale;
    const firstLine = pack.lines.firstLine * scale;
    const lastLine = pack.lines.lastLine * scale;
    const spacing = pack.lines.lineSpacing * scale;
    const fontSize = Math.min(style.fontSize * scale, spacing * 0.72);
    const wrappedLines = wrapText(ctx, text, style, fontSize, maxWidth * 0.96);

    ctx.save();
    ctx.beginPath();
    ctx.rect(
      pack.writeArea.left * scale,
      pack.writeArea.top * scale,
      pack.writeArea.usableWidth * scale,
      pack.writeArea.usableHeight * scale
    );
    ctx.clip();

    let baseline = firstLine;
    for (let i = 0; i < wrappedLines.length && baseline <= lastLine; i++) {
      renderGlyphLine(
        ctx,
        wrappedLines[i],
        x,
        baseline,
        maxWidth * 0.96,
        style,
        inkColor,
        fontSize,
        scale,
        seed + i * 997
      );
      baseline += spacing;
    }

    ctx.restore();
  }

  async renderToCanvas(options: PhotoRenderOptions): Promise<HTMLCanvasElement> {
    const canvas = document.createElement("canvas");
    await this.render(canvas, options);
    return canvas;
  }

  getTemplate(pack: NotebookPack): NotebookTemplate {
    return templateFromPack(pack);
  }
}

export const photoRenderer = new PhotoRenderer();
