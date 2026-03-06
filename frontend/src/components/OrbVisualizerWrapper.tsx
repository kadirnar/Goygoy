"use client";

import { lazy, Suspense, useMemo } from "react";
import type { PipelineState } from "@/lib/constants";
import OrbVisualizer from "./OrbVisualizer";

const Orb3D = lazy(() => import("./Orb3D"));

interface OrbVisualizerWrapperProps {
  state: PipelineState;
  getOutputFrequency: () => Uint8Array | null;
  getMicFrequency: () => Uint8Array | null;
  getAmplitude: () => number;
  segments?: number;
}

function hasWebGL(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

export default function OrbVisualizerWrapper({
  state,
  getOutputFrequency,
  getMicFrequency,
  getAmplitude,
  segments,
}: OrbVisualizerWrapperProps) {
  const webgl = useMemo(() => hasWebGL(), []);

  if (!webgl) {
    return (
      <OrbVisualizer
        state={state}
        getOutputFrequency={getOutputFrequency}
        getMicFrequency={getMicFrequency}
        getAmplitude={getAmplitude}
      />
    );
  }

  return (
    <Suspense
      fallback={
        <OrbVisualizer
          state={state}
          getOutputFrequency={getOutputFrequency}
          getMicFrequency={getMicFrequency}
          getAmplitude={getAmplitude}
        />
      }
    >
      <Orb3D
        state={state}
        getOutputFrequency={getOutputFrequency}
        getMicFrequency={getMicFrequency}
        getAmplitude={getAmplitude}
        segments={segments}
      />
    </Suspense>
  );
}
