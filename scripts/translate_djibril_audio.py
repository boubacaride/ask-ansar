#!/usr/bin/env python3
"""
Djibril Video Series — English-to-French Audio Translation Pipeline

Downloads 3 YouTube videos, transcribes with Whisper, translates EN→FR
with Claude, generates French TTS with ElevenLabs, and merges into
final French-dubbed .mp4 files.

Environment variables required:
  ANTHROPIC_API_KEY   — Claude API key
  ELEVENLABS_API_KEY  — ElevenLabs API key
  ELEVENLABS_VOICE_ID — French male voice ID (e.g. "pNInz6obpgDQGcFmaJgB")

Usage:
  pip install -r requirements.txt
  python translate_djibril_audio.py
"""

import os
import sys
import json
import subprocess
import time
from pathlib import Path

try:
    import anthropic
except ImportError:
    print("Missing anthropic package. Run: pip install anthropic")
    sys.exit(1)

try:
    import requests
except ImportError:
    print("Missing requests package. Run: pip install requests")
    sys.exit(1)

# ─── Configuration ─────────────────────────────────────────────────

ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY", "")
ELEVENLABS_API_KEY = os.environ.get("ELEVENLABS_API_KEY", "")
ELEVENLABS_VOICE_ID = os.environ.get("ELEVENLABS_VOICE_ID", "pNInz6obpgDQGcFmaJgB")

VIDEOS = [
    {"id": "2mICw81RlWI", "url": "https://www.youtube.com/watch?v=2mICw81RlWI", "name": "djibril_partie_1"},
    {"id": "EVn1PJ2liVo", "url": "https://www.youtube.com/watch?v=EVn1PJ2liVo", "name": "djibril_partie_2"},
    {"id": "uCL4jgqHnN8", "url": "https://www.youtube.com/watch?v=uCL4jgqHnN8", "name": "djibril_partie_3"},
]

OUTPUT_DIR = Path(__file__).parent / "output"
TEMP_DIR = Path(__file__).parent / "temp"

CLAUDE_MODEL = "claude-sonnet-4-20250514"
TRANSLATION_SYSTEM_PROMPT = (
    "You are a professional Islamic content translator. Translate the following "
    "English text to French. Preserve Islamic terms (Allah, Jibril, Rasul, etc.) "
    "in their Arabic form. Keep the tone reverent and formal. "
    "Return ONLY the French translation, no commentary."
)


# ─── Helpers ───────────────────────────────────────────────────────

def run_cmd(cmd: list[str], desc: str = "") -> subprocess.CompletedProcess:
    """Run a shell command and return the result."""
    if desc:
        print(f"   {desc}")
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"   ERROR: {result.stderr[:500]}")
        raise RuntimeError(f"Command failed: {' '.join(cmd[:4])}...")
    return result


def ensure_tool(name: str):
    """Check that a CLI tool is available."""
    result = subprocess.run(["which" if os.name != "nt" else "where", name],
                            capture_output=True, text=True)
    if result.returncode != 0:
        print(f"   Missing required tool: {name}")
        print(f"   Install it before running this script.")
        sys.exit(1)


# ─── Step 1: Download video + extract audio ────────────────────────

def step1_download(video: dict, work_dir: Path) -> tuple[Path, Path]:
    """Download video with yt-dlp and extract 16kHz mono WAV."""
    print(f"\n{'='*60}")
    print(f"  Processing: {video['name']}")
    print(f"{'='*60}")

    video_path = work_dir / f"{video['name']}_original.mp4"
    audio_path = work_dir / f"{video['name']}_audio.wav"

    # Download video
    print(f"\n\U0001F4E5 Step 1/7 — Downloading video...")
    if not video_path.exists():
        run_cmd([
            "yt-dlp",
            "-f", "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]",
            "--merge-output-format", "mp4",
            "-o", str(video_path),
            video["url"],
        ], "Downloading with yt-dlp...")
        print(f"   \u2705 Video downloaded: {video_path.name}")
    else:
        print(f"   \u2705 Video already exists, skipping download")

    # Extract audio as 16kHz mono WAV
    if not audio_path.exists():
        run_cmd([
            "ffmpeg", "-y", "-i", str(video_path),
            "-ar", "16000", "-ac", "1", "-f", "wav",
            str(audio_path),
        ], "Extracting 16kHz mono audio...")
        print(f"   \u2705 Audio extracted: {audio_path.name}")
    else:
        print(f"   \u2705 Audio already exists, skipping extraction")

    return video_path, audio_path


