# WriteBook AI — Realistic Handwriting Generator

WriteBook AI is a premium, production-ready SaaS web application designed to simulate realistic handwriting on virtual notebook paper. Built with **Next.js 15 (App Router)**, **React 19**, **TypeScript**, and **Tailwind CSS v4**, this application translates standard typed text into organic, natural-looking handwriting that looks physically written rather than computer-generated.

---

## 🌟 Key Features

### 1. Advanced Handwriting Simulation Engine (`lib/handwriting-engine.ts`)
Unlike simple script-font displays, WriteBook AI runs a complex procedural rendering engine on an HTML Canvas:
* **Character-Level Jitter**: Adds natural variation to letter spacing, rotation/angle drifts, and baseline alignments.
* **Stroke Pressure Simulation**: Simulates the variable thickness of ink caused by the natural changing pressure of a human hand.
* **Ink Flow Depletion & Fading**: Mimics the dry-down of a pen as ink is used up along a line, resetting ("re-inking") at the start of each new line.
* **Ink-to-Paper Absorption**: Integrates a `multiply` canvas blend mode, causing the ink to physically absorb into the underlying paper fibers and ruled lines instead of sitting flat on top.
* **11 Handwriting Styles**: Preloaded with student neat, student messy, teacher cursive, engineering blocks, doctor scrawls, and more.

### 2. 3D Photorealistic Canvas (`lib/paper-engine.ts`)
* **3D Stacked Page Visuals**: Renders paper with physical depth, shadows, and multiple visible pages underneath to show page stack thickness.
* **Book Spine / Binding Fold**: Adds a curved gradient shadow along the left margin to represent a real open notebook.
* **Authentic Indonesian Boss Notebook**: Specifically engineered template representing the Indonesian brand "BOSS" school notebook. It includes:
  - Collapsible header inputs (`Nama`, `Kelas`, `No.`, `Date`) drawn directly on pre-printed lines in handwriting.
  - Rectangular checkbox margins.
  - Pre-printed double boundary lines under the header.
* **15 Built-in Templates**: Grid paper, binder sheets, pastel notebook, college/wide ruled, blank, vintage yellowed paper, and more.

### 3. Dynamic Controls & Responsive UI
* **Real-time Synchronization**: As you edit text, styles, or paper types, the canvas renders in real-time using a debounced rendering queue.
* **Interactive Tooling**: Smooth zoom in/out rendering wrapper, fullscreen viewer, and a dynamic Light/Dark mode switcher syncing system-wide theme colors.
* **Post-processing Filters (FX Panel)**: Layer-on wrinkles, coffee stains, old-paper sepia filter, phone camera vignette shadow, scanner filters, and page curls.
* **Custom Font Loader**: Drag-and-drop or upload custom handwriting fonts (`.ttf`, `.otf`, `.woff`, `.woff2`) to use instantly.

### 4. Smart Page Splitter Engine (`lib/page-splitter.ts`)
* Automatically wraps lines based on the template's left/right margins and wraps text onto consecutive pages when text exceeds the line capacity of the page.

### 5. Multi-format High-Res Export (`lib/export-engine.ts`)
* **Print-Ready 300 DPI Export**: Scale-up canvas dimensions at high fidelity for high-resolution downloads.
* **Supported Formats**: PNG, JPG, PDF (via jsPDF), or a bundled ZIP containing separate page files.

---

## 🛠️ Tech Stack & Dependencies

* **Framework**: Next.js 15 (App Router), React 19, TypeScript
* **Styling**: Tailwind CSS v4, Vanilla CSS
* **Animations**: Framer Motion
* **Utilities**: Lucide Icons
* **Libraries**: `jsPDF` (PDF compiler), `JSZip` (ZIP archiver), `mammoth` (DOCX parser)

---

## 🚀 Getting Started

### Prerequisites
* Node.js 18.x or later
* npm, yarn, or pnpm

### Installation
Clone the repository and install the dependencies:
```bash
npm install
```

### Run the Development Server
Launch the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (or the port specified in console) with your browser to launch the web app.

---

## 📂 Project Directory Structure

```
├── app/
│   ├── globals.css      # Core styles & dark/light theme variables
│   ├── layout.tsx       # HTML structure, preconnect links, and Google Fonts
│   └── page.tsx         # Main orchestrator page
├── components/
│   └── shared/
│       ├── Header.tsx   # Top toolbar containing randomize/regenerate controls
│       └── SidePanel.tsx# Sidebar containing active panels & inputs
├── features/
│   ├── canvas/
│   │   └── CanvasRenderer.tsx  # Canvas wrapper component
│   ├── editor/
│   │   ├── EffectsToggle.tsx  # FX checkbox list
│   │   ├── FontUploader.tsx   # Font file drag-and-drop
│   │   ├── InkSelector.tsx    # Color ballpoint selector
│   │   ├── StyleSelector.tsx  # Handwriting options grid
│   │   └── TextEditor.tsx     # Plain textarea & importer
│   ├── export/
│   │   └── ExportPanel.tsx    # Format selectors & export trigger
│   ├── preview/
│   │   └── PreviewPanel.tsx   # Interactive canvas area, zoom/dark controls
│   └── templates/
│       └── TemplateSelector.tsx # Lined paper thumbnail layout
├── hooks/
│   ├── useAppState.ts   # Core React app state reducer
│   ├── useCanvas.ts     # Triggers rendering loop & loads fonts
│   ├── useDebounce.ts   # Prevents lag by debouncing inputs
│   └── useExport.ts     # Handles download states & engine logic
├── lib/
│   ├── handwriting-engine.ts # Canvas handwriting text generator
│   ├── ink-config.ts         # Preloaded color options
│   ├── page-splitter.ts      # Computes margins and split heights
│   ├── paper-engine.ts       # Draws paper types, grid, and FX layers
│   ├── styles-config.ts      # Preloaded handwriting personalities
│   └── templates-config.ts   # Preloaded paper shapes & BOSS details
├── types/
│   └── index.ts              # Custom state & option types
└── utils/
    └── canvas-utils.ts       # Seeds PRNG, converts hex, draws boxes
```
