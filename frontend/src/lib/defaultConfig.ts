/** Hardcoded model/VAD configuration defaults for the settings panel.
 *  These mirror the backend's config/config.yaml + core/config.py defaults.
 *  Will be replaced by a backend `/api/config` endpoint later. */

export const defaultConfig = {
  models: {
    asr: "Qwen/Qwen3-ASR-1.7B",
    llm: "gpt-oss-120b",
    tts: "Vyvo/VyvoTTS-EN-Beta",
    vad: "Silero VAD",
  },
  voice: {
    vadThreshold: 0.5,
    minSpeechMs: 250,
    minSilenceMs: 1500,
    preSpeechPadMs: 300,
  },
  server: {
    websocketUrl: process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/ws/chat",
    sampleRate: 16000,
    ttsSampleRate: 24000,
  },
} as const;
