#!/usr/bin/env python3
"""
Djibril Video Series - English-to-French Audio Translation Pipeline

Downloads 3 YouTube videos, gets transcripts (YouTube captions or Whisper),
translates EN->FR with OpenAI GPT-4o-mini, generates French TTS with
Microsoft Edge TTS (free), and merges into final French-dubbed .mp4 files.

Environment variables required:
  EXPO_PUBLIC_OPENAI_API_KEY - OpenAI API key

Usage:
  pip install -r requirements.txt
  python translate_djibril_audio.py
"""

import os
import sys
import json
import subprocess
import time
import re
import asyncio
from pathlib import Path

try:
    import requests
except ImportError:
    print("Missing requests package. Run: pip install requests")
    sys.exit(1)

try:
    import edge_tts
except ImportError:
    print("Missing edge-tts package. Run: pip install edge-tts")
    sys.exit(1)

# --- Configuration ---

OPENAI_API_KEY = os.environ.get("EXPO_PUBLIC_OPENAI_API_KEY", "")

# Edge TTS voice - French male, multilingual (natural sounding)
EDGE_TTS_VOICE = "fr-FR-RemyMultilingualNeural"

VIDEOS = [
    {"id": "2mICw81RlWI", "url": "https://www.youtube.com/watch?v=2mICw81RlWI", "name": "djibril_partie_1"},
    {"id": "EVn1PJ2liVo", "url": "https://www.youtube.com/watch?v=EVn1PJ2liVo", "name": "djibril_partie_2"},
    {"id": "uCL4jgqHnN8", "url": "https://www.youtube.com/watch?v=uCL4jgqHnN8", "name": "djibril_partie_3"},
]

OUTPUT_DIR = Path(__file__).parent / "output"
TEMP_DIR = Path(__file__).parent / "temp"

WHISPER_MODEL = "base"
OPENAI_MODEL = "gpt-4o-mini"

TRANSLATION_SYSTEM_PROMPT = (
    "You are a professional Islamic content translator. Translate the following "
    "English text to French. Preserve Islamic terms (Allah, Jibril, Rasul, etc.) "
    "in their Arabic form. Keep the tone reverent and formal. "
    "Return ONLY the French translation, no commentary."
)


# --- Helpers ---

def run_cmd(cmd, desc=""):
    if desc:
        print(f"   {desc}")
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"   ERROR: {result.stderr[:500]}")
        raise RuntimeError(f"Command failed: {' '.join(str(c) for c in cmd[:4])}...")
    return result


def ensure_tool(name):
    cmd = "where" if os.name == "nt" else "which"
    result = subprocess.run([cmd, name], capture_output=True, text=True)
    if result.returncode != 0:
        print(f"   Missing required tool: {name}")
        sys.exit(1)


# --- Step 1: Download video + extract audio ---

def step1_download(video, work_dir):
    print(f"\n{'='*60}")
    print(f"  Processing: {video['name']}")
    print(f"{'='*60}")

    video_path = work_dir / f"{video['name']}_original.mp4"
    audio_path = work_dir / f"{video['name']}_audio.wav"

    print(f"\n>> Step 1/7 - Downloading video...")
    if not video_path.exists():
        run_cmd([
            "yt-dlp",
            "-f", "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]",
            "--merge-output-format", "mp4",
            "-o", str(video_path),
            video["url"],
        ], "Downloading with yt-dlp...")
        print(f"   OK - Video downloaded: {video_path.name}")
    else:
        print(f"   OK - Video already exists, skipping download")

    if not audio_path.exists():
        run_cmd([
            "ffmpeg", "-y", "-i", str(video_path),
            "-ar", "16000", "-ac", "1", "-f", "wav",
            str(audio_path),
        ], "Extracting 16kHz mono audio...")
        print(f"   OK - Audio extracted: {audio_path.name}")
    else:
        print(f"   OK - Audio already exists, skipping extraction")

    return video_path, audio_path


# --- Step 2: Transcribe (YouTube captions first, Whisper fallback) ---

def parse_timestamp(ts):
    parts = ts.split(':')
    h, m = int(parts[0]), int(parts[1])
    s = float(parts[2])
    return h * 3600 + m * 60 + s


