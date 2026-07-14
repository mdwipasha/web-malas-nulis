"use client";
import { useEffect, useRef, useCallback, useState } from "react";
import type { RenderOptions, WritingPage } from "@/types";
import { drawPaper, applyPaperEffects } from "@/lib/paper-engine";
import { renderHandwritingPage, renderNotebookHeader } from "@/lib/handwriting-engine";
import { notebookRenderer } from "@/engines/notebook";
import {
  PAGE_WIDTH_PX,
  PAGE_HEIGHT_PX,
  CANVAS_WIDTH_PX,
  CANVAS_HEIGHT_PX,
  DESK_PADDING_X,
  DESK_PADDING_Y,
} from "@/utils/canvas-utils";

export function useCanvas(
  options: RenderOptions,
  currentPage: WritingPage | undefined,
  scale: number = 1
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRendering, setIsRendering] = useState(false);
  const renderIdRef = useRef(0);

  const render = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas || !currentPage) return;

    const renderId = ++renderIdRef.current;
    setIsRendering(true);

    // Full canvas includes desk padding
    const canvasW = CANVAS_WIDTH_PX * scale;
    const canvasH = CANVAS_HEIGHT_PX * scale;

    canvas.width = canvasW;
    canvas.height = canvasH;
    canvas.style.width = `${CANVAS_WIDTH_PX}px`;
    canvas.style.height = `${CANVAS_HEIGHT_PX}px`;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    try {
      if (options.notebookPack) {
        await notebookRenderer.render(
          canvas,
          options.notebookPack,
          options,
          currentPage.text,
          scale
        );
        return;
      }

      // 1. Draw paper (desk + notebook)
      drawPaper(ctx, options.template, canvasW, canvasH, options.seed);

      if (renderId !== renderIdRef.current) return;

      // 2. Render header (Nama / Kelas / No / Date) on templates that support it
      if (options.template.hasHeader && options.headerInfo) {
        await renderNotebookHeader(ctx, options, scale);
      }

      if (renderId !== renderIdRef.current) return;

      // 3. Draw handwriting text — offset by desk padding
      ctx.save();
      ctx.translate(DESK_PADDING_X * scale, DESK_PADDING_Y * scale);
      await renderHandwritingPage(ctx, options, currentPage.text, scale);
      ctx.restore();

      if (renderId !== renderIdRef.current) return;

      // 4. Apply paper effects on the page area only
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
    } finally {
      if (renderId === renderIdRef.current) {
        setIsRendering(false);
      }
    }
  }, [options, currentPage, scale]);

  useEffect(() => {
    render();
  }, [render]);

  return { canvasRef, isRendering, rerender: render };
}
