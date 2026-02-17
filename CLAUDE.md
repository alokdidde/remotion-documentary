# CLAUDE.md — YouTube Documentary Production Pipeline

This repository is a complete YouTube documentary video production system, not just a Remotion template. It chains four role-specific guides into a linear pipeline that takes a topic from concept to rendered MP4.

## Production Pipeline

### Phase 1: Concept (architect.md)

Use the Pop Documentary Architect to transform a topic into a structured concept. Output: `concept.md`.

1. **The Promise** — Define title/thumbnail first. The script fulfills the curiosity the thumbnail sparks.
2. **3-Act Narrative** — Act 1 (Setup: hero + inciting moment), Act 2 (Conflict: compounding obstacles, tension peak), Act 3 (Resolution: transformation).
3. **Anchor-Bridge Hook** — Open with a vivid Visual Anchor ("Look at this thing!"), withhold context (Curiosity Gap), then deliver the Contextual Bridge.
4. **Two-Column A/V Script** — Left column: narration prose (Explainer voice + Poetic voice). Right column: visual choreography tagged as Evidence (proves facts) or Soul Moments (mood/vibe).
5. **Art Ingredients** — Sound design plan (Foley, thematic motifs) and visual bible (archival treatment, 3D style, lighting).
6. **CTA Placement** — 10% in: ultra-light promise. Middle: provocative question. End: join mission + next video.

### Phase 2: Narration (narrator.md)

Transform the concept's narration column into a performance script with ElevenLabs vocal tags. Output: `scripts/narration-script.ts`.

