// ============================================================
// Ink Colors Configuration
// ============================================================
import type { InkColor } from "@/types";

export const INK_COLORS: InkColor[] = [
  {
    id: "blue",
    label: "Blue",
    hex: "#1a4fbd",
    opacity: 0.9,
  },
  {
    id: "black",
    label: "Black",
    hex: "#1a1a1a",
    opacity: 0.92,
  },
  {
    id: "dark-blue",
    label: "Dark Blue",
    hex: "#0d2e7a",
    opacity: 0.93,
  },
  {
    id: "purple",
    label: "Purple",
    hex: "#6b2fba",
    opacity: 0.88,
  },
  {
    id: "green",
    label: "Green",
    hex: "#1a6b3c",
    opacity: 0.88,
  },
  {
    id: "red",
    label: "Red",
    hex: "#c0141c",
    opacity: 0.9,
  },
  {
    id: "pencil",
    label: "Pencil Gray",
    hex: "#5a5a5a",
    opacity: 0.72,
  },
];

export const DEFAULT_INK_ID = "blue";

export const getInkColor = (id: string): InkColor =>
  INK_COLORS.find((c) => c.id === id) ?? INK_COLORS[0];
