import logging
import time
from collections.abc import AsyncGenerator
from dataclasses import dataclass

import numpy as np
import soundfile as sf
import torch
from snac import SNAC
from transformers import AutoTokenizer
from vllm import AsyncLLMEngine, AsyncEngineArgs, SamplingParams

logger = logging.getLogger(__name__)

TOKENISER_LENGTH = 151669
END_OF_TEXT = 151645
START_OF_SPEECH = TOKENISER_LENGTH + 1
END_OF_SPEECH = TOKENISER_LENGTH + 2
START_OF_HUMAN = TOKENISER_LENGTH + 3
END_OF_HUMAN = TOKENISER_LENGTH + 4
AUDIO_TOKENS_START = TOKENISER_LENGTH + 10

SAMPLE_RATE = 24000
SAMPLES_PER_FRAME = 2048


@dataclass
class SynthesisResult:
    text: str
    audio: np.ndarray | None
    sample_rate: int
    elapsed: float


class TTSEngine:
    def __init__(
        self,
        model: str = "Vyvo/Vyvo-Qwen3-1.7-Arataki_Itto",
        snac_model: str = "hubertsiuzdak/snac_24khz",
        gpu_memory_utilization: float = 0.95,
        max_model_len: int = 2048,
        max_tokens: int = 1200,
        temperature: float = 0.6,
        top_p: float = 0.95,
        top_k: int = 20,
        repetition_penalty: float = 1.1,
    ):
        self.model = model
        self.max_tokens = max_tokens
        self.temperature = temperature
        self.top_p = top_p
        self.top_k = top_k
        self.repetition_penalty = repetition_penalty
        self._request_counter = 0

        logger.info(f"Loading TTS tokenizer: {model}")
        self.tokenizer = AutoTokenizer.from_pretrained(model)

        logger.info(f"Loading TTS model (AsyncLLMEngine): {model}")
        engine_args = AsyncEngineArgs(
            model=model,
            dtype="bfloat16",
            gpu_memory_utilization=gpu_memory_utilization,
            max_model_len=max_model_len,
            max_num_seqs=1,
            disable_log_stats=True,
        )
        self.engine = AsyncLLMEngine.from_engine_args(engine_args)

        logger.info(f"Loading SNAC codec: {snac_model}")
        self.snac = SNAC.from_pretrained(snac_model).eval().to("cuda")

    def _build_prompt(self, text: str) -> list[int]:
        text_ids = self.tokenizer(text, return_tensors="pt").input_ids[0].tolist()
        return [START_OF_HUMAN] + text_ids + [END_OF_TEXT, END_OF_HUMAN]

    def _decode_snac(self, code_list: list[int]) -> np.ndarray | None:
        num_frames = len(code_list) // 7
        if num_frames == 0:
            return None

        l1, l2, l3 = [], [], []
        for i in range(num_frames):
            b = 7 * i
            r = code_list[b : b + 7]
            l1.append(r[0])
            l2.extend([r[1] - 4096, r[4] - 16384])
            l3.extend([r[2] - 8192, r[3] - 12288, r[5] - 20480, r[6] - 24576])

        with torch.inference_mode():
            audio = self.snac.decode([
                torch.tensor([l1], dtype=torch.int32, device="cuda"),
                torch.tensor([l2], dtype=torch.int32, device="cuda"),
                torch.tensor([l3], dtype=torch.int32, device="cuda"),
            ])
        return audio.detach().squeeze().cpu().numpy()

    async def synthesize_streaming(
        self, text: str,
    ) -> AsyncGenerator[tuple[np.ndarray, dict | None], None]:
        """Stream audio via sliding-window SNAC decode.

        Decodes 4 frames at a time, extracts the interior frame where
        convolutions have full context — eliminates boundary artifacts.
        """
        prompt_ids = self._build_prompt(text)
        self._request_counter += 1
        request_id = f"tts-{self._request_counter}"

        params = SamplingParams(
            temperature=self.temperature,
            top_p=self.top_p,
            top_k=self.top_k,
            max_tokens=self.max_tokens,
            repetition_penalty=self.repetition_penalty,
            stop_token_ids=[END_OF_SPEECH],
        )

        processed_count = 0
        audio_codes: list[int] = []
        speech_started = False
        t_start = time.perf_counter()
        ttft: float | None = None
        first_audio_sent = False
        chunks_sent = 0

        try:
            async for result in self.engine.generate(
                {"prompt_token_ids": prompt_ids},
                params,
                request_id=request_id,
            ):
                if ttft is None:
                    ttft = time.perf_counter() - t_start

                all_ids = list(result.outputs[0].token_ids)
                new_ids = all_ids[processed_count:]
                processed_count = len(all_ids)

                for tid in new_ids:
                    if tid == START_OF_SPEECH:
                        speech_started = True
                        continue
                    if tid == END_OF_SPEECH:
                        break
                    if speech_started and tid >= AUDIO_TOKENS_START:
                        audio_codes.append(tid - AUDIO_TOKENS_START)

                num_frames = len(audio_codes) // 7
                while num_frames >= 4 and chunks_sent < num_frames - 3:
                    w_start = chunks_sent * 7
                    window = audio_codes[w_start : w_start + 28]
                    audio = self._decode_snac(window)
                    if audio is not None:
                        chunk = audio[SAMPLES_PER_FRAME : SAMPLES_PER_FRAME * 2]
                        metrics = None
                        if not first_audio_sent:
                            first_audio_sent = True
                            ttfa = time.perf_counter() - t_start
                            metrics = {
                                "ttft_ms": (ttft or 0) * 1000,
                                "ttfa_ms": ttfa * 1000,
                                "tts_ms": ttfa * 1000,
                            }
                            logger.info(
                                f"TTS streaming: TTFT={metrics['ttft_ms']:.0f}ms "
                                f"TTFA={metrics['ttfa_ms']:.0f}ms"
                            )
                        yield chunk, metrics
                    chunks_sent += 1

            num_frames = len(audio_codes) // 7
            if num_frames > 0:
                if chunks_sent == 0:
                    audio = self._decode_snac(audio_codes[: num_frames * 7])
                    if audio is not None:
                        metrics = None
                        if not first_audio_sent:
                            first_audio_sent = True
                            ttfa = time.perf_counter() - t_start
                            metrics = {
                                "ttft_ms": (ttft or 0) * 1000,
                                "ttfa_ms": ttfa * 1000,
                                "tts_ms": ttfa * 1000,
                            }
                        yield audio, metrics
                else:
                    unsent_start = chunks_sent + 1
                    if unsent_start < num_frames:
                        ctx_frame = unsent_start - 1
                        flush_codes = audio_codes[ctx_frame * 7 : num_frames * 7]
                        audio = self._decode_snac(flush_codes)
                        if audio is not None and len(audio) > SAMPLES_PER_FRAME:
                            yield audio[SAMPLES_PER_FRAME:], None

            total = time.perf_counter() - t_start
            logger.info(f"TTS total={total * 1000:.0f}ms tokens={processed_count}")

        finally:
            await self.engine.abort(request_id)
            logger.debug(f"TTS request {request_id} aborted/cleaned up")

    async def synthesize(self, text: str) -> SynthesisResult:
        t0 = time.perf_counter()
        chunks = []
        async for audio_chunk, _ in self.synthesize_streaming(text):
            chunks.append(audio_chunk)

        elapsed = time.perf_counter() - t0
        audio = np.concatenate(chunks) if chunks else None

        if audio is not None:
            duration = len(audio) / SAMPLE_RATE
            rtf = elapsed / duration
            logger.info(f"TTS audio: {duration:.2f}s, RTF: {rtf:.4f}")

        return SynthesisResult(
            text=text,
            audio=audio,
            sample_rate=SAMPLE_RATE,
            elapsed=elapsed,
        )

    async def synthesize_to_file(self, text: str, path: str) -> SynthesisResult:
        result = await self.synthesize(text)
        if result.audio is not None:
            sf.write(path, result.audio, result.sample_rate)
            logger.info(f"TTS saved audio to {path}")
        else:
            logger.warning("TTS produced no audio, skipping file write")
        return result