def parse_vtt(vtt_path):
    """Parse YouTube VTT rolling captions, extracting only NEW text from each cue.

    YouTube auto-captions use a rolling format where each cue has 2 lines:
      Line 1 = previously completed text (DUPLICATE — skip)
      Line 2 = new text with <c> word-timing tags (KEEP)
    Cues with near-zero duration (< 0.1s) are transition snapshots — skip them.
    """
    with open(vtt_path, encoding="utf-8") as f:
        content = f.read()

    segments = []

    pattern = r'(\d{2}:\d{2}:\d{2}\.\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}\.\d{3})[^\n]*\n(.*?)(?=\n\n|\Z)'
    matches = re.findall(pattern, content, re.DOTALL)

    for start_str, end_str, text_block in matches:
        start = parse_timestamp(start_str)
        end = parse_timestamp(end_str)

        # Skip near-zero duration cues (transition snapshots)
        if end - start < 0.1:
            continue

        lines = text_block.strip().split('\n')

        # Find the NEW text line — it contains <c> timing tags or <00:...> timestamps
        new_text = ""
        for line in lines:
            if '<c>' in line or re.search(r'<\d{2}:\d{2}:\d{2}', line):
                # This is the new content line — strip all tags
                new_text = re.sub(r'<[^>]+>', '', line).strip()
                break

        if not new_text:
            # No timing tags found — take the last non-empty line as fallback
            for line in reversed(lines):
                cleaned = re.sub(r'<[^>]+>', '', line).strip()
                cleaned = re.sub(r'\[.*?\]', '', cleaned).strip()
                if cleaned:
                    new_text = cleaned
                    break

        # Remove [Music] and other bracketed annotations
        new_text = re.sub(r'\[.*?\]', '', new_text).strip()

        if new_text:
            segments.append({"start": round(start, 2), "end": round(end, 2), "text": new_text})

    return merge_short_segments(segments)


def merge_short_segments(segments, min_duration=3.0):
    if not segments:
        return segments
    merged = []
    current = segments[0].copy()
    for seg in segments[1:]:
        if current['end'] - current['start'] < min_duration:
            current['end'] = seg['end']
            current['text'] += ' ' + seg['text']
        else:
            merged.append(current)
            current = seg.copy()
    merged.append(current)
    return merged


def step2_try_youtube_captions(video, work_dir, video_name):
    json_sub = work_dir / f"{video_name}_subs.json"
    if json_sub.exists():
        print(f"   OK - YouTube captions already extracted, loading...")
        with open(json_sub) as f:
            return json.load(f)

    print(f"   Trying YouTube auto-captions first (much faster than Whisper)...")
    try:
        run_cmd([
            "yt-dlp",
            "--write-auto-sub",
            "--sub-lang", "en",
            "--sub-format", "vtt",
            "--skip-download",
            "-o", str(work_dir / f"{video_name}_subs"),
            video["url"],
        ], "Fetching auto-generated captions...")

        vtt_files = list(work_dir.glob(f"{video_name}_subs*.vtt"))
        if not vtt_files:
            print("   No VTT file found, falling back to Whisper...")
            return None

        segments = parse_vtt(vtt_files[0])
        if segments:
            with open(json_sub, "w") as f:
                json.dump(segments, f, indent=2, ensure_ascii=False)
            print(f"   OK - Got {len(segments)} segments from YouTube captions")
            return segments
    except Exception as e:
        print(f"   YouTube captions not available: {e}")
    return None


def step2_transcribe(audio_path, work_dir, video):
    print(f"\n>> Step 2/7 - Getting transcript...")
    video_name = video["name"]

    transcript_path = work_dir / f"{video_name}_transcript.json"
    if transcript_path.exists():
        print(f"   OK - Transcript already exists, loading...")
        with open(transcript_path) as f:
            return json.load(f)

    segments = step2_try_youtube_captions(video, work_dir, video_name)

    if not segments:
        print(f"   Falling back to Whisper {WHISPER_MODEL} model...")
        run_cmd([
            "whisper", str(audio_path),
            "--model", WHISPER_MODEL,
            "--language", "en",
            "--output_format", "json",
            "--output_dir", str(work_dir),
        ], f"Running Whisper {WHISPER_MODEL} (this may take a while)...")

        whisper_output = work_dir / f"{audio_path.stem}.json"
        if not whisper_output.exists():
            raise FileNotFoundError(f"Whisper output not found: {whisper_output}")

        with open(whisper_output) as f:
            whisper_data = json.load(f)

        segments = []
        for seg in whisper_data.get("segments", []):
            segments.append({
                "start": round(seg["start"], 2),
                "end": round(seg["end"], 2),
                "text": seg["text"].strip(),
            })

    with open(transcript_path, "w") as f:
        json.dump(segments, f, indent=2, ensure_ascii=False)

    print(f"   OK - Transcribed {len(segments)} segments")
    return segments


