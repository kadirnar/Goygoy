"use client";

import type { PipelineMetrics } from "@/hooks/useVoiceChat";

interface MetricsBarProps {
  metrics: PipelineMetrics | null;
  isActive: boolean;
}

export default function MetricsBar({ metrics, isActive }: MetricsBarProps) {
  return (
    <div className="flex items-center justify-center gap-2 px-4 py-4 flex-wrap">
      {metrics && (
        <div className="flex items-center gap-2 animate-fade-up flex-wrap justify-center">
          <div className="glass rounded-full px-3 py-1.5 flex items-center gap-2">
            <span className="text-[10px] font-mono text-muted-foreground">TTFT</span>
            <span className="text-[11px] font-mono font-semibold text-emerald-500 dark:text-emerald-400">
              {metrics.ttft_ms}ms
            </span>
          </div>
          <div className="glass rounded-full px-3 py-1.5 flex items-center gap-2">
            <span className="text-[10px] font-mono text-muted-foreground">TTFFA</span>
            <span className="text-[11px] font-mono font-semibold text-cyan-500 dark:text-cyan-400">
              {metrics.ttffa_ms}ms
            </span>
          </div>
          <div className="glass rounded-full px-3 py-1.5 flex items-center gap-2">
            <span className="text-[10px] font-mono text-muted-foreground">ASR</span>
            <span className="text-[11px] font-mono font-semibold text-amber-500 dark:text-amber-400">
              {metrics.asr_ms}ms
            </span>
          </div>
          {metrics.tts_ms != null && (
            <div className="glass rounded-full px-3 py-1.5 flex items-center gap-2">
              <span className="text-[10px] font-mono text-muted-foreground">TTS</span>
              <span className="text-[11px] font-mono font-semibold text-purple-500 dark:text-purple-400">
                {metrics.tts_ms}ms
              </span>
            </div>
          )}
        </div>
      )}
      {isActive && (
        <div className="glass rounded-full px-3 py-1.5 flex items-center gap-2 animate-fade-up">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-medium text-emerald-500 dark:text-emerald-400">
            Live
          </span>
        </div>
      )}
    </div>
  );
}
