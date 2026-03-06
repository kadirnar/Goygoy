"use client";

import { useCallback, useEffect, useRef } from "react";
import { useVoiceChat } from "@/hooks/useVoiceChat";
import { useMicAmplitude } from "@/hooks/useMicAmplitude";
import { useSessionHistoryContext } from "@/contexts/SessionHistoryContext";
import OrbVisualizerWrapper from "./OrbVisualizerWrapper";
import ControlBar from "./ControlBar";
import TranscriptPanel from "./TranscriptPanel";
import MetricsBar from "./MetricsBar";

export default function HeroVoiceWidget() {
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
    <div className="glass-strong rounded-3xl p-6 w-full max-w-[380px] mx-auto">
      {/* Compact metrics */}
      <MetricsBar metrics={metrics} isActive={active} />

      {/* 3D Orb */}
      <div className="relative w-[200px] h-[200px] mx-auto my-4">
        <OrbVisualizerWrapper
          state={state}
          getOutputFrequency={getFrequencyData}
          getMicFrequency={getMicFrequencyData}
          getAmplitude={getAmplitude}
          segments={64}
        />
      </div>

      {/* Control */}
      <div className="flex justify-center">
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

      {/* Idle hint */}
      {!active && (
        <p className="text-center text-xs text-muted-foreground mt-3 tracking-wide">
          talk to goygoy
        </p>
      )}

      {/* Compact transcript */}
      {transcript.length > 0 && (
        <div className="mt-4 max-h-[120px] overflow-y-auto scrollbar-thin">
          <TranscriptPanel transcript={transcript} state={state} />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-3 text-center">
          <span className="text-destructive text-xs font-medium">{error}</span>
        </div>
      )}
    </div>
  );
}
