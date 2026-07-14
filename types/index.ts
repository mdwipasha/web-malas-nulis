// ============================================================
// Malas Nulis — Core TypeScript Types
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

export type Handwriting = HandwritingStyle;

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
  hasHeader?: boolean; // special header section (like boss notebook)
  hasCheckboxes?: boolean; // left-side checkboxes
  gridSize?: number;
  paperTexture: "clean" | "rough" | "aged" | "smooth";
  shadowIntensity: number; // 0-1
  deskColor?: string; // custom desk/background color
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

export type HeaderInfo = {
  name: string;
  class: string;
  no: string;
  date: string;
};

export type AppState = {
  // Text
  text: string;

  // Header info for notebook templates
  headerInfo: HeaderInfo;

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
  notebookPack?: NotebookPack;
  style: HandwritingStyle;
  inkColor: InkColor;
  effects: AppState["effects"];
  seed: number;
  scale?: number;
  text: string;
  customFontUrl?: string;
  headerInfo?: HeaderInfo;
};

export type PageSplitResult = {
  pages: WritingPage[];
  totalPages: number;
  wordCount: number;
  charCount: number;
  estimatedPages: number;
};

// ============================================================
// NEW: Production Engine Interfaces
// ============================================================

/**
 * Full metadata stored in metadata.json for each notebook pack.
 */
export type NotebookMetadata = {
  id: string;
  name: string;
  brand: string;
  category: "school" | "office" | "premium" | "spiral";
  country: string;
  orientation: "portrait" | "landscape";
  paperSize: "A4" | "A5" | "Letter" | "Legal" | "B5" | string;
  spiral: boolean;
  header: boolean;
  footer: boolean;
  checkbox: boolean;
  defaultInk: string;
  defaultFont: string;
  lineSpacing: number;
  paperColor: string;
  version: string;
  description?: string;
  renderMode: "classic" | "photo" | "premium";
};

/**
 * Writable area boundaries for a notebook page.
 * All values are in pixels at the page's native resolution.
 * Stored in write-area.json.
 */
export type WriteArea = {
  top: number;          // px from page top to first writable line
  bottom: number;       // px from page bottom (margin below last line)
  left: number;         // px from page left (margin / checkbox area)
  right: number;        // px from page right
  header: number;       // header block height in px (0 if none)
  footer: number;       // footer block height in px (0 if none)
  usableWidth: number;  // total writable width in px
  usableHeight: number; // total writable height in px
};

/**
 * Ruled-line detection data for a notebook page.
 * Stored in lines.json.
 */
export type NotebookLines = {
  lineCount: number;    // total number of ruled lines
  lineSpacing: number;  // px between consecutive lines
  baseline: number;     // y of first baseline from page top
  firstLine: number;    // y of the very first ruled line
  lastLine: number;     // y of the very last ruled line
  color: string;        // detected line color (hex)
};

/**
 * A complete notebook asset pack.
 * Loaded by NotebookLoader from a folder containing:
 * page_01.jpg, metadata.json, write-area.json, lines.json
 */
export type NotebookPack = {
  id: string;
  name: string;
  brand: string;
  category: NotebookMetadata["category"];
  country: string;
  orientation: NotebookMetadata["orientation"];
  paperSize: string;
  spiral: boolean;
  renderMode: "classic" | "photo" | "premium";
  metadata: NotebookMetadata;
  writeArea: WriteArea;
  lines: NotebookLines;
  pagePath: string;        // URL path to page_01.jpg (relative to /assets/)
  thumbnailPath?: string;  // URL path to thumbnail.webp (if available)
  previewPath?: string;    // URL path to preview.webp (if available)
  maskPath?: string;       // URL path to mask.png (if available)
  folderPath: string;      // physical folder path (used server-side only)
};

export type Notebook = NotebookPack;

/**
 * Camera simulation preset.
 * Used by CameraEngine to apply post-process effects.
 */
export type CameraPreset = {
  id: "phone" | "scanner" | "dslr";
  label: string;
  vignette: number;              // 0–1: lens darkening at edges
  grain: number;                 // 0–1: film grain intensity
  noise: number;                 // 0–1: digital sensor noise
  warmth: number;                // -1 to 1: color temperature shift
  blur: number;                  // 0–10: edge bokeh radius
  chromaticAberration: number;   // 0–1: RGB channel offset
  scanLines: boolean;            // scanner artifact lines
  paperShadow: boolean;          // shadow cast from paper lift
  tilt: number;                  // 0–1: slight perspective rotation
};

/**
 * Extended Ink type with physical properties.
 * Backwards-compatible: InkColor still exists for legacy use.
 */
export type Ink = {
  id: string;
  label: string;
  hex: string;
  opacity: number;
  type: "ballpoint" | "gel" | "pencil" | "marker" | "fountain";
  pressureSensitivity: number; // 0–1
  flowVariation: number;       // 0–1: how much ink flow changes
  dryTime: number;             // ms before fully set (affects smear sim)
};

/**
 * Options passed to PhotoRenderer.render().
 */
export type PhotoRenderOptions = {
  pack: NotebookPack;
  text: string;
  style: HandwritingStyle;
  inkColor: InkColor;
  seed: number;
  effects: AppState["effects"];
  cameraPreset?: CameraPreset;
  customFontUrl?: string;
  headerInfo?: HeaderInfo;
  scale?: number;
};

/**
 * Result from NotebookAnalyzer.analyze().
 */
export type AnalyzerResult = {
  metadata: Partial<NotebookMetadata>;
  writeArea: WriteArea;
  lines: NotebookLines;
  thumbnailDataUrl: string;   // data:image/webp;base64,...
  previewDataUrl: string;     // data:image/webp;base64,...
  maskDataUrl: string;        // data:image/png;base64,...
  readme: string;             // generated README.md content
};
