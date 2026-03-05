import os

os.environ.setdefault("VLLM_WORKER_MULTIPROC_METHOD", "spawn")

import asyncio
import json
import logging
import time
import uuid
from contextlib import asynccontextmanager
from pathlib import Path

import numpy as np
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from goygoy.core.audio import int16_to_float32
from goygoy.core.config import load_config
from goygoy.core.pipeline import StreamingPipeline
from goygoy.core import protocol as proto
from goygoy.core.protocol import (
    MIC_AUDIO_PREFIX,
    TTS_AUDIO_PREFIX,
    ClientMessageType,
    PipelineState,
)
from goygoy.core.session import Session
from goygoy.engine.asr import ASREngine
from goygoy.engine.llm import LLMClient
from goygoy.engine.tts import TTSEngine
from goygoy.engine.vad import SileroVAD

logger = logging.getLogger(__name__)

config = load_config()
pipeline: StreamingPipeline | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global pipeline

    logger.info("Initializing Goygoy engines...")

    asr = ASREngine(
        model=config.asr.model,
        gpu_memory_utilization=config.asr.gpu_memory_utilization,
        max_model_len=config.asr.max_model_len,
        max_tokens=config.asr.max_tokens,
    )
    tts = TTSEngine(
        model=config.tts.model,
        snac_model=config.tts.snac_model,
        gpu_memory_utilization=config.tts.gpu_memory_utilization,
        max_model_len=config.tts.max_model_len,
        max_tokens=config.tts.max_tokens,
        temperature=config.tts.temperature,
        top_p=config.tts.top_p,
        top_k=config.tts.top_k,
        repetition_penalty=config.tts.repetition_penalty,
    )
    llm = LLMClient(model=config.llm.model, api_key=config.llm.api_key or None)

    pipeline = StreamingPipeline(asr=asr, llm=llm, tts=tts, config=config)

    logger.info("Goygoy engines initialized successfully")
    yield


