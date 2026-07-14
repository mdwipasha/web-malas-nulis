"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Pen,
  BookOpen,
  Layers,
  Palette,
  Upload,
  Sparkles,
  Download,
  ChevronRight,
} from "lucide-react";

import { TextEditor } from "@/features/editor/TextEditor";
import { StyleSelector } from "@/features/editor/StyleSelector";
import { InkSelector } from "@/features/editor/InkSelector";
import { EffectsToggle } from "@/features/editor/EffectsToggle";
import { FontUploader } from "@/features/editor/FontUploader";
import { TemplateSelector } from "@/features/templates/TemplateSelector";
import { ExportPanel } from "@/features/export/ExportPanel";
import type { AppState, RenderOptions, WritingPage } from "@/types";

type TabId = "text" | "style" | "template" | "effects" | "font" | "export";

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "text", label: "Text", icon: Pen },
  { id: "style", label: "Style", icon: Layers },
  { id: "template", label: "Paper", icon: BookOpen },
  { id: "effects", label: "FX", icon: Sparkles },
  { id: "font", label: "Font", icon: Upload },
  { id: "export", label: "Export", icon: Download },
];

interface SidePanelProps {
  state: AppState;
  onTextChange: (text: string) => void;
  onStyleChange: (id: string) => void;
  onTemplateChange: (id: string) => void;
  onInkChange: (id: string) => void;
  onEffectToggle: (key: keyof AppState["effects"]) => void;
  onFontLoad: (font: AppState["customFont"]) => void;
  onFormatChange: (format: AppState["exportFormat"]) => void;
  onQualityChange: (quality: AppState["exportQuality"]) => void;
  renderOptions: RenderOptions;
  pages: WritingPage[];
  wordCount: number;
  charCount: number;
  estimatedPages: number;
}

export function SidePanel({
  state,
  onTextChange,
  onStyleChange,
  onTemplateChange,
  onInkChange,
  onEffectToggle,
  onFontLoad,
  onFormatChange,
  onQualityChange,
  renderOptions,
  pages,
  wordCount,
  charCount,
  estimatedPages,
}: SidePanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>("text");

  return (
    <div
      className="flex flex-col h-full"
      style={{
        background: "var(--bg)",
        borderRight: "1px solid var(--border)",
        width: "320px",
        minWidth: "320px",
        maxWidth: "320px",
      }}
    >
      {/* Tab bar */}
      <div
        className="flex items-center gap-0.5 p-2 border-b border-[var(--border)] flex-shrink-0 overflow-x-auto"
        style={{ background: "var(--bg-elevated)" }}
      >
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <motion.button
              key={tab.id}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                active
                  ? "bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[rgba(255,255,255,0.03)]"
              }`}
              onClick={() => setActiveTab(tab.id)}
              whileTap={{ scale: 0.95 }}
            >
              <Icon size={12} />
              {tab.label}
            </motion.button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            transition={{ duration: 0.15 }}
            className="h-full"
          >
            {activeTab === "text" && (
              <TextEditor
                text={state.text}
                onChange={onTextChange}
                wordCount={wordCount}
                charCount={charCount}
                estimatedPages={estimatedPages}
              />
            )}

            {activeTab === "style" && (
              <div className="sidebar-scroll h-full p-3 space-y-4">
                {/* Handwriting Style */}
                <div>
                  <div className="control-label mb-2">Handwriting Style</div>
                  <StyleSelector
                    selectedId={state.handwritingStyleId}
                    onSelect={onStyleChange}
                  />
                </div>

                {/* Ink Color */}
                <div>
                  <div className="control-label mb-2">Ink Color</div>
                  <InkSelector
                    selectedId={state.inkColorId}
                    onSelect={onInkChange}
                  />
                </div>
              </div>
            )}

            {activeTab === "template" && (
              <div className="sidebar-scroll h-full p-3">
                <div className="control-label mb-3">Notebook Template</div>
                <TemplateSelector
                  selectedId={state.templateId}
                  onSelect={onTemplateChange}
                />
              </div>
            )}

            {activeTab === "effects" && (
              <div className="sidebar-scroll h-full p-3">
                <div className="control-label mb-3">Paper Effects</div>
                <EffectsToggle
                  effects={state.effects}
                  onToggle={onEffectToggle}
                />
              </div>
            )}

            {activeTab === "font" && (
              <div className="sidebar-scroll h-full p-3">
                <div className="control-label mb-3">Custom Font Upload</div>
                <FontUploader
                  customFont={state.customFont}
                  onFontLoad={onFontLoad}
                />
                <div className="mt-4 p-3 rounded-lg text-xs text-[var(--text-muted)] leading-relaxed"
                  style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}
                >
                  <strong className="text-[var(--text-secondary)]">Tip:</strong> Upload your own handwriting as a font (scan, digitize with tools like
                  Calligraphr), then upload the TTF file here to write in your own handwriting.
                </div>
              </div>
            )}

            {activeTab === "export" && (
              <div className="sidebar-scroll h-full p-3">
                <div className="control-label mb-3">Export Options</div>
                <ExportPanel
                  options={renderOptions}
                  pages={pages}
                  exportFormat={state.exportFormat}
                  exportQuality={state.exportQuality}
                  onFormatChange={onFormatChange}
                  onQualityChange={onQualityChange}
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
