import asyncio
import logging
from dataclasses import dataclass, field

from goygoy.core.config import GoygoyConfig
from goygoy.core.protocol import PipelineState

logger = logging.getLogger(__name__)


@dataclass
class Session:
    config: GoygoyConfig
    session_id: str
    state: PipelineState = PipelineState.IDLE
    generation_id: int = 0
    conversation_history: list[dict] = field(default_factory=list)
    _cancel_event: asyncio.Event = field(default_factory=asyncio.Event)
    mic_enabled: bool = True

    def next_generation(self) -> int:
        self.generation_id += 1
        self._cancel_event.clear()
        return self.generation_id

    def cancel_generation(self) -> None:
        self._cancel_event.set()

    def is_cancelled(self) -> bool:
        return self._cancel_event.is_set()

    def add_user_message(self, text: str) -> None:
        self.conversation_history.append({"role": "user", "content": text})
        self._trim_history()

    def add_assistant_message(self, text: str) -> None:
        self.conversation_history.append({"role": "assistant", "content": text})
        self._trim_history()

    def get_messages(self) -> list[dict]:
        system = [{"role": "system", "content": self.config.llm.system_prompt}]
        return system + self.conversation_history

    def _trim_history(self) -> None:
        max_msgs = self.config.llm.max_history_turns * 2
        if len(self.conversation_history) > max_msgs:
            self.conversation_history = self.conversation_history[-max_msgs:]
