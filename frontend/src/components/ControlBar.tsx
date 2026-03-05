"use client";

import type { PipelineState } from "@/lib/constants";

interface ControlBarProps {
  state: PipelineState;
  isConnected: boolean;
  isRecording: boolean;
  onStart: () => void;
  onStop: () => void;
  onBargeIn: () => void;
}

const stateConfig: Record<PipelineState, { label: string; color: string; dotColor: string }> = {
  idle: { label: "Ready to chat", color: "text-white/30", dotColor: "bg-white/20" },
  listening: { label: "Listening", color: "text-emerald-400/70", dotColor: "bg-emerald-400" },
  thinking: { label: "Processing", color: "text-amber-400/70", dotColor: "bg-amber-400" },
  speaking: { label: "Responding", color: "text-cyan-400/70", dotColor: "bg-cyan-400" },
};

export default function ControlBar({
  state,
  isConnected,
  isRecording,
  onStart,
  onStop,
  onBargeIn,
}: ControlBarProps) {
  const active = isConnected && isRecording;
  const config = stateConfig[state];

  return (
    <div className="flex flex-col items-center gap-5 py-6">
      {/* Main mic button */}
      <div className="relative">
        {/* Animated ring behind button when active */}
        {active && state === "listening" && (
          <>
            <div className="absolute inset-0 rounded-full border-2 border-emerald-400/30 pulse-ring" />
            <div className="absolute inset-0 rounded-full border border-emerald-400/20 pulse-ring" style={{ animationDelay: "0.5s" }} />
          </>
        )}

        {/* Gradient ring for active state */}
        {active && (
          <div className="absolute -inset-[3px] rounded-full overflow-hidden">
            <div
              className="w-full h-full mic-ring"
              style={{
                background: `conic-gradient(from 0deg, ${
                  state === "listening" ? "#10b981, #059669, #10b981" :
                  state === "thinking" ? "#f59e0b, #d97706, #f59e0b" :
                  state === "speaking" ? "#06b6d4, #0891b2, #06b6d4" :
                  "#8b5cf6, #7c3aed, #8b5cf6"
                })`,
                mask: "radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 2px))",
                WebkitMask: "radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 2px))",
              }}
            />
          </div>
        )}

        <button
          onClick={active ? onStop : onStart}
          className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 ${
            active
              ? "bg-white/10 hover:bg-white/15 shadow-[0_0_30px_rgba(255,255,255,0.05)]"
              : "bg-white/[0.07] hover:bg-white/[0.12] hover:shadow-[0_0_40px_rgba(139,92,246,0.15)]"
          }`}
        >
          {active ? (
            /* Stop icon */
            <div className="w-5 h-5 rounded-[4px] bg-red-400/90 transition-all duration-300 hover:bg-red-400" />
          ) : (
            /* Mic icon */
            <svg className="w-6 h-6 text-white/60 transition-colors group-hover:text-white/80" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
            </svg>
          )}
        </button>
      </div>

      {/* Status row */}
      <div className="flex items-center gap-4">
        {/* State indicator */}
        <div className={`flex items-center gap-2 ${config.color} transition-colors duration-700`}>
          <div className={`w-1.5 h-1.5 rounded-full ${config.dotColor} transition-colors duration-700 ${
            state === "thinking" ? "animate-pulse" : ""
          }`} />
          <span className="text-xs font-medium tracking-wide">
            {active ? config.label : "Tap to start"}
          </span>
        </div>

        {/* Interrupt button — only visible during speaking */}
        {active && state === "speaking" && (
          <button
            onClick={onBargeIn}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full
              bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06]
              text-white/40 hover:text-white/70 text-[11px] font-medium
              transition-all duration-300 animate-fade-up"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 7.5A2.25 2.25 0 0 1 7.5 5.25h9a2.25 2.25 0 0 1 2.25 2.25v9a2.25 2.25 0 0 1-2.25 2.25h-9a2.25 2.25 0 0 1-2.25-2.25v-9Z" />
            </svg>
            Interrupt
          </button>
        )}
      </div>
    </div>
  );
}
