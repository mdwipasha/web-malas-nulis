import { getAllNotebooks, getNotebookSummary } from "@/lib/notebook-api";

export const dynamic = "force-dynamic";

export async function GET() {
  const notebooks = getAllNotebooks();

  return Response.json({
    notebooks,
    summary: getNotebookSummary(),
  });
}
