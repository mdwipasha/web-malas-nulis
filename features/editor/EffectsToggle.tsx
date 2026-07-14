"use client";
import React from "react";
import { motion } from "framer-motion";
import type { AppState } from "@/types";
import {
  Waves,
  Wind,
  Coffee,
  Clock,
  Box,
  Bookmark,
  Scan,
  Camera,
} from "lucide-react";

interface EffectsToggleProps {
  effects: AppState["effects"];
  onToggle: (key: keyof AppState["effects"]) => void;
}

const EFFECTS = [
  {
    key: "noise" as const,
    label: "Paper Noise",
    icon: Waves,
    description: "Texture grain",
  },
  {
    key: "wrinkles" as const,
    label: "Wrinkles",
    icon: Wind,
    description: "Subtle creases",
  },
  {
    key: "coffeeStain" as const,
    label: "Coffee Stain",
    icon: Coffee,
    description: "Ring stain",
  },
  {
    key: "oldPaper" as const,
    label: "Old Paper",
    icon: Clock,
    description: "Aged yellowing",
  },
  {
    key: "shadow" as const,
    label: "Page Shadow",
    icon: Box,
    description: "Edge shadows",
  },
  {
    key: "curl" as const,
    label: "Page Curl",
    icon: Bookmark,
    description: "Corner curl",
  },
  {
    key: "scanner" as const,
    label: "Scanner",
    icon: Scan,
    description: "Scanned look",
  },
  {
    key: "camera" as const,
    label: "Camera",
    icon: Camera,
    description: "Phone photo",
  },
];

export function EffectsToggle({ effects, onToggle }: EffectsToggleProps) {
  return (
    <div className="grid grid-cols-2 gap-1.5">
      {EFFECTS.map(({ key, label, icon: Icon, description }) => {
        const active = effects[key];
        return (
          <motion.button
            key={key}
            className={`effect-toggle ${active ? "active" : ""}`}
            whileTap={{ scale: 0.95 }}
            onClick={() => onToggle(key)}
          >
            <div
              className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 ${
                active
                  ? "bg-[var(--accent)] text-white"
                  : "bg-[rgba(255,255,255,0.06)] text-[var(--text-muted)]"
              }`}
            >
              <Icon size={12} />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <div className="text-xs font-medium truncate">{label}</div>
              <div className="text-[9px] text-[var(--text-muted)] truncate">
                {description}
              </div>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
