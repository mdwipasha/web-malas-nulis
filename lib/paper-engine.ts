// ============================================================
// Paper Engine — draws notebook paper backgrounds
// Goal: Render like a PHOTO of a real notebook on a desk
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
  // 1. Draw Realistic Desk Background
  drawDeskBackground(ctx, width, height, template.deskColor, seed);

  // 2. Draw Book Shadow on desk (cast shadow beneath notebook)
  drawBookShadow(ctx);

  // 3. Draw Book Spine / Left Side binding
  drawBookSpine(ctx, template);

  // 4. Draw Paper page with slight paper texture
  ctx.save();
  // Clip to page area
  ctx.beginPath();
  roundRect(ctx, DESK_PADDING_X, DESK_PADDING_Y, PAGE_WIDTH_PX, PAGE_HEIGHT_PX, 3);
  ctx.fillStyle = template.paperColor;
  ctx.fill();
  ctx.restore();

  // 5. Translate context to page top-left for content drawing
  ctx.save();
  ctx.translate(DESK_PADDING_X, DESK_PADDING_Y);
  ctx.beginPath();
  roundRect(ctx, 0, 0, PAGE_WIDTH_PX, PAGE_HEIGHT_PX, 3);
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

  // Draw checkboxes (boss notebook style)
  if (template.hasCheckboxes) {
    drawCheckboxes(ctx, template, PAGE_WIDTH_PX, PAGE_HEIGHT_PX);
  }

  // Top red double-line for homework/campus
  if (template.id === "homework" || template.id === "campus") {
    drawTopLine(ctx, template, PAGE_WIDTH_PX);
  }

  // Book Binding Fold Shadow (Left Edge — simulates inner fold)
  drawBindingShadow(ctx, PAGE_WIDTH_PX, PAGE_HEIGHT_PX);

  // Subtle vignette / camera lens effect on paper
  drawPaperVignette(ctx, PAGE_WIDTH_PX, PAGE_HEIGHT_PX);

  ctx.restore();

  // 6. Stack of pages visible at right edge
  drawPageStack(ctx);
}

// ============================================================
// Realistic desk background with wood grain texture
// ============================================================
function drawDeskBackground(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  deskColor?: string,
  seed: number = 42
) {
  const rng = createRng(seed + 8888);

  // Base wood color
  const baseColor = deskColor || "#c8a876";
  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, w, h);

  // Wood grain — horizontal planks
  const grainColors = [
    "rgba(180,130,70,0.10)",
    "rgba(220,170,90,0.08)",
    "rgba(150,100,50,0.07)",
    "rgba(240,190,110,0.06)",
    "rgba(100,65,30,0.05)",
  ];

  // Draw long grain lines (horizontal)
  for (let y = 0; y < h; y += rngRange(rng, 8, 28)) {
    const thickness = rngRange(rng, 1, 5);
    ctx.fillStyle = grainColors[Math.floor(rng() * grainColors.length)];
    // Slight waviness
    const offset = rngRange(rng, -3, 3);
    ctx.fillRect(0, y + offset, w, thickness);
  }

  // Subtle vertical variation / dark streaks
  for (let x = 0; x < w; x += rngRange(rng, 60, 200)) {
    const streakW = rngRange(rng, 1, 4);
    ctx.fillStyle = "rgba(100,65,30,0.04)";
    ctx.fillRect(x, 0, streakW, h);
  }

  // Highlight streak (glossy wood look)
  const gloss = ctx.createLinearGradient(0, 0, w, h);
  gloss.addColorStop(0, "rgba(255,255,255,0.06)");
  gloss.addColorStop(0.4, "rgba(255,255,255,0.02)");
  gloss.addColorStop(1, "rgba(0,0,0,0.05)");
  ctx.fillStyle = gloss;
  ctx.fillRect(0, 0, w, h);
}

// ============================================================
// Cast shadow from notebook onto desk
// ============================================================
function drawBookShadow(ctx: CanvasRenderingContext2D) {
  const sx = DESK_PADDING_X + 8;
  const sy = DESK_PADDING_Y + 14;
  const sw = PAGE_WIDTH_PX + 6;
  const sh = PAGE_HEIGHT_PX + 4;

  // Outer diffuse shadow
  ctx.save();
  ctx.shadowColor = "rgba(0, 0, 0, 0.45)";
  ctx.shadowBlur = 32;
  ctx.shadowOffsetX = 10;
  ctx.shadowOffsetY = 18;
  ctx.fillStyle = "rgba(0,0,0,0.01)";
  roundRect(ctx, sx, sy, sw, sh, 3);
  ctx.fill();
  ctx.restore();

  // Close contact shadow (sharp)
  const closeGrad = ctx.createLinearGradient(
    sx, sy + sh - 20, sx, sy + sh + 30
  );
  closeGrad.addColorStop(0, "rgba(0,0,0,0.25)");
  closeGrad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = closeGrad;
  ctx.fillRect(sx, sy + sh - 20, sw, 50);
}

