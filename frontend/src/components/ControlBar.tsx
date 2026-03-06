"use client";

import type { PipelineState } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface ControlBarProps {
  state: PipelineState;
  isConnected: boolean;
  isRecording: boolean;
  onStart: () => void;
  onStop: () => void;
  onBargeIn: () => void;
  amplitude: number;
  micActive: boolean;
}

const stateConfig: Record<
  PipelineState,
  { label: string; color: string; dotColor: string; glowColor: string; conicGradient: string }
> = {
  idle: {
    label: "Ready to chat",
    color: "text-muted-foreground",
    dotColor: "bg-muted-foreground/40",
    glowColor: "rgba(139,92,246,0.3)",
    conicGradient: "conic-gradient(from 0deg, #8b5cf6, #7c3aed, #8b5cf6)",
  },
  listening: {
    label: "Listening",
    color: "text-emerald-500 dark:text-emerald-400",
    dotColor: "bg-emerald-500 dark:bg-emerald-400",
    glowColor: "rgba(16,185,129,0.4)",
    conicGradient: "conic-gradient(from 0deg, #10b981, #059669, #10b981)",
  },
  thinking: {
    label: "Processing",
    color: "text-amber-500 dark:text-amber-400",
    dotColor: "bg-amber-500 dark:bg-amber-400",
    glowColor: "rgba(245,158,11,0.35)",
    conicGradient: "conic-gradient(from 0deg, #f59e0b, #d97706, #f59e0b)",
  },
  speaking: {
    label: "Responding",
    color: "text-cyan-500 dark:text-cyan-400",
    dotColor: "bg-cyan-500 dark:bg-cyan-400",
    glowColor: "rgba(6,182,212,0.35)",
    conicGradient: "conic-gradient(from 0deg, #06b6d4, #0891b2, #06b6d4)",
  },
};

export default function ControlBar({
  state,
  isConnected,
  isRecording,
  onStart,
  onStop,
  onBargeIn,
  amplitude,
  micActive,
}: ControlBarProps) {
  const active = isConnected && isRecording;
  const config = stateConfig[state];
  const amp = micActive ? Math.min(amplitude * 4, 1) : 0;

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Orb container */}
      <div className="relative">
        {/* Amplitude-driven glow */}
        {active && (
          <div
            className="absolute -inset-10 rounded-full blur-2xl pointer-events-none"
            style={{
              background: `radial-gradient(circle, ${config.glowColor} 0%, transparent 70%)`,
              opacity: 0.2 + amp * 0.5,
              transition: "opacity 150ms ease-out",
            }}
          />
        )}

        {/* Expanding pulse rings — listening state */}
        {active && state === "listening" && (
          <>
            <div className="absolute -inset-5 rounded-full border-2 border-emerald-400/30 orb-ring-expand" />
            <div
              className="absolute -inset-5 rounded-full border border-emerald-400/20 orb-ring-expand"
              style={{ animationDelay: "0.8s" }}
            />
            <div
              className="absolute -inset-5 rounded-full border border-emerald-400/10 orb-ring-expand"
              style={{ animationDelay: "1.6s" }}
            />
          </>
        )}

        {/* Spinning gradient ring */}
        {active && (
          <div className="absolute -inset-[3px] rounded-full overflow-hidden">
            <div
              className="w-full h-full mic-ring"
              style={{
                background: config.conicGradient,
                mask: "radial-gradient(farthest-side, transparent calc(100% - 2.5px), #000 calc(100% - 2.5px))",
                WebkitMask:
                  "radial-gradient(farthest-side, transparent calc(100% - 2.5px), #000 calc(100% - 2.5px))",
                opacity: 0.6 + amp * 0.4,
                transition: "opacity 150ms ease-out",
              }}
            />
          </div>
        )}

        {/* Main orb button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={active ? onStop : onStart}
              className={`relative w-20 h-20 rounded-full transition-all duration-500 ${
                active
                  ? "bg-foreground/10 hover:bg-foreground/15 shadow-[0_0_40px_rgba(255,255,255,0.06)]"
                  : "bg-foreground/[0.07] hover:bg-foreground/[0.12] hover:shadow-[0_0_50px_rgba(139,92,246,0.2)]"
              }`}
            >
              {active ? (
                /* Stop icon */
                <div className="w-6 h-6 rounded-[5px] bg-destructive/90 transition-all duration-300 hover:bg-destructive" />
              ) : (
                /* Mic icon */
                <svg className="w-8 h-8 text-foreground/60" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                  <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                </svg>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{active ? "Stop recording" : "Start recording"}</TooltipContent>
        </Tooltip>
      </div>

      {/* State label + interrupt */}
      <div className="flex items-center gap-4">
        <div className={`flex items-center gap-2.5 ${config.color} transition-colors duration-700`}>
          <div
            className={`w-2 h-2 rounded-full ${config.dotColor} transition-colors duration-700 ${
              state === "thinking" ? "animate-pulse" : ""
            }`}
          />
          <span className="text-sm font-medium tracking-wide">
            {active ? config.label : "Tap to start"}
          </span>
        </div>

        {/* Interrupt button — during speaking */}
        {active && state === "speaking" && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={onBargeIn}
                className="h-8 text-xs font-medium gap-1.5 animate-fade-up border-border/50"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5.25 7.5A2.25 2.25 0 0 1 7.5 5.25h9a2.25 2.25 0 0 1 2.25 2.25v9a2.25 2.25 0 0 1-2.25 2.25h-9a2.25 2.25 0 0 1-2.25-2.25v-9Z"
                  />
                </svg>
                Interrupt
              </Button>
            </TooltipTrigger>
            <TooltipContent>Stop AI response</TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  );
}
