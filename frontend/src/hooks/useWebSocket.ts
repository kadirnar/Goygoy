"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { WS_URL } from "@/lib/constants";
import type { ServerMessage, ClientMessage } from "@/lib/protocol";

export type ConnectionStatus = "disconnected" | "connecting" | "connected";

interface UseWebSocketReturn {
  status: ConnectionStatus;
  connect: () => void;
  disconnect: () => void;
  sendJson: (msg: ClientMessage) => void;
  sendBinary: (data: ArrayBuffer) => void;
  onMessage: React.MutableRefObject<((msg: ServerMessage) => void) | null>;
  onBinary: React.MutableRefObject<((data: ArrayBuffer) => void) | null>;
}

export function useWebSocket(): UseWebSocketReturn {
  const wsRef = useRef<WebSocket | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const onMessage = useRef<((msg: ServerMessage) => void) | null>(null);
  const onBinary = useRef<((data: ArrayBuffer) => void) | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intentionalClose = useRef(false);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const cleanup = useCallback(() => {
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
      reconnectTimer.current = null;
    }
    if (wsRef.current) {
      wsRef.current.onopen = null;
      wsRef.current.onclose = null;
      wsRef.current.onmessage = null;
      wsRef.current.onerror = null;
      if (
        wsRef.current.readyState === WebSocket.OPEN ||
        wsRef.current.readyState === WebSocket.CONNECTING
      ) {
        wsRef.current.close();
      }
      wsRef.current = null;
    }
  }, []);

  const connect = useCallback(() => {
    cleanup();
    intentionalClose.current = false;
    setStatus("connecting");

    const ws = new WebSocket(WS_URL);
    ws.binaryType = "arraybuffer";
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus("connected");
      reconnectAttempts.current = 0;
    };

    ws.onclose = () => {
      setStatus("disconnected");
      wsRef.current = null;

      // Auto-reconnect on unexpected disconnects
      if (
        !intentionalClose.current &&
        reconnectAttempts.current < maxReconnectAttempts
      ) {
        const delay = Math.min(1000 * 2 ** reconnectAttempts.current, 10000);
        reconnectAttempts.current++;
        reconnectTimer.current = setTimeout(() => {
          connect();
        }, delay);
      }
    };

    ws.onerror = () => {
      // onclose will fire after this
    };

    ws.onmessage = (event: MessageEvent) => {
      if (event.data instanceof ArrayBuffer) {
        onBinary.current?.(event.data);
      } else if (typeof event.data === "string") {
        try {
          const msg = JSON.parse(event.data) as ServerMessage;
          onMessage.current?.(msg);
        } catch {
          // ignore malformed JSON
        }
      }
    };
  }, [cleanup]);

  const disconnect = useCallback(() => {
    intentionalClose.current = true;
    reconnectAttempts.current = 0;
    cleanup();
    setStatus("disconnected");
  }, [cleanup]);

  const sendJson = useCallback((msg: ClientMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    }
  }, []);

  const sendBinary = useCallback((data: ArrayBuffer) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(data);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => cleanup, [cleanup]);

  return { status, connect, disconnect, sendJson, sendBinary, onMessage, onBinary };
}
