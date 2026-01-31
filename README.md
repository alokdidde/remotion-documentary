# remotion-documentary

Reusable [Remotion](https://www.remotion.dev/) template for generating breadtube-style documentary videos on any topic. Built with React, TypeScript, and Tailwind CSS.

## Quick Start

```bash
npx degit alokdidde/remotion-documentary my-documentary
cd my-documentary
npm install
cp .env.example .env  # fill in API keys
npm run dev
```

## What's Included

### Reusable Components (`src/components/`)

- **Layout**: `FullScreen`, `SplitScreen`, `Centered`, `PaddedContainer`
- **Text**: `ChapterTitle`, `Quote`, `Subtitle`, `InfoLabel`
- **Data Viz**: `AnimatedCounter`, `ComparisonCounter`, `BarChart`, `StatCard`, `StatGrid`, `Timeline`
- **Media**: `BackgroundVideo`, `BackgroundImage`, `StaticImage`, `PlaceholderImage`
- **Audio**: `Narration`, `BackgroundMusic`
- **Maps**: `IndiaMap`, `RailwayRoute`
- **Transitions**: `ChapterTransition`, `FadeTransition`

### Asset Generation Scripts (`scripts/`)

| Script | Description |
|--------|-------------|
| `generate-image.ts` | Generate images with Google Gemini |
| `generate-video.ts` | Generate video clips with Google Veo |
| `generate-audio.ts` | Generate TTS, SFX, or music with ElevenLabs |
| `generate-music.ts` | Generate chapter background music |
| `generate-all-narration.ts` | Batch generate all narration |
| `pexels-download.ts` | Search and download stock media from Pexels |
| `youtube-download.ts` | Search and download YouTube videos via yt-dlp |
| `analyze-audio-durations.ts` | Analyze audio durations vs frame timing |

### Claude Skills (`.claude/skills/`)

Pre-configured skills for Claude Code to help generate assets:

- `pexels-download` / `pexels-image-search` / `pexels-video-search`
- `generate-audio` / `generate-image` / `generate-video`
- `youtube-download`
- `remotion-best-practices/` - Comprehensive Remotion reference guide

## Workflow

See [guide.md](./guide.md) for the full documentary creation process.

1. **Write the script** — create or generate the narration text
2. **Generate narration audio** — TTS via `generate-audio.ts`
3. **Source b-roll** — search Pexels/YouTube for matching visuals
4. **Fill gaps with AI** — only generate images/video if stock footage isn't found
5. **Build chapter components** in `src/chapters/`
6. **Preview** with `npm run dev`
7. **Render** with Remotion CLI

## API Keys Required

| Service | Key | Used For |
|---------|-----|----------|
| [Google AI](https://aistudio.google.com/) | `GOOGLE_API_KEY` | Image generation (Gemini) |
| [ElevenLabs](https://elevenlabs.io/) | `ELEVENLABS_API_KEY` | TTS, SFX, music |
| [Pexels](https://www.pexels.com/api/) | `PEXELS_API_KEY` | Stock photos and videos |
| [Google Cloud](https://cloud.google.com/) | `GOOGLE_CLOUD_PROJECT` | Video generation (Veo, optional) |

## Video Specs

- **Resolution**: 1920x1080 (Full HD)
- **Frame Rate**: 30 FPS
- **Format**: JPEG frames / MP4 output

## Commands

```bash
npm run dev      # Launch Remotion Studio
npm run build    # Bundle for production
npm run lint     # Run ESLint + TypeScript checks
```
