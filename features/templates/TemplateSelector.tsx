"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NOTEBOOK_TEMPLATES, getTemplatesByCategory } from "@/lib/templates-config";

interface TemplateSelectorProps {
  selectedId: string;
  onSelect: (id: string) => void;
}

// Mini paper preview renderer
function TemplateMiniPreview({ template }: { template: (typeof NOTEBOOK_TEMPLATES)[0] }) {
  return (
    <div
      className="w-full aspect-[3/4] relative overflow-hidden rounded-sm"
      style={{ background: template.paperColor }}
    >
      {/* Grid lines */}
      {template.hasGrid && template.gridSize && (
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
      {template.hasLines &&
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
      {template.hasMargin && (
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
      {template.hasHoles && (
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
      {Array.from({ length: 5 }).map((_, i) => (
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
  const byCategory = getTemplatesByCategory();

  return (
    <div className="space-y-4">
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
