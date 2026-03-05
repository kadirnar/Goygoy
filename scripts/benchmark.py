import os

os.environ.setdefault("VLLM_WORKER_MULTIPROC_METHOD", "spawn")

import asyncio
import logging
import time

import numpy as np
import torch

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(name)s %(levelname)s %(message)s")
logger = logging.getLogger("benchmark")


def fmt_ms(seconds: float) -> str:
    return f"{seconds * 1000:.0f}ms"


def benchmark_vad():
    from goygoy.engine.vad import SileroVAD
    from goygoy.core.config import VADConfig

    print("\n" + "=" * 60)
    print("  VAD BENCHMARK")
    print("=" * 60)

    config = VADConfig()
    vad = SileroVAD(config, device="cuda")

    sr = config.sample_rate
    window = config.window_size

    t_speech = np.linspace(0, 1.0, sr, dtype=np.float32)
    speech_audio = 0.3 * np.sin(2 * np.pi * 300 * t_speech) + 0.1 * np.random.randn(sr).astype(np.float32)
    silence_audio = 0.01 * np.random.randn(sr).astype(np.float32)

    real_audio = None
    real_audio_name = ""
    for f in ["samples/speech_test.wav", "samples/echo-andrew-001.wav"]:
        if os.path.exists(f):
            import soundfile as sf
            audio_data, file_sr = sf.read(f, dtype="float32")
            if file_sr != sr:
                ratio = sr / file_sr
                indices = np.arange(0, len(audio_data), 1.0 / ratio).astype(int)
                indices = indices[indices < len(audio_data)]
                audio_data = audio_data[indices]
            real_audio = audio_data
            real_audio_name = os.path.basename(f)
            break

    print("\n[Warmup] Running 10 warmup chunks...")
    warmup_chunk = np.zeros(window, dtype=np.float32)
    for _ in range(10):
        vad.process_chunk(warmup_chunk)
    vad.reset()

    print("\n[Benchmark] Single chunk (512 samples = 32ms at 16kHz):\n")
    print(f"  {'Test':<35} {'Run 1':>8} {'Run 2':>8} {'Run 3':>8} {'Run 4':>8} {'Run 5':>8} {'AVG':>8}")
    print("  " + "-" * 85)

    test_chunks = [
        ("silence chunk", silence_audio[:window]),
        ("speech-like chunk", speech_audio[:window]),
    ]
    if real_audio is not None and len(real_audio) >= window:
        mid = len(real_audio) // 2
        test_chunks.append((f"real audio ({real_audio_name})", real_audio[mid:mid + window]))

    for name, chunk in test_chunks:
        times = []
        for _ in range(5):
            vad.reset()
            torch.cuda.synchronize()
            t0 = time.perf_counter()
            vad.process_chunk(chunk)
            torch.cuda.synchronize()
            elapsed = time.perf_counter() - t0
            times.append(elapsed)

        avg = np.mean(times)
        runs_str = "  ".join(f"{t*1000:>6.2f}ms" for t in times)
        print(f"  {name:<35} {runs_str}  {avg*1000:>6.2f}ms")

    print(f"\n[Benchmark] 1 second of audio ({sr // window} chunks):\n")

    test_streams = [
        ("1s silence", silence_audio),
        ("1s speech-like", speech_audio),
    ]
    if real_audio is not None and len(real_audio) >= sr:
        test_streams.append((f"1s real ({real_audio_name})", real_audio[:sr]))

    for name, audio in test_streams:
        n_chunks = len(audio) // window
        times = []
        for _ in range(5):
            vad.reset()
            torch.cuda.synchronize()
            t0 = time.perf_counter()
            for i in range(n_chunks):
                vad.process_chunk(audio[i * window : (i + 1) * window])
            torch.cuda.synchronize()
            elapsed = time.perf_counter() - t0
            times.append(elapsed)

        avg = np.mean(times)
        per_chunk = avg / n_chunks * 1000
        runs_str = "  ".join(f"{t*1000:>6.1f}ms" for t in times)
        print(f"  {name:<25} {runs_str}  AVG={avg*1000:>6.1f}ms  ({per_chunk:.2f}ms/chunk)")

    del vad
    torch.cuda.empty_cache()


def benchmark_asr():
    from goygoy.engine.asr import ASREngine

    print("\n" + "=" * 60)
    print("  ASR BENCHMARK")
    print("=" * 60)

    asr = ASREngine(gpu_memory_utilization=0.9)

    test_files = []
    for f in ["samples/speech_test.wav", "samples/echo-andrew-001.wav"]:
        if os.path.exists(f):
            test_files.append(f)

    if not test_files:
        print("  No test audio files found in samples/")
        del asr
        torch.cuda.empty_cache()
        return

    print("\n[Warmup] Running 2 warmup calls...")
    asr.transcribe([test_files[0]])
    asr.transcribe([test_files[0]])

    print("\n[Benchmark] Transcription timing:\n")
    print(f"  {'File':<30} {'Run 1':>8} {'Run 2':>8} {'Run 3':>8} {'Run 4':>8} {'Run 5':>8} {'AVG':>8}  Transcript")
    print("  " + "-" * 120)

    for f in test_files:
        times = []
        text = ""
        for _ in range(5):
            t0 = time.perf_counter()
            results = asr.transcribe([f])
            elapsed = time.perf_counter() - t0
            times.append(elapsed)
            text = results[0].text

        avg = np.mean(times)
        runs_str = "  ".join(f"{t*1000:>6.0f}ms" for t in times)
        print(f"  {os.path.basename(f):<30} {runs_str}  {avg*1000:>6.0f}ms  \"{text[:50]}\"")

    del asr
    torch.cuda.empty_cache()


