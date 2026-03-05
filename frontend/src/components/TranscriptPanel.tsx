"use client";

import { useEffect, useRef } from "react";
import type { TranscriptEntry } from "@/hooks/useVoiceChat";
import type { PipelineState } from "@/lib/constants";

interface TranscriptPanelProps {
  transcript: TranscriptEntry[];
  state: PipelineState;
}

export default function TranscriptPanel({ transcript, state }: TranscriptPanelProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  return (
    <div className="flex flex-col h-full overflow-y-auto scrollbar-thin px-5 py-4">
      {transcript.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center py-8">
          <div className="w-10 h-10 rounded-full bg-white/[0.04] flex items-center justify-center">
            <svg className="w-5 h-5 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
            </svg>
          </div>
          <p className="text-white/25 text-xs leading-relaxed max-w-[200px]">
            Your conversation will appear here
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {transcript.map((entry, i) => (
            <div
              key={i}
              className={`flex ${entry.role === "user" ? "justify-end" : "justify-start"} animate-fade-up`}
            >
              <div
                className={`max-w-[88%] relative group ${
                  entry.role === "user"
                    ? "bg-gradient-to-br from-white/[0.1] to-white/[0.05] rounded-2xl rounded-br-md"
                    : "bg-white/[0.03] rounded-2xl rounded-bl-md border border-white/[0.04]"
                } px-4 py-3`}
              >
                <div className="flex items-center gap-1.5 mb-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    entry.role === "user" ? "bg-blue-400/60" : "bg-purple-400/60"
                  }`} />
                  <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-white/25">
                    {entry.role === "user" ? "You" : "Goygoy"}
                  </span>
                </div>
                <p className={`text-[13px] leading-[1.6] ${
                  entry.role === "user" ? "text-white/85" : "text-white/70"
                }`}>
                  {entry.text}
                </p>
              </div>
            </div>
          ))}

          {/* Thinking indicator */}
          {state === "thinking" && (
            <div className="flex justify-start animate-fade-up">
              <div className="bg-white/[0.03] rounded-2xl rounded-bl-md border border-white/[0.04] px-4 py-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400/60" />
                  <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-white/25">
                    Goygoy
                  </span>
                </div>
                <div className="flex gap-1.5 py-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/20 typing-dot" />
                  <div className="w-1.5 h-1.5 rounded-full bg-white/20 typing-dot" />
                  <div className="w-1.5 h-1.5 rounded-full bg-white/20 typing-dot" />
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      )}
    </div>
  );
}
