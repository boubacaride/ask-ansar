#!/usr/bin/env python3
"""
Download Mishari Alafasy reference audio clips from EveryAyah.com
for use as voice cloning reference with Coqui TTS XTTS-v2.

Usage:
    python download_reference.py

Downloads select ayahs that showcase Mishari's distinctive voice clearly.
These clips are used as reference audio for voice cloning.
"""

import os
import requests
import subprocess
import sys

# EveryAyah.com base URL for Mishari Alafasy 128kbps
BASE_URL = "https://everyayah.com/data/Alafasy_128kbps"

# Selected ayahs with clear, sustained recitation
# Format: (surah_number, ayah_number)
AYAHS = [
    (1, 1),   # Al-Fatiha - Bismillah
    (1, 2),   # Al-Fatiha - Alhamdulillah
    (1, 3),   # Al-Fatiha - Ar-Rahman Ar-Raheem
    (1, 4),   # Al-Fatiha - Maliki yawm ad-deen
    (2, 255), # Ayat al-Kursi - long, distinctive recitation
    (36, 1),  # Ya-Sin opening
    (36, 2),  # Ya-Sin
    (112, 1), # Al-Ikhlas
    (112, 2), # Al-Ikhlas
    (113, 1), # Al-Falaq
]

REFERENCE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "reference_audio")


def download_ayah(surah: int, ayah: int) -> str:
    """Download a single ayah MP3 from EveryAyah.com."""
    filename = f"{surah:03d}{ayah:03d}.mp3"
    url = f"{BASE_URL}/{filename}"
    output_path = os.path.join(REFERENCE_DIR, filename)

    if os.path.exists(output_path):
        print(f"  [skip] {filename} already exists")
        return output_path

    print(f"  [download] {filename} from {url}")
    response = requests.get(url, timeout=30)
    response.raise_for_status()

    with open(output_path, "wb") as f:
        f.write(response.content)

    return output_path


def convert_to_wav(mp3_path: str) -> str:
    """Convert MP3 to WAV 24kHz mono (required by XTTS-v2)."""
    wav_path = mp3_path.replace(".mp3", ".wav")
    if os.path.exists(wav_path):
        print(f"  [skip] {os.path.basename(wav_path)} already exists")
        return wav_path

    # Try librosa + soundfile (installed with coqui-tts)
    try:
        import librosa
        import soundfile as sf
        y, sr = librosa.load(mp3_path, sr=24000, mono=True)
        sf.write(wav_path, y, 24000)
        print(f"  [convert] {os.path.basename(mp3_path)} -> {os.path.basename(wav_path)} (librosa)")
        return wav_path
    except Exception as e:
        print(f"  [librosa failed] {e}")

    # Fallback to pydub (requires ffmpeg)
    try:
        from pydub import AudioSegment
        audio = AudioSegment.from_mp3(mp3_path)
        audio = audio.set_frame_rate(24000).set_channels(1)
        audio.export(wav_path, format="wav")
        print(f"  [convert] {os.path.basename(mp3_path)} -> {os.path.basename(wav_path)} (pydub)")
    except Exception as e2:
        print(f"  [pydub failed] {e2}")
        # Fallback to ffmpeg CLI
        try:
            subprocess.run([
                "ffmpeg", "-i", mp3_path,
                "-ar", "24000", "-ac", "1",
                "-y", wav_path
            ], check=True, capture_output=True)
            print(f"  [convert] {os.path.basename(mp3_path)} -> {os.path.basename(wav_path)} (ffmpeg)")
        except FileNotFoundError:
            print(f"  [error] No converter available, keeping MP3: {os.path.basename(mp3_path)}")
            return mp3_path

    return wav_path


def combine_reference_clips(wav_files: list[str]) -> str:
    """Combine multiple WAV clips into a single reference file (6-15s ideal for XTTS-v2)."""
    combined_path = os.path.join(REFERENCE_DIR, "mishari_reference.wav")
    if os.path.exists(combined_path):
        print(f"  [skip] Combined reference already exists")
        return combined_path

    try:
        import numpy as np
        import soundfile as sf

        all_audio = []
        silence = np.zeros(int(24000 * 0.3), dtype=np.float32)  # 300ms silence at 24kHz

        for wav in wav_files[:5]:  # Use first 5 clips (aim for ~10-15s total)
            if wav.endswith(".wav") and os.path.exists(wav):
                data, sr = sf.read(wav, dtype='float32')
                if len(data.shape) > 1:
                    data = data.mean(axis=1)
                all_audio.append(data)
                all_audio.append(silence)

        if not all_audio:
            print("  [warning] No WAV files to combine")
            return wav_files[0] if wav_files else ""

        combined = np.concatenate(all_audio)

        # Trim to max 15 seconds (15 * 24000 = 360000 samples)
        max_samples = 15 * 24000
        if len(combined) > max_samples:
            combined = combined[:max_samples]

        sf.write(combined_path, combined, 24000)
        duration = len(combined) / 24000
        print(f"  [combined] Created {os.path.basename(combined_path)} ({duration:.1f}s)")
    except Exception as e:
        print(f"  [warning] Could not combine clips: {e}")
        return wav_files[0] if wav_files else ""

    return combined_path


def main():
    os.makedirs(REFERENCE_DIR, exist_ok=True)
    print("Downloading Mishari Alafasy reference audio...")
    print(f"Output directory: {REFERENCE_DIR}\n")

    mp3_files = []
    for surah, ayah in AYAHS:
        try:
            mp3_path = download_ayah(surah, ayah)
            mp3_files.append(mp3_path)
        except Exception as e:
            print(f"  [error] Failed to download {surah:03d}{ayah:03d}: {e}")

    print(f"\nConverting {len(mp3_files)} clips to WAV 24kHz mono...")
    wav_files = []
    for mp3 in mp3_files:
        wav = convert_to_wav(mp3)
        wav_files.append(wav)

    print("\nCombining clips into single reference file...")
    reference = combine_reference_clips(wav_files)

    print(f"\nDone! Reference audio: {reference}")
    print(f"Total clips downloaded: {len(mp3_files)}")
    print(f"\nYou can now start the TTS server with: python main.py")


if __name__ == "__main__":
    main()