def benchmark_llm():
    from goygoy.engine.llm import LLMClient

    print("\n" + "=" * 60)
    print("  LLM BENCHMARK")
    print("=" * 60)

    llm = LLMClient()

    prompts = [
        "Say hello in one sentence.",
        "What is the capital of France? Answer in one sentence.",
        "Explain quantum computing in two sentences.",
    ]

    print("\n[Benchmark] Streaming response timing:\n")
    print(f"  {'Prompt':<55} {'TTFT':>8} {'Total':>8} {'Tokens':>7}")
    print("  " + "-" * 85)

    for prompt in prompts:
        t0 = time.perf_counter()
        gen = llm.chat(prompt, stream=True)

        ttft = None
        token_count = 0

        for token in gen:
            if ttft is None:
                ttft = time.perf_counter() - t0
            token_count += 1

        total = time.perf_counter() - t0

        label = prompt[:52] + "..." if len(prompt) > 55 else prompt
        print(f"  {label:<55} {fmt_ms(ttft or 0):>8} {fmt_ms(total):>8} {token_count:>7}")


async def benchmark_tts():
    from goygoy.engine.tts import TTSEngine, SAMPLE_RATE

    print("\n" + "=" * 60)
    print("  TTS BENCHMARK")
    print("=" * 60)

    tts = TTSEngine(gpu_memory_utilization=0.9)

    test_texts = [
        "The quick brown fox jumps over the lazy dog. It was a beautiful sunny day outside.",
        "Hello! I am doing great today. How can I help you with your project? Let me know what you need.",
        "Artificial intelligence is transforming the way we interact with technology. Every single day brings new breakthroughs and innovations.",
    ]

    print("\n[Warmup] Running 2 warmup calls...")
    for _ in range(2):
        async for _ in tts.synthesize_streaming("Warmup sentence for the engine to initialize."):
            pass

    print("\n[Benchmark] Streaming TTS (sliding-window SNAC):\n")
    print(f"  {'Text':<55} {'Words':>5} {'TTFT':>8} {'TTFA':>8} {'Total':>8} {'Audio':>7}")
    print("  " + "-" * 100)

    for text in test_texts:
        t0 = time.perf_counter()
        ttft_val = None
        ttfa_val = None
        chunks = []

        async for audio_chunk, metrics in tts.synthesize_streaming(text):
            if metrics:
                ttft_val = metrics["ttft_ms"]
                ttfa_val = metrics["ttfa_ms"]
            chunks.append(audio_chunk)

        t_total = time.perf_counter() - t0
        audio = np.concatenate(chunks) if chunks else np.array([])
        audio_dur = len(audio) / SAMPLE_RATE if len(audio) > 0 else 0
        wc = len(text.split())

        label = text[:52] + "..." if len(text) > 55 else text
        print(
            f"  {label:<55} "
            f"{wc:>5} "
            f"{ttft_val or 0:>6.0f}ms "
            f"{ttfa_val or 0:>6.0f}ms "
            f"{fmt_ms(t_total):>8} "
            f"{audio_dur:>6.2f}s"
        )

    avg_text = "Hello! I am doing great today. How can I help you with your project? Let me know what you need."
    wc = len(avg_text.split())
    print(f"\n[Benchmark] 5-run average ({wc} words):\n")
    times_ttft = []
    times_ttfa = []
    times_total = []

    for i in range(5):
        t0 = time.perf_counter()
        ttft_val = None
        ttfa_val = None

        async for audio_chunk, metrics in tts.synthesize_streaming(avg_text):
            if metrics:
                ttft_val = metrics["ttft_ms"]
                ttfa_val = metrics["ttfa_ms"]

        t_total = time.perf_counter() - t0

        if ttft_val is not None:
            times_ttft.append(ttft_val)
        if ttfa_val is not None:
            times_ttfa.append(ttfa_val)
        times_total.append(t_total)

        print(
            f"    Run {i+1}: "
            f"TTFT={ttft_val or 0:>6.0f}ms  "
            f"TTFA={ttfa_val or 0:>6.0f}ms  "
            f"Total={fmt_ms(t_total):>8}"
        )

    if times_ttft:
        print(
            f"\n    AVG:   "
            f"TTFT={np.mean(times_ttft):>6.0f}ms  "
            f"TTFA={np.mean(times_ttfa):>6.0f}ms  "
            f"Total={fmt_ms(np.mean(times_total)):>8}"
        )

    del tts
    torch.cuda.empty_cache()


async def async_main():
    print("\n" + "#" * 60)
    print("  GOYGOY MODEL BENCHMARK")
    print("#" * 60)

    benchmark_vad()
    benchmark_asr()
    benchmark_llm()
    await benchmark_tts()

    print("\n" + "=" * 60)
    print("  BENCHMARK COMPLETE")
    print("=" * 60 + "\n")


if __name__ == "__main__":
    asyncio.run(async_main())
