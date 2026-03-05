export const WS_URL =
  process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/ws/chat";

export const MIC_SAMPLE_RATE = 16000;
export const TTS_SAMPLE_RATE = 24000;
export const MIC_CHUNK_MS = 100;

// Binary frame prefixes (must match server protocol.py)
export const MIC_AUDIO_PREFIX = 0x01;
export const TTS_AUDIO_PREFIX = 0x02;

// Pipeline states
export type PipelineState = "idle" | "listening" | "thinking" | "speaking";
