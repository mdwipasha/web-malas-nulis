"use client";

import type { NotebookPack, NotebookTemplate, PhotoRenderOptions, RenderOptions } from "@/types";
import { applyPaperEffects } from "@/lib/paper-engine";
import { renderHandwritingPage, renderNotebookHeader } from "@/lib/handwriting-engine";

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
    marginTop: pack.lines.firstLine - pack.lines.lineSpacing,
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

function scaleTemplate(template: NotebookTemplate, scale: number): NotebookTemplate {
  return {
    ...template,
    lineSpacing: template.lineSpacing * scale,
    marginLeft: template.marginLeft * scale,
    marginRight: template.marginRight * scale,
    marginTop: template.marginTop * scale,
    marginBottom: template.marginBottom * scale,
    gridSize: template.gridSize ? template.gridSize * scale : undefined,
  };
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

    const template = scaleTemplate(templateFromPack(options.pack), scale);
    const renderOptions: RenderOptions = {
      template,
      style: options.style,
      inkColor: options.inkColor,
      effects: options.effects,
      seed: options.seed,
      text: options.text,
      customFontUrl: options.customFontUrl,
      headerInfo: options.headerInfo,
      scale,
    };

    if (template.hasHeader && options.headerInfo) {
      await renderNotebookHeader(ctx, renderOptions, 1);
    }

    await renderHandwritingPage(ctx, renderOptions, options.text, 1);
    applyPaperEffects(ctx, options.effects, width, height, options.seed);
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
