"use client";

import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
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
    <div className="glass-strong rounded-2xl overflow-hidden max-w-3xl mx-auto">
      <ScrollArea className="max-h-[200px]">
        <div className="flex flex-col gap-3 p-4">
          {transcript.map((entry, i) => (
            <div
              key={i}
              className={`flex ${entry.role === "user" ? "justify-end" : "justify-start"} animate-fade-up`}
            >
              <div
                className={`max-w-[85%] ${
                  entry.role === "user"
                    ? "bg-blue-500/10 dark:bg-blue-400/10 rounded-2xl rounded-br-sm"
                    : "bg-purple-500/10 dark:bg-purple-400/5 rounded-2xl rounded-bl-sm border border-border/20"
                } px-4 py-2.5`}
              >
                <span
                  className={`text-[9px] font-semibold uppercase tracking-[0.15em] block mb-1 ${
                    entry.role === "user"
                      ? "text-blue-500/70 dark:text-blue-400/60"
                      : "text-purple-500/70 dark:text-purple-400/60"
                  }`}
                >
                  {entry.role === "user" ? "You" : "Goygoy"}
                </span>
                <p className="text-[13px] leading-[1.6] text-foreground/85">{entry.text}</p>
              </div>
            </div>
          ))}

          {/* Thinking indicator */}
          {state === "thinking" && (
            <div className="flex justify-start animate-fade-up">
              <div className="bg-purple-500/10 dark:bg-purple-400/5 rounded-2xl rounded-bl-sm border border-border/20 px-4 py-2.5">
                <span className="text-[9px] font-semibold uppercase tracking-[0.15em] text-purple-500/70 dark:text-purple-400/60 block mb-1">
                  Goygoy
                </span>
                <div className="flex gap-1.5 py-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400/40 typing-dot" />
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400/40 typing-dot" />
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400/40 typing-dot" />
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </ScrollArea>
    </div>
  );
}
