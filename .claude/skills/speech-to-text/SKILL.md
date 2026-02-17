---
name: speech-to-text
description: Transcribe audio files to get word-level timestamps using ElevenLabs Scribe v2 API
---

# Speech to Text

Transcribe audio files using ElevenLabs Speech-to-Text (Scribe v2) to get word-level timestamps. Useful for generating closed captions/subtitles.

## Usage

```bash
# Single file:
npx tsx scripts/generate-captions.ts --input audio.mp3 --output captions.json

# Directory (transcribes all .mp3 files):
npx tsx scripts/generate-captions.ts --input public/audio/narration/ --output public/captions.json

# Defaults (all narration → public/captions.json):
npx tsx scripts/generate-captions.ts
```

## Options

| Flag | Short | Description | Default |
|------|-------|-------------|---------|
| `--input` | `-i` | Audio file or directory of .mp3 files | `public/audio/narration/` |
| `--output` | `-o` | Output JSON file path | `public/captions.json` |
| `--help` | `-h` | Show help | |

## Output Format

```json
[
  {
    "id": "hook",
    "words": [
      { "text": "In", "start": 0.139, "end": 0.259 },
      { "text": "2014,", "start": 0.359, "end": 0.959 }
    ]
  }
]
```

## Notes

- Requires `ELEVENLABS_API_KEY` in `.env`
- Accepts single file or directory as input
- For directories, transcribes all `.mp3` files sorted alphabetically
- Each word includes `text`, `start` (seconds), and `end` (seconds)
- To convert to frames: `Math.round(seconds * 30)` (at 30 FPS)
