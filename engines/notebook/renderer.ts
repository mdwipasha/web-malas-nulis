// ============================================================
// NotebookRenderer — unified rendering dispatch
// Routes to the correct render strategy based on renderMode:
//   "classic"  → draws paper procedurally (lib/paper-engine)
//   "photo"    → draws page_01.jpg as background (PhotoEngine)
//   "premium"  → draws photo with premium post-processing
// ============================================================
"use client";
import type { NotebookPack, RenderOptions, PhotoRenderOptions } from "@/types";
import { drawPaper, applyPaperEffects } from "@/lib/paper-engine";
import {
  renderHandwritingPage,
  renderNotebookHeader,
} from "@/lib/handwriting-engine";
import {
  DESK_PADDING_X,
  DESK_PADDING_Y,
  PAGE_WIDTH_PX,
  PAGE_HEIGHT_PX,
  CANVAS_WIDTH_PX,
  CANVAS_HEIGHT_PX,
} from "@/utils/canvas-utils";
import { PhotoRenderer } from "@/engines/photo";
import { CameraEngine, CAMERA_PRESETS } from "@/engines/camera";

const photoRenderer = new PhotoRenderer();
const cameraEngine = new CameraEngine();

export class NotebookRenderer {
  // ============================================================
  // Render a notebook page to a canvas element
  // ============================================================
  async render(
    canvas: HTMLCanvasElement,
    pack: NotebookPack,
    options: RenderOptions,
    pageText: string,
    scale: number = 1
  ): Promise<void> {
    const mode = pack.renderMode;

    switch (mode) {
      case "photo":
        await this.renderPhoto(canvas, pack, options, pageText, scale);
        break;
      case "premium":
        await this.renderPremium(canvas, pack, options, pageText, scale);
        break;
      case "classic":
      default:
        await this.renderClassic(canvas, options, pageText, scale);
        break;
    }
  }

  // ============================================================
  // Classic render — procedural paper (uses existing paper-engine)
  // ============================================================
  private async renderClassic(
    canvas: HTMLCanvasElement,
    options: RenderOptions,
    pageText: string,
    scale: number
  ): Promise<void> {
    const w = CANVAS_WIDTH_PX * scale;
    const h = CANVAS_HEIGHT_PX * scale;
    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext("2d", { alpha: false })!;

    // Draw paper background
    drawPaper(ctx, options.template, w, h, options.seed);

    // Draw header if template supports it
    if (options.template.hasHeader && options.headerInfo) {
      await renderNotebookHeader(ctx, options, scale);
    }

    // Draw handwriting
    ctx.save();
    ctx.translate(DESK_PADDING_X * scale, DESK_PADDING_Y * scale);
    await renderHandwritingPage(ctx, options, pageText, scale);
    ctx.restore();

    // Apply effects
    ctx.save();
    ctx.translate(DESK_PADDING_X * scale, DESK_PADDING_Y * scale);
    applyPaperEffects(
      ctx,
      options.effects,
      PAGE_WIDTH_PX * scale,
      PAGE_HEIGHT_PX * scale,
      options.seed
    );
    ctx.restore();
  }

  // ============================================================
  // Photo render — real notebook image as background
  // ============================================================
  private async renderPhoto(
    canvas: HTMLCanvasElement,
    pack: NotebookPack,
    options: RenderOptions,
    pageText: string,
    scale: number
  ): Promise<void> {
    const photoOptions: PhotoRenderOptions = {
      pack,
      text: pageText,
      style: options.style,
      inkColor: options.inkColor,
      seed: options.seed,
      effects: options.effects,
      headerInfo: options.headerInfo,
      customFontUrl: options.customFontUrl,
      scale,
    };
    await photoRenderer.render(canvas, photoOptions);
  }

  // ============================================================
  // Premium render — photo + camera post-processing
  // ============================================================
  private async renderPremium(
    canvas: HTMLCanvasElement,
    pack: NotebookPack,
    options: RenderOptions,
    pageText: string,
    scale: number
  ): Promise<void> {
    // First render photo
    await this.renderPhoto(canvas, pack, options, pageText, scale);

    // Then apply DSLR camera preset for premium feel
    const ctx = canvas.getContext("2d")!;
    cameraEngine.apply(ctx, CAMERA_PRESETS.dslr, canvas.width, canvas.height, options.seed);
  }

  // ============================================================
  // Create an offscreen canvas and render to it
  // ============================================================
  async renderToCanvas(
    pack: NotebookPack,
    options: RenderOptions,
    pageText: string,
    scale: number = 1
  ): Promise<HTMLCanvasElement> {
    const canvas = document.createElement("canvas");
    await this.render(canvas, pack, options, pageText, scale);
    return canvas;
  }
}

/** Singleton notebook renderer */
export const notebookRenderer = new NotebookRenderer();