# --- Step 3: Translate with OpenAI GPT-4o-mini ---

def step3_translate(segments, work_dir, video_name):
    print(f"\n>> Step 3/7 - Translating EN->FR with OpenAI ({OPENAI_MODEL})...")

    translated_path = work_dir / f"{video_name}_translated.json"

    if translated_path.exists():
        print(f"   OK - Translation already exists, loading...")
        with open(translated_path) as f:
            return json.load(f)

    if not OPENAI_API_KEY:
        print("   ERROR - OPENAI_API_KEY not set! Skipping translation.")
        return [{"start": s["start"], "end": s["end"], "text": s["text"],
                 "text_fr": s["text"]} for s in segments]

    headers = {
        "Authorization": f"Bearer {OPENAI_API_KEY}",
        "Content-Type": "application/json",
    }

    translated = []
    total = len(segments)

    batch_size = 10
    for batch_start in range(0, total, batch_size):
        batch = segments[batch_start:batch_start + batch_size]
        batch_texts = "\n---\n".join(
            f"[{i+batch_start+1}] {s['text']}" for i, s in enumerate(batch)
        )

        try:
            payload = {
                "model": OPENAI_MODEL,
                "messages": [
                    {"role": "system", "content": TRANSLATION_SYSTEM_PROMPT},
                    {"role": "user", "content": (
                        f"Translate each numbered segment below from English to French. "
                        f"Return them in the same numbered format:\n\n{batch_texts}"
                    )},
                ],
                "max_tokens": 4096,
                "temperature": 0.3,
            }

            resp = requests.post(
                "https://api.openai.com/v1/chat/completions",
                headers=headers,
                json=payload,
                timeout=60,
            )
            resp.raise_for_status()
            fr_text = resp.json()["choices"][0]["message"]["content"]

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

            for i, seg in enumerate(batch):
                fr = fr_lines[i] if i < len(fr_lines) else seg["text"]
                translated.append({
                    "start": seg["start"],
                    "end": seg["end"],
                    "text": seg["text"],
                    "text_fr": fr,
                })

        except Exception as e:
            print(f"   WARNING - Translation error for batch: {e}")
            for seg in batch:
                translated.append({
                    "start": seg["start"],
                    "end": seg["end"],
                    "text": seg["text"],
                    "text_fr": seg["text"],
                })

        done = min(batch_start + batch_size, total)
        print(f"   Translated {done}/{total} segments...")
        time.sleep(0.3)

    with open(translated_path, "w", encoding="utf-8") as f:
        json.dump(translated, f, indent=2, ensure_ascii=False)

    print(f"   OK - Translation complete: {len(translated)} segments")
    return translated


# --- Step 4: Generate TTS with Edge TTS (free, unlimited, concurrent) ---

CONCURRENT_TTS = 3  # Number of parallel TTS tasks (low to avoid rate limits)


async def generate_single_tts(text, out_mp3, voice=EDGE_TTS_VOICE):
    """Generate a single TTS clip using edge-tts."""
    communicate = edge_tts.Communicate(text, voice)
    await communicate.save(str(out_mp3))


async def generate_tts_batch(batch_items, tts_dir):
    """Generate a batch of TTS clips concurrently."""
    tasks = []
    for i, seg, text in batch_items:
        mp3_path = tts_dir / f"seg_{i:04d}.mp3"
        tasks.append((i, seg, text, mp3_path))

    async def _gen(idx, seg, txt, mp3p):
        try:
            await generate_single_tts(txt, mp3p)
            return (idx, seg, mp3p, None)
        except Exception as e:
            return (idx, seg, mp3p, e)

    results = await asyncio.gather(*[_gen(i, s, t, p) for i, s, t, p in tasks])
    return results


