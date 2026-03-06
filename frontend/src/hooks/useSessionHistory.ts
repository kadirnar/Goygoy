"use client";

import { useCallback, useState } from "react";
import type { TranscriptEntry, PipelineMetrics } from "@/hooks/useVoiceChat";

export interface Session {
  id: string;
  timestamp: number;
  transcript: TranscriptEntry[];
  metrics: PipelineMetrics | null;
}

const STORAGE_KEY = "goygoy-sessions";
const MAX_SESSIONS = 50;

function loadSessions(): Session[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Session[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveSessions(sessions: Session[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

export function useSessionHistory() {
  const [sessions, setSessions] = useState<Session[]>(loadSessions);

  const addSession = useCallback(
    (transcript: TranscriptEntry[], metrics: PipelineMetrics | null) => {
      if (transcript.length === 0) return;
      const session: Session = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        transcript,
        metrics,
      };
      setSessions((prev) => {
        const updated = [session, ...prev].slice(0, MAX_SESSIONS);
        saveSessions(updated);
        return updated;
      });
    },
    []
  );

  const removeSession = useCallback((id: string) => {
    setSessions((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      saveSessions(updated);
      return updated;
    });
  }, []);

  const clearSessions = useCallback(() => {
    setSessions([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return { sessions, addSession, removeSession, clearSessions };
}
