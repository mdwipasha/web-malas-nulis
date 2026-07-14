"use client";
import React from "react";
import { motion } from "framer-motion";
import { HANDWRITING_STYLES } from "@/lib/styles-config";

interface StyleSelectorProps {
  selectedId: string;
  onSelect: (id: string) => void;
}

const STYLE_DESCRIPTIONS: Record<string, string> = {
  "neat-student": "Clean & organized",
  "messy-student": "Careless scrawl",
  "fast-writing": "Rushed notes",
  elegant: "Flowing cursive",
  teacher: "Chalkboard style",
  female: "Rounded loops",
  male: "Block print",
  child: "Wobbly letters",
  sketchy: "Artistic draft",
  engineering: "Technical print",
  medical: "Doctor scrawl",
};

export function StyleSelector({ selectedId, onSelect }: StyleSelectorProps) {
  return (
    <div className="space-y-1.5">
      {HANDWRITING_STYLES.map((style) => (
        <motion.button
          key={style.id}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all border ${
            selectedId === style.id
              ? "bg-[var(--accent-muted)] border-[var(--accent)] text-[var(--accent-hover)]"
              : "border-transparent hover:bg-[rgba(255,255,255,0.04)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect(style.id)}
        >
          {/* Sample text in the style */}
          <div
            className="w-20 flex-shrink-0 text-center py-0.5 rounded overflow-hidden"
            style={{
              fontFamily: style.fontFamily,
              fontSize: "14px",
              color: selectedId === style.id ? "#6366f1" : "#a1a1aa",
              lineHeight: 1,
              background: "rgba(0,0,0,0.2)",
              padding: "3px 6px",
              borderRadius: "4px",
            }}
          >
            Abc
          </div>

          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold truncate">{style.label}</div>
            <div className="text-[10px] text-[var(--text-muted)] truncate">
              {STYLE_DESCRIPTIONS[style.id]}
            </div>
          </div>

          {/* Randomness indicator */}
          <div className="flex gap-0.5 flex-shrink-0">
            {Array.from({ length: 3 }).map((_, i) => {
              const level = Math.ceil(
                (style.rotationRange + style.shakiness * 10) / 7
              );
              return (
                <div
                  key={i}
                  className="w-1 rounded-full"
                  style={{
                    height: `${8 + i * 3}px`,
                    background:
                      i < level
                        ? selectedId === style.id
                          ? "#818cf8"
                          : "rgba(255,255,255,0.2)"
                        : "rgba(255,255,255,0.06)",
                  }}
                />
              );
            })}
          </div>
        </motion.button>
      ))}
    </div>
  );
}
