"use client";

import { useVoiceChat } from "@/hooks/useVoiceChat";
import { useMicAmplitude } from "@/hooks/useMicAmplitude";
import { useSessionHistoryContext } from "@/contexts/SessionHistoryContext";
import { useCallback, useEffect, useRef } from "react";
import TranscriptPanel from "./TranscriptPanel";
import ControlBar from "./ControlBar";
import OrbVisualizerWrapper from "./OrbVisualizerWrapper";
import MetricsBar from "./MetricsBar";

export default function VoiceChat() {
  const {
    state,
    isConnected,
    isRecording,
    transcript,
    metrics,
    error,
    start,
    stop,
    bargeIn,
    getAmplitude,
    getFrequencyData,
  } = useVoiceChat();

  const { amplitude, startMic, stopMic, isActive: micActive, getMicFrequencyData } = useMicAmplitude();
  const { addSession } = useSessionHistoryContext();

  // Keep refs to transcript/metrics for use in stop callback
  const transcriptRef = useRef(transcript);
  const metricsRef = useRef(metrics);
  useEffect(() => { transcriptRef.current = transcript; }, [transcript]);
  useEffect(() => { metricsRef.current = metrics; }, [metrics]);

  const active = isConnected && isRecording;

  const handleStart = useCallback(() => {
    start();
    startMic();
  }, [start, startMic]);

  const handleStop = useCallback(() => {
    if (transcriptRef.current.length > 0) {
      addSession(transcriptRef.current, metricsRef.current);
    }
    stop();
    stopMic();
  }, [stop, stopMic, addSession]);

  return (
    <div className="relative h-full overflow-hidden">
      {/* Orb visualizer — fills entire area as immersive background */}
      <div className="absolute inset-0">
        <OrbVisualizerWrapper
          state={state}
          getOutputFrequency={getFrequencyData}
          getMicFrequency={getMicFrequencyData}
          getAmplitude={getAmplitude}
          segments={128}
        />
      </div>

      {/* Floating metrics overlay — top */}
      <div className="absolute top-0 left-0 right-0 z-10">
        <MetricsBar metrics={metrics} isActive={active} />
      </div>

      {/* Central control orb — vertically centered */}
      <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
        <div className="pointer-events-auto">
          <ControlBar
            state={state}
            isConnected={isConnected}
            isRecording={isRecording}
            onStart={handleStart}
            onStop={handleStop}
            onBargeIn={bargeIn}
            amplitude={amplitude}
            micActive={micActive}
          />
        </div>
      </div>

      {/* Transcript overlay — bottom */}
      {transcript.length > 0 && (
        <div className="absolute bottom-0 left-0 right-0 z-10 px-4 pb-4 md:px-6 md:pb-6">
          <TranscriptPanel transcript={transcript} state={state} />
        </div>
      )}

      {/* Error toast */}
      {error && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 animate-fade-up">
          <div className="glass px-4 py-2.5 rounded-xl flex items-center gap-2.5 border-destructive/30">
            <div className="w-1.5 h-1.5 rounded-full bg-destructive flex-shrink-0" />
            <span className="text-destructive text-xs font-medium">{error}</span>
          </div>
        </div>
      )}
    </div>
  );
}
