"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PipelineState } from "@/lib/constants";
import type { ServerMessage } from "@/lib/protocol";
import { useWebSocket } from "./useWebSocket";
import { useAudioRecorder } from "./useAudioRecorder";
import { useAudioPlayer } from "./useAudioPlayer";

export interface TranscriptEntry {
  role: "user" | "assistant";
  text: string;
  final: boolean;
}

export interface PipelineMetrics {
  asr_ms: number;
  ttft_ms: number;
  ttffa_ms: number;
  tts_ms: number | null;
  total_ms: number | null;
}

interface UseVoiceChatReturn {
  state: PipelineState;
  isConnected: boolean;
  isRecording: boolean;
  transcript: TranscriptEntry[];
  metrics: PipelineMetrics | null;
  error: string | null;
  start: () => void;
  stop: () => void;
  bargeIn: () => void;
  getAmplitude: () => number;
}

export function useVoiceChat(): UseVoiceChatReturn {
  const [state, setState] = useState<PipelineState>("idle");
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [metrics, setMetrics] = useState<PipelineMetrics | null>(null);
  const [error, setError] = useState<string | null>(null);

  const ws = useWebSocket();
  const recorder = useAudioRecorder();
  const player = useAudioPlayer();

  // Track current assistant streaming text index
  const assistantIdxRef = useRef<number>(-1);
  // Flag to start recording once WS connects
  const pendingRecordRef = useRef(false);

  // Handle server messages
  const handleMessage = useCallback(
    (msg: ServerMessage) => {
      switch (msg.type) {
        case "state.change":
          setState(msg.state);
          break;

        case "audio.stop":
          // Server-side barge-in: immediately stop TTS playback
          player.stopPlayback();
          break;

        case "transcript.user":
          setTranscript((prev) => [
            ...prev,
            { role: "user", text: msg.text, final: true },
          ]);
          assistantIdxRef.current = -1;
          break;

        case "transcript.assistant": {
          setTranscript((prev) => {
            const copy = [...prev];
            if (
              assistantIdxRef.current >= 0 &&
              assistantIdxRef.current < copy.length
            ) {
              copy[assistantIdxRef.current] = {
                role: "assistant",
                text: msg.text,
                final: msg.final,
              };
            } else {
              assistantIdxRef.current = copy.length;
              copy.push({
                role: "assistant",
                text: msg.text,
                final: msg.final,
              });
            }
            return copy;
          });
          break;
        }

        case "audio.done":
          break;

        case "metrics":
          setMetrics({
            asr_ms: msg.asr_ms,
            ttft_ms: msg.ttft_ms,
            ttffa_ms: msg.ttffa_ms,
            tts_ms: msg.tts_ms,
            total_ms: msg.total_ms,
          });
          break;

        case "error":
          setError(msg.message);
          break;

        case "session.started":
          setError(null);
          break;
      }
    },
    [player]
  );

  // Handle binary audio from server
  const handleBinary = useCallback(
    (data: ArrayBuffer) => {
      player.feedAudio(data);
    },
    [player]
  );

  // Wire up message handlers
  useEffect(() => {
    ws.onMessage.current = handleMessage;
    ws.onBinary.current = handleBinary;
  }, [ws.onMessage, ws.onBinary, handleMessage, handleBinary]);

  // When WebSocket connects, start recording if pending
  useEffect(() => {
    if (ws.status === "connected" && pendingRecordRef.current) {
      pendingRecordRef.current = false;
      recorder
        .start((chunk) => {
          ws.sendBinary(chunk);
        })
        .catch((err) => {
          console.error("Mic start failed:", err);
          setError(
            err instanceof Error ? err.message : "Microphone access denied"
          );
        });
    }
  }, [ws.status, recorder, ws]);

  // Start voice chat session
  const start = useCallback(() => {
    setError(null);
    setTranscript([]);
    setMetrics(null);

    player.init();
    pendingRecordRef.current = true;
    ws.connect();
  }, [ws, player]);

  // Stop voice chat session
  const stop = useCallback(() => {
    pendingRecordRef.current = false;
    recorder.stop();
    player.stopPlayback();
    ws.sendJson({ type: "session.end" });
    ws.disconnect();
    setState("idle");
  }, [ws, recorder, player]);

  // Barge-in: interrupt current AI speech
  const bargeIn = useCallback(() => {
    player.stopPlayback();
    ws.sendJson({ type: "barge_in" });
  }, [ws, player]);

  return {
    state,
    isConnected: ws.status === "connected",
    isRecording: recorder.isRecording,
    transcript,
    metrics,
    error,
    start,
    stop,
    bargeIn,
    getAmplitude: player.getAmplitude,
  };
}
