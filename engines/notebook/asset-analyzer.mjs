import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const CATEGORY_BY_FOLDER = new Map([
  ["premium", "premium"],
  ["spiral", "spiral"],
  ["indonesia", "school"],
  ["photo", "school"],
]);

function readJson(filePath) {
  if (!fs.existsSync(filePath)) return {};
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function toTitleCase(value) {
  return value
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function median(values) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

function hexFromRgb(r, g, b) {
  return `#${[r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("")}`;
}

function inferMetadata(folderPath, imageMetadata, existing = {}) {
  const id = existing.id ?? path.basename(folderPath);
  const parts = folderPath.split(path.sep).map((part) => part.toLowerCase());
  const category =
    existing.category ??
    parts.map((part) => CATEGORY_BY_FOLDER.get(part)).find(Boolean) ??
    "school";
  const brand = existing.brand ?? toTitleCase(id.split("-")[0]);
  const width = imageMetadata.width ?? 0;
  const height = imageMetadata.height ?? 0;

  return {
    id,
    name: existing.name ?? toTitleCase(id),
    brand,
    category,
    country: existing.country ?? (parts.includes("indonesia") ? "Indonesia" : "Unknown"),
    orientation: existing.orientation ?? (width >= height ? "landscape" : "portrait"),
    paperSize: existing.paperSize ?? (height > 1200 || width > 900 ? "A4" : "A5"),
    spiral: existing.spiral ?? parts.includes("spiral"),
    header: existing.header ?? false,
    footer: existing.footer ?? false,
    checkbox: existing.checkbox ?? false,
    defaultInk: existing.defaultInk ?? "blue",
    defaultFont: existing.defaultFont ?? "student-neat",
    lineSpacing: existing.lineSpacing ?? 28,
    paperColor: existing.paperColor ?? "#FAFAF8",
    version: existing.version ?? "1.0.0",
    description:
      existing.description ??
      `${toTitleCase(id)} notebook asset pack generated from page_01.jpg.`,
    renderMode: existing.renderMode ?? (category === "premium" ? "premium" : "photo"),
  };
}

function analyzeRows(raw, width, height, metadata) {
  const sampleLeft = Math.floor(width * 0.2);
  const sampleRight = Math.floor(width * 0.82);
  const rowBrightness = new Array(height).fill(0);

  for (let y = 0; y < height; y++) {
    let sum = 0;
    let count = 0;
    for (let x = sampleLeft; x < sampleRight; x += 2) {
      const idx = (y * width + x) * 3;
      sum += (raw[idx] + raw[idx + 1] + raw[idx + 2]) / 3;
      count++;
    }
    rowBrightness[y] = sum / Math.max(count, 1);
  }

  const rowScore = new Array(height).fill(0);
  for (let y = 6; y < height - 6; y++) {
    let neighborSum = 0;
    let neighborCount = 0;
    for (let dy = -6; dy <= 6; dy++) {
      if (Math.abs(dy) <= 1) continue;
      neighborSum += rowBrightness[y + dy];
      neighborCount++;
    }
    rowScore[y] = neighborSum / neighborCount - rowBrightness[y];
  }

  const positives = rowScore.filter((score) => score > 0).sort((a, b) => a - b);
  const threshold = Math.max(1.2, positives[Math.floor(positives.length * 0.75)] ?? 1.2);
  const candidates = [];
  let start = -1;
  const scanTop = metadata.header ? Math.floor(height * 0.16) : Math.floor(height * 0.04);
  const scanBottom = Math.floor(height * 0.96);

  for (let y = scanTop; y < scanBottom; y++) {
    const isLine = rowScore[y] >= threshold;
    if (isLine && start === -1) start = y;
    if ((!isLine || y === scanBottom - 1) && start !== -1) {
      const end = isLine && y === scanBottom - 1 ? y : y - 1;
      const thickness = end - start + 1;
      if (thickness <= 7) {
        candidates.push(Math.round((start + end) / 2));
      }
      start = -1;
    }
  }

  const lineYs = [];
  for (const y of candidates) {
    if (lineYs.length === 0 || y - lineYs[lineYs.length - 1] > 8) {
      lineYs.push(y);
    }
  }

  const spacings = [];
  for (let i = 1; i < lineYs.length; i++) {
    const spacing = lineYs[i] - lineYs[i - 1];
    if (spacing >= 12 && spacing <= 80) spacings.push(spacing);
  }

  const lineSpacing = Math.round(median(spacings)) || 28;
  const normalizedLines = lineYs.filter((y, index) => {
    if (index === 0 || spacings.length === 0) return true;
    const previous = lineYs[index - 1];
    const distance = y - previous;
    return distance >= lineSpacing * 0.65 && distance <= lineSpacing * 1.45;
  });

  while (
    normalizedLines.length > 1 &&
    normalizedLines[normalizedLines.length - 1] + lineSpacing < scanBottom - lineSpacing
  ) {
    normalizedLines.push(normalizedLines[normalizedLines.length - 1] + lineSpacing);
  }

  const firstLine = normalizedLines[0] ?? Math.round(height * 0.12);
  const lastLine = normalizedLines[normalizedLines.length - 1] ?? Math.round(height * 0.88);
  const color = sampleLineColor(raw, width, firstLine);

  return {
    lineCount: normalizedLines.length,
    lineSpacing,
    baseline: firstLine,
    firstLine,
    lastLine,
    color,
  };
}

function sampleLineColor(raw, width, y) {
  let r = 0;
  let g = 0;
  let b = 0;
  let count = 0;
  const start = Math.floor(width * 0.18);
  const end = Math.floor(width * 0.82);

  for (let x = start; x < end; x += 8) {
    const idx = (y * width + x) * 3;
    r += raw[idx];
    g += raw[idx + 1];
    b += raw[idx + 2];
    count++;
  }

  return hexFromRgb(r / count, g / count, b / count);
}

function detectWriteArea(raw, width, height, lines, metadata) {
  const left = detectLeftMargin(raw, width, height, lines.firstLine, lines.lastLine, metadata);
  const right = Math.max(24, Math.round(width * 0.04));
  const header = metadata.header ? Math.max(72, Math.round(lines.firstLine - lines.lineSpacing)) : 0;
  const footer = metadata.footer ? Math.max(24, Math.round(height - lines.lastLine)) : 0;
  const top = Math.max(0, Math.round(lines.firstLine - lines.lineSpacing));
  const bottom = Math.max(0, Math.round(height - lines.lastLine));

  return {
    top,
    bottom,
    left,
    right,
    header,
    footer,
    usableWidth: Math.max(1, width - left - right),
    usableHeight: Math.max(1, height - top - bottom),
  };
}

function detectLeftMargin(raw, width, height, firstLine, lastLine, metadata) {
  if (metadata.checkbox) return Math.round(width * 0.1);
  if (metadata.spiral) return Math.round(width * 0.12);

  const yStart = Math.max(0, firstLine);
  const yEnd = Math.min(height - 1, lastLine);
  const columnScores = [];

  for (let x = 0; x < Math.floor(width * 0.35); x += 2) {
    let darkness = 0;
    let count = 0;
    for (let y = yStart; y <= yEnd; y += 8) {
      const idx = (y * width + x) * 3;
      darkness += 255 - (raw[idx] + raw[idx + 1] + raw[idx + 2]) / 3;
      count++;
    }
    columnScores.push({ x, score: darkness / Math.max(count, 1) });
  }

  const strong = columnScores.find((col) => col.score > 18);
  return strong ? Math.max(32, strong.x + 16) : Math.round(width * 0.08);
}

function generateReadme(metadata, writeArea, lines) {
  return `# ${metadata.name}

## Overview

**Brand:** ${metadata.brand}
**Country:** ${metadata.country}
**Category:** ${metadata.category}
**Paper Size:** ${metadata.paperSize}
**Orientation:** ${metadata.orientation}
**Render Mode:** ${metadata.renderMode}

## Description

${metadata.description}

## Asset Pack

| File | Purpose |
| --- | --- |
| \`page_01.jpg\` | Source notebook page image |
| \`thumbnail.webp\` | 200x260 selector thumbnail |
| \`preview.webp\` | 400x520 notebook preview |
| \`metadata.json\` | Notebook identity and rendering metadata |
| \`write-area.json\` | Writable area boundaries in source-image pixels |
| \`lines.json\` | Ruled-line detection result |
| \`mask.png\` | Writable area mask, white for writable pixels and black for protected pixels |

## Write Area

\`\`\`json
${JSON.stringify(writeArea, null, 2)}
\`\`\`

## Lines

\`\`\`json
${JSON.stringify(lines, null, 2)}
\`\`\`
`;
}

export class NotebookAssetAnalyzer {
  async analyzeFolder(folderPath) {
    const pagePath = path.join(folderPath, "page_01.jpg");
    if (!fs.existsSync(pagePath)) {
      throw new Error(`NotebookAssetAnalyzer: ${pagePath} was not found`);
    }

    const image = sharp(pagePath);
    const imageMetadata = await image.metadata();
    const { data, info } = await image.removeAlpha().raw().toBuffer({ resolveWithObject: true });
    const existingMetadata = readJson(path.join(folderPath, "metadata.json"));
    const metadata = inferMetadata(folderPath, imageMetadata, existingMetadata);
    const lines = analyzeRows(data, info.width, info.height, metadata);
    const writeArea = detectWriteArea(data, info.width, info.height, lines, metadata);

    writeJson(path.join(folderPath, "metadata.json"), metadata);
    writeJson(path.join(folderPath, "write-area.json"), writeArea);
    writeJson(path.join(folderPath, "lines.json"), lines);

    await this.generateImages(folderPath, pagePath, imageMetadata, writeArea);

    fs.writeFileSync(
      path.join(folderPath, "README.md"),
      generateReadme(metadata, writeArea, lines)
    );

    return { metadata, writeArea, lines };
  }

  async generateImages(folderPath, pagePath, imageMetadata, writeArea) {
    await sharp(pagePath)
      .resize(200, 260, { fit: "cover", position: "top" })
      .webp({ quality: 82 })
      .toFile(path.join(folderPath, "thumbnail.webp"));

    await sharp(pagePath)
      .resize(400, 520, { fit: "cover", position: "top" })
      .webp({ quality: 86 })
      .toFile(path.join(folderPath, "preview.webp"));

    const writableTop = writeArea.top + writeArea.header;
    const svg = `
      <svg width="${imageMetadata.width}" height="${imageMetadata.height}" viewBox="0 0 ${imageMetadata.width} ${imageMetadata.height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="black"/>
        <rect x="${writeArea.left}" y="${writableTop}" width="${writeArea.usableWidth}" height="${writeArea.usableHeight}" fill="white"/>
      </svg>
    `;

    await sharp(Buffer.from(svg)).png().toFile(path.join(folderPath, "mask.png"));
  }
}

export function findNotebookSourceFolders(root) {
  if (!fs.existsSync(root)) return [];

  const entries = fs.readdirSync(root, { withFileTypes: true });
  const folders = entries.some((entry) => entry.isFile() && entry.name === "page_01.jpg")
    ? [root]
    : [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      folders.push(...findNotebookSourceFolders(path.join(root, entry.name)));
    }
  }

  return folders;
}
