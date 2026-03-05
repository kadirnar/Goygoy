from dataclasses import dataclass, field, fields
from pathlib import Path

import yaml


@dataclass
class ASRConfig:
    model: str = "Qwen/Qwen3-ASR-1.7B"
    gpu_memory_utilization: float = 0.4
    max_model_len: int = 4096
    max_tokens: int = 512


@dataclass
class LLMConfig:
    model: str = "gpt-oss-120b"
    api_key: str = ""
    system_prompt: str = (
        "You are Goygoy, a friendly and helpful voice assistant. "
        "Keep your responses concise and conversational -- typically 1-3 sentences. "
        "You are speaking out loud, so avoid markdown, bullet points, or code blocks. "
        "Be warm, natural, and engaging."
    )
    max_history_turns: int = 20


@dataclass
class TTSConfig:
    model: str = "Vyvo/Vyvo-Qwen3-1.7-Arataki_Itto"
    snac_model: str = "hubertsiuzdak/snac_24khz"
    gpu_memory_utilization: float = 0.4
    max_model_len: int = 2048
    max_tokens: int = 1200
    sample_rate: int = 24000
    temperature: float = 0.6
    top_p: float = 0.95
    top_k: int = 20
    repetition_penalty: float = 1.1


@dataclass
class VADConfig:
    threshold: float = 0.5
    min_speech_ms: int = 250
    min_silence_ms: int = 1500
    pre_speech_pad_ms: int = 300
    sample_rate: int = 16000
    window_size: int = 512


@dataclass
class ServerConfig:
    host: str = "0.0.0.0"
    port: int = 8000
    mic_sample_rate: int = 16000
    mic_chunk_ms: int = 100
    audio_send_chunk_size: int = 4800


@dataclass
class PipelineConfig:
    min_words_per_tts_chunk: int = 20


@dataclass
class GoygoyConfig:
    asr: ASRConfig = field(default_factory=ASRConfig)
    llm: LLMConfig = field(default_factory=LLMConfig)
    tts: TTSConfig = field(default_factory=TTSConfig)
    vad: VADConfig = field(default_factory=VADConfig)
    server: ServerConfig = field(default_factory=ServerConfig)
    pipeline: PipelineConfig = field(default_factory=PipelineConfig)


_SECTION_MAP = {
    "asr": ASRConfig,
    "llm": LLMConfig,
    "tts": TTSConfig,
    "vad": VADConfig,
    "server": ServerConfig,
    "pipeline": PipelineConfig,
}


def _build_section(cls, data: dict):
    valid = {f.name for f in fields(cls)}
    return cls(**{k: v for k, v in data.items() if k in valid})


def _find_config_dir() -> Path | None:
    candidates = [
        Path.cwd() / "config",
        Path(__file__).resolve().parent.parent / "config",
    ]
    return next((p for p in candidates if p.is_dir()), None)


def load_config(config_dir: str | Path | None = None) -> GoygoyConfig:
    if config_dir is not None:
        cfg_dir = Path(config_dir)
    else:
        cfg_dir = _find_config_dir()

    if cfg_dir is None:
        return GoygoyConfig()

    # Load config.yaml (models, keys)
    config_path = cfg_dir / "config.yaml"
    raw = {}
    if config_path.is_file():
        with open(config_path) as f:
            raw = yaml.safe_load(f) or {}

    kwargs = {}
    for section_name, cls in _SECTION_MAP.items():
        if section_name in raw and isinstance(raw[section_name], dict):
            kwargs[section_name] = _build_section(cls, raw[section_name])

    # Load prompt.yaml (system prompt) → overrides llm.system_prompt
    prompt_path = cfg_dir / "prompt.yaml"
    if prompt_path.is_file():
        with open(prompt_path) as f:
            prompt_data = yaml.safe_load(f) or {}
        if "system_prompt" in prompt_data:
            if "llm" not in kwargs:
                kwargs["llm"] = LLMConfig()
            kwargs["llm"] = LLMConfig(
                **{
                    **{fld.name: getattr(kwargs["llm"], fld.name) for fld in fields(LLMConfig)},
                    "system_prompt": prompt_data["system_prompt"],
                }
            )

    return GoygoyConfig(**kwargs)