def step4_tts(segments, work_dir, video_name):
    print(f"\n>> Step 4/7 - Generating French TTS with Edge TTS ({EDGE_TTS_VOICE}) [{CONCURRENT_TTS}x parallel]...")

    tts_dir = work_dir / f"{video_name}_tts"
    tts_dir.mkdir(exist_ok=True)

    audio_files = []
    total = len(segments)
    errors = 0
    skipped = 0

    # Collect work items (segments that need TTS)
    pending = []
    for i, seg in enumerate(segments):
        out_path = tts_dir / f"seg_{i:04d}.wav"
        audio_files.append(out_path)

        if out_path.exists() and out_path.stat().st_size > 1000:
            skipped += 1
            continue

        if out_path.exists():
            out_path.unlink()

        text = seg.get("text_fr", seg.get("text", ""))
        if not text or len(text.strip()) < 2:
            duration = seg["end"] - seg["start"]
            run_cmd([
                "ffmpeg", "-y", "-f", "lavfi",
                "-i", f"anullsrc=r=24000:cl=mono",
                "-t", str(max(duration, 0.1)),
                str(out_path),
            ])
            skipped += 1
            continue

        pending.append((i, seg, text))

    if skipped > 0:
        print(f"   Skipping {skipped} already-generated clips...")

    if not pending:
        print(f"   OK - All {total} TTS clips already exist!")
        return audio_files

    print(f"   Generating {len(pending)} TTS clips ({CONCURRENT_TTS} at a time)...")

    # Process in batches of CONCURRENT_TTS
    generated = 0
    for batch_start in range(0, len(pending), CONCURRENT_TTS):
        batch = pending[batch_start:batch_start + CONCURRENT_TTS]

        results = asyncio.run(generate_tts_batch(batch, tts_dir))
        time.sleep(0.5)  # Throttle to avoid Edge TTS rate limiting

        for idx, seg, mp3_path, err in results:
            out_path = tts_dir / f"seg_{idx:04d}.wav"

            if err:
                print(f"   WARNING - TTS error for segment {idx}: {err}")
                errors += 1
                duration = seg["end"] - seg["start"]
                run_cmd([
                    "ffmpeg", "-y", "-f", "lavfi",
                    "-i", f"anullsrc=r=24000:cl=mono",
                    "-t", str(max(duration, 0.1)),
                    str(out_path),
                ])
                if mp3_path.exists():
                    mp3_path.unlink()
            else:
                # Convert MP3 to WAV (24kHz mono)
                run_cmd([
                    "ffmpeg", "-y", "-i", str(mp3_path),
                    "-ar", "24000", "-ac", "1",
                    str(out_path),
                ])
                mp3_path.unlink()

            generated += 1

        if (generated) % 100 < CONCURRENT_TTS or batch_start + CONCURRENT_TTS >= len(pending):
            print(f"   Generated {generated}/{len(pending)} audio clips... ({errors} errors)")

    print(f"   OK - TTS complete: {len(audio_files)} total ({errors} errors)")
    return audio_files


# --- Step 5-6: Sync audio with FFmpeg adelay + amix ---

