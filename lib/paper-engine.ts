// ============================================================
// Paper Engine — draws notebook paper backgrounds
// All templates are rendered on HTML Canvas
// ============================================================
import type { NotebookTemplate } from "@/types";
import type { AppState } from "@/types";
import {
  createRng,
  rngRange,
  hexToRgba,
  roundRect,
  PAGE_WIDTH_PX,
  PAGE_HEIGHT_PX,
  DESK_PADDING_X,
  DESK_PADDING_Y,
} from "@/utils/canvas-utils";

// ============================================================
// Draw the base paper + lines/grid
// ============================================================
export function drawPaper(
  ctx: CanvasRenderingContext2D,
  template: NotebookTemplate,
  width: number,
  height: number,
  seed: number
) {
  // 1. Draw Desk Background
  drawDeskBackground(ctx, width, height);

  // 2. Draw Book Shadow
  ctx.save();
  ctx.shadowColor = "rgba(0, 0, 0, 0.45)";
  ctx.shadowBlur = 24;
  ctx.shadowOffsetX = 12;
  ctx.shadowOffsetY = 16;
  ctx.fillStyle = template.paperColor;
  roundRect(ctx, DESK_PADDING_X, DESK_PADDING_Y, PAGE_WIDTH_PX, PAGE_HEIGHT_PX, 4);
  ctx.fill();
  ctx.restore();

  // 3. Draw Stack of Pages (right edge)
  ctx.fillStyle = "#e5e5e5";
  ctx.beginPath();
  roundRect(ctx, DESK_PADDING_X + PAGE_WIDTH_PX - 3, DESK_PADDING_Y + 4, 6, PAGE_HEIGHT_PX - 8, 2);
  ctx.fill();
  ctx.fillStyle = "#d4d4d4";
  ctx.beginPath();
  roundRect(ctx, DESK_PADDING_X + PAGE_WIDTH_PX + 2, DESK_PADDING_Y + 8, 3, PAGE_HEIGHT_PX - 16, 2);
  ctx.fill();

  // 4. Translate context to the top page area for grid/lines drawing
  ctx.save();
  ctx.translate(DESK_PADDING_X, DESK_PADDING_Y);

  // Clip all internal paper drawings to the paper's rounded rectangle
  ctx.beginPath();
  roundRect(ctx, 0, 0, PAGE_WIDTH_PX, PAGE_HEIGHT_PX, 4);
  ctx.clip();

  // Fill paper background
  ctx.fillStyle = template.paperColor;
  ctx.fillRect(0, 0, PAGE_WIDTH_PX, PAGE_HEIGHT_PX);

  // Apply paper texture noise
  if (template.paperTexture !== "clean") {
    applyPaperNoise(ctx, PAGE_WIDTH_PX, PAGE_HEIGHT_PX, template.paperTexture, seed);
  }

  // Draw grid
  if (template.hasGrid && template.gridSize) {
    drawGrid(ctx, template, PAGE_WIDTH_PX, PAGE_HEIGHT_PX);
  }

  // Draw ruled lines
  if (template.hasLines) {
    drawRuledLines(ctx, template, PAGE_WIDTH_PX, PAGE_HEIGHT_PX);
  }

  // Draw margin line
  if (template.hasMargin) {
    drawMargin(ctx, template, PAGE_HEIGHT_PX);
  }

  // Draw hole punches
  if (template.hasHoles) {
    drawHoles(ctx, template, PAGE_WIDTH_PX, PAGE_HEIGHT_PX);
  }

  // Top red double-line for homework/campus
  if (template.id === "homework" || template.id === "campus") {
    drawTopLine(ctx, template, PAGE_WIDTH_PX);
  }

  // Book Binding Fold Shadow (Left Edge)
  drawBindingShadow(ctx, PAGE_WIDTH_PX, PAGE_HEIGHT_PX);

  ctx.restore(); // Restore from translation & clipping

  // Page overall shadow overlay is no longer needed since we have a photorealistic 3D binding
  // drawPageShadow(ctx, template, PAGE_WIDTH_PX, PAGE_HEIGHT_PX);
}

