"use client";

import { useVoiceChat } from "@/hooks/useVoiceChat";
import TranscriptPanel from "./TranscriptPanel";
import ControlBar from "./ControlBar";
import WaveVisualizer from "./WaveVisualizer";

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
  } = useVoiceChat();

  const active = isConnected && isRecording;

  return (
    <div className="fixed inset-0 flex flex-col">
      {/* Background */}
      <div className="bg-scene" />
      <div className="bg-noise" />

      {/* Header */}
      <header className="relative z-20 flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center border border-white/[0.06]">
            <span className="text-xs font-bold text-white/50">G</span>
          </div>
          <h1 className="text-white/40 text-sm font-medium tracking-[0.2em] uppercase">
            Goygoy
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {/* Metrics display */}
          {metrics && (
            <div className="flex items-center gap-3 animate-fade-up">
              <div className="flex items-center gap-1.5" title="Time To First Token — ASR + LLM startup">
                <span className="text-[10px] text-white/20 font-medium uppercase tracking-wider">TTFT</span>
                <span className="text-[11px] text-emerald-400/80 font-mono tabular-nums">{metrics.ttft_ms}ms</span>
              </div>
              <div className="w-px h-3 bg-white/[0.06]" />
              <div className="flex items-center gap-1.5" title="Time To First Audio — total latency to first sound">
                <span className="text-[10px] text-white/20 font-medium uppercase tracking-wider">TTFFA</span>
                <span className="text-[11px] text-cyan-400/80 font-mono tabular-nums">{metrics.ttffa_ms}ms</span>
              </div>
              <div className="w-px h-3 bg-white/[0.06]" />
              <div className="flex items-center gap-1.5" title="ASR inference time">
                <span className="text-[10px] text-white/20 font-medium uppercase tracking-wider">ASR</span>
                <span className="text-[11px] text-amber-400/80 font-mono tabular-nums">{metrics.asr_ms}ms</span>
              </div>
              {metrics.tts_ms != null && (
                <>
                  <div className="w-px h-3 bg-white/[0.06]" />
                  <div className="flex items-center gap-1.5" title="TTS synthesis time for first sentence">
                    <span className="text-[10px] text-white/20 font-medium uppercase tracking-wider">TTS</span>
                    <span className="text-[11px] text-purple-400/80 font-mono tabular-nums">{metrics.tts_ms}ms</span>
                  </div>
                </>
              )}
            </div>
          )}
          {/* Live indicator */}
          {active && (
            <div className="flex items-center gap-2 animate-fade-up">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] text-white/30 font-medium">Live</span>
            </div>
          )}
        </div>
      </header>

      {/* Main content area */}
      <main className="relative flex-1 min-h-0 flex flex-col">
        {/* Wave visualizer — centered hero */}
        <div className="flex-1 relative flex items-center justify-center min-h-0">
          {/* Ambient glow */}
          <div className="wave-glow" data-state={state} />

          {/* Wave canvas */}
          <div className="absolute inset-0 z-[1]">
            <WaveVisualizer state={state} getAmplitude={getAmplitude} />
          </div>

          {/* State label */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
            <span className={`text-xs font-medium tracking-[0.15em] uppercase transition-colors duration-1000 ${
              state === "idle" ? "text-white/15" :
              state === "listening" ? "text-emerald-400/50" :
              state === "thinking" ? "text-amber-400/50" :
              "text-cyan-400/50"
            }`}>
              {!active ? "" :
                state === "listening" ? "Listening..." :
                state === "thinking" ? "Processing..." :
                state === "speaking" ? "Speaking..." : ""
              }
            </span>
          </div>
        </div>

        {/* Transcript panel — below the wave */}
        {transcript.length > 0 && (
          <div className="relative z-10 mx-4 mb-3 max-h-[30vh] lg:max-h-[35vh]">
            <div className="glass-strong rounded-2xl overflow-hidden">
              <div className="px-5 py-3 border-b border-white/[0.04] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400/40" />
                  <h2 className="text-white/30 text-[11px] font-semibold tracking-[0.15em] uppercase">
                    Transcript
                  </h2>
                </div>
                <span className="text-[10px] text-white/15 tabular-nums">
                  {transcript.length}
                </span>
              </div>
              <div className="max-h-[25vh] lg:max-h-[30vh] overflow-y-auto">
                <TranscriptPanel transcript={transcript} state={state} />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Error toast */}
      {error && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 animate-fade-up">
          <div className="glass px-4 py-2.5 rounded-xl flex items-center gap-2.5 border-red-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
            <span className="text-red-300/80 text-xs font-medium">{error}</span>
          </div>
        </div>
      )}

      {/* Control bar */}
      <div className="relative z-20">
        <ControlBar
          state={state}
          isConnected={isConnected}
          isRecording={isRecording}
          onStart={start}
          onStop={stop}
          onBargeIn={bargeIn}
        />
      </div>
    </div>
  );
}
