"use client";

import { useRef, useEffect, useCallback } from "react";
import type { PipelineState } from "@/lib/constants";

interface WaveVisualizerProps {
  state: PipelineState;
  getAmplitude: () => number;
}

// State color palettes — each state gets a primary and secondary color
const STATE_PALETTES: Record<PipelineState, { colors: string[]; glowColor: string }> = {
  idle: {
    colors: ["rgba(139,92,246,0.35)", "rgba(168,85,247,0.20)", "rgba(192,132,252,0.12)", "rgba(139,92,246,0.06)"],
    glowColor: "139,92,246",
  },
  listening: {
    colors: ["rgba(52,211,153,0.50)", "rgba(16,185,129,0.30)", "rgba(110,231,183,0.18)", "rgba(52,211,153,0.08)"],
    glowColor: "16,185,129",
  },
  thinking: {
    colors: ["rgba(251,191,36,0.45)", "rgba(245,158,11,0.28)", "rgba(252,211,77,0.15)", "rgba(251,191,36,0.07)"],
    glowColor: "245,158,11",
  },
  speaking: {
    colors: ["rgba(34,211,238,0.50)", "rgba(6,182,212,0.32)", "rgba(103,232,249,0.18)", "rgba(34,211,238,0.08)"],
    glowColor: "6,182,212",
  },
};

// Wave configuration — each layer has different characteristics
const WAVE_LAYERS = [
  { frequency: 0.015, speed: 0.8,  baseAmplitude: 0.35, amplitudeScale: 1.0,  phaseOffset: 0 },
  { frequency: 0.020, speed: 1.2,  baseAmplitude: 0.25, amplitudeScale: 0.8,  phaseOffset: 2.1 },
  { frequency: 0.028, speed: 1.6,  baseAmplitude: 0.18, amplitudeScale: 0.6,  phaseOffset: 4.2 },
  { frequency: 0.035, speed: 2.0,  baseAmplitude: 0.10, amplitudeScale: 0.35, phaseOffset: 1.0 },
];