# ─── Step 2: Transcribe with Whisper ───────────────────────────────

def step2_transcribe(audio_path: Path, work_dir: Path, video_name: str) -> list[dict]:
    """Transcribe audio using OpenAI Whisper large model."""
    print(f"\n\U0001F4DD Step 2/7 — Transcribing with Whisper large...")

    transcript_path = work_dir / f"{video_name}_transcript.json"

    if transcript_path.exists():
        print(f"   \u2705 Transcript already exists, loading...")
        with open(transcript_path) as f:
            return json.load(f)

    # Run whisper CLI
    run_cmd([
        "whisper",
        str(audio_path),
        "--model", "large",
        "--language", "en",
        "--output_format", "json",
        "--output_dir", str(work_dir),
    ], "Running Whisper large model (this may take a while)...")

    # Whisper outputs {filename}.json
    whisper_output = work_dir / f"{audio_path.stem}.json"
    if not whisper_output.exists():
        raise FileNotFoundError(f"Whisper output not found: {whisper_output}")

    with open(whisper_output) as f:
        whisper_data = json.load(f)

    # Extract segments
    segments = []
    for seg in whisper_data.get("segments", []):
        segments.append({
            "start": round(seg["start"], 2),
            "end": round(seg["end"], 2),
            "text": seg["text"].strip(),
        })

    # Save our clean transcript
    with open(transcript_path, "w") as f:
        json.dump(segments, f, indent=2, ensure_ascii=False)

    print(f"   \u2705 Transcribed {len(segments)} segments")
    return segments


# ─── Step 3: Translate with Claude ─────────────────────────────────

def step3_translate(segments: list[dict], work_dir: Path, video_name: str) -> list[dict]:
    """Translate each segment EN→FR using Claude API."""
    print(f"\n\U0001F310 Step 3/7 — Translating with Claude ({CLAUDE_MODEL})...")

    translated_path = work_dir / f"{video_name}_translated.json"

    if translated_path.exists():
        print(f"   \u2705 Translation already exists, loading...")
        with open(translated_path) as f:
            return json.load(f)

    if not ANTHROPIC_API_KEY:
        print("   \u274c ANTHROPIC_API_KEY not set! Skipping translation.")
        return [{"start": s["start"], "end": s["end"], "text": s["text"],
                 "text_fr": s["text"]} for s in segments]

    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
    translated = []
    total = len(segments)

    # Process in batches of 10 for efficiency
    batch_size = 10
    for batch_start in range(0, total, batch_size):
        batch = segments[batch_start:batch_start + batch_size]
        batch_texts = "\n---\n".join(
            f"[{i+batch_start+1}] {s['text']}" for i, s in enumerate(batch)
        )

        try:
            response = client.messages.create(
                model=CLAUDE_MODEL,
                max_tokens=4096,
                system=TRANSLATION_SYSTEM_PROMPT,
                messages=[{
                    "role": "user",
                    "content": (
                        f"Translate each numbered segment below from English to French. "
                        f"Return them in the same numbered format:\n\n{batch_texts}"
                    ),
                }],
            )

            fr_text = response.content[0].text
            # Parse numbered responses
            fr_lines = []
            current = ""
            for line in fr_text.split("\n"):
                if line.strip().startswith("[") and "]" in line:
                    if current:
                        fr_lines.append(current.strip())
                    current = line.split("]", 1)[1].strip()
                else:
                    current += " " + line.strip()
            if current:
                fr_lines.append(current.strip())

            # Match translations to segments
            for i, seg in enumerate(batch):
                fr = fr_lines[i] if i < len(fr_lines) else seg["text"]
                translated.append({
                    "start": seg["start"],
                    "end": seg["end"],
                    "text": seg["text"],
                    "text_fr": fr,
                })

        except Exception as e:
            print(f"   \u26a0\ufe0f Translation error for batch: {e}")
            for seg in batch:
                translated.append({
                    "start": seg["start"],
                    "end": seg["end"],
                    "text": seg["text"],
                    "text_fr": seg["text"],
                })

        done = min(batch_start + batch_size, total)
        print(f"   Translated {done}/{total} segments...")
        time.sleep(0.5)  # Rate limiting

    with open(translated_path, "w") as f:
        json.dump(translated, f, indent=2, ensure_ascii=False)

    print(f"   \u2705 Translation complete: {len(translated)} segments")
    return translated


