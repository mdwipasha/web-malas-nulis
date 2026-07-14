"use client";
import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Type, Check, X } from "lucide-react";
import type { AppState } from "@/types";

interface FontUploaderProps {
  customFont: AppState["customFont"];
  onFontLoad: (font: AppState["customFont"]) => void;
}

export function FontUploader({ customFont, onFontLoad }: FontUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFont = async (file: File) => {
    setIsLoading(true);
    setError(null);

    try {
      const url = URL.createObjectURL(file);
      const fontName = `custom-${Date.now()}`;

      const font = new FontFace(fontName, `url(${url})`);
      await font.load();
      document.fonts.add(font);

      onFontLoad({ name: fontName, url });
    } catch (err) {
      setError("Failed to load font. Ensure it's a valid TTF, OTF, or WOFF file.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) loadFont(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) loadFont(file);
  };

  const clearFont = () => {
    onFontLoad(null);
    setError(null);
  };

  return (
    <div className="space-y-2">
      {/* Drop zone */}
      <motion.div
        className={`relative border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
          isDragging
            ? "border-[var(--accent)] bg-[var(--accent-muted)]"
            : "border-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.02)]"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        whileHover={{ scale: 1.01 }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".ttf,.otf,.woff,.woff2"
          className="hidden"
          onChange={handleFileChange}
        />

        {isLoading ? (
          <div className="flex flex-col items-center gap-2 py-2">
            <div className="w-5 h-5 border-2 border-[var(--accent)] border-t-transparent rounded-full spinner" />
            <p className="text-xs text-[var(--text-muted)]">Loading font...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-2">
            <Upload size={18} className="text-[var(--text-muted)]" />
            <div>
              <p className="text-xs font-medium text-[var(--text-secondary)]">
                Drop your font here
              </p>
              <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                TTF · OTF · WOFF · WOFF2
              </p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Loaded font display */}
      <AnimatePresence>
        {customFont && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 px-3 py-2 bg-[var(--accent-muted)] border border-[var(--accent)] rounded-lg"
          >
            <Check size={12} className="text-[var(--accent-hover)] flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-[var(--accent-hover)] truncate">
                Custom font loaded
              </p>
              <p
                className="text-xs text-[var(--text-muted)] truncate mt-0.5"
                style={{ fontFamily: customFont.name }}
              >
                The quick brown fox
              </p>
            </div>
            <button
              onClick={clearFont}
              className="icon-btn w-6 h-6 flex-shrink-0"
            >
              <X size={10} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-xs text-[var(--danger)] px-1"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
