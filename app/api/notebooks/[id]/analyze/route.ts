import { getNotebook } from "@/lib/notebook-api";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  ctx: RouteContext<"/api/notebooks/[id]/analyze">
) {
  const { id } = await ctx.params;
  const notebook = getNotebook(id);

  if (!notebook) {
    return Response.json({ error: `Notebook "${id}" was not found` }, { status: 404 });
  }

  const url = new URL(request.url);
  const format = url.searchParams.get("format") ?? "json";

  if (format !== "json") {
    return Response.json(
      {
        error:
          "Server-side binary thumbnail generation is not enabled. Use NotebookAnalyzer in the browser for Canvas-generated previews.",
      },
      { status: 400 }
    );
  }

  return Response.json({
    notebook,
    imageUrl: notebook.pagePath,
    metadata: notebook.metadata,
    writeArea: notebook.writeArea,
    lines: notebook.lines,
    analyzer: {
      engine: "NotebookAnalyzer",
      runtime: "browser-canvas",
      outputs: ["thumbnailDataUrl", "previewDataUrl", "maskDataUrl", "readme"],
    },
  });
}
