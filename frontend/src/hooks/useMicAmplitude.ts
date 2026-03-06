"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface UseMicAmplitudeReturn {
  /** Current amplitude (0-1) updated each animation frame */
  amplitude: number;
  /** Start capturing mic amplitude */
  startMic: () => Promise<void>;
  /** Stop capturing mic amplitude */
  stopMic: () => void;
  /** Whether mic capture is active */
  isActive: boolean;
  /** Get byte frequency data (128 bins, 0-255) for visualization */
  getMicFrequencyData: () => Uint8Array | null;
}

export function useMicAmplitude(): UseMicAmplitudeReturn {
  const [amplitude, setAmplitude] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const contextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animRef = useRef<number>(0);
  const dataRef = useRef<Float32Array<ArrayBuffer> | null>(null);
  const micFreqData = useRef<Uint8Array<ArrayBuffer> | null>(null);

  const stopMic = useCallback(() => {
    cancelAnimationFrame(animRef.current);
    animRef.current = 0;

    contextRef.current?.close();
    contextRef.current = null;
    analyserRef.current = null;
    dataRef.current = null;
    micFreqData.current = null;

    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;

    setAmplitude(0);
    setIsActive(false);
  }, []);

  const startMic = useCallback(async () => {
    stopMic();

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });
    streamRef.current = stream;

    const ctx = new AudioContext();
    contextRef.current = ctx;

    if (ctx.state === "suspended") await ctx.resume();

    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.8;
    analyserRef.current = analyser;
    dataRef.current = new Float32Array(new ArrayBuffer(analyser.fftSize * 4));
    micFreqData.current = new Uint8Array(analyser.frequencyBinCount);

    const source = ctx.createMediaStreamSource(stream);
    source.connect(analyser);

    setIsActive(true);

    const tick = () => {
      const a = analyserRef.current;
      const d = dataRef.current;
      if (!a || !d) return;

      a.getFloatTimeDomainData(d);
      let sum = 0;
      for (let i = 0; i < d.length; i++) {
        sum += d[i] * d[i];
      }
      setAmplitude(Math.sqrt(sum / d.length));
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
  }, [stopMic]);

  const getMicFrequencyData = useCallback((): Uint8Array | null => {
    const analyser = analyserRef.current;
    const buf = micFreqData.current;
    if (!analyser || !buf) return null;
    analyser.getByteFrequencyData(buf);
    return buf;
  }, []);

  // Cleanup on unmount
  useEffect(() => stopMic, [stopMic]);

  return { amplitude, startMic, stopMic, isActive, getMicFrequencyData };
}
