import asyncio
import logging
import time
from collections.abc import AsyncGenerator

import numpy as np

from goygoy.core.audio import float32_to_int16, split_sentences
from goygoy.core.config import GoygoyConfig
from goygoy.core.session import Session
from goygoy.engine.asr import ASREngine
from goygoy.engine.llm import LLMClient
from goygoy.engine.tts import TTSEngine

logger = logging.getLogger(__name__)


class StreamingPipeline:
    def __init__(
        self,
        asr: ASREngine,
        llm: LLMClient,
        tts: TTSEngine,
        config: GoygoyConfig,
    ):
        self.asr = asr
        self.llm = llm
        self.tts = tts
        self.config = config

    async def transcribe(self, audio: np.ndarray, sample_rate: int = 16000) -> str:
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(
            None, self.asr.transcribe_buffer, audio, sample_rate
        )
        return result.text.strip()

    async def generate_response(
        self,
        session: Session,
        generation_id: int,
        t_start: float | None = None,
    ) -> AsyncGenerator[tuple[str, bytes | None, dict | None], None]:
        messages = session.get_messages()
        pipeline_start = t_start or time.perf_counter()

        loop = asyncio.get_event_loop()
        token_gen = await loop.run_in_executor(
            None, self.llm.chat_with_history, messages, True
        )

        full_response = ""
        buffer = ""
        ttft_time: float | None = None
        first_audio_sent = False
        sentence_queue: asyncio.Queue[str | None] = asyncio.Queue()

        async def produce_sentences():
            nonlocal buffer, full_response, ttft_time
            try:
                for token in token_gen:
                    if session.is_cancelled():
                        break
                    if ttft_time is None:
                        ttft_time = time.perf_counter()
                    buffer += token
                    full_response += token
                    sentences, remainder = split_sentences(buffer)
                    for sent in sentences:
                        await sentence_queue.put(sent)
                    buffer = remainder
                if buffer.strip() and not session.is_cancelled():
                    await sentence_queue.put(buffer.strip())
            finally:
                await sentence_queue.put(None)

        producer = asyncio.create_task(produce_sentences())
        min_words = self.config.pipeline.min_words_per_tts_chunk

        try:
            tts_text_buffer = ""

            async def dispatch_tts(text_block: str):
                nonlocal first_audio_sent
                is_first_chunk = True
                async for audio_chunk, tts_metrics in self.tts.synthesize_streaming(text_block):
                    if session.is_cancelled():
                        break

                    audio_bytes = float32_to_int16(audio_chunk)

                    timing = None
                    if not first_audio_sent and audio_bytes:
                        first_audio_sent = True
                        now = time.perf_counter()
                        timing = {
                            "ttft_ms": ((ttft_time or now) - pipeline_start) * 1000,
                            "ttffa_ms": (now - pipeline_start) * 1000,
                            "tts_ms": tts_metrics["tts_ms"] if tts_metrics else 0,
                        }

                    text = text_block if is_first_chunk else ""
                    is_first_chunk = False
                    yield text, audio_bytes, timing

                if is_first_chunk:
                    yield text_block, None, None

            while True:
                sentence = await sentence_queue.get()
                if sentence is None:
                    if tts_text_buffer.strip():
                        async for item in dispatch_tts(tts_text_buffer):
                            yield item
                    break
                if session.is_cancelled():
                    break

                tts_text_buffer += (" " if tts_text_buffer else "") + sentence
                word_count = len(tts_text_buffer.split())

                if word_count >= min_words:
                    async for item in dispatch_tts(tts_text_buffer):
                        yield item
                    tts_text_buffer = ""
        finally:
            producer.cancel()
            try:
                await producer
            except asyncio.CancelledError:
                pass

        if full_response.strip():
            session.add_assistant_message(full_response.strip())
