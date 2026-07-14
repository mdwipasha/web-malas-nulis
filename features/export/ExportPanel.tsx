"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  FileImage,
  FileText,
  Archive,
  Loader2,
  ChevronDown,
  Printer,
  Globe,
} from "lucide-react";
import { useExport } from "@/hooks/useExport";
import type { RenderOptions, WritingPage, ExportFormat, ExportQuality } from "@/types";

interface ExportPanelProps {
  options: RenderOptions;
  pages: WritingPage[];
  exportFormat: ExportFormat;
  exportQuality: ExportQuality;
  onFormatChange: (format: ExportFormat) => void;
  onQualityChange: (quality: ExportQuality) => void;
}

const FORMATS = [
  {
    id: "png" as const,
    label: "PNG",
    description: "Lossless · Current page",
    icon: FileImage,
  },
  {
    id: "jpg" as const,
    label: "JPG",
    description: "Compressed · Current page",
    icon: FileImage,
  },
  {
    id: "pdf" as const,
    label: "PDF",
    description: "All pages · Print-ready",
    icon: FileText,
  },
  {
    id: "zip" as const,
    label: "ZIP",
    description: "All pages as PNGs",
    icon: Archive,
  },
];

export function ExportPanel({
  options,
  pages,
  exportFormat,
  exportQuality,
  onFormatChange,
  onQualityChange,
}: ExportPanelProps) {
  const { doExport, isExporting, exportProgress } = useExport();

  const handleExport = () => {
    doExport(options, pages, exportFormat, exportQuality);
  };

  return (
    <div className="space-y-4">
      {/* Format selector */}
      <div>
        <div className="control-label mb-2">Format</div>
        <div className="grid grid-cols-2 gap-1.5">
          {FORMATS.map((fmt) => {
            const Icon = fmt.icon;
            const active = exportFormat === fmt.id;
            return (
              <motion.button
                key={fmt.id}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-left transition-all ${
                  active
                    ? "border-[var(--accent)] bg-[var(--accent-muted)]"
                    : "border-[var(--border)] bg-[var(--bg-card)] hover:bg-[rgba(255,255,255,0.03)]"
                }`}
                whileTap={{ scale: 0.97 }}
                onClick={() => onFormatChange(fmt.id)}
              >
                <Icon
                  size={14}
                  className={active ? "text-[var(--accent-hover)]" : "text-[var(--text-muted)]"}
                />
                <div className="min-w-0">
                  <div
                    className={`text-xs font-semibold ${active ? "text-[var(--accent-hover)]" : "text-[var(--text-secondary)]"}`}
                  >
                    {fmt.label}
                  </div>
                  <div className="text-[9px] text-[var(--text-muted)] truncate">
                    {fmt.description}
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Quality */}
      <div>
        <div className="control-label mb-2">Quality</div>
        <div className="flex gap-1.5">
          {[
            { id: "web" as const, label: "Web", desc: "96 DPI", icon: Globe },
            { id: "print" as const, label: "Print", desc: "300 DPI", icon: Printer },
          ].map(({ id, label, desc, icon: Icon }) => (
            <motion.button
              key={id}
              className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-lg border text-left transition-all ${
                exportQuality === id
                  ? "border-[var(--accent)] bg-[var(--accent-muted)]"
                  : "border-[var(--border)] bg-[var(--bg-card)] hover:bg-[rgba(255,255,255,0.03)]"
              }`}
              whileTap={{ scale: 0.97 }}
              onClick={() => onQualityChange(id)}
            >
              <Icon
                size={13}
                className={exportQuality === id ? "text-[var(--accent-hover)]" : "text-[var(--text-muted)]"}
              />
              <div>
                <div
                  className={`text-xs font-semibold ${exportQuality === id ? "text-[var(--accent-hover)]" : "text-[var(--text-secondary)]"}`}
                >
                  {label}
                </div>
                <div className="text-[9px] text-[var(--text-muted)]">{desc}</div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Info */}
      <div
        className="px-3 py-2.5 rounded-lg text-xs text-[var(--text-muted)]"
        style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}
      >
        {exportFormat === "pdf" || exportFormat === "zip" ? (
          <span>
            Exporting{" "}
            <strong className="text-[var(--text-secondary)]">{pages.length}</strong> page
            {pages.length !== 1 ? "s" : ""}
          </span>
        ) : (
          <span>Exporting current page only</span>
        )}
      </div>

      {/* Export button */}
      <motion.button
        className="btn-primary w-full py-3 text-sm"
        onClick={handleExport}
        disabled={isExporting || pages.length === 0}
        whileTap={{ scale: 0.97 }}
      >
        {isExporting ? (
          <>
            <Loader2 size={15} className="spinner" />
            Exporting...
          </>
        ) : (
          <>
            <Download size={15} />
            Export {exportFormat.toUpperCase()}
          </>
        )}
      </motion.button>

      {/* Progress bar */}
      <AnimatePresence>
        {isExporting && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div
              className="h-1 rounded-full overflow-hidden"
              style={{ background: "var(--bg-elevated)" }}
            >
              <motion.div
                className="h-full rounded-full progress-pulse"
                style={{ background: "var(--accent)" }}
                initial={{ width: "0%" }}
                animate={{ width: `${exportProgress || 30}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
