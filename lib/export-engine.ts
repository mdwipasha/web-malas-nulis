// ============================================================
// Export Engine — PNG, JPG, PDF, ZIP export
// ============================================================
"use client";

import type { WritingPage, ExportFormat, ExportQuality, RenderOptions } from "@/types";
import { drawPaper, applyPaperEffects } from "@/lib/paper-engine";
import { renderHandwritingPage } from "@/lib/handwriting-engine";
import { DPI_SCALE, PAGE_WIDTH_PX, PAGE_HEIGHT_PX } from "@/utils/canvas-utils";

// ============================================================
// Render a single page to an offscreen canvas
// ============================================================
export async function renderPageToCanvas(
  options: RenderOptions,
  pageText: string,
  scale: number = 1
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement("canvas");
  const width = PAGE_WIDTH_PX * scale;
  const height = PAGE_HEIGHT_PX * scale;

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d", { alpha: false })!;

  // Step 1: Draw paper
  drawPaper(ctx, options.template, width, height, options.seed);

  // Step 2: Draw text
  await renderHandwritingPage(ctx, options, pageText, scale);

  // Step 3: Apply effects
  applyPaperEffects(ctx, options.effects, width, height, options.seed);

  return canvas;
}

// ============================================================
// Export single page as image
// ============================================================
export async function exportImage(
  options: RenderOptions,
  pageText: string,
  format: "png" | "jpg",
  quality: ExportQuality = "web"
): Promise<string> {
  const scale = quality === "print" ? DPI_SCALE : 1;
  const canvas = await renderPageToCanvas(options, pageText, scale);

  if (format === "jpg") {
    return canvas.toDataURL("image/jpeg", 0.92);
  }
  return canvas.toDataURL("image/png");
}

// ============================================================
// Export all pages as PDF
// ============================================================
export async function exportPDF(
  options: RenderOptions,
  pages: WritingPage[],
  quality: ExportQuality = "web"
): Promise<Blob> {
  const { jsPDF } = await import("jspdf");
  const scale = quality === "print" ? DPI_SCALE : 1;

  // A4-like dimensions in mm
  const widthMm = 180;
  const heightMm = widthMm * (PAGE_HEIGHT_PX / PAGE_WIDTH_PX);

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [widthMm, heightMm],
  });

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const pageOptions: RenderOptions = {
      ...options,
      seed: page.seed,
    };

    const canvas = await renderPageToCanvas(pageOptions, page.text, scale);
    const imgData = canvas.toDataURL("image/jpeg", 0.92);

    if (i > 0) pdf.addPage([widthMm, heightMm]);
    pdf.addImage(imgData, "JPEG", 0, 0, widthMm, heightMm);
  }

  return pdf.output("blob");
}

// ============================================================
// Export all pages as ZIP of PNGs
// ============================================================
export async function exportZip(
  options: RenderOptions,
  pages: WritingPage[],
  quality: ExportQuality = "web"
): Promise<Blob> {
  const JSZip = (await import("jszip")).default;
  const scale = quality === "print" ? DPI_SCALE : 1;
  const zip = new JSZip();

  for (const page of pages) {
    const pageOptions: RenderOptions = {
      ...options,
      seed: page.seed,
    };
    const canvas = await renderPageToCanvas(pageOptions, page.text, scale);
    const blob = await canvasToBlob(canvas, "image/png");
    const pageNum = String(page.pageNumber).padStart(3, "0");
    zip.file(`page-${pageNum}.png`, blob);
  }

  return zip.generateAsync({ type: "blob", compression: "DEFLATE" });
}

// ============================================================
// Helper: canvas to blob
// ============================================================
function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Canvas to blob failed"));
      },
      type,
      0.95
    );
  });
}

// ============================================================
// Trigger browser download
// ============================================================
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

export function downloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
