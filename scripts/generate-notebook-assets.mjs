import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = path.join(process.cwd(), "assets", "notebooks");

function walkNotebookFolders(dir) {
  if (!fs.existsSync(dir)) return [];

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const folders = entries.some((entry) => entry.isFile() && entry.name === "metadata.json")
    ? [dir]
    : [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      folders.push(...walkNotebookFolders(path.join(dir, entry.name)));
    }
  }

  return folders;
}

async function generateNotebookAssets(folder) {
  const pagePath = path.join(folder, "page_01.jpg");
  const writeAreaPath = path.join(folder, "write-area.json");
  const writeArea = JSON.parse(fs.readFileSync(writeAreaPath, "utf8"));
  const metadata = await sharp(pagePath).metadata();

  await sharp(pagePath)
    .resize(200, 260, { fit: "cover", position: "top" })
    .webp({ quality: 82 })
    .toFile(path.join(folder, "thumbnail.webp"));

  await sharp(pagePath)
    .resize(400, 520, { fit: "cover", position: "top" })
    .webp({ quality: 86 })
    .toFile(path.join(folder, "preview.webp"));

  const writableTop = writeArea.top + writeArea.header;
  const svg = `
    <svg width="${metadata.width}" height="${metadata.height}" viewBox="0 0 ${metadata.width} ${metadata.height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="black"/>
      <rect x="${writeArea.left}" y="${writableTop}" width="${writeArea.usableWidth}" height="${writeArea.usableHeight}" fill="white"/>
    </svg>
  `;

  await sharp(Buffer.from(svg)).png().toFile(path.join(folder, "mask.png"));
}

for (const folder of walkNotebookFolders(root)) {
  await generateNotebookAssets(folder);
  console.log(path.relative(process.cwd(), folder));
}
