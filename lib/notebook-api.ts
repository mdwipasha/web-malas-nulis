import fs from "node:fs";
import path from "node:path";
import type { NotebookLines, NotebookMetadata, NotebookPack, WriteArea } from "@/types";

const NOTEBOOK_ROOT = path.join(process.cwd(), "assets", "notebooks");

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}

function walkNotebookFolders(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const folders: string[] = [];

  if (entries.some((entry) => entry.isFile() && entry.name === "metadata.json")) {
    folders.push(dir);
  }

  for (const entry of entries) {
    if (entry.isDirectory()) {
      folders.push(...walkNotebookFolders(path.join(dir, entry.name)));
    }
  }

  return folders;
}

function toUrlPath(folderPath: string, fileName: string): string {
  const relative = path.relative(NOTEBOOK_ROOT, path.join(folderPath, fileName));
  return `/api/notebooks/assets/${relative.split(path.sep).join("/")}`;
}

function hasFile(folderPath: string, fileName: string): boolean {
  return fs.existsSync(path.join(folderPath, fileName));
}

function createPack(folderPath: string): NotebookPack {
  const metadata = readJson<NotebookMetadata>(path.join(folderPath, "metadata.json"));
  const writeArea = readJson<WriteArea>(path.join(folderPath, "write-area.json"));
  const lines = readJson<NotebookLines>(path.join(folderPath, "lines.json"));
  const relativeFolder = path.relative(process.cwd(), folderPath).split(path.sep).join("/");

  return {
    id: metadata.id,
    name: metadata.name,
    brand: metadata.brand,
    category: metadata.category,
    country: metadata.country,
    orientation: metadata.orientation,
    paperSize: metadata.paperSize,
    spiral: metadata.spiral,
    renderMode: metadata.renderMode,
    metadata,
    writeArea,
    lines,
    pagePath: toUrlPath(folderPath, "page_01.jpg"),
    thumbnailPath: hasFile(folderPath, "thumbnail.webp")
      ? toUrlPath(folderPath, "thumbnail.webp")
      : undefined,
    previewPath: hasFile(folderPath, "preview.webp")
      ? toUrlPath(folderPath, "preview.webp")
      : undefined,
    maskPath: hasFile(folderPath, "mask.png") ? toUrlPath(folderPath, "mask.png") : undefined,
    folderPath: relativeFolder,
  };
}

export function getAllNotebooks(): NotebookPack[] {
  return walkNotebookFolders(NOTEBOOK_ROOT)
    .map(createPack)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getNotebook(id: string): NotebookPack | undefined {
  return getAllNotebooks().find((pack) => pack.id === id);
}

export async function getNotebookById(id: string): Promise<NotebookPack> {
  const pack = getNotebook(id);
  if (!pack) {
    throw new Error(`Notebook "${id}" was not found`);
  }
  return pack;
}

export function getNotebookCategories(): string[] {
  return [...new Set(getAllNotebooks().map((pack) => pack.category))].sort();
}

export function getNotebookBrands(): string[] {
  return [...new Set(getAllNotebooks().map((pack) => pack.brand))].sort();
}

export function getNotebookCountries(): string[] {
  return [...new Set(getAllNotebooks().map((pack) => pack.country))].sort();
}

export function getNotebookCountry(id: string): string {
  return getNotebook(id)?.country ?? "";
}

export function getSpiralNotebooks(): NotebookPack[] {
  return getAllNotebooks().filter((pack) => pack.spiral);
}

export function getPortraitNotebooks(): NotebookPack[] {
  return getAllNotebooks().filter((pack) => pack.orientation === "portrait");
}

export function getLandscapeNotebooks(): NotebookPack[] {
  return getAllNotebooks().filter((pack) => pack.orientation === "landscape");
}

export function getNotebookSummary() {
  const notebooks = getAllNotebooks();

  return {
    total: notebooks.length,
    categories: [...new Set(notebooks.map((pack) => pack.category))].sort(),
    brands: [...new Set(notebooks.map((pack) => pack.brand))].sort(),
    countries: [...new Set(notebooks.map((pack) => pack.country))].sort(),
    spiral: notebooks.filter((pack) => pack.spiral).length,
    portrait: notebooks.filter((pack) => pack.orientation === "portrait").length,
    landscape: notebooks.filter((pack) => pack.orientation === "landscape").length,
  };
}
