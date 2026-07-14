import path from "node:path";
import {
  NotebookAssetAnalyzer,
  findNotebookSourceFolders,
} from "../engines/notebook/asset-analyzer.mjs";

const root = path.join(process.cwd(), "assets", "notebooks");
const analyzer = new NotebookAssetAnalyzer();

for (const folder of findNotebookSourceFolders(root)) {
  await analyzer.analyzeFolder(folder);
  console.log(path.relative(process.cwd(), folder));
}
