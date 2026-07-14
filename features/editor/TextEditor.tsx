"use client";
import React, { useRef } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Upload,
  RotateCcw,
  Hash,
  AlignLeft,
  BookOpen,
} from "lucide-react";

interface TextEditorProps {
  text: string;
  onChange: (text: string) => void;
  wordCount: number;
  charCount: number;
  estimatedPages: number;
}

export function TextEditor({
  text,
  onChange,
  wordCount,
  charCount,
  estimatedPages,
}: TextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const txtInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.name.endsWith(".txt")) {
      const text = await file.text();
      onChange(text);
    } else if (file.name.endsWith(".docx")) {
      try {
        const mammoth = (await import("mammoth")).default;
        const buffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer: buffer });
        onChange(result.value);
      } catch (err) {
        console.error("DOCX import failed:", err);
      }
    }

    // Reset input
    e.target.value = "";
  };

  const clearText = () => onChange("");

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    // Allow normal paste behavior
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-3 border-b border-[var(--border)]">
        <div className="flex items-center gap-1.5 flex-1">
          <FileText size={14} className="text-[var(--text-muted)]" />
          <span className="text-xs font-medium text-[var(--text-secondary)]">
            Text Input
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Import TXT */}
          <button
            className="icon-btn relative group"
            title="Import TXT"
            onClick={() => txtInputRef.current?.click()}
          >
            <Upload size={13} />
            <span className="tooltip">Import TXT / DOCX</span>
          </button>
          <input
            ref={txtInputRef}
            type="file"
            accept=".txt,.docx"
            className="hidden"
            onChange={handleFileUpload}
          />

          {/* Clear */}
          <button
            className="icon-btn group"
            title="Clear text"
            onClick={clearText}
          >
            <RotateCcw size={13} />
            <span className="tooltip">Clear</span>
          </button>
        </div>
      </div>

      {/* Textarea */}
      <div className="flex-1 relative overflow-hidden">
        <textarea
          className="input-field h-full rounded-none border-0 border-none resize-none text-sm leading-relaxed"
          style={{
            borderRadius: 0,
            border: "none",
            outline: "none",
            background: "var(--bg-elevated)",
            padding: "16px",
            fontFamily: "inherit",
          }}
          placeholder="Type or paste your text here...

You can also import a .txt or .docx file using the button above.

Your text will be rendered as realistic handwriting on notebook paper."
          value={text}
          onChange={(e) => onChange(e.target.value)}
          onPaste={handlePaste}
          spellCheck={false}
        />
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-4 px-4 py-2.5 border-t border-[var(--border)] bg-[var(--bg)]">
        <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
          <AlignLeft size={11} />
          <span>
            <span className="text-[var(--text-secondary)] font-medium">
              {wordCount.toLocaleString()}
            </span>{" "}
            words
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
          <Hash size={11} />
          <span>
            <span className="text-[var(--text-secondary)] font-medium">
              {charCount.toLocaleString()}
            </span>{" "}
            chars
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] ml-auto">
          <BookOpen size={11} />
          <span>
            <span className="text-[var(--text-secondary)] font-medium">
              ~{estimatedPages}
            </span>{" "}
            page{estimatedPages !== 1 ? "s" : ""}
          </span>
        </div>
      </div>
    </div>
  );
}
