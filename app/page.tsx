"use client";
import React, { useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";

import { useAppState } from "@/hooks/useAppState";
import { useDebouncedValue } from "@/hooks/useDebounce";
import { splitTextToPages, computeTextStats } from "@/lib/page-splitter";
import { getStyle } from "@/lib/styles-config";
import { getTemplate } from "@/lib/templates-config";
import { getInkColor } from "@/lib/ink-config";
import type { RenderOptions } from "@/types";

import { Header } from "@/components/shared/Header";
import { SidePanel } from "@/components/shared/SidePanel";
import { PreviewPanel } from "@/features/preview/PreviewPanel";

export default function Home() {
  const {
    state,
    updateText,
    updateStyle,
    updateTemplate,
    updateInk,
    toggleEffect,
    updateZoom,
    setCurrentPage,
    toggleFullscreen,
    toggleDarkMode,
    updatePages,
    setExportFormat,
    setExportQuality,
    setCustomFont,
    randomize,
    regenerate,
  } = useAppState();

  // Debounce text changes to avoid excessive re-renders
  const debouncedText = useDebouncedValue(state.text, 400);
  const debouncedStyle = useDebouncedValue(state.handwritingStyleId, 200);
  const debouncedTemplate = useDebouncedValue(state.templateId, 200);

  // Resolve current configs
  const currentStyle = getStyle(debouncedStyle);
  const currentTemplate = getTemplate(debouncedTemplate);
  const currentInk = getInkColor(state.inkColorId);

  // Override font family if custom font is loaded
  const effectiveStyle = useMemo(() => {
    if (state.customFont) {
      return { ...currentStyle, fontFamily: `'${state.customFont.name}', cursive` };
    }
    return currentStyle;
  }, [currentStyle, state.customFont]);

  // Compute pages whenever text/style/template changes
  const { pages, wordCount, charCount, estimatedPages } = useMemo(() => {
    const stats = computeTextStats(debouncedText, effectiveStyle, currentTemplate);
    const result = splitTextToPages(debouncedText, effectiveStyle, currentTemplate);
    return {
      pages: result.pages,
      wordCount: stats.wordCount,
      charCount: stats.charCount,
      estimatedPages: stats.estimatedPages,
    };
  }, [debouncedText, effectiveStyle, currentTemplate]);

  // Update pages in state
  useEffect(() => {
    updatePages(pages);
  }, [pages, updatePages]);

  // Reset page to 0 when page count changes
  useEffect(() => {
    if (state.currentPage >= pages.length && pages.length > 0) {
      setCurrentPage(0);
    }
  }, [pages.length, state.currentPage, setCurrentPage]);

  // Build render options
  const renderOptions: RenderOptions = useMemo(
    () => ({
      template: currentTemplate,
      style: effectiveStyle,
      inkColor: currentInk,
      effects: state.effects,
      seed: state.seed,
      text: debouncedText,
      customFontUrl: state.customFont?.url,
    }),
    [
      currentTemplate,
      effectiveStyle,
      currentInk,
      state.effects,
      state.seed,
      debouncedText,
      state.customFont,
    ]
  );

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: "var(--bg)" }}>
      {/* Header */}
      <Header onRandomize={randomize} onRegenerate={regenerate} />

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel — controls */}
        <SidePanel
          state={state}
          onTextChange={updateText}
          onStyleChange={updateStyle}
          onTemplateChange={updateTemplate}
          onInkChange={updateInk}
          onEffectToggle={toggleEffect}
          onFontLoad={setCustomFont}
          onFormatChange={setExportFormat}
          onQualityChange={setExportQuality}
          renderOptions={renderOptions}
          pages={pages}
          wordCount={wordCount}
          charCount={charCount}
          estimatedPages={estimatedPages}
        />

        {/* Right panel — preview */}
        <div className="flex-1 overflow-hidden">
          <PreviewPanel
            options={renderOptions}
            pages={pages}
            currentPage={state.currentPage}
            onPageChange={setCurrentPage}
            zoom={state.zoom}
            onZoomChange={updateZoom}
            isFullscreen={state.isFullscreen}
            onToggleFullscreen={toggleFullscreen}
            isDarkMode={state.isDarkMode}
            onToggleDarkMode={toggleDarkMode}
          />
        </div>
      </div>
    </div>
  );
}
