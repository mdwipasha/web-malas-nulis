import fs from "node:fs";
import path from "node:path";

export const dynamic = "force-dynamic";

const NOTEBOOK_ROOT = path.join(process.cwd(), "assets", "notebooks");

const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".json": "application/json",
  ".md": "text/markdown; charset=utf-8",
};

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/notebooks/assets/[...path]">
) {
  const params = await ctx.params;
  const relativePath = params.path.join(path.sep);
  const targetPath = path.normalize(path.join(NOTEBOOK_ROOT, relativePath));

  if (!targetPath.startsWith(NOTEBOOK_ROOT + path.sep)) {
    return Response.json({ error: "Invalid notebook asset path" }, { status: 400 });
  }

  if (!fs.existsSync(targetPath) || !fs.statSync(targetPath).isFile()) {
    return Response.json({ error: "Notebook asset was not found" }, { status: 404 });
  }

  const bytes = fs.readFileSync(targetPath);
  const contentType = CONTENT_TYPES[path.extname(targetPath).toLowerCase()] ?? "application/octet-stream";

  return new Response(bytes, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
