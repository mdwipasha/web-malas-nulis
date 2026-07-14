"use client";
import React from "react";
import { motion } from "framer-motion";
import { INK_COLORS } from "@/lib/ink-config";
import { Check } from "lucide-react";

interface InkSelectorProps {
  selectedId: string;
  onSelect: (id: string) => void;
}

export function InkSelector({ selectedId, onSelect }: InkSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {INK_COLORS.map((ink) => (
        <motion.button
          key={ink.id}
          className="relative group flex flex-col items-center gap-1.5"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelect(ink.id)}
          title={ink.label}
        >
          <div
            className={`ink-dot ${selectedId === ink.id ? "active" : ""}`}
            style={{
              background: ink.hex,
              opacity: ink.opacity,
              borderColor: selectedId === ink.id ? "white" : "transparent",
            }}
          >
            {selectedId === ink.id && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <Check size={10} color="white" strokeWidth={3} />
              </motion.div>
            )}
          </div>
          <span className="text-[9px] text-[var(--text-muted)] text-center leading-tight max-w-[36px]">
            {ink.label}
          </span>
        </motion.button>
      ))}
    </div>
  );
}
