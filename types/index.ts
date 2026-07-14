// ============================================================
// WriteBook AI — Core TypeScript Types
// ============================================================

export type InkColor = {
  id: string;
  label: string;
  hex: string;
  opacity: number;
};

export type HandwritingStyle = {
  id: string;
  label: string;
  fontFamily: string;
  fontSize: number; // base px
  strokeWidth: number; // base stroke
  letterSpacing: number; // base em
  lineHeight: number; // multiplier
  rotationRange: number; // degrees max
  baselineRange: number; // px max
  spacingJitter: number; // px max
  pressureVariation: number; // 0-1
  shakiness: number; // 0-1
  inkFade: number; // 0-1
  wordSpacingJitter: number; // px
  slant: number; // degrees
};

export type NotebookTemplate = {
  id: string;
  label: string;
  category: string;
  paperColor: string;
  lineColor: string;
  marginColor: string;
  lineSpacing: number; // px
  marginLeft: number; // px
  marginRight: number; // px
  marginTop: number; // px
  marginBottom: number; // px
  hasLines: boolean;
  hasMargin: boolean;
  hasGrid: boolean;
  hasHoles: boolean;
  gridSize?: number;
  paperTexture: "clean" | "rough" | "aged" | "smooth";
  shadowIntensity: number; // 0-1
  description: string;
};

export type PaperEffect = {
  id: string;
  label: string;
  intensity: number; // 0-1
};

export type ExportFormat = "png" | "jpg" | "pdf" | "zip";

export type ExportQuality = "web" | "print"; // print = 300dpi

export type WritingPage = {
  id: string;
  pageNumber: number;
  text: string;
  lines: string[];
  seed: number;
};

export type AppState = {
  // Text
  text: string;
  
  // Style choices
  handwritingStyleId: string;
  templateId: string;
  inkColorId: string;
  
  // Paper effects
  effects: {
    noise: boolean;
    wrinkles: boolean;
    coffeeStain: boolean;
    oldPaper: boolean;
    shadow: boolean;
    curl: boolean;
    scanner: boolean;
    camera: boolean;
  };
  
  // Preview
  zoom: number;
  currentPage: number;
  isFullscreen: boolean;
  isDarkMode: boolean;
  
  // Pages
  pages: WritingPage[];
  
  // Export
  exportFormat: ExportFormat;
  exportQuality: ExportQuality;
  
  // Custom font
  customFont: {
    name: string;
    url: string;
  } | null;
  
  // Randomization seed
  seed: number;
};

export type RenderOptions = {
  template: NotebookTemplate;
  style: HandwritingStyle;
  inkColor: InkColor;
  effects: AppState["effects"];
  seed: number;
  scale?: number;
  text: string;
  customFontUrl?: string;
};

export type PageSplitResult = {
  pages: WritingPage[];
  totalPages: number;
  wordCount: number;
  charCount: number;
  estimatedPages: number;
};
