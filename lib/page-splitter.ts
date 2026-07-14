// ============================================================
// Page Splitter — splits text into pages
// ============================================================
import type { HandwritingStyle, NotebookTemplate, WritingPage, PageSplitResult } from "@/types";
import { measureLinesPerPage } from "@/lib/handwriting-engine";
import { PAGE_WIDTH_PX, PAGE_HEIGHT_PX } from "@/utils/canvas-utils";

// ============================================================
// Fast text-only line splitter (no canvas needed)
// Uses estimated character count per line
// ============================================================
function estimateLinesPerWidth(
  text: string,
  style: HandwritingStyle,
  template: NotebookTemplate,
  pageWidth: number = PAGE_WIDTH_PX
): string[] {
  const writableWidth = pageWidth - template.marginLeft - template.marginRight;
  // Estimate average char width based on fontSize
  const avgCharWidth = style.fontSize * 0.58;
  const charsPerLine = Math.floor(writableWidth / avgCharWidth);

  const paragraphs = text.split("\n");
  const lines: string[] = [];

  for (const paragraph of paragraphs) {
    if (paragraph.trim() === "") {
      lines.push("");
      continue;
    }

    const words = paragraph.split(" ");
    let currentLine = "";

    for (const word of words) {
      const test = currentLine ? `${currentLine} ${word}` : word;
      if (test.length > charsPerLine && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = test;
      }
    }

    if (currentLine) lines.push(currentLine);
  }

  return lines;
}

// ============================================================
// Split all lines into pages
// ============================================================
export function splitTextToPages(
  text: string,
  style: HandwritingStyle,
  template: NotebookTemplate
): PageSplitResult {
  if (!text.trim()) {
    return {
      pages: [],
      totalPages: 0,
      wordCount: 0,
      charCount: 0,
      estimatedPages: 0,
    };
  }

  const allLines = estimateLinesPerWidth(text, style, template);
  const linesPerPage = measureLinesPerPage(template);

  const pages: WritingPage[] = [];
  let lineIndex = 0;
  let pageIndex = 0;

  while (lineIndex < allLines.length) {
    const pageLines = allLines.slice(lineIndex, lineIndex + linesPerPage);
    const pageText = pageLines.join("\n");

    pages.push({
      id: `page-${pageIndex}`,
      pageNumber: pageIndex + 1,
      text: pageText,
      lines: pageLines,
      seed: hashPage(pageIndex, text.length),
    });

    lineIndex += linesPerPage;
    pageIndex++;
  }

  const wordCount = text
    .split(/\s+/)
    .filter((w) => w.length > 0).length;
  const charCount = text.length;

  return {
    pages,
    totalPages: pages.length,
    wordCount,
    charCount,
    estimatedPages: pages.length,
  };
}

function hashPage(pageIndex: number, textLength: number): number {
  return ((pageIndex + 1) * 2654435761 + textLength * 1234567891) >>> 0;
}

// ============================================================
// Compute words / chars / estimated pages from text
// ============================================================
export function computeTextStats(
  text: string,
  style: HandwritingStyle,
  template: NotebookTemplate
): { wordCount: number; charCount: number; estimatedPages: number } {
  const wordCount = text.split(/\s+/).filter((w) => w.length > 0).length;
  const charCount = text.length;

  const allLines = estimateLinesPerWidth(text, style, template);
  const linesPerPage = measureLinesPerPage(template);
  const estimatedPages = Math.max(1, Math.ceil(allLines.length / linesPerPage));

  return { wordCount, charCount, estimatedPages };
}
