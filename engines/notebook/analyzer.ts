// ============================================================
// NotebookAnalyzer — accepts page_01.jpg and auto-generates
// all required asset pack metadata using Canvas API analysis.
// Browser-only (uses HTMLCanvasElement, ImageData).
// ============================================================
import type {
  WriteArea,
  NotebookLines,
  NotebookMetadata,
  AnalyzerResult,
} from "@/types";

// ============================================================
// Load an image URL into an HTMLImageElement
// ============================================================
function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`NotebookAnalyzer: failed to load image: ${url}`));
    img.src = url;
  });
}

// ============================================================
// Detect horizontal ruled lines by scanning pixel rows
// Returns y-positions of detected lines.
// ============================================================
function detectLines(
  data: Uint8ClampedArray,
  width: number,
  height: number
): { lineYs: number[]; dominantLineColor: string } {
  // Compute average row brightness (R+G+B mean per row)
  const rowBrightness: number[] = new Array(height).fill(0);

  for (let y = 0; y < height; y++) {
    let sum = 0;
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      sum += (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
    }
    rowBrightness[y] = sum / width;
  }

  // Compute global mean brightness
  const meanBrightness =
    rowBrightness.reduce((a, b) => a + b, 0) / rowBrightness.length;

  // Lines are rows significantly darker than paper background
  const threshold = meanBrightness * 0.93;
  const lineYs: number[] = [];
  let inDark = false;
  let darkStart = 0;

  for (let y = 0; y < height; y++) {
    if (!inDark && rowBrightness[y] < threshold) {
      inDark = true;
      darkStart = y;
    } else if (inDark && rowBrightness[y] >= threshold) {
      // Center of the dark band = line position
      const center = Math.round((darkStart + y - 1) / 2);
      lineYs.push(center);
      inDark = false;
    }
  }

  // Compute dominant line color from first detected line
  let lineColor = "#b8d0e8"; // fallback
  if (lineYs.length > 0) {
    const y = lineYs[0];
    let r = 0,
      g = 0,
      b = 0;
    const sampleCount = Math.min(width, 100);
    for (let x = 0; x < sampleCount; x++) {
      const idx = (y * width + x) * 4;
      r += data[idx];
      g += data[idx + 1];
      b += data[idx + 2];
    }
    r = Math.round(r / sampleCount);
    g = Math.round(g / sampleCount);
    b = Math.round(b / sampleCount);
    lineColor = `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  }

  return { lineYs, dominantLineColor: lineColor };
}

// ============================================================
// Detect paper boundaries by scanning edges for non-white pixels
// ============================================================
function detectWriteArea(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  lineYs: number[]
): WriteArea {
  // Scan from top for first non-white row (paper start)
  let top = 0;
  const whitishThreshold = 240;
  for (let y = 0; y < height; y++) {
    let rowIsWhite = true;
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      if (
        data[idx] < whitishThreshold ||
        data[idx + 1] < whitishThreshold ||
        data[idx + 2] < whitishThreshold
      ) {
        rowIsWhite = false;
        break;
      }
    }
    if (!rowIsWhite) {
      top = y;
      break;
    }
  }

  // Scan from bottom
  let bottom = 0;
  for (let y = height - 1; y >= 0; y--) {
    let rowIsWhite = true;
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      if (
        data[idx] < whitishThreshold ||
        data[idx + 1] < whitishThreshold ||
        data[idx + 2] < whitishThreshold
      ) {
        rowIsWhite = false;
        break;
      }
    }
    if (!rowIsWhite) {
      bottom = height - y;
      break;
    }
  }

  // Use line positions for top/bottom if available
  let effectiveTop = top;
  let effectiveBottom = bottom;
  if (lineYs.length > 0) {
    effectiveTop = Math.max(top, lineYs[0] - 10);
    effectiveBottom = Math.max(bottom, height - lineYs[lineYs.length - 1] - 10);
  }

  // Scan left/right for margin column (darker or consistent stripe)
  const left = 30; // default — refine with column analysis
  const right = 25;

  const usableWidth = width - left - right;
  const usableHeight = height - effectiveTop - effectiveBottom;

  return {
    top: effectiveTop,
    bottom: effectiveBottom,
    left,
    right,
    header: 0,
    footer: 0,
    usableWidth,
    usableHeight,
  };
}

// ============================================================
// Generate thumbnail (200×260) as data URL
// ============================================================
function generateThumbnail(img: HTMLImageElement): string {
  const THUMB_W = 200;
  const THUMB_H = 260;
  const canvas = document.createElement("canvas");
  canvas.width = THUMB_W;
  canvas.height = THUMB_H;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, THUMB_W, THUMB_H);
  return canvas.toDataURL("image/webp", 0.85);
}

// ============================================================
// Generate preview (400×520) as data URL
// ============================================================
function generatePreview(img: HTMLImageElement): string {
  const PREV_W = 400;
  const PREV_H = 520;
  const canvas = document.createElement("canvas");
  canvas.width = PREV_W;
  canvas.height = PREV_H;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, PREV_W, PREV_H);
  return canvas.toDataURL("image/webp", 0.9);
}

// ============================================================
// Generate mask.png — white = writable, black = margins/header
// ============================================================
function generateMask(
  writeArea: WriteArea,
  width: number,
  height: number
): string {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  // Fill black (non-writable)
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, width, height);

  // Fill white (writable area)
  const writeTop = writeArea.top + writeArea.header;
  const writeLeft = writeArea.left;
  const writeW = writeArea.usableWidth;
  const writeH = writeArea.usableHeight;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(writeLeft, writeTop, writeW, writeH);

  return canvas.toDataURL("image/png");
}

// ============================================================
// Generate README.md content for a notebook
// ============================================================
function generateReadme(
  metadata: Partial<NotebookMetadata>,
  writeArea: WriteArea,
  lines: NotebookLines
): string {
  const name = metadata.name ?? "Unknown Notebook";
  const brand = metadata.brand ?? "Unknown";
  const country = metadata.country ?? "Unknown";
  const category = metadata.category ?? "school";
  const size = metadata.paperSize ?? "A4";
  const mode = metadata.renderMode ?? "photo";

  return `# ${name} — Asset Pack

## Overview

**Brand:** ${brand}
**Country:** ${country}
**Category:** ${category.charAt(0).toUpperCase() + category.slice(1)}
**Paper Size:** ${size} (Portrait)
**Render Mode:** ${mode.charAt(0).toUpperCase() + mode.slice(1)}

## Description

${metadata.description ?? `${name} — auto-generated asset pack.`}

## Asset Pack Contents

| File | Description |
|------|-------------|
| \`page_01.jpg\` | Full-resolution scan of one notebook page |
| \`metadata.json\` | Notebook identification and properties |
| \`write-area.json\` | Computed writable area boundaries (px) |
| \`lines.json\` | Ruled line detection data |
| \`thumbnail.webp\` | 200×260 thumbnail for UI selectors |
| \`preview.webp\` | 400×520 preview for template browser |
| \`mask.png\` | Binary mask: white = writable, black = margins |
| \`README.md\` | This file |

## Write Area (auto-detected)

\`\`\`json
${JSON.stringify(writeArea, null, 2)}
\`\`\`

## Line Data (auto-detected)

- **Total lines:** ${lines.lineCount}
- **Line spacing:** ${lines.lineSpacing}px
- **First line Y:** ${lines.firstLine}px
- **Last line Y:** ${lines.lastLine}px
- **Line color:** ${lines.color}

## Usage

\`\`\`typescript
import { getNotebookById } from '@/lib/notebook-api';

const pack = await getNotebookById('${metadata.id ?? "id"}');
\`\`\`
`;
}

// ============================================================
// Main analyzer function
// ============================================================
export class NotebookAnalyzer {
  /**
   * Analyze a notebook page image and return all computed asset data.
   * @param imageUrl - URL or data URL of page_01.jpg
   * @param partialMetadata - Known metadata to merge into result
   */
  async analyze(
    imageUrl: string,
    partialMetadata: Partial<NotebookMetadata> = {}
  ): Promise<AnalyzerResult> {
    const img = await loadImage(imageUrl);
    const { width, height } = img;

    // Draw to canvas for pixel analysis
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    // Detect lines
    const { lineYs, dominantLineColor } = detectLines(data, width, height);

    // Compute line metrics
    let lineSpacing = 28; // fallback
    const firstLine = lineYs[0] ?? 50;
    const lastLine = lineYs[lineYs.length - 1] ?? height - 50;

    if (lineYs.length >= 2) {
      // Median spacing for robustness
      const spacings: number[] = [];
      for (let i = 1; i < lineYs.length; i++) {
        spacings.push(lineYs[i] - lineYs[i - 1]);
      }
      spacings.sort((a, b) => a - b);
      lineSpacing = spacings[Math.floor(spacings.length / 2)];
    }

    const lines: NotebookLines = {
      lineCount: lineYs.length,
      lineSpacing,
      baseline: firstLine,
      firstLine,
      lastLine,
      color: dominantLineColor,
    };

    // Detect write area
    const writeArea = detectWriteArea(data, width, height, lineYs);

    // Merge with partial metadata
    const metadata: Partial<NotebookMetadata> = {
      renderMode: "photo",
      orientation: "portrait",
      spiral: false,
      header: false,
      footer: false,
      checkbox: false,
      ...partialMetadata,
    };

    // Generate assets
    const thumbnailDataUrl = generateThumbnail(img);
    const previewDataUrl = generatePreview(img);
    const maskDataUrl = generateMask(writeArea, width, height);
    const readme = generateReadme(metadata, writeArea, lines);

    return {
      metadata,
      writeArea,
      lines,
      thumbnailDataUrl,
      previewDataUrl,
      maskDataUrl,
      readme,
    };
  }
}

/** Singleton analyzer instance */
export const notebookAnalyzer = new NotebookAnalyzer();