def step5_6_sync_audio(segments, audio_files, work_dir, video_name):
    print(f"\n>> Step 5-6/7 - Syncing audio to timestamps with FFmpeg...")

    french_audio = work_dir / f"{video_name}_french_audio.wav"

    if french_audio.exists():
        print(f"   OK - French audio already exists, skipping sync")
        return french_audio

    if not audio_files:
        print("   WARNING - No audio files to sync")
        return french_audio

    total_duration = max(s["end"] for s in segments) + 5.0

    valid_clips = []
    for i, (seg, af) in enumerate(zip(segments, audio_files)):
        if af.exists():
            valid_clips.append((seg, af, i))

    if not valid_clips:
        print("   WARNING - No valid audio clips found")
        return french_audio

    chunk_size = 50
    chunk_outputs = []

    for chunk_idx in range(0, len(valid_clips), chunk_size):
        chunk = valid_clips[chunk_idx:chunk_idx + chunk_size]
        chunk_path = work_dir / f"{video_name}_chunk_{chunk_idx}.wav"
        chunk_outputs.append(chunk_path)

        if chunk_path.exists():
            continue

        inputs = []
        filter_parts = []
        for j, (seg, af, _) in enumerate(chunk):
            inputs.extend(["-i", str(af)])
            delay_ms = int(seg["start"] * 1000)
            filter_parts.append(f"[{j}]adelay={delay_ms}|{delay_ms}[d{j}]")

        count = len(chunk)
        mix_inputs = "".join(f"[d{j}]" for j in range(count))
        filter_parts.append(
            f"{mix_inputs}amix=inputs={count}:duration=longest:dropout_transition=2[out]"
        )

        cmd = [
            "ffmpeg", "-y",
            *inputs,
            "-filter_complex", ";".join(filter_parts),
            "-map", "[out]",
            "-ar", "44100", "-ac", "1",
            "-t", str(total_duration),
            str(chunk_path),
        ]
        run_cmd(cmd, f"Mixing chunk {chunk_idx // chunk_size + 1}...")

    if len(chunk_outputs) == 1:
        import shutil
        shutil.move(str(chunk_outputs[0]), str(french_audio))
    else:
        inputs = []
        for cp in chunk_outputs:
            inputs.extend(["-i", str(cp)])
        count = len(chunk_outputs)
        mix_inputs = "".join(f"[{i}]" for i in range(count))
        run_cmd([
            "ffmpeg", "-y",
            *inputs,
            "-filter_complex",
            f"{mix_inputs}amix=inputs={count}:duration=longest[out]",
            "-map", "[out]",
            "-ar", "44100", "-ac", "1",
            str(french_audio),
        ], "Merging audio chunks...")

    print(f"   OK - French audio track created: {french_audio.name}")
    return french_audio


# --- Step 7: Merge video + French audio ---

def step7_merge(video_path, french_audio, video_name):
    print(f"\n>> Step 7/7 - Merging video + French audio...")

    output_path = OUTPUT_DIR / f"{video_name}_french.mp4"

    if output_path.exists():
        print(f"   OK - Output already exists: {output_path.name}")
        return output_path

    if not french_audio.exists():
        print("   WARNING - French audio not found, copying original video")
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

    print(f"   OK - Final output: {output_path.name}")
    return output_path


# --- Main pipeline ---

def process_video(video):
    work_dir = TEMP_DIR / video["name"]
    work_dir.mkdir(parents=True, exist_ok=True)

    video_path, audio_path = step1_download(video, work_dir)
    segments = step2_transcribe(audio_path, work_dir, video)
    translated = step3_translate(segments, work_dir, video["name"])
    audio_files = step4_tts(translated, work_dir, video["name"])
    french_audio = step5_6_sync_audio(translated, audio_files, work_dir, video["name"])
    output = step7_merge(video_path, french_audio, video["name"])

    return output


def main():
    print("\n" + "=" * 60)
    print("  Djibril Video Translation Pipeline")
    print("  EN -> FR | YouTube Captions/Whisper + GPT-4o-mini + Edge TTS + FFmpeg")
    print("=" * 60)

    print("\nChecking required tools...")
    for tool in ["yt-dlp", "ffmpeg"]:
        ensure_tool(tool)
        print(f"   OK - {tool} found")

    if not OPENAI_API_KEY:
        print("\nWARNING - OPENAI_API_KEY not set - translations will be skipped")

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    TEMP_DIR.mkdir(parents=True, exist_ok=True)

    results = []
    for i, video in enumerate(VIDEOS):
        print(f"\n{'#' * 60}")
        print(f"  VIDEO {i+1}/3: {video['name']}")
        print(f"{'#' * 60}")

        try:
            output = process_video(video)
            results.append(output)
            print(f"\n   DONE - {video['name']} complete!")
        except Exception as e:
            print(f"\n   FAIL - Error processing {video['name']}: {e}")
            import traceback
            traceback.print_exc()

    print(f"\n{'=' * 60}")
    print(f"  PIPELINE COMPLETE")
    print(f"{'=' * 60}")
    for r in results:
        size_mb = r.stat().st_size / (1024 * 1024) if r.exists() else 0
        print(f"   {r.name} ({size_mb:.1f} MB)")
    print(f"\n   Output directory: {OUTPUT_DIR.resolve()}")


if __name__ == "__main__":
    main()
