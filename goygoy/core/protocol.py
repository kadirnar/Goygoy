from enum import Enum
from typing import Any

MIC_AUDIO_PREFIX = b"\x01"
TTS_AUDIO_PREFIX = b"\x02"


class PipelineState(str, Enum):
    IDLE = "idle"
    LISTENING = "listening"
    THINKING = "thinking"
    SPEAKING = "speaking"


class ClientMessageType(str, Enum):
    SESSION_START = "session.start"
    SESSION_END = "session.end"
    BARGE_IN = "barge_in"
    MIC_TOGGLE = "mic.toggle"


class ServerMessageType(str, Enum):
    SESSION_STARTED = "session.started"
    STATE_CHANGE = "state.change"
    TRANSCRIPT_USER = "transcript.user"
    TRANSCRIPT_ASSISTANT = "transcript.assistant"
    AUDIO_DONE = "audio.done"
    AUDIO_STOP = "audio.stop"
    METRICS = "metrics"
    ERROR = "error"


def make_message(msg_type: ServerMessageType, **kwargs: Any) -> dict:
    return {"type": msg_type.value, **kwargs}


def session_started() -> dict:
    return make_message(ServerMessageType.SESSION_STARTED)


def state_change(state: PipelineState) -> dict:
    return make_message(ServerMessageType.STATE_CHANGE, state=state.value)


def transcript_user(text: str) -> dict:
    return make_message(ServerMessageType.TRANSCRIPT_USER, text=text)


def transcript_assistant(text: str, final: bool = False) -> dict:
    return make_message(ServerMessageType.TRANSCRIPT_ASSISTANT, text=text, final=final)


def audio_done() -> dict:
    return make_message(ServerMessageType.AUDIO_DONE)


def audio_stop() -> dict:
    return make_message(ServerMessageType.AUDIO_STOP)


def metrics(
    asr_ms: float,
    ttft_ms: float,
    ttffa_ms: float,
    tts_ms: float | None = None,
    total_ms: float | None = None,
) -> dict:
    return make_message(
        ServerMessageType.METRICS,
        asr_ms=round(asr_ms),
        ttft_ms=round(ttft_ms),
        ttffa_ms=round(ttffa_ms),
        tts_ms=round(tts_ms) if tts_ms is not None else None,
        total_ms=round(total_ms) if total_ms is not None else None,
    )


def error(message: str) -> dict:
    return make_message(ServerMessageType.ERROR, message=message)
