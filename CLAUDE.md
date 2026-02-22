# CLAUDE.md — YouTube Documentary Production Pipeline

This repository is a complete YouTube documentary video production system built on Remotion. The entire documentary exists in **3D space** — every scene is a camera waypoint, and the compiler auto-generates camera sweeps, visual events, and audio timing from YAML files.

**Pipeline:** YAML project tree → 3 AI passes → compile → Scene3D render

**Storytelling Foundation (`story-telling.md`)** — All phases are governed by the storytelling guide's principles: audience-first writing, world building (atomic units → frame shifts → rooting with examples), cognitive hospitality, and consistency. Every script decision should pass through these filters.

**Core Visual Rule: CONSTANT MOTION** — No static frames anywhere. The camera is always moving between Steps, with Ken Burns on images, floating particles, text animating in/out, counters ticking, gradients shifting. If a frame has nothing moving, it's a bug.

**Opening Montage** — Every documentary must begin with a 15-30 second cold-open montage before the title card: rapid-fire preview of the video's most intriguing moments, set to high-energy music and punchy SFX.

## The 3D World Model

```
Scene3D (perspective: 1000, transition: 45 frames, easing: easeInOutCubic)
  └── Step (scene-1) at x=800, y=0, z=0, scale=0.96
  │     ├── Element3D (factory_exterior video)
  │     ├── Element3D (robot_arm image)
  │     ├── Audio (narration.wav)
  │     ├── Audio (sfx_bed: industrial_hum)
  │     └── AnimatedText (cost overlay)
  └── Step (scene-2) at x=1337, y=1377, z=-150, scale=1.04
        ├── Element3D (assembly_line video)
        ├── Audio (narration.wav)
        └── Audio (sfx_entry: riser_heavy — plays during camera sweep)
```

Camera sweep timing = narration end + breath gap → sweep to next Step → SFX plays during sweep.

### Intent Dials → 3D Mapping

Six continuous dials (0.0–1.0) in `editorial.yaml` control the 3D world:

| Dial | Controls | Low (0) | High (1) |
|------|----------|---------|----------|
| **weight** | Camera scale | 0.8× (distant) | 1.2× (close-up) |
| **energy** | Transition speed | Slow camera sweep | Fast camera sweep |
| **contrast** | Rotation magnitude | Gentle angle shift | Dramatic angle shift |
| **breath** | Gap after scene | 0 seconds | 4 seconds |
| **warmth** | Z-depth | Far from camera | Close to camera |
| **density** | Visual elements | Few, tight | Many, spread out |

## Production Pipeline

```
 0. DEEP RESEARCH → RESEARCH_BRIEF.md (sourced facts, verified claims)
 1. Concept → concept.md (uses RESEARCH_BRIEF.md as primary input)
 2. PASS 1: STRUCTURE → project.yaml + acts/act-N/act.yaml + seq-N/sequence.yaml + scene-N/scene.yaml
 3. Asset sourcing → assets/{footage,images,music,sfx}/ + manifest.yaml files
 4. PASS 2: NARRATIVE → acts/.../scene-N/narration.txt per scene
 5. VO generation → acts/.../scene-N/narration.wav per scene (ElevenLabs)
 6. Word alignment → acts/.../scene-N/words.json per scene
 7. PASS 3: EDITORIAL → acts/.../scene-N/editorial.yaml per scene
 8. COMPILE → npm run compile → compiled/timeline.json (3D positions auto-computed)
 9. QA + Preview → npm run dev (Scene3D composition in Remotion Studio)
10. RENDER → npm run render
```

**All visual/audio/timing decisions go into YAML files.** No manual TSX editing needed for content — the compiler and Scene3D renderer consume the YAML tree automatically.

### The 3 AI Passes

**PASS 1: STRUCTURE (Architect)** — Input: concept + research + asset manifests. Output: `project.yaml`, `act.yaml`, `sequence.yaml`, `scene.yaml` for the entire project.

**PASS 2: NARRATIVE (Writer)** — Input: structure context (act arcs, sequence purposes, available visuals). Output: `narration.txt` per scene. Then: ElevenLabs TTS → `narration.wav` → word alignment → `words.json`.