See [Narration Tag Lexicon](#narration-tag-lexicon) below for the full tag set.

### Phase 3: Sound Design (sfx-designer.md)

Select sound effects from the 200+ SFX library organized across 14 categories. Follow the layering rules: max 2 SFX simultaneously, never layer two impacts, ambience + accent works best.

**Volume hierarchy:** Narration at 0 dB → Music at -12 to -18 dB → SFX accents at -6 to -12 dB → Ambience at -18 to -24 dB.

### Phase 4: Edit Planning (editor.md)

Review the concept + narration against YouTube quality pillars. Output: `edit-notes.md`.

See [YouTube Quality Standards](#youtube-quality-standards) below for the distilled checklist.

### Phase 5: Build (guide.md)

Execute the technical build using asset generation scripts + Remotion components:

1. Populate `scripts/narration-script.ts` with NarrationEntry objects
2. Generate TTS audio → `public/audio/narration/`
3. Analyze audio durations to set frame timing
4. Source B-roll (Pexels/YouTube) → `public/video/`, `public/images/`
5. Fill gaps with AI generation (Gemini images, Veo video, ElevenLabs SFX/music)
6. Build chapter components in `src/chapters/` using Sequence blocks + components
7. Preview with `npm run dev`, render with `npx remotion render`

### Phase 6: Quality Check

Run the [Pre-Upload Checklist](#pre-upload-checklist) against the rendered output.

## Commands

```bash
npm run dev          # Remotion Studio at localhost:3000
npm run build        # Bundle for production
npm run lint         # ESLint + TypeScript type check (eslint src && tsc)

# Asset generation (all via npx tsx scripts/...)
npx tsx scripts/generate-all-narration.ts              # Batch TTS from narration-script.ts
npx tsx scripts/analyze-audio-durations.ts             # Compare audio durations to frame allocations
npx tsx scripts/generate-audio.ts --type tts --text "..." --output narration/seg.mp3
npx tsx scripts/generate-audio.ts --type sfx --prompt "..." --output sfx/name.mp3
npx tsx scripts/generate-audio.ts --type music --prompt "..." --output music/name.mp3
npx tsx scripts/generate-image.ts --prompt "..." --output name.png
npx tsx scripts/generate-video.ts --prompt "..." --output name.mp4
npx tsx scripts/image-search.ts --query "Nikola Tesla" --count 3 --prefix ch2  # Real subjects
npx tsx scripts/pexels-download.ts --query "..." --type video --count 3 --prefix ch1
npx tsx scripts/youtube-download.ts --search "..." --max-results 5
npx tsx scripts/youtube-download.ts --url "..." --output "clip" --resolution 1080
```

## Architecture

**Video specs:** 1920x1080 @ 30fps

### Composition Flow

`src/Root.tsx` registers three composition types:
- **"Documentary"** — TransitionSeries with 30-frame fade transitions between chapters
- **"DocumentarySimple"** — Sequential Sequences, no transition library
- **Individual chapters** — Isolated preview compositions for faster iteration

### Timing Model (`src/lib/timing.ts`)

All durations are in **frames** (30fps). Key presets: `fast(6)`, `short(15)`, `medium(24)`, `normal(30)`, `long(45)`, `dramatic(90)`, `titleCard(120)`. Spring configs: `smooth`, `snappy`, `bouncy`, `heavy`, `quick`, `gentle`. Easing: cubic, expo, back variants. Use `secondsToFrames()` / `framesToSeconds()` for conversion.

### Data Files

| File | Purpose |
|------|---------|
| `src/data/chapters.ts` | Chapter definitions: id, title, durationFrames, sections, keyFacts, visualCues |
| `src/data/colors.ts` | Per-chapter color themes (primary, secondary, background, accent) + shared text/overlay colors |
| `src/data/quotes.ts` | Quote data |
| `src/data/statistics.ts` | Statistical data for visualizations |
| `scripts/narration-script.ts` | NarrationEntry[] — id, chapter, scene, text, startFrame, durationFrames |

### Component Library (`src/components/`)

- **Layout:** FullScreen, Centered, PaddedContainer, SplitScreen
- **Text:** ChapterTitle (spring-animated), Quote, Subtitle, InfoLabel
- **Data viz:** AnimatedCounter, ComparisonCounter, BarChart, Timeline, StatCard, StatGrid
- **Media:** BackgroundVideo (loop, overlay, Ken Burns), BackgroundImage, StaticImage, PlaceholderImage
- **Audio:** Narration (segment-based, reads from `public/audio/narration/{id}.mp3`), BackgroundMusic
- **Transitions:** ChapterTransition, FadeTransition

### Asset Directories

```
public/
├── audio/narration/   # TTS narration segments
├── audio/sfx/         # Sound effects
├── audio/music/       # Background music
├── images/            # Photos (Pexels, Gemini)
└── video/             # Video clips (Pexels, YouTube, Veo)
```

## YouTube Quality Standards

Distilled from editor.md's 10 pillars. Use as a checklist during Phase 4 (edit planning).

1. **Sound hierarchy** — Voice always audible over music/SFX. Music -12 to -18dB under voice. SFX -6 to -12dB under voice. Test on phone speakers.
2. **Music sync** — Change music when mood shifts. Sync reveals to beat drops. Use risers before key moments. Plan music in segments matching script structure.
3. **Retention pacing** — Hook in first 3 seconds (no static intros). Visual change every 3-5s in long-form. Pattern interrupt every 2-3 minutes. Match edit intensity to content energy.
4. **Color/contrast** — High contrast text on all backgrounds. 2-3 color palette max. Test readability at phone size. Consistent theme throughout.
5. **Typography** — Clean, readable fonts. Spell-check all on-screen text. 1-2 font families. Test at mobile player size.
6. **Animation polish** — Always use easing curves (never linear). Smooth Ken Burns for images. Subtle glow effects. Spring animations for text entrances.
7. **Visual hierarchy** — Text follows subject gaze direction. Consistent text position per section. Avoid YouTube safe zone conflicts (top-right timestamp, bottom CC).
8. **Format awareness** — End screen needs 20s runway. Chapters should have distinct visual feel. Thumbnails: high contrast, max 3 elements, readable at small size.

### Pre-Upload Checklist

- [ ] Voiceover audible over music at all times
- [ ] SFX at appropriate volume, not ear-piercing
- [ ] Music changes when mood shifts
- [ ] All text has strong contrast against background
- [ ] All spellings correct (especially first frame)
- [ ] Animations use easing, not linear
- [ ] Hook within first 3 seconds
- [ ] Visual changes every 3-5 seconds
- [ ] No repetitive editing after opening
- [ ] Pattern interrupts every 2-3 minutes
- [ ] End screen has 20s runway
- [ ] All on-screen data/stats verified

## Narration Tag Lexicon

Tags for ElevenLabs v3 performance scripts. Use in `scripts/narration-script.ts` text fields.

| Tag | Effect | Use For |
|-----|--------|---------|
| `[declamatory]` | Loud, chest-voice, high energy | Section headers, hooks |
| `[staccato]` | Short, clipped syllables with gaps | Percentages, dates, stats |
| `[vocal_fry_heavy]` | Low, gravelly, textured tone | Scary/massive numbers |
| `[pitch_climb]` | Gradually increasing pitch + speed | Rapid growth, booms |
| `[aspirated_whisper]` | High-breathiness, low volume, intense | Secrets, dark truths |
| `[cynical]` | Sarcastic, conversational, slightly faster | Failures, "peculiar problems" |
| `[hard_stop]` | Sudden abrupt silence mid-thought | Cliffhanger effect |
| `[somber]` | Low pitch, slow speed, empathetic | Social collapse, human cost |

**Pacing markers:** `...` for short tactical pauses, `[pause_long]` for full resets between chapters, `[pause_medium]` and `[pause_short]` for calibrated beats.

**Layering:** Combine tags for critical moments (e.g., `[staccato] [vocal_fry_heavy]`). Every statistic must be isolated by tags.

**Narrative strategy:** Hook & Anchor (loud declarative opener) → Data Hammer (numbers as heavy objects) → Rhythmic Pulse (rapid context ↔ slow reveals) → Cynical Pivot (peer-to-peer criticism tone).

## Environment

Required API keys in `.env` (see `.env.example`):

```
GOOGLE_API_KEY=       # Gemini image generation
ELEVENLABS_API_KEY=   # TTS narration, SFX, music
PEXELS_API_KEY=       # Stock photo/video search + download
GOOGLE_CLOUD_PROJECT= # Veo video generation (optional)
```
