"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun,
  RotateCw,
  Layers,
} from "lucide-react";
import { CanvasRenderer } from "@/features/canvas/CanvasRenderer";
import type { RenderOptions, WritingPage } from "@/types";
import { CANVAS_WIDTH_PX, CANVAS_HEIGHT_PX } from "@/utils/canvas-utils";

interface PreviewPanelProps {
  options: RenderOptions;
  pages: WritingPage[];
  currentPage: number;
  onPageChange: (page: number) => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export function PreviewPanel({
  options,
  pages,
  currentPage,
  onPageChange,
  zoom,
  onZoomChange,
  isFullscreen,
  onToggleFullscreen,
  isDarkMode,
  onToggleDarkMode,
}: PreviewPanelProps) {
  const [rotation, setRotation] = useState(0);
  const page = pages[currentPage];
  const totalPages = pages.length;

  const zoomIn = () => onZoomChange(Math.min(zoom + 0.1, 2));
  const zoomOut = () => onZoomChange(Math.max(zoom - 0.1, 0.3));
  const rotatePage = () => setRotation((r) => (r + 90) % 360);

  const pageOptions = page
    ? { ...options, seed: page.seed }
    : options;

  return (
    <div
      className={`flex flex-col h-full ${
        isFullscreen ? "fixed inset-0 z-50 bg-[var(--bg)]" : "relative"
      }`}
    >
      {/* Preview toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--border)] bg-[var(--bg)] flex-shrink-0">
        {/* Left: Page navigation */}
        <div className="flex items-center gap-2">
          <button
            className="icon-btn"
            onClick={() => onPageChange(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
            style={{ opacity: currentPage === 0 ? 0.4 : 1 }}
          >
            <ChevronLeft size={14} />
          </button>

          <span className="page-badge">
            {totalPages > 0 ? `${currentPage + 1} / ${totalPages}` : "0 / 0"}
          </span>

          <button
            className="icon-btn"
            onClick={() => onPageChange(Math.min(totalPages - 1, currentPage + 1))}
            disabled={currentPage >= totalPages - 1}
            style={{ opacity: currentPage >= totalPages - 1 ? 0.4 : 1 }}
          >
            <ChevronRight size={14} />
          </button>
        </div>

        {/* Center: Page thumbnails */}
        {totalPages > 1 && (
          <div className="hidden md:flex items-center gap-1.5 overflow-x-auto max-w-[200px]">
            {pages.map((_, i) => (
              <button
                key={i}
                onClick={() => onPageChange(i)}
                className={`w-5 h-7 rounded-sm border flex-shrink-0 transition-all ${
                  i === currentPage
                    ? "border-[var(--accent)] bg-[var(--accent-muted)]"
                    : "border-[var(--border)] bg-[var(--bg-card)]"
                }`}
                style={{
                  minWidth: "20px",
                }}
              />
            ))}
          </div>
        )}

        {/* Right: View controls */}
        <div className="flex items-center gap-1">
          {/* Zoom controls */}
          <div className="zoom-control">
            <button
              className="icon-btn border-0 bg-transparent w-7 h-7"
              onClick={zoomOut}
            >
              <ZoomOut size={13} />
            </button>
            <span className="text-xs text-[var(--text-muted)] w-10 text-center font-medium">
              {Math.round(zoom * 100)}%
            </span>
            <button
              className="icon-btn border-0 bg-transparent w-7 h-7"
              onClick={zoomIn}
            >
              <ZoomIn size={13} />
            </button>
          </div>

          <button className="icon-btn" onClick={rotatePage} title="Rotate page">
            <RotateCw size={13} />
          </button>

          <button
            className="icon-btn"
            onClick={onToggleDarkMode}
            title="Dark mode preview"
          >
            {isDarkMode ? <Sun size={13} /> : <Moon size={13} />}
          </button>

          <button
            className={`icon-btn ${isFullscreen ? "active" : ""}`}
            onClick={onToggleFullscreen}
            title="Fullscreen"
          >
            {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          </button>
        </div>
      </div>

      {/* Preview canvas area */}
      <div
        className="flex-1 overflow-auto p-8 preview-area"
        style={{
          display: "flex",
          alignItems: zoom <= 1 ? "center" : "flex-start",
          justifyContent: zoom <= 1 ? "center" : "flex-start",
        }}
      >
        {page ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${currentPage}-${options.seed}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              style={{
                width: CANVAS_WIDTH_PX * zoom,
                height: CANVAS_HEIGHT_PX * zoom,
                margin: zoom > 1 ? "auto" : undefined,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                  transformOrigin: "center center",
                  transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              >
                <CanvasRenderer
                  options={pageOptions}
                  currentPage={page}
                  scale={1}
                />
              </div>
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="flex flex-col items-center gap-4 text-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
            >
              <Layers size={28} className="text-[var(--text-muted)]" />
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--text-secondary)]">
                No text yet
              </p>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Type something in the editor to see your handwriting
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Zoom indicator bar at bottom */}
      {zoom !== 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 bg-[var(--bg-card)] border border-[var(--border)] rounded-full text-xs text-[var(--text-muted)]">
          <span>{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => onZoomChange(1)}
            className="text-[var(--accent-hover)] hover:underline"
          >
            Reset
          </button>
        </div>
      )}
    </div>
  );
}