**PASS 3: EDITORIAL (Editor)** — Input: `narration.txt` + `words.json` + `scene.yaml` + manifests + act arcs. Output: `editorial.yaml` per scene containing the 6 intent dials, SFX (entry/exit/bed), and word events (visual-change, music-intensity, text-overlay pinned to word indices).

### Regeneration

| Want to change | Regenerate | Keep |
|---------------|------------|------|
| Research foundation | Deep research → concept → Pass 1 → 2 → 3 | Assets (re-evaluate) |
| Overall structure | Pass 1 → 2 → 3 | project.yaml, assets |
| One scene's narration | narration.txt → TTS → alignment → Pass 3 | Everything else |
| One scene's edit decisions | editorial.yaml → Pass 3 only | Everything else |
| Music for a sequence | sequence.yaml → re-compile | Scenes unchanged |
| Pacing in one scene | Hand-edit editorial.yaml dials → re-compile | Everything else |

## Commands

```bash
npm run dev          # Remotion Studio at localhost:3000
npm run build        # Bundle for production
npm run lint         # ESLint + TypeScript type check (eslint src && tsc)
npm run compile      # Compile acts/ YAML tree → compiled/timeline.json + render-props.json
npm run render       # Render Documentary composition → output/*.mp4

# Deep research (step 0 — before concept)
npx tsx scripts/research-deep.ts --topic "..." --output <project>/RESEARCH_BRIEF.md       # Full deep research (5-20 min)
npx tsx scripts/research-deep.ts --query "..." --output <project>/RESEARCH_BRIEF.md --append  # Quick grounded lookup
npx tsx scripts/research-deep.ts --follow-up "q1" "q2" --output <project>/RESEARCH_BRIEF.md   # Verify claims

# Asset generation (all via npx tsx scripts/...)
npx tsx scripts/generate-all-narration.ts              # Batch TTS from acts/.../narration.txt
npx tsx scripts/analyze-audio-durations.ts             # Compare audio durations to frame allocations
npx tsx scripts/generate-audio.ts --type tts --text "..." --output narration/seg.mp3
npx tsx scripts/generate-audio.ts --type sfx --prompt "..." --output sfx/name.mp3
npx tsx scripts/generate-audio.ts --type music --prompt "..." --output music/name.mp3
npx tsx scripts/generate-music.ts                      # Batch music from musicPrompts array
npx tsx scripts/generate-image.ts --prompt "..." --output name.png
npx tsx scripts/generate-video.ts --prompt "..." --output name.mp4
npx tsx scripts/image-search.ts --query "..." --count 3 --prefix act1
npx tsx scripts/pexels-download.ts --query "..." --type video --count 3 --prefix act1
npx tsx scripts/youtube-download.ts --search "..." --max-results 5
npx tsx scripts/youtube-download.ts --url "..." --output "clip" --resolution 1080
```

## Architecture

**Video specs:** 1920x1080 @ 30fps

### Folder Structure

```
project.yaml                           # Global config (fps, voice, audio_mix, color_grades)
acts/
├── act-1/
│   ├── act.yaml                       # Title, emotional arc (energy curves)
│   ├── seq-1/
│   │   ├── sequence.yaml              # Purpose, music cue, default ambience
│   │   ├── scene-1/
│   │   │   ├── scene.yaml             # Color grade, ambience override, available_visuals
│   │   │   ├── narration.txt          # Narration prose (AI-written)
│   │   │   ├── narration.wav          # ElevenLabs TTS
│   │   │   ├── words.json             # Word-level timings
│   │   │   └── editorial.yaml         # 6 intent dials + word events + SFX
│   │   └── scene-2/ ...
│   └── seq-2/ ...
├── act-2/ ...
└── act-3/ ...
assets/
├── footage/                           # B-roll video clips
├── images/                            # Still images
├── music/                             # Music beds + manifest.yaml
└── sfx/                               # SFX manifest.yaml (actual files symlinked at public/audio/sfx/)
compiled/
├── timeline.json                      # Compiled timeline (auto-generated by npm run compile)
└── render-props.json                  # Render props (auto-generated)
public/
├── audio/sfx/ → ~/Assets/sfx/        # Symlink to global SFX library (233 categories, 1600+ files)
└── audio/music/                       # Background music
output/                                # Rendered MP4s
```

