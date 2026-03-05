/**
 * AudioWorklet processor for capturing microphone audio.
 *
 * The AudioContext is created at 16kHz, so the browser handles resampling.
 * This processor simply converts float32 samples to Int16 PCM and
 * accumulates them into 100ms chunks (1600 samples) before posting.
 */
class AudioCaptureProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this._buffer = new Int16Array(1600); // 100ms at 16kHz
    this._writeIndex = 0;
    this._running = true;

    this.port.onmessage = (e) => {
      if (e.data === "stop") {
        this._running = false;
      }
    };
  }

  process(inputs) {
    if (!this._running) return false;

    const input = inputs[0];
    if (!input || !input[0]) return true;

    const samples = input[0]; // Float32Array, 128 samples at 16kHz

    for (let i = 0; i < samples.length; i++) {
      // Clamp and convert float32 [-1,1] to Int16
      const clamped = Math.max(-1, Math.min(1, samples[i]));
      this._buffer[this._writeIndex++] = clamped * 32767;

      // When buffer is full (1600 samples = 100ms), send it
      if (this._writeIndex >= 1600) {
        // Copy the buffer before transferring
        const chunk = this._buffer.slice(0);
        this.port.postMessage(chunk.buffer, [chunk.buffer]);
        this._buffer = new Int16Array(1600);
        this._writeIndex = 0;
      }
    }

    return true;
  }
}

registerProcessor("audio-capture-processor", AudioCaptureProcessor);
