import logging
import os
import time
from dataclasses import dataclass

import numpy as np
from vllm import LLM, SamplingParams
from vllm.config import CompilationConfig

from goygoy.core.audio import save_temp_wav, remove_temp_file

logger = logging.getLogger(__name__)


@dataclass
class TranscriptionResult:
    file: str
    language: str
    text: str
    elapsed: float


class ASREngine:
    def __init__(
        self,
        model: str = "Qwen/Qwen3-ASR-1.7B",
        gpu_memory_utilization: float = 0.9,
        max_model_len: int = 4096,
        max_tokens: int = 512,
    ):
        self.model = model
        self.max_tokens = max_tokens
        logger.info(f"Loading ASR model: {model}")
        self.llm = LLM(
            model=model,
            dtype="bfloat16",
            gpu_memory_utilization=gpu_memory_utilization,
            allowed_local_media_path="/",
            max_model_len=max_model_len,
            compilation_config=CompilationConfig(compile_mm_encoder=True),
        )

    def _parse_output(self, raw: str) -> tuple[str, str]:
        if "<asr_text>" in raw:
            prefix, text = raw.split("<asr_text>", 1)
            lang = prefix.replace("language", "").strip()
            return lang, text
        return "", raw

    def transcribe(self, audio_files: list[str]) -> list[TranscriptionResult]:
        sampling_params = SamplingParams(temperature=0.01, max_tokens=self.max_tokens)

        conversations = []
        for f in audio_files:
            conversations.append([
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "audio_url",
                            "audio_url": {"url": f"file://{os.path.abspath(f)}"},
                        },
                    ],
                }
            ])

        t0 = time.perf_counter()
        outputs = self.llm.chat(conversations, sampling_params=sampling_params)
        elapsed = time.perf_counter() - t0

        results = []
        for i, output in enumerate(outputs):
            lang, text = self._parse_output(output.outputs[0].text)
            results.append(TranscriptionResult(
                file=audio_files[i],
                language=lang,
                text=text,
                elapsed=elapsed / len(audio_files),
            ))

        logger.info(f"Transcribed {len(audio_files)} file(s) in {elapsed:.2f}s")
        return results

    def transcribe_buffer(self, audio: np.ndarray, sample_rate: int = 16000) -> TranscriptionResult:
        tmp_path = save_temp_wav(audio, sample_rate)
        try:
            results = self.transcribe([tmp_path])
            return results[0]
        finally:
            remove_temp_file(tmp_path)
