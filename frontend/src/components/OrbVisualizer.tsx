"use client";

import { useRef, useEffect } from "react";
import type { PipelineState } from "@/lib/constants";

interface OrbVisualizerProps {
  state: PipelineState;
  getOutputFrequency: () => Uint8Array | null;
  getMicFrequency: () => Uint8Array | null;
  getAmplitude: () => number;
}

const NUM_POINTS = 64;
const FREQ_BINS = 128;

const STATE_COLORS: Record<PipelineState, { r: number; g: number; b: number }> = {
  idle: { r: 139, g: 92, b: 246 },
  listening: { r: 16, g: 185, b: 129 },
  thinking: { r: 245, g: 158, b: 11 },
  speaking: { r: 6, g: 182, b: 212 },
};

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export default function OrbVisualizer({
  state,
  getOutputFrequency,
  getMicFrequency,
  getAmplitude,
}: OrbVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const timeRef = useRef(0);
  const smoothedRef = useRef(new Float32Array(FREQ_BINS).fill(0));
  const colorRef = useRef({ r: 139, g: 92, b: 246 });
  const smoothAmpRef = useRef(0);

  // Sync props to refs for the animation loop
  const stateRef = useRef(state);
  const getOutputFreqRef = useRef(getOutputFrequency);
  const getMicFreqRef = useRef(getMicFrequency);
  const getAmpRef = useRef(getAmplitude);

  useEffect(() => { stateRef.current = state; }, [state]);
  useEffect(() => { getOutputFreqRef.current = getOutputFrequency; }, [getOutputFrequency]);
  useEffect(() => { getMicFreqRef.current = getMicFrequency; }, [getMicFrequency]);
  useEffect(() => { getAmpRef.current = getAmplitude; }, [getAmplitude]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const W = rect.width;
      const H = rect.height;
      const cx = W / 2;
      const cy = H / 2;
      const currentState = stateRef.current;
      const t = timeRef.current;

      // Smooth amplitude for glow intensity
      const rawAmp = getAmpRef.current();
      smoothAmpRef.current = lerp(smoothAmpRef.current, Math.min(rawAmp * 5, 1), 0.1);
      const amp = smoothAmpRef.current;

      // Responsive sizing
      const baseRadius = Math.min(W, H) * 0.12;
      const maxDisp = baseRadius * 0.45;

      // Get real frequency data based on state
      let rawData: Uint8Array | null = null;
      if (currentState === "listening") {
        rawData = getMicFreqRef.current();
      } else if (currentState === "speaking") {
        rawData = getOutputFreqRef.current();
      }

      // Update smoothed frequency buffer
      const smoothed = smoothedRef.current;
      if (rawData && rawData.length > 0) {
        const sf = currentState === "listening" ? 0.18 : 0.14;
        for (let i = 0; i < FREQ_BINS; i++) {
          const val = i < rawData.length ? rawData[i] / 255 : 0;
          smoothed[i] = lerp(smoothed[i], val, sf);
        }
      } else if (currentState === "thinking") {
        // Energetic pulsing pattern
        const pulse = 0.5 + 0.5 * Math.sin(t * 2.5);
        for (let i = 0; i < FREQ_BINS; i++) {
          const a = (i / FREQ_BINS) * Math.PI * 2;
          const target =
            0.2 * pulse +
            0.15 * Math.sin(a * 4 + t * 3) * pulse +
            0.1 * Math.sin(a * 7 + t * 2) +
            0.05 * Math.sin(i * 0.3 + t * 4);
          smoothed[i] = lerp(smoothed[i], target, 0.1);
        }
      } else {
        // Idle: organic, dreamy deformation
        for (let i = 0; i < FREQ_BINS; i++) {
          const a = (i / FREQ_BINS) * Math.PI * 2;
          const target =
            0.12 +
            0.08 * Math.sin(a * 2 + t * 0.7) +
            0.05 * Math.sin(a * 3 + t * 1.1) +
            0.03 * Math.sin(a * 5 + t * 0.9) +
            0.02 * Math.sin(i * 0.5 + t * 1.5);
          smoothed[i] = lerp(smoothed[i], target, 0.05);
        }
      }

      // Lerp color toward target state
      const tc = STATE_COLORS[currentState];
      const col = colorRef.current;
      col.r = lerp(col.r, tc.r, 0.03);
      col.g = lerp(col.g, tc.g, 0.03);
      col.b = lerp(col.b, tc.b, 0.03);
      const { r, g, b } = col;

      // Subtle slow rotation
      const rotOffset = t * 0.05;

      // Calculate blob points from frequency data
      const points: { x: number; y: number }[] = [];
      for (let i = 0; i < NUM_POINTS; i++) {
        const angle = (i / NUM_POINTS) * Math.PI * 2 - Math.PI / 2 + rotOffset;
        const binIdx = Math.floor((i / NUM_POINTS) * (FREQ_BINS / 2)) * 2;
        const value = smoothed[binIdx];
        const radius = baseRadius + value * maxDisp;
        points.push({
          x: cx + Math.cos(angle) * radius,
          y: cy + Math.sin(angle) * radius,
        });
      }

      ctx.clearRect(0, 0, W, H);

      // Trace smooth closed curve through points using midpoint bezier
      const tracePath = (pts: { x: number; y: number }[]) => {
        ctx.beginPath();
        const last = pts[pts.length - 1];
        const first = pts[0];
        ctx.moveTo((last.x + first.x) / 2, (last.y + first.y) / 2);
        for (let i = 0; i < pts.length; i++) {
          const cur = pts[i];
          const next = pts[(i + 1) % pts.length];
          ctx.quadraticCurveTo(cur.x, cur.y, (cur.x + next.x) / 2, (cur.y + next.y) / 2);
        }
        ctx.closePath();
      };

      // Layer 1: Background radial glow
      const bgGlow = ctx.createRadialGradient(cx, cy, baseRadius * 0.3, cx, cy, baseRadius * 2.5);
      bgGlow.addColorStop(0, `rgba(${r},${g},${b},${0.06 + amp * 0.1})`);
      bgGlow.addColorStop(1, `rgba(${r},${g},${b},0)`);
      ctx.fillStyle = bgGlow;
      ctx.fillRect(0, 0, W, H);

      // Layer 2: Outer glow (blurred larger shape)
      ctx.save();
      ctx.filter = `blur(${Math.round(baseRadius * 0.3)}px)`;
      const glowPts = points.map((p) => ({
        x: cx + (p.x - cx) * 1.25,
        y: cy + (p.y - cy) * 1.25,
      }));
      tracePath(glowPts);
      ctx.fillStyle = `rgba(${r},${g},${b},${0.1 + amp * 0.15})`;
      ctx.fill();
      ctx.restore();

      // Layer 3: Main blob with radial gradient
      tracePath(points);
      const mainGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, baseRadius + maxDisp);
      const mainAlpha = 0.18 + amp * 0.22;
      mainGrad.addColorStop(0, `rgba(255,255,255,${0.06 + amp * 0.08})`);
      mainGrad.addColorStop(0.35, `rgba(${r},${g},${b},${mainAlpha})`);
      mainGrad.addColorStop(0.7, `rgba(${r},${g},${b},${mainAlpha * 0.5})`);
      mainGrad.addColorStop(1, `rgba(${r},${g},${b},0.02)`);
      ctx.fillStyle = mainGrad;
      ctx.fill();

      // Layer 4: Edge stroke
      tracePath(points);
      ctx.strokeStyle = `rgba(${r},${g},${b},${0.2 + amp * 0.3})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Layer 5: Inner core highlight
      const innerGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, baseRadius * 0.4);
      innerGrad.addColorStop(0, `rgba(255,255,255,${0.04 + amp * 0.06})`);
      innerGrad.addColorStop(1, `rgba(${r},${g},${b},0)`);
      ctx.fillStyle = innerGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, baseRadius * 0.4, 0, Math.PI * 2);
      ctx.fill();

      timeRef.current += 0.016;
      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ display: "block" }}
    />
  );
}