export default function WaveVisualizer({ state, getAmplitude }: WaveVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const timeRef = useRef(0);
  const smoothAmpRef = useRef(0);
  const currentColorsRef = useRef(STATE_PALETTES.idle.colors.map(() => ({ r: 0, g: 0, b: 0, a: 0 })));
  const currentGlowRef = useRef({ r: 139, g: 92, b: 246 });

  const parseRGBA = useCallback((rgba: string) => {
    const match = rgba.match(/rgba?\((\d+),(\d+),(\d+),?([\d.]*)\)/);
    if (!match) return { r: 0, g: 0, b: 0, a: 0 };
    return { r: +match[1], g: +match[2], b: +match[3], a: match[4] ? +match[4] : 1 };
  }, []);

  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    // Initialize parsed colors
    const palette = STATE_PALETTES[state];
    currentColorsRef.current = palette.colors.map(c => parseRGBA(c));
    const gc = palette.glowColor.split(",").map(Number);
    currentGlowRef.current = { r: gc[0], g: gc[1], b: gc[2] };

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const W = rect.width;
      const H = rect.height;

      // Smooth amplitude
      const rawAmp = getAmplitude();
      const targetAmp = Math.min(rawAmp * 6, 1.0);
      smoothAmpRef.current += (targetAmp - smoothAmpRef.current) * 0.08;

      // State-dependent amplitude adjustments
      let amp = smoothAmpRef.current;
      const t = timeRef.current;
      if (state === "idle") {
        amp = 0.05 + 0.03 * Math.sin(t * 0.5);
      } else if (state === "listening") {
        amp = Math.max(amp, 0.12 + 0.06 * Math.sin(t * 1.0));
      } else if (state === "thinking") {
        amp = 0.2 + 0.15 * Math.sin(t * 2.0);
      } else if (state === "speaking") {
        amp = Math.max(amp, 0.15);
      }

      // Lerp colors toward target state
      const targetPalette = STATE_PALETTES[state];
      const colorLerp = 0.03;
      for (let i = 0; i < currentColorsRef.current.length; i++) {
        const target = parseRGBA(targetPalette.colors[i]);
        const cur = currentColorsRef.current[i];
        cur.r = lerp(cur.r, target.r, colorLerp);
        cur.g = lerp(cur.g, target.g, colorLerp);
        cur.b = lerp(cur.b, target.b, colorLerp);
        cur.a = lerp(cur.a, target.a, colorLerp);
      }

      const tgc = targetPalette.glowColor.split(",").map(Number);
      currentGlowRef.current.r = lerp(currentGlowRef.current.r, tgc[0], colorLerp);
      currentGlowRef.current.g = lerp(currentGlowRef.current.g, tgc[1], colorLerp);
      currentGlowRef.current.b = lerp(currentGlowRef.current.b, tgc[2], colorLerp);

      // Clear
      ctx.clearRect(0, 0, W, H);

      const centerY = H * 0.5;
      const waveWidth = W * 0.85;
      const startX = (W - waveWidth) / 2;

      // Draw center glow
      const gc = currentGlowRef.current;
      const glowGrad = ctx.createRadialGradient(W / 2, centerY, 0, W / 2, centerY, waveWidth * 0.45);
      glowGrad.addColorStop(0, `rgba(${gc.r},${gc.g},${gc.b},${0.06 + amp * 0.08})`);
      glowGrad.addColorStop(1, `rgba(${gc.r},${gc.g},${gc.b},0)`);
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, W, H);

      // Draw each wave layer (back to front)
      for (let layer = WAVE_LAYERS.length - 1; layer >= 0; layer--) {
        const cfg = WAVE_LAYERS[layer];
        const col = currentColorsRef.current[layer];
        const waveAmp = (cfg.baseAmplitude + amp * cfg.amplitudeScale) * H * 0.35;

        ctx.beginPath();
        ctx.moveTo(startX, centerY);

        // Draw top half of wave
        for (let x = 0; x <= waveWidth; x += 2) {
          const normalizedX = x / waveWidth;
          // Gaussian envelope — waves taper at edges
          const envelope = Math.exp(-Math.pow((normalizedX - 0.5) * 2.5, 2));
          const y = Math.sin(x * cfg.frequency + t * cfg.speed + cfg.phaseOffset) * waveAmp * envelope;
          ctx.lineTo(startX + x, centerY + y);
        }

        // Mirror — draw bottom half going back
        for (let x = waveWidth; x >= 0; x -= 2) {
          const normalizedX = x / waveWidth;
          const envelope = Math.exp(-Math.pow((normalizedX - 0.5) * 2.5, 2));
          const y = Math.sin(x * cfg.frequency + t * cfg.speed + cfg.phaseOffset + Math.PI) * waveAmp * envelope;
          ctx.lineTo(startX + x, centerY + y);
        }

        ctx.closePath();

        // Gradient fill
        const grad = ctx.createLinearGradient(startX, centerY - waveAmp, startX, centerY + waveAmp);
        const alphaBoost = 1 + amp * 0.5;
        grad.addColorStop(0, `rgba(${col.r},${col.g},${col.b},${col.a * alphaBoost * 0.7})`);
        grad.addColorStop(0.5, `rgba(${col.r},${col.g},${col.b},${col.a * alphaBoost})`);
        grad.addColorStop(1, `rgba(${col.r},${col.g},${col.b},${col.a * alphaBoost * 0.7})`);
        ctx.fillStyle = grad;
        ctx.fill();

        // Subtle stroke on the first two layers
        if (layer < 2) {
          ctx.strokeStyle = `rgba(${col.r},${col.g},${col.b},${col.a * 0.5})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      // Draw center line
      ctx.beginPath();
      const lineAlpha = 0.03 + amp * 0.04;
      ctx.strokeStyle = `rgba(${gc.r},${gc.g},${gc.b},${lineAlpha})`;
      ctx.lineWidth = 1;
      ctx.moveTo(startX + waveWidth * 0.1, centerY);
      ctx.lineTo(startX + waveWidth * 0.9, centerY);
      ctx.stroke();

      timeRef.current += 0.016; // ~60fps
      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animRef.current);
    };
  }, [state, getAmplitude, parseRGBA]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ display: "block" }}
    />
  );
}
