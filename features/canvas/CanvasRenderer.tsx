"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCanvas } from "@/hooks/useCanvas";
import type { RenderOptions, WritingPage } from "@/types";
import { PAGE_WIDTH_PX, PAGE_HEIGHT_PX, CANVAS_WIDTH_PX, CANVAS_HEIGHT_PX } from "@/utils/canvas-utils";
import { Loader2 } from "lucide-react";

interface CanvasRendererProps {
  options: RenderOptions;
  currentPage: WritingPage | undefined;
  scale?: number;
}

export function CanvasRenderer({
  options,
  currentPage,
  scale = 1,
}: CanvasRendererProps) {
  const { canvasRef, isRendering } = useCanvas(options, currentPage, scale);

  return (
    <div className="relative inline-block page-shadow">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH_PX}
        height={CANVAS_HEIGHT_PX}
        className="block rounded"
        style={{
          width: `${CANVAS_WIDTH_PX}px`,
          height: `${CANVAS_HEIGHT_PX}px`,
          imageRendering: "auto",
        }}
      />

      {/* Rendering overlay */}
      <AnimatePresence>
        {isRendering && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 rounded flex items-center justify-center"
            style={{
              background: "rgba(9,9,11,0.3)",
              backdropFilter: "blur(2px)",
            }}
          >
            <div className="flex flex-col items-center gap-2">
              <Loader2
                size={24}
                className="text-[var(--accent)] spinner"
              />
              <span className="text-xs text-[var(--text-muted)]">Rendering...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
