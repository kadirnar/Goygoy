"use client";

import { useCallback, useRef, useState } from "react";
import { MIC_AUDIO_PREFIX } from "@/lib/constants";

interface UseAudioRecorderReturn {
  isRecording: boolean;
  start: (onChunk: (data: ArrayBuffer) => void) => Promise<void>;
  stop: () => void;
}

export function useAudioRecorder(): UseAudioRecorderReturn {
  const [isRecording, setIsRecording] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const contextRef = useRef<AudioContext | null>(null);
  const workletRef = useRef<AudioWorkletNode | null>(null);

  const stop = useCallback(() => {
    workletRef.current?.port.postMessage("stop");
    workletRef.current?.disconnect();
    workletRef.current = null;

    contextRef.current?.close();
    contextRef.current = null;

    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;

    setIsRecording(false);
  }, []);

  const start = useCallback(
    async (onChunk: (data: ArrayBuffer) => void) => {
      stop();

      console.log("[Goygoy] Requesting microphone permission...");

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;
      console.log("[Goygoy] Microphone access granted");

      // Create AudioContext at 16kHz — browser handles resampling from mic's native rate
      const ctx = new AudioContext({ sampleRate: 16000 });
      contextRef.current = ctx;

      // Resume context if browser requires user gesture
      if (ctx.state === "suspended") {
        await ctx.resume();
      }

      console.log(`[Goygoy] AudioContext sampleRate: ${ctx.sampleRate}`);

      await ctx.audioWorklet.addModule("/audio-processor.js");
      const source = ctx.createMediaStreamSource(stream);
      const worklet = new AudioWorkletNode(ctx, "audio-capture-processor");
      workletRef.current = worklet;

      let chunkCount = 0;
      worklet.port.onmessage = (e: MessageEvent) => {
        const pcm = e.data as ArrayBuffer; // Int16 PCM at 16kHz

        // Prepend the MIC_AUDIO_PREFIX byte
        const prefixed = new Uint8Array(1 + pcm.byteLength);
        prefixed[0] = MIC_AUDIO_PREFIX;
        prefixed.set(new Uint8Array(pcm), 1);

        onChunk(prefixed.buffer);
        chunkCount++;
        if (chunkCount === 1) {
          console.log(`[Goygoy] First audio chunk sent (${pcm.byteLength} bytes)`);
        }
      };

      source.connect(worklet);
      // Don't connect worklet to destination (no mic feedback)
      setIsRecording(true);
      console.log("[Goygoy] Audio recording started");
    },
    [stop]
  );

  return { isRecording, start, stop };
}
