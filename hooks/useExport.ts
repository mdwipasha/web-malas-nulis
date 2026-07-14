"use client";
import { useState, useCallback } from "react";
import type { AppState, RenderOptions, WritingPage, ExportFormat, ExportQuality } from "@/types";
import {
  exportImage,
  exportPDF,
  exportZip,
  downloadBlob,
  downloadDataUrl,
} from "@/lib/export-engine";

export function useExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const doExport = useCallback(
    async (
      options: RenderOptions,
      pages: WritingPage[],
      format: ExportFormat,
      quality: ExportQuality
    ) => {
      if (isExporting) return;
      setIsExporting(true);
      setExportProgress(0);

      try {
        if (format === "png" || format === "jpg") {
          const page = pages[0];
          if (!page) return;
          const pageOptions = { ...options, seed: page.seed };
          const dataUrl = await exportImage(pageOptions, page.text, format, quality);
          downloadDataUrl(dataUrl, `writebook-page-1.${format}`);
          setExportProgress(100);
        } else if (format === "pdf") {
          const blob = await exportPDF(options, pages, quality);
          downloadBlob(blob, "writebook-handwriting.pdf");
          setExportProgress(100);
        } else if (format === "zip") {
          const blob = await exportZip(options, pages, quality);
          downloadBlob(blob, "writebook-handwriting.zip");
          setExportProgress(100);
        }
      } catch (err) {
        console.error("Export failed:", err);
      } finally {
        setIsExporting(false);
        setTimeout(() => setExportProgress(0), 2000);
      }
    },
    [isExporting]
  );

  return { doExport, isExporting, exportProgress };
}
