import logging
import os
from collections.abc import Generator

from cerebras.cloud.sdk import Cerebras
from dotenv import load_dotenv

logger = logging.getLogger(__name__)

load_dotenv()


class LLMClient:
    def __init__(
        self,
        model: str = "gpt-oss-120b",
        api_key: str | None = None,
    ):
        self.model = model
        key = api_key or os.environ.get("CEREBRAS_API_KEY", "")
        self.client = Cerebras(api_key=key)
        logger.info(f"Cerebras client ready: {model}")

    def chat(self, prompt: str, stream: bool = True) -> str | Generator[str, None, None]:
        messages = [{"role": "user", "content": prompt}]
        if stream:
            return self._stream(messages)
        response = self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            stream=False,
        )
        return response.choices[0].message.content

    def chat_with_history(
        self,
        messages: list[dict],
        stream: bool = True,
    ) -> str | Generator[str, None, None]:
        if stream:
            return self._stream(messages)
        response = self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            stream=False,
        )
        return response.choices[0].message.content

    def _stream(self, messages: list[dict]) -> Generator[str, None, None]:
        stream = self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            stream=True,
        )
        for chunk in stream:
            content = chunk.choices[0].delta.content
            if content:
                yield content