### Composition Flow

`src/Root.tsx` registers the **Documentary** composition which uses `Scene3D` rendering. The compiled timeline (`compiled/timeline.json`) drives all camera positions, visual events, audio timing, and transitions. No manual chapter components needed.

### Compiler (`src/pipeline/compiler.ts`)

Pure arithmetic layer. Converts the YAML tree → `compiled/timeline.json`:
1. Walks acts → sequences → scenes
2. Reads `words.json` for narration duration per scene
3. Computes gap duration from `intent.breath` (0 → 0 frames, 1 → 4 seconds)
4. Resolves word indices → absolute frame positions for visual events
5. Compiles SFX events (entry/exit/bed with fade curves)
6. Auto-assigns 3D camera waypoints using spiral layout (acts on z-axis, sequences on x, scenes on y)
7. Intent dials modulate: weight→scale, energy→speed, contrast→rotation, warmth→depth, density→element spread

### Motion System (`src/lib/motion.ts` + `remotion-bits`)

Within-scene sequential animations — elements enter, deliver information, exit — without full screen changes.

**Components** (from `remotion-bits`):
- `<StaggeredMotion transition={fadeUp}>` — animate any children with stagger
- `<AnimatedText transition={textFadeUp}>` — split text by word/character/line with stagger
- `<TypeWriter text="..." typeSpeed={3}>` — typing effect with optional error simulation
- `<GradientTransition gradient={gradients.darkCinematic}>` — smooth background color transitions
- `<Particles>` + `<Spawner>` + `<Behavior>` — physics-based particle effects

**Presets** (from `src/lib/motion.ts`):
- Enter: `fadeUp`, `fadeDown`, `slideInLeft`, `slideInRight`, `scaleUp`, `popIn`, `blurReveal`, `statReveal`
- Exit: `fadeOutDown`, `fadeOutUp`, `scaleOut`
- Text: `textFadeUp`, `textCharReveal`, `textSlideIn`, `titleReveal`, `numberReveal`
- Stagger: `stagger.tight(2f)`, `stagger.normal(4f)`, `stagger.relaxed(8f)`, `stagger.dramatic(12f)`
- Gradients: `gradients.darkCinematic`, `gradients.warmHope`, `gradients.coolMystery`, `gradients.dangerRed`

### Timing Model (`src/lib/timing.ts`)

All durations are in **frames** (30fps). Key presets: `fast(6)`, `short(15)`, `medium(24)`, `normal(30)`, `long(45)`, `dramatic(90)`, `titleCard(120)`. Spring configs: `smooth`, `snappy`, `bouncy`, `heavy`, `quick`, `gentle`. Easing: cubic, expo, back variants. Use `secondsToFrames()` / `framesToSeconds()` for conversion.

### Data Files

| File | Purpose |
|------|---------|
| `project.yaml` | Global config: fps, voice, audio_mix, color_grades, acts list |
| `acts/act-N/act.yaml` | Act title, emotional arc (start/peak/end energy, peak position) |
| `acts/.../sequence.yaml` | Sequence purpose, music cue, default ambience, scene list |
| `acts/.../scene.yaml` | Color grade, ambience override, available_visuals palette |
| `acts/.../editorial.yaml` | 6 intent dials, SFX (entry/exit/bed), word events |
| `acts/.../narration.txt` | Narration prose with ElevenLabs performance tags |
| `acts/.../words.json` | Word-level timings: `{ duration_seconds, words: [{ index, word, start, end }] }` |
| `assets/music/manifest.yaml` | Music bed metadata (duration, BPM, energy_range, mood) |
| `assets/sfx/manifest.yaml` | SFX metadata for beds and transitions |
| `compiled/timeline.json` | Compiled timeline with absolute frame positions (auto-generated) |
| `src/data/colors.ts` | Shared text/overlay color constants |

### SFX Library (`public/audio/sfx/`)

Symlinked to `~/Assets/sfx/`. Contains 233 SFX across 14 categories, each with multiple MP3 variants and a `metadata.json`:

```
public/audio/sfx/
├── boom_deep/
│   ├── metadata.json            # { sfxName, category, files: [...] }
│   ├── boom_deep_12345.mp3
│   └── boom_deep_67890.mp3
├── whoosh_soft/
│   ├── metadata.json
│   └── whoosh_soft_11111.mp3
└── ...
```

`metadata.json` fields per file: `file`, `freesoundId`, `freesoundName`, `description`, `duration`, `tags`, `rating`, `license`, `author`, `fileSizeKB`.

SFX choices go in `editorial.yaml` (entry/exit/bed per scene). The compiler resolves them to absolute frame positions. SFX plays automatically during camera sweeps via `TransitionSfxLayer`.

### Component Library (`src/components/`)

- **Layout:** FullScreen, Centered, PaddedContainer, SplitScreen
- **Text:** ChapterTitle (spring-animated), Quote, Subtitle, InfoLabel
- **Data viz:** AnimatedCounter, ComparisonCounter, BarChart, Timeline, StatCard, StatGrid
- **Media:** BackgroundVideo (loop, overlay, Ken Burns), BackgroundImage, StaticImage, PlaceholderImage
- **Motion (`remotion-bits`):** StaggeredMotion, AnimatedText, TypeWriter, GradientTransition, Particles/Spawner/Behavior
- **3D (`@remotion/three`):** ThreeScene, Globe, FloatingParticles, Bars3D

## YouTube Quality Standards

1. **Sound hierarchy** — Voice always audible over music/SFX. Music -12 to -18dB under voice. SFX -6 to -12dB under voice. Test on phone speakers.
2. **Music sync** — Change music when mood shifts (sequence boundaries). Sync reveals to beat drops. Use risers before key moments.
3. **Retention pacing** — Cold-open montage in first 15-30s. Visual change every 3-5s. Pattern interrupt every 2-3 minutes. **Zero static frames** — camera always moving between Steps. Match edit intensity to content energy.
4. **Color/contrast** — High contrast text on all backgrounds. Use project.yaml color_grades consistently. Test readability at phone size.
5. **Typography** — Clean, readable fonts. Spell-check all on-screen text. 1-2 font families. Test at mobile player size.
6. **Animation polish** — Always use easing curves (never linear). Ken Burns via Element3D animations. Spring animations for text entrances.
7. **Visual hierarchy** — Text follows subject gaze direction. Consistent text position per section. Avoid YouTube safe zone conflicts.
8. **Format awareness** — End screen needs 20s runway. Acts/sequences should have distinct visual feel.

### Pre-Upload Checklist

- [ ] Voiceover audible over music at all times
- [ ] SFX at appropriate volume, not ear-piercing
- [ ] Music changes when mood shifts (sequence boundaries)
- [ ] All text has strong contrast against background
- [ ] All spellings correct (especially first frame)
- [ ] Animations use easing, not linear
- [ ] Cold-open montage hooks within first 3 seconds
- [ ] Visual changes every 3-5 seconds
- [ ] Zero static frames — camera always moving between Steps
- [ ] No repetitive editing after opening
- [ ] Pattern interrupts every 2-3 minutes
- [ ] `npm run compile` succeeds with no warnings
- [ ] 3D camera positions reasonable (no overlapping Steps)
- [ ] End screen has 20s runway
- [ ] All on-screen data/stats verified

## Narration Tag Lexicon

Tags for ElevenLabs v3 performance scripts. Use in `narration.txt` files.

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

**Pacing markers:** `...` for short tactical pauses, `[pause_long]` for full resets between acts, `[pause_medium]` and `[pause_short]` for calibrated beats.

**Layering:** Combine tags for critical moments (e.g., `[staccato] [vocal_fry_heavy]`). Every statistic must be isolated by tags.

## Environment

Required API keys in `.env` (see `.env.example`):

```
GOOGLE_API_KEY=       # Gemini image generation + deep research + search grounding
ELEVENLABS_API_KEY=   # TTS narration, SFX, music
PEXELS_API_KEY=       # Stock photo/video search + download
GOOGLE_CLOUD_PROJECT= # Veo video generation (optional)
```

Voice config: ID `WaqMdPR4ga80Q9kzp4ft`, model `eleven_v3` (set in `project.yaml` and `scripts/config.ts`).
