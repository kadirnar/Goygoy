"use client";

import { useCallback, useRef } from "react";
import { TTS_SAMPLE_RATE, TTS_AUDIO_PREFIX } from "@/lib/constants";

interface UseAudioPlayerReturn {
  /** Feed raw binary frame from WebSocket (includes prefix byte) */
  feedAudio: (data: ArrayBuffer) => void;
  /** Stop playback immediately (for barge-in) */
  stopPlayback: () => void;
  /** Get current RMS amplitude (0-1) for orb visualization */
  getAmplitude: () => number;
  /** Get byte frequency data (128 bins, 0-255) for visualization */
  getFrequencyData: () => Uint8Array | null;
  /** Initialize the audio context (call on user gesture) */
  init: () => void;
}

export function useAudioPlayer(): UseAudioPlayerReturn {
  const contextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const scheduledRef = useRef<AudioBufferSourceNode[]>([]);
  const nextStartTimeRef = useRef<number>(0);
  const analyserData = useRef<Float32Array<ArrayBuffer> | null>(null);
  const freqData = useRef<Uint8Array<ArrayBuffer> | null>(null);

  const init = useCallback(() => {
    if (contextRef.current) return;

    const ctx = new AudioContext({ sampleRate: TTS_SAMPLE_RATE });
    contextRef.current = ctx;

    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.8;
    analyserRef.current = analyser;
    analyserData.current = new Float32Array(new ArrayBuffer(analyser.fftSize * 4));
    freqData.current = new Uint8Array(analyser.frequencyBinCount);

    const gain = ctx.createGain();
    gain.gain.value = 1.0;
    gainRef.current = gain;

    gain.connect(analyser);
    analyser.connect(ctx.destination);
  }, []);

  const feedAudio = useCallback((data: ArrayBuffer) => {
    const ctx = contextRef.current;
    const gain = gainRef.current;
    if (!ctx || !gain) return;

    const view = new Uint8Array(data);
    if (view[0] !== TTS_AUDIO_PREFIX) return;

    // Strip prefix byte, remaining is Int16 PCM
    const pcmBytes = data.slice(1);
    const int16 = new Int16Array(pcmBytes);
    const float32 = new Float32Array(int16.length);
    for (let i = 0; i < int16.length; i++) {
      float32[i] = int16[i] / 32768;
    }

    const buffer = ctx.createBuffer(1, float32.length, TTS_SAMPLE_RATE);
    buffer.copyToChannel(float32, 0);

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(gain);

    // Schedule gapless playback
    const now = ctx.currentTime;
    const startTime = Math.max(now, nextStartTimeRef.current);
    source.start(startTime);
    nextStartTimeRef.current = startTime + buffer.duration;

    scheduledRef.current.push(source);
    source.onended = () => {
      scheduledRef.current = scheduledRef.current.filter((s) => s !== source);
    };
  }, []);

  const stopPlayback = useCallback(() => {
    scheduledRef.current.forEach((s) => {
      try {
        s.stop();
      } catch {
        // already stopped
      }
    });
    scheduledRef.current = [];
    nextStartTimeRef.current = 0;
  }, []);

  const getAmplitude = useCallback((): number => {
    const analyser = analyserRef.current;
    const data = analyserData.current;
    if (!analyser || !data) return 0;

    analyser.getFloatTimeDomainData(data);
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      sum += data[i] * data[i];
    }
    return Math.sqrt(sum / data.length); // RMS
  }, []);

  const getFrequencyData = useCallback((): Uint8Array | null => {
    const analyser = analyserRef.current;
    const buf = freqData.current;
    if (!analyser || !buf) return null;
    analyser.getByteFrequencyData(buf);
    return buf;
  }, []);

  return { feedAudio, stopPlayback, getAmplitude, getFrequencyData, init };
}