# ─── Step 4: Generate TTS with ElevenLabs ──────────────────────────

def step4_tts(segments: list[dict], work_dir: Path, video_name: str) -> list[Path]:
    """Generate French TTS audio for each segment using ElevenLabs."""
    print(f"\n\U0001F50A Step 4/7 — Generating French TTS with ElevenLabs...")

    tts_dir = work_dir / f"{video_name}_tts"
    tts_dir.mkdir(exist_ok=True)

    if not ELEVENLABS_API_KEY:
        print("   \u274c ELEVENLABS_API_KEY not set! Skipping TTS.")
        return []

    audio_files = []
    total = len(segments)
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{ELEVENLABS_VOICE_ID}"
    headers = {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
    }

    for i, seg in enumerate(segments):
        out_path = tts_dir / f"seg_{i:04d}.wav"
        audio_files.append(out_path)

        if out_path.exists():
            continue

        payload = {
            "text": seg["text_fr"],
            "model_id": "eleven_multilingual_v2",
            "voice_settings": {
                "stability": 0.65,
                "similarity_boost": 0.75,
                "style": 0.3,
            },
        }

        try:
            resp = requests.post(url, json=payload, headers=headers, timeout=30)
            resp.raise_for_status()

            # ElevenLabs returns MP3 by default, convert to WAV
            mp3_path = tts_dir / f"seg_{i:04d}.mp3"
            with open(mp3_path, "wb") as f:
                f.write(resp.content)

            # Convert MP3 → WAV 16kHz mono
            run_cmd([
                "ffmpeg", "-y", "-i", str(mp3_path),
                "-ar", "16000", "-ac", "1",
                str(out_path),
            ])
            mp3_path.unlink()

        except Exception as e:
            print(f"   \u26a0\ufe0f TTS error for segment {i}: {e}")
            # Create silent placeholder
            duration = seg["end"] - seg["start"]
            run_cmd([
                "ffmpeg", "-y", "-f", "lavfi",
                "-i", f"anullsrc=r=16000:cl=mono",
                "-t", str(max(duration, 0.1)),
                str(out_path),
            ])

        if (i + 1) % 20 == 0 or i == total - 1:
            print(f"   Generated {i+1}/{total} audio clips...")
        time.sleep(0.3)  # Rate limiting

    print(f"   \u2705 TTS complete: {len(audio_files)} audio files")
    return audio_files


# ─── Step 5-6: Sync audio with FFmpeg adelay + amix ────────────────

def step5_6_sync_audio(
    segments: list[dict],
    audio_files: list[Path],
    work_dir: Path,
    video_name: str,
) -> Path:
    """Align each TTS clip to its original timestamp using FFmpeg adelay."""
    print(f"\n\U0001F3B5 Step 5-6/7 — Syncing audio to timestamps with FFmpeg...")

    french_audio = work_dir / f"{video_name}_french_audio.wav"

    if french_audio.exists():
        print(f"   \u2705 French audio already exists, skipping sync")
        return french_audio

    if not audio_files:
        print("   \u26a0\ufe0f No audio files to sync")
        return french_audio

    # Get total video duration from the last segment
    total_duration = max(s["end"] for s in segments) + 5.0

    # Build complex FFmpeg filter for adelay + amix
    inputs = []
    filter_parts = []
    valid_count = 0

    for i, (seg, af) in enumerate(zip(segments, audio_files)):
        if not af.exists():
            continue
        inputs.extend(["-i", str(af)])
        delay_ms = int(seg["start"] * 1000)
        filter_parts.append(f"[{valid_count}]adelay={delay_ms}|{delay_ms}[d{valid_count}]")
        valid_count += 1

    if valid_count == 0:
        print("   \u26a0\ufe0f No valid audio clips found")
        return french_audio

    # Amix all delayed streams
    mix_inputs = "".join(f"[d{i}]" for i in range(valid_count))
    filter_parts.append(
        f"{mix_inputs}amix=inputs={valid_count}:duration=longest:dropout_transition=2[out]"
    )

    filter_complex = ";".join(filter_parts)

    cmd = [
        "ffmpeg", "-y",
        *inputs,
        "-filter_complex", filter_complex,
        "-map", "[out]",
        "-ar", "44100", "-ac", "1",
        "-t", str(total_duration),
        str(french_audio),
    ]

    run_cmd(cmd, "Mixing all audio clips with adelay...")
    print(f"   \u2705 French audio track created: {french_audio.name}")
    return french_audio


