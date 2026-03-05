/** Server → Client message types */
export interface StateChangeMessage {
  type: "state.change";
  state: "idle" | "listening" | "thinking" | "speaking";
}

export interface TranscriptUserMessage {
  type: "transcript.user";
  text: string;
}

export interface TranscriptAssistantMessage {
  type: "transcript.assistant";
  text: string;
  final: boolean;
}

export interface SessionStartedMessage {
  type: "session.started";
}

export interface AudioDoneMessage {
  type: "audio.done";
}

export interface AudioStopMessage {
  type: "audio.stop";
}

export interface MetricsMessage {
  type: "metrics";
  asr_ms: number;
  ttft_ms: number;
  ttffa_ms: number;
  tts_ms: number | null;
  total_ms: number | null;
}

export interface ErrorMessage {
  type: "error";
  message: string;
}

export type ServerMessage =
  | StateChangeMessage
  | TranscriptUserMessage
  | TranscriptAssistantMessage
  | SessionStartedMessage
  | AudioDoneMessage
  | AudioStopMessage
  | MetricsMessage
  | ErrorMessage;

/** Client → Server message types */
export interface SessionStartRequest {
  type: "session.start";
}

export interface BargeInRequest {
  type: "barge_in";
}

export interface MicToggleRequest {
  type: "mic.toggle";
}

export interface SessionEndRequest {
  type: "session.end";
}

export type ClientMessage =
  | SessionStartRequest
  | BargeInRequest
  | MicToggleRequest
  | SessionEndRequest;