// ============================================================
// Book spine on the left (makes it look like a real bound book)
// ============================================================
function drawBookSpine(ctx: CanvasRenderingContext2D, template: NotebookTemplate) {
  const spineWidth = DESK_PADDING_X - 4;
  const sy = DESK_PADDING_Y + 2;
  const sh = PAGE_HEIGHT_PX - 4;
  const sx = 4;

  // Spine body (slightly darker than paper)
  const spineGrad = ctx.createLinearGradient(sx, 0, sx + spineWidth, 0);
  spineGrad.addColorStop(0, "rgba(180,180,185,0.95)");
  spineGrad.addColorStop(0.3, "rgba(230,230,232,0.9)");
  spineGrad.addColorStop(0.7, "rgba(240,240,242,0.85)");
  spineGrad.addColorStop(1, "rgba(200,200,205,0.7)");

  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.2)";
  ctx.shadowBlur = 6;
  ctx.fillStyle = spineGrad;
  roundRect(ctx, sx, sy, spineWidth, sh, 3);
  ctx.fill();
  ctx.restore();

  // Pages stacked in spine (the layered sheets visible at left)
  const pageLayerCount = 18;
  for (let i = 0; i < pageLayerCount; i++) {
    const t = i / pageLayerCount;
    const lx = sx + spineWidth * 0.6 + t * spineWidth * 0.35;
    const alpha = 0.06 + t * 0.04;
    ctx.strokeStyle = `rgba(150,150,160,${alpha})`;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(lx, sy + 4);
    ctx.lineTo(lx, sy + sh - 4);
    ctx.stroke();
  }

  // Spine highlight (glossy left edge)
  const highlightGrad = ctx.createLinearGradient(sx, 0, sx + 6, 0);
  highlightGrad.addColorStop(0, "rgba(255,255,255,0.4)");
  highlightGrad.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = highlightGrad;
  ctx.fillRect(sx, sy, 6, sh);

  // Fold crease (the paper meeting spine)
  ctx.strokeStyle = "rgba(100,100,110,0.35)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(DESK_PADDING_X - 1, DESK_PADDING_Y);
  ctx.lineTo(DESK_PADDING_X - 1, DESK_PADDING_Y + PAGE_HEIGHT_PX);
  ctx.stroke();
}

// ============================================================
// Stack of pages visible at right edge
// ============================================================
function drawPageStack(ctx: CanvasRenderingContext2D) {
  const rx = DESK_PADDING_X + PAGE_WIDTH_PX;
  const ry = DESK_PADDING_Y + 3;
  const rh = PAGE_HEIGHT_PX - 6;

  // Multiple stacked page edges
  ctx.fillStyle = "#e2e2e4";
  roundRect(ctx, rx, ry, 5, rh, 1);
  ctx.fill();

  ctx.fillStyle = "#d5d5d8";
  roundRect(ctx, rx + 4, ry + 2, 3, rh - 4, 1);
  ctx.fill();

  ctx.fillStyle = "#c8c8cb";
  roundRect(ctx, rx + 6, ry + 4, 2, rh - 8, 1);
  ctx.fill();
}

// ============================================================
// Inner fold / binding depth shadow on paper
// ============================================================
function drawBindingShadow(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Left inner fold shadow (where paper meets binding)
  const foldWidth = 55;
  const foldGrad = ctx.createLinearGradient(0, 0, foldWidth, 0);
  foldGrad.addColorStop(0, "rgba(0,0,0,0.38)");
  foldGrad.addColorStop(0.1, "rgba(0,0,0,0.14)");
  foldGrad.addColorStop(0.4, "rgba(0,0,0,0.04)");
  foldGrad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = foldGrad;
  ctx.fillRect(0, 0, foldWidth, h);

  // Right page edge curl shadow
  const edgeWidth = 20;
  const edgeGrad = ctx.createLinearGradient(w - edgeWidth, 0, w, 0);
  edgeGrad.addColorStop(0, "rgba(0,0,0,0)");
  edgeGrad.addColorStop(1, "rgba(0,0,0,0.05)");
  ctx.fillStyle = edgeGrad;
  ctx.fillRect(w - edgeWidth, 0, edgeWidth, h);

  // Top edge subtle shadow
  const topGrad = ctx.createLinearGradient(0, 0, 0, 20);
  topGrad.addColorStop(0, "rgba(0,0,0,0.07)");
  topGrad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = topGrad;
  ctx.fillRect(0, 0, w, 20);
}

