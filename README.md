# Goygoy

Real-time speech-to-speech voice chat.

## Project Structure

```
goygoy/          # Library — reusable engines and pipeline
  core/          # Core abstractions
    audio.py     # Audio conversion utilities
    config.py    # Configuration dataclasses and loader
    pipeline.py  # Streaming ASR → LLM → TTS pipeline
    protocol.py  # WebSocket message protocol
    session.py   # Conversation session management
  engine/        # ML engines (ASR, LLM, TTS, VAD)

server/          # Application — FastAPI web server
  app.py         # WebSocket server, serves frontend

frontend/        # Next.js web UI
config/          # YAML configuration files
scripts/         # Benchmarking tools
```

## Setup

```bash
# Backend
python -m venv .venv
source .venv/bin/activate
pip install -e .
cp .env.example .env  # Add your CEREBRAS_API_KEY

# Frontend
cd frontend && npm install && npm run build && cd ..

# Run
python -m goygoy
```

Opens at `http://localhost:8000`.

## Configuration

Edit `config/config.yaml` to change models, VAD thresholds, and server settings.
Edit `config/prompt.yaml` to customize the system prompt.

## License

[MIT](LICENSE)
