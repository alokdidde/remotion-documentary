---
name: generate-audio
description: Generate audio (TTS narration, SFX, or music) using ElevenLabs API
---

# Generate Audio

Generate text-to-speech narration, sound effects, or background music using ElevenLabs API.

## Usage

```bash
npx tsx scripts/generate-audio.ts <type> [options]
```

## Types

### TTS (Text-to-Speech)
```bash
npx tsx scripts/generate-audio.ts tts --text "Your narration text" --output narration/intro.mp3
```

### SFX (Sound Effects)
```bash
npx tsx scripts/generate-audio.ts sfx --prompt "Ambient crowd noise" --duration 10 --output sfx/crowd.mp3
```

### Music
```bash
npx tsx scripts/generate-audio.ts music --prompt "Epic documentary orchestral" --duration 20 --output music/intro.mp3
```

## Notes

- Requires ELEVENLABS_API_KEY in .env
- SFX/Music max duration: 22 seconds
- Audio saved to public/audio/ directories
