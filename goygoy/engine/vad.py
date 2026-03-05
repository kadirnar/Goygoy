import logging
from collections import deque
from enum import Enum

import numpy as np
import torch

from goygoy.core.config import VADConfig

logger = logging.getLogger(__name__)


class VADState(Enum):
    IDLE = "idle"
    SPEAKING = "speaking"


class SileroVAD:
    def __init__(self, config: VADConfig | None = None, device: str = "cuda"):
        self.config = config or VADConfig()
        self.state = VADState.IDLE
        self.device = device

        self.model, _ = torch.hub.load(
            "snakers4/silero-vad", "silero_vad", trust_repo=True
        )
        self.model.to(device)
        self.model.eval()

        samples_per_ms = self.config.sample_rate // 1000
        self._min_speech_samples = self.config.min_speech_ms * samples_per_ms
        self._min_silence_samples = self.config.min_silence_ms * samples_per_ms
        self._pre_pad_samples = self.config.pre_speech_pad_ms * samples_per_ms

        self._ring_buffer: deque[np.ndarray] = deque()
        self._ring_buffer_samples = 0
        self._speech_buffer: list[np.ndarray] = []
        self._speech_samples = 0
        self._silence_samples = 0

        logger.info(f"Silero VAD initialized ({device})")

    def reset(self) -> None:
        self.state = VADState.IDLE
        self.model.reset_states()
        self._ring_buffer.clear()
        self._ring_buffer_samples = 0
        self._speech_buffer.clear()
        self._speech_samples = 0
        self._silence_samples = 0

    def process_chunk(self, chunk: np.ndarray) -> tuple[str, np.ndarray | None]:
        tensor = torch.from_numpy(chunk).float().to(self.device)
        prob = self.model(tensor, self.config.sample_rate).item()
        is_speech = prob >= self.config.threshold

        if self.state == VADState.IDLE:
            self._ring_buffer.append(chunk.copy())
            self._ring_buffer_samples += len(chunk)
            while self._ring_buffer_samples > self._pre_pad_samples:
                removed = self._ring_buffer.popleft()
                self._ring_buffer_samples -= len(removed)

            if is_speech:
                self.state = VADState.SPEAKING
                self._silence_samples = 0
                self._speech_buffer = list(self._ring_buffer)
                self._speech_samples = self._ring_buffer_samples
                self._speech_buffer.append(chunk.copy())
                self._speech_samples += len(chunk)
                self._ring_buffer.clear()
                self._ring_buffer_samples = 0
                return "speech_start", None
            return "silence", None

        self._speech_buffer.append(chunk.copy())
        self._speech_samples += len(chunk)

        if not is_speech:
            self._silence_samples += len(chunk)
            if self._silence_samples >= self._min_silence_samples:
                self.state = VADState.IDLE
                if self._speech_samples >= self._min_speech_samples:
                    audio = np.concatenate(self._speech_buffer)
                    self._speech_buffer.clear()
                    self._speech_samples = 0
                    self._silence_samples = 0
                    return "speech_end", audio
                self._speech_buffer.clear()
                self._speech_samples = 0
                self._silence_samples = 0
                return "silence", None
        else:
            self._silence_samples = 0

        return "speaking", None
