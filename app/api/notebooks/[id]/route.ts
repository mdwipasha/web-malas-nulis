import { getNotebook } from "@/lib/notebook-api";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, ctx: RouteContext<"/api/notebooks/[id]">) {
  const { id } = await ctx.params;
  const notebook = getNotebook(id);

  if (!notebook) {
    return Response.json({ error: `Notebook "${id}" was not found` }, { status: 404 });
  }

  return Response.json(notebook);
}