# ─── Step 7: Merge video + French audio ────────────────────────────

def step7_merge(
    video_path: Path,
    french_audio: Path,
    video_name: str,
) -> Path:
    """Merge original video with French audio into final output."""
    print(f"\n\U0001F3AC Step 7/7 — Merging video + French audio...")

    output_path = OUTPUT_DIR / f"{video_name}_french.mp4"

    if output_path.exists():
        print(f"   \u2705 Output already exists: {output_path.name}")
        return output_path

    if not french_audio.exists():
        print("   \u26a0\ufe0f French audio not found, copying original video")
        import shutil
        shutil.copy2(video_path, output_path)
        return output_path

    run_cmd([
        "ffmpeg", "-y",
        "-i", str(video_path),
        "-i", str(french_audio),
        "-c:v", "copy",
        "-map", "0:v:0",
        "-map", "1:a:0",
        "-shortest",
        str(output_path),
    ], "Merging with FFmpeg...")

    print(f"   \u2705 Final output: {output_path.name}")
    return output_path


# ─── Main pipeline ─────────────────────────────────────────────────

def process_video(video: dict):
    """Run the full pipeline for a single video."""
    work_dir = TEMP_DIR / video["name"]
    work_dir.mkdir(parents=True, exist_ok=True)

    # Step 1: Download
    video_path, audio_path = step1_download(video, work_dir)

    # Step 2: Transcribe
    segments = step2_transcribe(audio_path, work_dir, video["name"])

    # Step 3: Translate
    translated = step3_translate(segments, work_dir, video["name"])

    # Step 4: TTS
    audio_files = step4_tts(translated, work_dir, video["name"])

    # Step 5-6: Sync
    french_audio = step5_6_sync_audio(translated, audio_files, work_dir, video["name"])

    # Step 7: Merge
    output = step7_merge(video_path, french_audio, video["name"])

    return output


def main():
    print("\n" + "=" * 60)
    print("  \U0001F3AC Djibril Video Translation Pipeline")
    print("  EN \u2192 FR | Whisper + Claude + ElevenLabs + FFmpeg")
    print("=" * 60)

    # Check required tools
    print("\n\U0001F50D Checking required tools...")
    for tool in ["yt-dlp", "ffmpeg", "whisper"]:
        ensure_tool(tool)
        print(f"   \u2705 {tool} found")

    # Check API keys
    if not ANTHROPIC_API_KEY:
        print("\n\u26a0\ufe0f  ANTHROPIC_API_KEY not set — translations will be skipped")
    if not ELEVENLABS_API_KEY:
        print("\u26a0\ufe0f  ELEVENLABS_API_KEY not set — TTS will be skipped")

    # Create output directory
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    TEMP_DIR.mkdir(parents=True, exist_ok=True)

    # Process each video
    results = []
    for i, video in enumerate(VIDEOS):
        print(f"\n{'#' * 60}")
        print(f"  VIDEO {i+1}/3: {video['name']}")
        print(f"{'#' * 60}")

        try:
            output = process_video(video)
            results.append(output)
            print(f"\n\u2705 {video['name']} complete!")
        except Exception as e:
            print(f"\n\u274c Error processing {video['name']}: {e}")
            import traceback
            traceback.print_exc()

    # Summary
    print(f"\n{'=' * 60}")
    print(f"  \u2705 PIPELINE COMPLETE")
    print(f"{'=' * 60}")
    for r in results:
        size_mb = r.stat().st_size / (1024 * 1024) if r.exists() else 0
        print(f"   \U0001F4C1 {r.name} ({size_mb:.1f} MB)")
    print(f"\n   Output directory: {OUTPUT_DIR.resolve()}")


if __name__ == "__main__":
    main()