function drawDeskBackground(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Soft wooden / desk color
  ctx.fillStyle = "#8b7355";
  ctx.fillRect(0, 0, w, h);
  
  // Simple wood grain / desk texture
  ctx.fillStyle = "rgba(0,0,0,0.06)";
  for (let i = 0; i < w; i += 30) {
    ctx.fillRect(i, 0, 4, h);
  }
  ctx.fillStyle = "rgba(255,255,255,0.03)";
  for (let i = 15; i < w; i += 45) {
    ctx.fillRect(i, 0, 2, h);
  }
}

function drawBindingShadow(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Left fold/binding depth
  const foldWidth = 60;
  const foldGrad = ctx.createLinearGradient(0, 0, foldWidth, 0);
  foldGrad.addColorStop(0, "rgba(0,0,0,0.5)");
  foldGrad.addColorStop(0.15, "rgba(0,0,0,0.15)");
  foldGrad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = foldGrad;
  ctx.fillRect(0, 0, foldWidth, h);

  // Right page edge slight curve shadow
  const edgeWidth = 30;
  const edgeGrad = ctx.createLinearGradient(w - edgeWidth, 0, w, 0);
  edgeGrad.addColorStop(0, "rgba(0,0,0,0)");
  edgeGrad.addColorStop(1, "rgba(0,0,0,0.06)");
  ctx.fillStyle = edgeGrad;
  ctx.fillRect(w - edgeWidth, 0, edgeWidth, h);
}

function drawGrid(
  ctx: CanvasRenderingContext2D,
  template: NotebookTemplate,
  width: number,
  height: number
) {
  const gs = template.gridSize!;
  ctx.strokeStyle = template.lineColor;
  ctx.lineWidth = 0.5;
  ctx.globalAlpha = 0.6;

  for (let x = 0; x <= width; x += gs) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y <= height; y += gs) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function drawRuledLines(
  ctx: CanvasRenderingContext2D,
  template: NotebookTemplate,
  width: number,
  height: number
) {
  const startY = template.marginTop;
  const endY = height - template.marginBottom;

  ctx.strokeStyle = template.lineColor;
  ctx.lineWidth = 0.8;
  ctx.globalAlpha = 0.9;

  let y = startY;
  while (y <= endY) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
    y += template.lineSpacing;
  }
  ctx.globalAlpha = 1;
}

function drawMargin(
  ctx: CanvasRenderingContext2D,
  template: NotebookTemplate,
  height: number
) {
  ctx.strokeStyle = template.marginColor;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.8;

  ctx.beginPath();
  ctx.moveTo(template.marginLeft, 0);
  ctx.lineTo(template.marginLeft, height);
  ctx.stroke();

  ctx.globalAlpha = 1;
}