app = FastAPI(title="Goygoy Voice Chat", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health():
    return JSONResponse({"status": "ok", "engines_loaded": pipeline is not None})


@app.websocket("/ws/chat")
async def websocket_chat(ws: WebSocket):
    await ws.accept()

    session = Session(
        config=config,
        session_id=str(uuid.uuid4()),
    )

    vad = SileroVAD(config.vad)
    logger.info(f"Session {session.session_id} connected")

    async def send_json(msg: dict):
        await ws.send_json(msg)

    async def send_audio(audio_bytes: bytes):
        await ws.send_bytes(TTS_AUDIO_PREFIX + audio_bytes)

    async def set_state(state: PipelineState):
        session.state = state
        await send_json(proto.state_change(state))

    speech_task: asyncio.Task | None = None

    try:
        await send_json(proto.session_started())
        await set_state(PipelineState.LISTENING)

        while True:
            data = await ws.receive()

            if data.get("type") == "websocket.disconnect":
                break

            if "bytes" in data and data["bytes"]:
                raw = data["bytes"]
                if not raw or raw[0:1] != MIC_AUDIO_PREFIX:
                    continue

                pcm_bytes = raw[1:]
                if not pcm_bytes:
                    continue

                audio_chunk = int16_to_float32(pcm_bytes)

                chunk_samples = len(audio_chunk)
                window = config.vad.window_size
                offset = 0

                while offset < chunk_samples:
                    end = min(offset + window, chunk_samples)
                    segment = audio_chunk[offset:end]
                    if len(segment) < window:
                        segment = np.pad(segment, (0, window - len(segment)))
                    offset = end

                    event, speech_audio = vad.process_chunk(segment)

                    if event == "speech_start" and session.state in (
                        PipelineState.LISTENING,
                        PipelineState.IDLE,
                    ):
                        await set_state(PipelineState.LISTENING)

                    elif event == "speech_start" and session.state in (
                        PipelineState.SPEAKING,
                        PipelineState.THINKING,
                    ):
                        logger.info(f"Session {session.session_id} barge-in detected")
                        session.cancel_generation()
                        vad.reset()
                        await send_json(proto.audio_stop())
                        await set_state(PipelineState.LISTENING)

                    elif event == "speech_end" and speech_audio is not None:
                        if speech_task and not speech_task.done():
                            session.cancel_generation()
                            await speech_task
                        speech_task = asyncio.create_task(
                            handle_speech(
                                session, ws, speech_audio,
                                send_json, send_audio, set_state,
                            )
                        )

            elif "text" in data and data["text"]:
                try:
                    msg = json.loads(data["text"])
                except json.JSONDecodeError:
                    continue

                msg_type = msg.get("type", "")

                if msg_type == ClientMessageType.SESSION_END:
                    break
                elif msg_type == ClientMessageType.BARGE_IN:
                    logger.info(f"Session {session.session_id} client barge-in")
                    session.cancel_generation()
                    vad.reset()
                    await send_json(proto.audio_stop())
                    await set_state(PipelineState.LISTENING)
                elif msg_type == ClientMessageType.MIC_TOGGLE:
                    session.mic_enabled = not session.mic_enabled

    except WebSocketDisconnect:
        logger.info(f"Session {session.session_id} disconnected")
    except Exception:
        logger.exception(f"Session {session.session_id} error")
        try:
            await send_json(proto.error("Internal server error"))
        except Exception:
            pass
    finally:
        if speech_task and not speech_task.done():
            session.cancel_generation()
            speech_task.cancel()
            try:
                await speech_task
            except (asyncio.CancelledError, Exception):
                pass
        logger.info(f"Session {session.session_id} closed")


async def handle_speech(
    session: Session,
    ws: WebSocket,
    speech_audio: np.ndarray,
    send_json,
    send_audio,
    set_state,
):
    gen_id = session.next_generation()
    t_pipeline_start = time.perf_counter()

    await set_state(PipelineState.THINKING)
    try:
        transcript = await pipeline.transcribe(speech_audio, config.vad.sample_rate)
    except Exception:
        logger.exception("ASR failed")
        await send_json(proto.error("Transcription failed"))
        await set_state(PipelineState.LISTENING)
        return

    asr_ms = (time.perf_counter() - t_pipeline_start) * 1000

    if not transcript:
        await set_state(PipelineState.LISTENING)
        return

    await send_json(proto.transcript_user(transcript))
    session.add_user_message(transcript)

    await set_state(PipelineState.SPEAKING)
    accumulated_text = ""

    try:
        async for sentence, audio_bytes, timing in pipeline.generate_response(
            session, gen_id, t_start=t_pipeline_start
        ):
            if session.is_cancelled():
                break

            if sentence:
                accumulated_text += (" " if accumulated_text else "") + sentence
                await send_json(proto.transcript_assistant(accumulated_text, final=False))

            if timing:
                total_ms = (time.perf_counter() - t_pipeline_start) * 1000
                await send_json(proto.metrics(
                    asr_ms=asr_ms,
                    ttft_ms=timing["ttft_ms"],
                    ttffa_ms=timing["ttffa_ms"],
                    tts_ms=timing["tts_ms"],
                    total_ms=total_ms,
                ))
                logger.info(
                    f"Metrics: ASR={asr_ms:.0f}ms TTFT={timing['ttft_ms']:.0f}ms "
                    f"TTFFA={timing['ttffa_ms']:.0f}ms TTS={timing['tts_ms']:.0f}ms"
                )

            if audio_bytes and not session.is_cancelled():
                await send_audio(audio_bytes)

        if accumulated_text and not session.is_cancelled():
            await send_json(proto.transcript_assistant(accumulated_text, final=True))
            await send_json(proto.audio_done())

    except Exception:
        if not session.is_cancelled():
            logger.exception("Pipeline error")
            await send_json(proto.error("Response generation failed"))

    if not session.is_cancelled():
        await set_state(PipelineState.LISTENING)


_frontend_dist = Path(__file__).resolve().parent.parent / "frontend" / "out"
if _frontend_dist.is_dir():
    app.mount("/", StaticFiles(directory=str(_frontend_dist), html=True), name="frontend")


def main():
    import uvicorn
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(name)s %(levelname)s %(message)s")
    uvicorn.run(app, host=config.server.host, port=config.server.port)


if __name__ == "__main__":
    main()
