"use client";
import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { getTemplatesByCategory } from "@/lib/templates-config";
import type { NotebookPack, NotebookTemplate } from "@/types";
import { notebookPackToTemplate, toNotebookTemplateId } from "@/lib/notebook-template-adapter";

interface TemplateSelectorProps {
  selectedId: string;
  onSelect: (id: string) => void;
}

// Mini paper preview renderer
function TemplateMiniPreview({
  template,
  thumbnailPath,
}: {
  template: NotebookTemplate;
  thumbnailPath?: string;
}) {
  return (
    <div
      className="w-full aspect-[3/4] relative overflow-hidden rounded-sm"
      style={{ background: template.paperColor }}
    >
      {thumbnailPath && (
        <div
          className="absolute inset-0 bg-cover bg-top"
          style={{ backgroundImage: `url(${thumbnailPath})` }}
        />
      )}

      {/* Grid lines */}
      {!thumbnailPath && template.hasGrid && template.gridSize && (
        <>
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={`gh-${i}`}
              className="absolute w-full"
              style={{
                top: `${i * 12.5}%`,
                height: "1px",
                background: template.lineColor,
                opacity: 0.6,
              }}
            />
          ))}
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={`gv-${i}`}
              className="absolute h-full"
              style={{
                left: `${i * 16.67}%`,
                width: "1px",
                background: template.lineColor,
                opacity: 0.6,
              }}
            />
          ))}
        </>
      )}

      {/* Ruled lines */}
      {!thumbnailPath && template.hasLines &&
        Array.from({ length: 8 }).map((_, i) => (
          <div
            key={`line-${i}`}
            className="absolute w-full"
            style={{
              top: `${10 + i * 12}%`,
              height: "1px",
              background: template.lineColor,
              opacity: 0.8,
            }}
          />
        ))}

      {/* Margin line */}
      {!thumbnailPath && template.hasMargin && (
        <div
          className="absolute h-full"
          style={{
            left: "20%",
            width: "1px",
            background: template.marginColor,
            opacity: 0.9,
          }}
        />
      )}

      {/* Hole punches */}
      {!thumbnailPath && template.hasHoles && (
        <>
          {[25, 50, 75].map((y) => (
            <div
              key={`hole-${y}`}
              className="absolute rounded-full"
              style={{
                left: "3px",
                top: `${y}%`,
                transform: "translateY(-50%)",
                width: "6px",
                height: "6px",
                background: "rgba(200,200,200,0.8)",
                border: "1px solid rgba(0,0,0,0.1)",
              }}
            />
          ))}
        </>
      )}

      {/* Simulated text lines */}
      {!thumbnailPath && Array.from({ length: 5 }).map((_, i) => (
        <div
          key={`text-${i}`}
          className="absolute rounded-full"
          style={{
            top: `${20 + i * 14}%`,
            left: template.hasMargin ? "25%" : "8%",
            right: "8%",
            height: "2px",
            background: "rgba(80,80,80,0.25)",
            width: `${60 + Math.sin(i * 1.7) * 20}%`,
            borderRadius: "2px",
          }}
        />
      ))}
    </div>
  );
}

export function TemplateSelector({ selectedId, onSelect }: TemplateSelectorProps) {
  const [notebookPacks, setNotebookPacks] = useState<NotebookPack[]>([]);
  const byCategory = getTemplatesByCategory();
  const assetPackTemplates = useMemo(
    () =>
      notebookPacks.map((pack) => ({
        pack,
        template: notebookPackToTemplate(pack),
      })),
    [notebookPacks]
  );

  useEffect(() => {
    let cancelled = false;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;

    const loadNotebooks = (attempt = 0) => {
      fetch("/api/notebooks")
        .then((res) => (res.ok ? res.json() : Promise.reject(res)))
        .then((payload: { notebooks: NotebookPack[] }) => {
          if (!cancelled) setNotebookPacks(payload.notebooks);
        })
        .catch(() => {
          if (cancelled) return;
          if (attempt < 3) {
            retryTimer = setTimeout(() => loadNotebooks(attempt + 1), 1000);
            return;
          }
          setNotebookPacks([]);
        });
    };

    loadNotebooks();

    return () => {
      cancelled = true;
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, []);

  return (
    <div className="space-y-4">
      {assetPackTemplates.length > 0 && (
        <div>
          <div className="control-label mb-2 px-1">Asset Packs</div>
          <div className="grid grid-cols-2 gap-2">
            {assetPackTemplates.map(({ pack, template }) => {
              const templateId = toNotebookTemplateId(pack.id);

              return (
                <motion.div
                  key={templateId}
                  className={`template-card ${selectedId === templateId ? "active" : ""}`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onSelect(templateId)}
                >
                  <TemplateMiniPreview
                    template={template}
                    thumbnailPath={pack.thumbnailPath ?? pack.previewPath ?? pack.pagePath}
                  />
                  <div
                    className="px-2 py-1.5 text-center"
                    style={{ background: "var(--bg-card)" }}
                  >
                    <p className="text-xs font-medium text-[var(--text-secondary)] truncate">
                      {template.label}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {Object.entries(byCategory).map(([category, templates]) => (
        <div key={category}>
          <div className="control-label mb-2 px-1">{category}</div>
          <div className="grid grid-cols-2 gap-2">
            {templates.map((template) => (
              <motion.div
                key={template.id}
                className={`template-card ${selectedId === template.id ? "active" : ""}`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelect(template.id)}
              >
                <TemplateMiniPreview template={template} />
                <div
                  className="px-2 py-1.5 text-center"
                  style={{ background: "var(--bg-card)" }}
                >
                  <p className="text-xs font-medium text-[var(--text-secondary)] truncate">
                    {template.label}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
