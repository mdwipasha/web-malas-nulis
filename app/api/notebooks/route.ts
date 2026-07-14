import { getAllNotebooks, getNotebookBrands, getNotebookCategories } from "@/lib/notebook-api";

export const dynamic = "force-dynamic";

export async function GET() {
  const notebooks = getAllNotebooks();

  return Response.json({
    notebooks,
    summary: {
      total: notebooks.length,
      categories: getNotebookCategories(),
      brands: getNotebookBrands(),
      countries: [...new Set(notebooks.map((pack) => pack.country))].sort(),
      spiral: notebooks.filter((pack) => pack.spiral).length,
      portrait: notebooks.filter((pack) => pack.orientation === "portrait").length,
      landscape: notebooks.filter((pack) => pack.orientation === "landscape").length,
    },
  });
}
