"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useSessionHistory, type Session } from "@/hooks/useSessionHistory";
import type { TranscriptEntry, PipelineMetrics } from "@/hooks/useVoiceChat";

interface SessionHistoryContextValue {
  sessions: Session[];
  addSession: (transcript: TranscriptEntry[], metrics: PipelineMetrics | null) => void;
  removeSession: (id: string) => void;
  clearSessions: () => void;
}

const SessionHistoryContext = createContext<SessionHistoryContextValue | null>(null);

export function SessionHistoryProvider({ children }: { children: ReactNode }) {
  const history = useSessionHistory();

  return (
    <SessionHistoryContext.Provider value={history}>
      {children}
    </SessionHistoryContext.Provider>
  );
}

export function useSessionHistoryContext(): SessionHistoryContextValue {
  const ctx = useContext(SessionHistoryContext);
  if (!ctx) throw new Error("useSessionHistoryContext must be used within SessionHistoryProvider");
  return ctx;
}
