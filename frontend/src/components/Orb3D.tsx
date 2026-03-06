"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { PipelineState } from "@/lib/constants";
import { orbVertexShader } from "./shaders/orbVertex.glsl";
import { orbFragmentShader } from "./shaders/orbFragment.glsl";

const STATE_COLORS: Record<PipelineState, THREE.Color> = {
  idle: new THREE.Color(0.545, 0.361, 0.965),      // purple
  listening: new THREE.Color(0.063, 0.725, 0.506),  // emerald
  thinking: new THREE.Color(0.961, 0.620, 0.043),   // amber
  speaking: new THREE.Color(0.024, 0.714, 0.831),   // cyan
};

interface OrbMeshProps {
  state: PipelineState;
  getOutputFrequency: () => Uint8Array | null;
  getMicFrequency: () => Uint8Array | null;
  getAmplitude: () => number;
  segments: number;
}

function OrbMesh({ state, getOutputFrequency, getMicFrequency, getAmplitude, segments }: OrbMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const smoothAmpRef = useRef(0);
  const currentColor = useRef(new THREE.Color(0.545, 0.361, 0.965));

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAmplitude: { value: 0 },
      uColor: { value: new THREE.Color(0.545, 0.361, 0.965) },
      uFreqData: { value: new Float32Array(64) },
    }),
    []
  );

  useFrame((_, delta) => {
    if (!materialRef.current) return;
    const u = materialRef.current.uniforms;

    u.uTime.value += delta;

    // Smooth amplitude
    const rawAmp = getAmplitude();
    smoothAmpRef.current += (Math.min(rawAmp * 5, 1) - smoothAmpRef.current) * 0.1;
    u.uAmplitude.value = smoothAmpRef.current;

    // Lerp color toward target
    const target = STATE_COLORS[state];
    currentColor.current.lerp(target, 0.03);
    u.uColor.value.copy(currentColor.current);

    // Get frequency data based on state
    let rawData: Uint8Array | null = null;
    if (state === "listening") rawData = getMicFrequency();
    else if (state === "speaking") rawData = getOutputFrequency();

    const freqArr = u.uFreqData.value;
    if (rawData && rawData.length > 0) {
      for (let i = 0; i < 64; i++) {
        const idx = Math.floor((i / 64) * rawData.length);
        freqArr[i] = rawData[idx];
      }
    } else if (state === "thinking") {
      const t = u.uTime.value;
      const pulse = 0.5 + 0.5 * Math.sin(t * 2.5);
      for (let i = 0; i < 64; i++) {
        freqArr[i] = (80 + 60 * pulse * Math.sin(i * 0.3 + t * 3)) | 0;
      }
    } else {
      // idle: gentle drift
      const t = u.uTime.value;
      for (let i = 0; i < 64; i++) {
        freqArr[i] = (40 + 20 * Math.sin(i * 0.2 + t * 0.7)) | 0;
      }
    }

    // Slow rotation
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.15;
      meshRef.current.rotation.x = Math.sin(u.uTime.value * 0.3) * 0.1;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1, segments, segments]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={orbVertexShader}
        fragmentShader={orbFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}

export interface Orb3DProps {
  state: PipelineState;
  getOutputFrequency: () => Uint8Array | null;
  getMicFrequency: () => Uint8Array | null;
  getAmplitude: () => number;
  segments?: number;
}

export default function Orb3D({
  state,
  getOutputFrequency,
  getMicFrequency,
  getAmplitude,
  segments = 64,
}: Orb3DProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 2.8], fov: 45 }}
      gl={{ alpha: true, antialias: true }}
      style={{ background: "transparent" }}
    >
      <OrbMesh
        state={state}
        getOutputFrequency={getOutputFrequency}
        getMicFrequency={getMicFrequency}
        getAmplitude={getAmplitude}
        segments={segments}
      />
    </Canvas>
  );
}
