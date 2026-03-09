#!/usr/bin/env python3
"""
Rebuild French audio tracks using sequential placement (no overlapping).
Uses the existing TTS wav segments but places them one after another
with silence gaps, instead of amix which causes overlapping and volume issues.
"""

import json
import subprocess
import sys
from pathlib import Path

TEMP_DIR = Path(__file__).parent / "temp"
OUTPUT_DIR = Path(__file__).parent / "output"

VIDEOS = [
    "djibril_partie_1",
    "djibril_partie_2",
    "djibril_partie_3",
]


def get_wav_duration(wav_path):
    """Get duration of a wav file in seconds using ffprobe."""
    result = subprocess.run(
        ["ffprobe", "-v", "quiet", "-show_entries", "format=duration",
         "-of", "csv=p=0", str(wav_path)],
        capture_output=True, text=True
    )
    try:
        return float(result.stdout.strip())
    except:
        return 0.0


def rebuild_audio(video_name):
    work_dir = TEMP_DIR / video_name
    tts_dir = work_dir / f"{video_name}_tts"
    translated_path = work_dir / f"{video_name}_translated.json"
    output_audio = OUTPUT_DIR / f"{video_name}_french.m4a"

    print(f"\n{'='*60}")
    print(f"  Rebuilding: {video_name}")
    print(f"{'='*60}")

    if not translated_path.exists():
        print(f"  ERROR: {translated_path} not found")
        return

    with open(translated_path) as f:
        segments = json.load(f)

    print(f"  Found {len(segments)} segments")

    # Build a list of (target_start_time, wav_file, actual_duration)
    clips = []
    for i, seg in enumerate(segments):
        wav_path = tts_dir / f"seg_{i:04d}.wav"
        if not wav_path.exists():
            continue
        dur = get_wav_duration(wav_path)
        if dur < 0.05:
            continue
        clips.append({
            "target_start": seg["start"],
            "wav": wav_path,
            "duration": dur,
            "text": seg.get("text_fr", "")[:50],
        })

    print(f"  Valid clips: {len(clips)}")

    # Sort by target start time
    clips.sort(key=lambda c: c["target_start"])

    # Build sequential timeline - no overlaps allowed
    # Each clip starts at max(target_start, previous_clip_end)
    timeline = []
    current_end = 0.0

    for clip in clips:
        actual_start = max(clip["target_start"], current_end)
        timeline.append({
            "start": actual_start,
            "wav": clip["wav"],
            "duration": clip["duration"],
        })
        current_end = actual_start + clip["duration"]

    total_duration = current_end + 1.0
    print(f"  Total duration: {total_duration:.1f}s ({total_duration/60:.1f}min)")

    # Build a concat file for ffmpeg
    # Create silence-padded segments: silence + audio + silence + audio ...
    concat_list = work_dir / f"{video_name}_concat.txt"
    silence_dir = work_dir / "silence_clips"
    silence_dir.mkdir(exist_ok=True)

    entries = []
    prev_end = 0.0

    for idx, item in enumerate(timeline):
        gap = item["start"] - prev_end
        if gap > 0.01:
            # Create silence clip for the gap
            silence_path = silence_dir / f"silence_{idx:04d}.wav"
            subprocess.run([
                "ffmpeg", "-y", "-f", "lavfi",
                "-i", f"anullsrc=r=24000:cl=mono",
                "-t", str(gap),
                "-ar", "24000", "-ac", "1",
                str(silence_path),
            ], capture_output=True)
            entries.append(f"file '{silence_path}'")

        entries.append(f"file '{item['wav']}'")
        prev_end = item["start"] + item["duration"]

        if (idx + 1) % 100 == 0:
            print(f"  Prepared {idx + 1}/{len(timeline)} clips...")

    with open(concat_list, "w") as f:
        f.write("\n".join(entries))

    print(f"  Concatenating {len(entries)} segments...")

    # Use ffmpeg concat demuxer - fast, no re-encoding overlap issues
    subprocess.run([
        "ffmpeg", "-y", "-f", "concat", "-safe", "0",
        "-i", str(concat_list),
        "-ar", "24000", "-ac", "1",
        "-c:a", "aac", "-b:a", "96k",
        str(output_audio),
    ], capture_output=True)

    if output_audio.exists():
        size_mb = output_audio.stat().st_size / (1024 * 1024)
        print(f"  OK - Output: {output_audio.name} ({size_mb:.1f} MB)")
    else:
        print(f"  ERROR - Failed to create output")


def main():
    print("Rebuilding French audio tracks (sequential, no overlap)")
    OUTPUT_DIR.mkdir(exist_ok=True)

    for name in VIDEOS:
        rebuild_audio(name)

    print(f"\nDone! Output in: {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
