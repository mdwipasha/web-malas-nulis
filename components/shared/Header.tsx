"use client";
import React from "react";
import { motion } from "framer-motion";
import { Pen, Shuffle, RefreshCw, Sparkles } from "lucide-react";

interface HeaderProps {
  onRandomize: () => void;
  onRegenerate: () => void;
}

export function Header({ onRandomize, onRegenerate }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-5 py-3 border-b border-[var(--border)] bg-[var(--bg)] flex-shrink-0 relative z-10">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{
            background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
            boxShadow: "0 2px 12px rgba(99,102,241,0.4)",
          }}
        >
          <Pen size={16} color="white" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-[var(--text-primary)] leading-none">
            WriteBook{" "}
            <span className="gradient-text">AI</span>
          </h1>
          <p className="text-[10px] text-[var(--text-muted)] leading-tight mt-0.5">
            Realistic handwriting generator
          </p>
        </div>
      </div>

      {/* Center: tagline */}
      <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[var(--border)] bg-[var(--bg-card)]">
        <Sparkles size={11} className="text-[var(--accent-hover)]" />
        <span className="text-[11px] text-[var(--text-muted)]">
          Every page looks naturally different
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <motion.button
          className="btn-secondary text-xs py-1.5 px-3"
          onClick={onRegenerate}
          whileTap={{ scale: 0.95 }}
          title="Generate a new random variation"
        >
          <RefreshCw size={12} />
          Regenerate
        </motion.button>

        <motion.button
          className="btn-primary text-xs py-1.5 px-3"
          onClick={onRandomize}
          whileTap={{ scale: 0.95 }}
          title="Randomize everything"
        >
          <Shuffle size={12} />
          Randomize
        </motion.button>
      </div>
    </header>
  );
}
