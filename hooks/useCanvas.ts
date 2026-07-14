"use client";
import { useEffect, useRef, useCallback, useState } from "react";
import type { RenderOptions, WritingPage } from "@/types";
import { drawPaper, applyPaperEffects } from "@/lib/paper-engine";
import { renderHandwritingPage } from "@/lib/handwriting-engine";
import { PAGE_WIDTH_PX, PAGE_HEIGHT_PX } from "@/utils/canvas-utils";

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

    const width = PAGE_WIDTH_PX * scale;
    const height = PAGE_HEIGHT_PX * scale;

    canvas.width = width;
    canvas.height = height;
    canvas.style.width = `${PAGE_WIDTH_PX}px`;
    canvas.style.height = `${PAGE_HEIGHT_PX}px`;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    try {
      // Draw paper
      drawPaper(ctx, options.template, width, height, options.seed);

      // Bail if stale render
      if (renderId !== renderIdRef.current) return;

      // Draw handwriting
      await renderHandwritingPage(ctx, options, currentPage.text, scale);

      if (renderId !== renderIdRef.current) return;

      // Apply paper effects
      applyPaperEffects(ctx, options.effects, width, height, options.seed);
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