function drawHoles(
  ctx: CanvasRenderingContext2D,
  template: NotebookTemplate,
  width: number,
  height: number
) {
  const holeRadius = 8;
  const holePositions = [
    height * 0.2,
    height * 0.5,
    height * 0.8,
  ];

  const holeX = 20;

  for (const y of holePositions) {
    // White hole
    ctx.beginPath();
    ctx.arc(holeX, y, holeRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#f8f8f8";
    ctx.fill();

    // Hole shadow
    ctx.beginPath();
    ctx.arc(holeX, y, holeRadius, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(0,0,0,0.15)";
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

function drawTopLine(
  ctx: CanvasRenderingContext2D,
  template: NotebookTemplate,
  width: number
) {
  const y = template.marginTop - 4;
  ctx.strokeStyle = template.lineColor;
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.9;

  ctx.beginPath();
  ctx.moveTo(0, y);
  ctx.lineTo(width, y);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, y + 4);
  ctx.lineTo(width, y + 4);
  ctx.stroke();

  ctx.globalAlpha = 1;
}

function drawPageShadow(
  ctx: CanvasRenderingContext2D,
  template: NotebookTemplate,
  width: number,
  height: number
) {
  const intensity = template.shadowIntensity;

  // Right-side shadow
  const rightGrad = ctx.createLinearGradient(width - 20, 0, width, 0);
  rightGrad.addColorStop(0, "rgba(0,0,0,0)");
  rightGrad.addColorStop(1, `rgba(0,0,0,${intensity * 0.1})`);
  ctx.fillStyle = rightGrad;
  ctx.fillRect(width - 20, 0, 20, height);

  // Bottom shadow
  const bottomGrad = ctx.createLinearGradient(0, height - 20, 0, height);
  bottomGrad.addColorStop(0, "rgba(0,0,0,0)");
  bottomGrad.addColorStop(1, `rgba(0,0,0,${intensity * 0.08})`);
  ctx.fillStyle = bottomGrad;
  ctx.fillRect(0, height - 20, width, 20);
}

// ============================================================
// Paper texture: noise overlay
// ============================================================
function applyPaperNoise(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  type: string,
  seed: number
) {
  const rng = createRng(seed + 9999);

  // Create offscreen canvas for noise
  const noiseCanvas = document.createElement("canvas");
  noiseCanvas.width = width;
  noiseCanvas.height = height;
  const nCtx = noiseCanvas.getContext("2d")!;

  const imageData = nCtx.createImageData(width, height);
  const data = imageData.data;

  const intensity = type === "aged" ? 0.12 : type === "rough" ? 0.06 : 0.03;

  for (let i = 0; i < data.length; i += 4) {
    const noise = (rng() - 0.5) * intensity * 255;
    data[i] = noise;
    data[i + 1] = noise;
    data[i + 2] = noise;
    data[i + 3] = type === "aged" ? 30 : type === "rough" ? 15 : 8;
  }

  nCtx.putImageData(imageData, 0, 0);
  ctx.globalAlpha = 1;
  ctx.drawImage(noiseCanvas, 0, 0);
}

// ============================================================
// Paper Effects Layer — overlays on top of paper
// ============================================================
export function applyPaperEffects(
  ctx: CanvasRenderingContext2D,
  effects: AppState["effects"],
  width: number,
  height: number,
  seed: number
) {
  const rng = createRng(seed + 11111);

  if (effects.coffeeStain) {
    drawCoffeeStain(ctx, width, height, rng, seed);
  }

  if (effects.wrinkles) {
    drawWrinkles(ctx, width, height, rng);
  }

  if (effects.oldPaper) {
    applyOldPaperEffect(ctx, width, height, rng);
  }

  if (effects.scanner) {
    applyScannerEffect(ctx, width, height, rng);
  }

  if (effects.camera) {
    applyCameraEffect(ctx, width, height, rng);
  }

  if (effects.curl) {
    drawPageCurl(ctx, width, height);
  }

  if (effects.noise) {
    applyExtraNoise(ctx, width, height, seed);
  }
}

function drawCoffeeStain(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  rng: () => number,
  seed: number
) {
  const x = rngRange(rng, width * 0.6, width * 0.85);
  const y = rngRange(rng, height * 0.05, height * 0.2);
  const outerRadius = rngRange(rng, 40, 80);
  const innerRadius = outerRadius * rngRange(rng, 0.6, 0.8);

  // Outer ring
  const grad = ctx.createRadialGradient(x, y, innerRadius, x, y, outerRadius);
  grad.addColorStop(0, "rgba(120,80,40,0)");
  grad.addColorStop(0.5, "rgba(120,80,40,0.08)");
  grad.addColorStop(0.8, "rgba(120,80,40,0.12)");
  grad.addColorStop(1, "rgba(120,80,40,0)");

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(x, y, outerRadius, 0, Math.PI * 2);
  ctx.fill();

  // Inner ring edge
  const innerGrad = ctx.createRadialGradient(x, y, innerRadius * 0.9, x, y, innerRadius);
  innerGrad.addColorStop(0, "rgba(100,65,30,0)");
  innerGrad.addColorStop(1, "rgba(100,65,30,0.06)");
  ctx.fillStyle = innerGrad;
  ctx.beginPath();
  ctx.arc(x, y, innerRadius, 0, Math.PI * 2);
  ctx.fill();
}

function drawWrinkles(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  rng: () => number
) {
  ctx.strokeStyle = "rgba(0,0,0,0.04)";
  ctx.lineWidth = 0.5;

  for (let i = 0; i < 8; i++) {
    const x1 = rngRange(rng, 0, width);
    const y1 = rngRange(rng, 0, height);
    const x2 = x1 + rngRange(rng, -100, 100);
    const y2 = y1 + rngRange(rng, -100, 100);
    const cx = (x1 + x2) / 2 + rngRange(rng, -30, 30);
    const cy = (y1 + y2) / 2 + rngRange(rng, -30, 30);

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.quadraticCurveTo(cx, cy, x2, y2);
    ctx.stroke();
  }
}

function applyOldPaperEffect(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  rng: () => number
) {
  // Sepia-like tint
  ctx.fillStyle = "rgba(180,140,80,0.08)";
  ctx.fillRect(0, 0, width, height);

  // Edge darkening (aging)
  const cornerGrad = ctx.createRadialGradient(
    width / 2, height / 2, Math.min(width, height) * 0.3,
    width / 2, height / 2, Math.max(width, height) * 0.8
  );
  cornerGrad.addColorStop(0, "rgba(100,70,30,0)");
  cornerGrad.addColorStop(1, "rgba(100,70,30,0.15)");
  ctx.fillStyle = cornerGrad;
  ctx.fillRect(0, 0, width, height);
}

function applyScannerEffect(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  rng: () => number
) {
  // Slight overexposure
  ctx.fillStyle = "rgba(255,255,255,0.06)";
  ctx.fillRect(0, 0, width, height);

  // Very faint horizontal scan lines
  ctx.strokeStyle = "rgba(0,0,0,0.02)";
  ctx.lineWidth = 1;
  for (let y = 0; y < height; y += 4) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Slight grey corners
  const scanGrad = ctx.createRadialGradient(
    width / 2, height / 2, Math.min(width, height) * 0.25,
    width / 2, height / 2, Math.max(width, height) * 0.75
  );
  scanGrad.addColorStop(0, "rgba(0,0,0,0)");
  scanGrad.addColorStop(1, "rgba(0,0,0,0.06)");
  ctx.fillStyle = scanGrad;
  ctx.fillRect(0, 0, width, height);
}

function applyCameraEffect(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  rng: () => number
) {
  // Phone camera vignette
  const vGrad = ctx.createRadialGradient(
    width * 0.5, height * 0.45, Math.min(width, height) * 0.2,
    width * 0.5, height * 0.45, Math.max(width, height) * 0.9
  );
  vGrad.addColorStop(0, "rgba(0,0,0,0)");
  vGrad.addColorStop(1, "rgba(0,0,0,0.22)");
  ctx.fillStyle = vGrad;
  ctx.fillRect(0, 0, width, height);

  // Warm tone shift
  ctx.fillStyle = "rgba(255,220,180,0.04)";
  ctx.fillRect(0, 0, width, height);
}

function drawPageCurl(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  // Bottom-right page curl
  const curlSize = 40;
  const x = width - curlSize;
  const y = height - curlSize;

  ctx.save();

  // Curl shadow
  const shadowGrad = ctx.createLinearGradient(x, y, width, height);
  shadowGrad.addColorStop(0, "rgba(0,0,0,0)");
  shadowGrad.addColorStop(1, "rgba(0,0,0,0.25)");

  ctx.beginPath();
  ctx.moveTo(x, height);
  ctx.lineTo(width, y);
  ctx.lineTo(width, height);
  ctx.closePath();
  ctx.fillStyle = shadowGrad;
  ctx.fill();

  // White curl page
  const curlGrad = ctx.createLinearGradient(x, y, width, height);
  curlGrad.addColorStop(0, "#e8e8e8");
  curlGrad.addColorStop(1, "#ffffff");

  ctx.beginPath();
  ctx.moveTo(x, height);
  ctx.quadraticCurveTo(x + curlSize * 0.4, y + curlSize * 0.6, width - 2, y + 2);
  ctx.lineTo(width, height);
  ctx.closePath();
  ctx.fillStyle = curlGrad;
  ctx.fill();

  ctx.restore();
}

function applyExtraNoise(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  seed: number
) {
  applyPaperNoise(ctx, width, height, "rough", seed + 77777);
}
