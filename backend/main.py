#!/usr/bin/env python3
"""
FastAPI TTS Server using Coqui XTTS-v2 with Mishari Alafasy voice cloning.

Provides a /generate-speech endpoint that generates Arabic speech
using Mishari Alafasy's cloned voice via the XTTS-v2 model.

Usage:
    1. First download reference audio: python download_reference.py
    2. Start server: python main.py
    3. Server runs on http://localhost:8765

The server will automatically download the XTTS-v2 model on first run (~1.8GB).
"""

import io
import os
import logging
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Mishari TTS Server", version="1.0.0")

# Allow CORS from Expo dev server and production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global TTS model reference
tts_model = None
REFERENCE_DIR = Path(__file__).parent / "reference_audio"
REFERENCE_FILE = REFERENCE_DIR / "mishari_reference.wav"


class SpeechRequest(BaseModel):
    text: str
    language: str = "ar"
    speed: float = 1.0


def get_reference_audio() -> str:
    """Find the best available reference audio file."""
    # Prefer combined reference file
    if REFERENCE_FILE.exists():
        return str(REFERENCE_FILE)

    # Fall back to individual WAV files
    wav_files = sorted(REFERENCE_DIR.glob("*.wav"))
    if wav_files:
        return str(wav_files[0])

    # Fall back to MP3 files
    mp3_files = sorted(REFERENCE_DIR.glob("*.mp3"))
    if mp3_files:
        return str(mp3_files[0])

    raise FileNotFoundError(
        "No reference audio found. Run download_reference.py first."
    )


def load_model():
    """Load the XTTS-v2 model (downloads on first use ~1.8GB)."""
    global tts_model
    if tts_model is not None:
        return tts_model

    logger.info("Loading XTTS-v2 model (first run will download ~1.8GB)...")
    try:
        from TTS.api import TTS
        import torch

        # Auto-agree to Coqui license terms (non-commercial CPML)
        os.environ["COQUI_TOS_AGREED"] = "1"

        # Monkey-patch torchaudio.load to use soundfile instead of torchcodec
        # This avoids the FFmpeg DLL dependency on Windows
        _patch_torchaudio_load()

        device = "cuda" if torch.cuda.is_available() else "cpu"
        logger.info(f"Using device: {device}")

        tts_model = TTS("tts_models/multilingual/multi-dataset/xtts_v2").to(device)
        logger.info("XTTS-v2 model loaded successfully!")
        return tts_model
    except Exception as e:
        logger.error(f"Failed to load XTTS-v2 model: {e}")
        raise


def _patch_torchaudio_load():
    """Patch torchaudio.load to use soundfile backend instead of torchcodec."""
    try:
        import torchaudio
        import soundfile as sf
        import torch
        import numpy as np

        _original_load = torchaudio.load

        def patched_load(filepath, *args, **kwargs):
            try:
                return _original_load(filepath, *args, **kwargs)
            except Exception:
                # Fallback: load with soundfile
                logger.info(f"Using soundfile fallback for: {filepath}")
                data, sr = sf.read(str(filepath), dtype='float32')
                if len(data.shape) == 1:
                    data = data[np.newaxis, :]  # (1, samples)
                else:
                    data = data.T  # (channels, samples)
                return torch.from_numpy(data), sr

        torchaudio.load = patched_load
        logger.info("Patched torchaudio.load with soundfile fallback")
    except Exception as e:
        logger.warning(f"Could not patch torchaudio.load: {e}")


@app.on_event("startup")
async def startup_event():
    """Pre-load model and verify reference audio on startup."""
    try:
        ref = get_reference_audio()
        logger.info(f"Reference audio: {ref}")
    except FileNotFoundError as e:
        logger.warning(f"Reference audio not found: {e}")
        logger.warning("Run: python download_reference.py")

    # Load model in background (don't block startup)
    try:
        load_model()
    except Exception as e:
        logger.warning(f"Model not pre-loaded: {e}")
        logger.warning("Model will be loaded on first request.")


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    model_loaded = tts_model is not None
    try:
        ref = get_reference_audio()
        ref_available = True
    except FileNotFoundError:
        ref_available = False

    return {
        "status": "ok",
        "model_loaded": model_loaded,
        "reference_audio_available": ref_available,
    }


@app.post("/generate-speech")
async def generate_speech(request: SpeechRequest):
    """
    Generate Arabic speech using Mishari Alafasy's cloned voice.

    Args:
        text: Arabic text to synthesize
        language: Language code (default: "ar")
        speed: Speech speed multiplier (default: 1.0)

    Returns:
        WAV audio stream
    """
    if not request.text or not request.text.strip():
        raise HTTPException(status_code=400, detail="Text is required")

    logger.info(f"Generating speech: {len(request.text)} chars, lang={request.language}, speed={request.speed}")

    try:
        model = load_model()
        reference = get_reference_audio()
    except FileNotFoundError as e:
        raise HTTPException(
            status_code=503,
            detail=f"Reference audio not available: {e}. Run download_reference.py first."
        )
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Model not available: {e}")

    try:
        # Generate speech with voice cloning
        # XTTS-v2 supports Arabic natively
        wav = model.tts(
            text=request.text,
            speaker_wav=reference,
            language=request.language,
            speed=request.speed,
        )

        # Convert numpy array to WAV bytes
        import numpy as np
        import wave
        import struct

        # wav is a list of floats (-1.0 to 1.0)
        wav_array = np.array(wav, dtype=np.float32)

        # Normalize and convert to 16-bit PCM
        wav_int16 = (wav_array * 32767).astype(np.int16)

        # Write WAV to buffer
        buffer = io.BytesIO()
        with wave.open(buffer, "wb") as wf:
            wf.setnchannels(1)
            wf.setsampwidth(2)  # 16-bit
            wf.setframerate(24000)  # XTTS-v2 outputs 24kHz
            wf.writeframes(wav_int16.tobytes())

        buffer.seek(0)
        logger.info(f"Generated {len(wav_int16)} samples ({len(wav_int16)/24000:.1f}s)")

        return StreamingResponse(
            buffer,
            media_type="audio/wav",
            headers={
                "Content-Disposition": "inline; filename=speech.wav",
                "Cache-Control": "no-cache",
            },
        )

    except Exception as e:
        logger.error(f"Speech generation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Speech generation failed: {e}")


@app.get("/")
async def root():
    return {
        "service": "Mishari TTS Server",
        "version": "1.0.0",
        "endpoints": {
            "/generate-speech": "POST - Generate Arabic speech with Mishari's voice",
            "/health": "GET - Health check",
        },
    }


if __name__ == "__main__":
    import uvicorn

    port = int(os.environ.get("PORT", 8765))
    logger.info(f"Starting Mishari TTS Server on port {port}")
    uvicorn.run(app, host="0.0.0.0", port=port)