// ============================================================
// Subtle lens vignette over paper (realistic photo look)
// ============================================================
function drawPaperVignette(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const vGrad = ctx.createRadialGradient(
    w * 0.5, h * 0.45, Math.min(w, h) * 0.35,
    w * 0.5, h * 0.45, Math.max(w, h) * 0.85
  );
  vGrad.addColorStop(0, "rgba(0,0,0,0)");
  vGrad.addColorStop(1, "rgba(0,0,0,0.055)");
  ctx.fillStyle = vGrad;
  ctx.fillRect(0, 0, w, h);
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
  ctx.globalAlpha = 0.85;

  let y = startY;
  while (y <= endY) {
    ctx.beginPath();
    ctx.moveTo(template.hasMargin ? template.marginLeft : 0, y);
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
  ctx.globalAlpha = 0.75;

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
    ctx.fillStyle = "#f0f0f0";
    ctx.fill();

    // Hole shadow
    ctx.beginPath();
    ctx.arc(holeX, y, holeRadius, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(0,0,0,0.12)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Inner shadow
    const innerGrad = ctx.createRadialGradient(holeX, y, holeRadius * 0.4, holeX, y, holeRadius);
    innerGrad.addColorStop(0, "rgba(0,0,0,0)");
    innerGrad.addColorStop(1, "rgba(0,0,0,0.15)");
    ctx.fillStyle = innerGrad;
    ctx.beginPath();
    ctx.arc(holeX, y, holeRadius, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ============================================================
// Draw checkboxes — like boss notebook (Indonesian style)
// ============================================================
function drawCheckboxes(
  ctx: CanvasRenderingContext2D,
  template: NotebookTemplate,
  width: number,
  height: number
) {
  const startY = template.marginTop + template.lineSpacing;
  const endY = height - template.marginBottom;
  const checkboxX = template.marginLeft - 32;
  const checkboxSize = 11;
  const halfBox = checkboxSize / 2;

  ctx.strokeStyle = "rgba(100,100,120,0.5)";
  ctx.lineWidth = 0.8;

  let y = startY;
  while (y <= endY) {
    const boxY = y - halfBox - 4;
    ctx.beginPath();
    ctx.rect(checkboxX, boxY, checkboxSize, checkboxSize);
    ctx.stroke();
    y += template.lineSpacing;
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

  const noiseCanvas = document.createElement("canvas");
  noiseCanvas.width = width;
  noiseCanvas.height = height;
  const nCtx = noiseCanvas.getContext("2d")!;

  const imageData = nCtx.createImageData(width, height);
  const data = imageData.data;

  const intensity = type === "aged" ? 0.1 : type === "rough" ? 0.05 : 0.025;

  for (let i = 0; i < data.length; i += 4) {
    const noise = (rng() - 0.5) * intensity * 255;
    data[i] = noise;
    data[i + 1] = noise;
    data[i + 2] = noise;
    data[i + 3] = type === "aged" ? 28 : type === "rough" ? 14 : 7;
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

  const grad = ctx.createRadialGradient(x, y, innerRadius, x, y, outerRadius);
  grad.addColorStop(0, "rgba(120,80,40,0)");
  grad.addColorStop(0.5, "rgba(120,80,40,0.08)");
  grad.addColorStop(0.8, "rgba(120,80,40,0.12)");
  grad.addColorStop(1, "rgba(120,80,40,0)");

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(x, y, outerRadius, 0, Math.PI * 2);
  ctx.fill();

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
  ctx.strokeStyle = "rgba(0,0,0,0.035)";
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
  ctx.fillStyle = "rgba(180,140,80,0.08)";
  ctx.fillRect(0, 0, width, height);

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
  ctx.fillStyle = "rgba(255,255,255,0.06)";
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = "rgba(0,0,0,0.015)";
  ctx.lineWidth = 1;
  for (let y = 0; y < height; y += 4) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  const scanGrad = ctx.createRadialGradient(
    width / 2, height / 2, Math.min(width, height) * 0.25,
    width / 2, height / 2, Math.max(width, height) * 0.75
  );
  scanGrad.addColorStop(0, "rgba(0,0,0,0)");
  scanGrad.addColorStop(1, "rgba(0,0,0,0.05)");
  ctx.fillStyle = scanGrad;
  ctx.fillRect(0, 0, width, height);
}

function applyCameraEffect(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  rng: () => number
) {
  const vGrad = ctx.createRadialGradient(
    width * 0.5, height * 0.45, Math.min(width, height) * 0.2,
    width * 0.5, height * 0.45, Math.max(width, height) * 0.9
  );
  vGrad.addColorStop(0, "rgba(0,0,0,0)");
  vGrad.addColorStop(1, "rgba(0,0,0,0.22)");
  ctx.fillStyle = vGrad;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "rgba(255,220,180,0.04)";
  ctx.fillRect(0, 0, width, height);
}

function drawPageCurl(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  const curlSize = 40;
  const x = width - curlSize;
  const y = height - curlSize;

  ctx.save();

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
