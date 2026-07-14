"use client";

import type { CameraPreset } from "@/types";
import { createRng, rngRange } from "@/utils/canvas-utils";

export const CAMERA_PRESETS = {
  phone: {
    id: "phone",
    label: "Phone",
    vignette: 0.26,
    grain: 0.08,
    noise: 0.04,
    warmth: 0.18,
    blur: 0,
    chromaticAberration: 0.08,
    scanLines: false,
    paperShadow: true,
    tilt: 0.08,
  },
  scanner: {
    id: "scanner",
    label: "Scanner",
    vignette: 0.04,
    grain: 0.02,
    noise: 0.01,
    warmth: -0.12,
    blur: 0,
    chromaticAberration: 0,
    scanLines: true,
    paperShadow: false,
    tilt: 0,
  },
  dslr: {
    id: "dslr",
    label: "DSLR",
    vignette: 0.32,
    grain: 0.05,
    noise: 0.02,
    warmth: 0.1,
    blur: 1.5,
    chromaticAberration: 0.12,
    scanLines: false,
    paperShadow: true,
    tilt: 0.04,
  },
} satisfies Record<CameraPreset["id"], CameraPreset>;

export class CameraEngine {
  apply(
    ctx: CanvasRenderingContext2D,
    preset: CameraPreset,
    width: number,
    height: number,
    seed: number
  ) {
    if (preset.warmth !== 0) this.applyWarmth(ctx, preset.warmth, width, height);
    if (preset.scanLines) this.applyScanLines(ctx, width, height);
    if (preset.grain > 0 || preset.noise > 0) {
      this.applyGrain(ctx, preset.grain + preset.noise, width, height, seed);
    }
    if (preset.chromaticAberration > 0) {
      this.applyChromaticAberration(ctx, preset.chromaticAberration, width, height);
    }
    if (preset.vignette > 0) this.applyVignette(ctx, preset.vignette, width, height);
    if (preset.paperShadow) this.applyPaperShadow(ctx, width, height);
  }

  applyPreset(
    ctx: CanvasRenderingContext2D,
    preset: CameraPreset,
    width: number,
    height: number,
    seed: number
  ) {
    this.apply(ctx, preset, width, height, seed);
  }

  private applyWarmth(ctx: CanvasRenderingContext2D, warmth: number, width: number, height: number) {
    ctx.save();
    ctx.globalCompositeOperation = warmth > 0 ? "soft-light" : "multiply";
    ctx.fillStyle = warmth > 0
      ? `rgba(255, 202, 130, ${Math.min(Math.abs(warmth), 1) * 0.18})`
      : `rgba(190, 220, 255, ${Math.min(Math.abs(warmth), 1) * 0.16})`;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }

  private applyVignette(ctx: CanvasRenderingContext2D, intensity: number, width: number, height: number) {
    const gradient = ctx.createRadialGradient(
      width * 0.5,
      height * 0.45,
      Math.min(width, height) * 0.2,
      width * 0.5,
      height * 0.45,
      Math.max(width, height) * 0.75
    );
    gradient.addColorStop(0, "rgba(0,0,0,0)");
    gradient.addColorStop(1, `rgba(0,0,0,${Math.min(intensity, 1)})`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }

  private applyGrain(ctx: CanvasRenderingContext2D, intensity: number, width: number, height: number, seed: number) {
    const rng = createRng(seed + 31337);
    const imageData = ctx.getImageData(0, 0, width, height);
    const amount = Math.min(intensity, 1) * 18;

    for (let i = 0; i < imageData.data.length; i += 4) {
      const noise = rngRange(rng, -amount, amount);
      imageData.data[i] = Math.max(0, Math.min(255, imageData.data[i] + noise));
      imageData.data[i + 1] = Math.max(0, Math.min(255, imageData.data[i + 1] + noise));
      imageData.data[i + 2] = Math.max(0, Math.min(255, imageData.data[i + 2] + noise));
    }

    ctx.putImageData(imageData, 0, 0);
  }

  private applyScanLines(ctx: CanvasRenderingContext2D, width: number, height: number) {
    ctx.save();
    ctx.strokeStyle = "rgba(20, 35, 60, 0.035)";
    ctx.lineWidth = 1;
    for (let y = 0; y < height; y += 4) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  private applyChromaticAberration(
    ctx: CanvasRenderingContext2D,
    intensity: number,
    width: number,
    height: number
  ) {
    const offset = Math.max(1, Math.round(intensity * 3));
    const snapshot = document.createElement("canvas");
    snapshot.width = width;
    snapshot.height = height;
    snapshot.getContext("2d")!.drawImage(ctx.canvas, 0, 0);

    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.globalAlpha = 0.08;
    ctx.drawImage(snapshot, offset, 0);
    ctx.globalCompositeOperation = "multiply";
    ctx.drawImage(snapshot, -offset, 0);
    ctx.restore();
  }

  private applyPaperShadow(ctx: CanvasRenderingContext2D, width: number, height: number) {
    const gradient = ctx.createLinearGradient(0, height * 0.72, 0, height);
    gradient.addColorStop(0, "rgba(0,0,0,0)");
    gradient.addColorStop(1, "rgba(0,0,0,0.12)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }
}
