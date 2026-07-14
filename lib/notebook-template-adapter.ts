import type { NotebookPack, NotebookTemplate } from "@/types";

export const NOTEBOOK_TEMPLATE_PREFIX = "notebook:";

export function toNotebookTemplateId(notebookId: string): string {
  return `${NOTEBOOK_TEMPLATE_PREFIX}${notebookId}`;
}

export function fromNotebookTemplateId(templateId: string): string | null {
  return templateId.startsWith(NOTEBOOK_TEMPLATE_PREFIX)
    ? templateId.slice(NOTEBOOK_TEMPLATE_PREFIX.length)
    : null;
}

export function notebookPackToTemplate(pack: NotebookPack): NotebookTemplate {
  const nativeHeight = pack.writeArea.top + pack.writeArea.usableHeight + pack.writeArea.bottom;

  return {
    id: toNotebookTemplateId(pack.id),
    label: pack.name,
    category: `Asset Packs / ${pack.category}`,
    paperColor: pack.metadata.paperColor,
    lineColor: pack.lines.color,
    marginColor: "rgba(210, 80, 90, 0.55)",
    lineSpacing: pack.lines.lineSpacing,
    marginLeft: pack.writeArea.left,
    marginRight: pack.writeArea.right,
    marginTop: Math.max(0, pack.lines.firstLine - pack.lines.lineSpacing),
    marginBottom: Math.max(0, nativeHeight - pack.lines.lastLine),
    hasLines: true,
    hasMargin: pack.writeArea.left > 40,
    hasGrid: false,
    hasHoles: pack.spiral,
    hasHeader: pack.metadata.header,
    hasCheckboxes: pack.metadata.checkbox,
    paperTexture: "smooth",
    shadowIntensity: 0.35,
    description: pack.metadata.description ?? pack.name,
  };
}
