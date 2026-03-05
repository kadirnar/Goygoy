import re
import tempfile
from pathlib import Path

import numpy as np
import soundfile as sf


def int16_to_float32(audio: bytes) -> np.ndarray:
    samples = np.frombuffer(audio, dtype=np.int16)
    return samples.astype(np.float32) / 32768.0


def float32_to_int16(audio: np.ndarray) -> bytes:
    clipped = np.clip(audio, -1.0, 1.0)
    return (clipped * 32767).astype(np.int16).tobytes()


def save_temp_wav(audio: np.ndarray, sample_rate: int) -> str:
    tmp = tempfile.NamedTemporaryFile(suffix=".wav", delete=False)
    sf.write(tmp.name, audio, sample_rate)
    tmp.close()
    return tmp.name


def remove_temp_file(path: str) -> None:
    try:
        Path(path).unlink(missing_ok=True)
    except OSError:
        pass


_SENTENCE_RE = re.compile(r'(?<=[.!?])\s+')


def split_sentences(text: str) -> tuple[list[str], str]:
    if not text:
        return [], ""

    stripped = text.rstrip()
    ends_complete = stripped and stripped[-1] in ".!?"

    parts = _SENTENCE_RE.split(text)
    parts = [p.strip() for p in parts if p.strip()]

    if not parts:
        return [], text

    if ends_complete:
        return parts, ""
    return parts[:-1], parts[-1]
