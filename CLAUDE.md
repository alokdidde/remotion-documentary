# CLAUDE.md — YouTube Documentary Production Pipeline

This repository is a complete YouTube documentary video production system, not just a Remotion template. It chains role-specific guides into a linear pipeline that takes a topic from concept to rendered MP4.

**Storytelling Foundation (`story-telling.md`)** — All phases are governed by the storytelling guide's principles: audience-first writing, world building (atomic units → frame shifts → rooting with examples), cognitive hospitality, and consistency. Every script decision should pass through these filters. Reference it before and during every phase.

**Core Visual Rule: CONSTANT MOTION** — There must be no static frames anywhere in the video. Every single moment should have something moving: Ken Burns on images, floating particles in backgrounds, text animating in/out, counters ticking, gradients shifting, subtle zooms, parallax layers. If a frame has nothing moving, it's a bug. Use `remotion-bits` StaggeredMotion, BackgroundVideo with Ken Burns, FloatingParticles, GradientTransition, and spring animations to guarantee perpetual motion.

**Opening Montage** — Every documentary must begin with a 15-30 second cold-open montage before the title card. This montage is a rapid-fire preview of the video's most intriguing moments: key visuals, dramatic stats, provocative quotes — all set to high-energy music and punchy SFX (whooshes, impacts, risers). It uses fast transitions (wipe, slide, flip at 10-15 frame durations) and teases without revealing context. The goal: make the viewer think "I NEED to watch this." See the concept skill for structure.

## Production Pipeline

### Phase 1: Concept (architect.md + story-telling.md)

Use the Pop Documentary Architect to transform a topic into a structured concept. Apply the storytelling guide's world-building principles: define the viewer's world first, structure acts as frame shifts, root every claim with examples. Output: `concept.md`.

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

### Phase 4: Edit Planning (editor.md + story-telling.md)

Review the concept + narration against YouTube quality pillars and the storytelling checklist (world-building consistency, frame shift structure, rooting examples, cognitive hospitality). Output: `edit-notes.md`.

See [YouTube Quality Standards](#youtube-quality-standards) below for the distilled checklist.

### Phase 5: Build (guide.md)

Execute the technical build using asset generation scripts + Remotion components:

1. Populate `scripts/narration-script.ts` with NarrationEntry objects
2. Generate TTS audio → `public/audio/narration/`
3. Analyze audio durations to set frame timing
4. Source B-roll (Pexels/YouTube) → `public/video/`, `public/images/`
5. Fill gaps with AI generation (Gemini images, Veo video, ElevenLabs SFX/music)
6. Build chapter components in `src/chapters/` using Sequence blocks + components. Prefer within-scene sequential motion (StaggeredMotion, AnimatedText) over hard cuts. Reference `editing-cuts.md` for cut vocabulary and `src/lib/motion.ts` for animation presets.
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
npx tsx scripts/generate-music.ts                                  # Batch music from musicPrompts array
npx tsx scripts/generate-music.ts --filter=ch1                     # Generate music matching filter
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

### Motion System (`src/lib/motion.ts` + `remotion-bits`)

Within-scene sequential animations — elements enter, deliver information, exit — without full screen changes. This is the primary animation style for documentary content.

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

**Pattern — Sequential info reveal (no full screen change):**
```tsx
<Sequence from={0} durationInFrames={120}>
  <GradientTransition gradient={gradients.darkCinematic}>
    <StaggeredMotion transition={{ ...fadeUp, stagger: 8 }}>
      <AnimatedText transition={titleReveal}>The Discovery</AnimatedText>
      <AnimatedText transition={textFadeUp}>In 1947, something changed...</AnimatedText>
      <StaggeredMotion transition={{ ...statReveal, stagger: 12 }}>
        <StatCard ... />
        <StatCard ... />
      </StaggeredMotion>
    </StaggeredMotion>
  </GradientTransition>
</Sequence>
```

### Transition System (`src/lib/transitions.ts`)

Per-chapter-gap transition config using `@remotion/transitions` presentations:
- **Presentations:** `fade`, `slideLeft/Right/Up/Down`, `wipeRight/Left/Up/Down/Diagonal`, `flipLeft/Right/Up/Down`, `clock`
- **Timings:** `fast` (15f), `standard` (30f), `slow` (45f), `dramatic` (60f), `spring`, `bouncy`
- Edit `chapterTransitions[]` array to assign different transitions between chapters
- `DocumentaryVideo` in `Video.tsx` reads this config; `DocumentaryVideoSimple` uses no transitions

### 3D Components (`@remotion/three`)

Use `<ThreeScene>` as the base wrapper — it provides `<ThreeCanvas>` with camera, lighting, and video dimensions. Inside, use `useCurrentFrame()` (NOT React Three Fiber's `useFrame()`). When nesting `<Sequence>` inside ThreeCanvas, pass `layout="none"`. For rendering, add `chromiumOptions: { gl: "angle" }`.

### Timing Model (`src/lib/timing.ts`)

All durations are in **frames** (30fps). Key presets: `fast(6)`, `short(15)`, `medium(24)`, `normal(30)`, `long(45)`, `dramatic(90)`, `titleCard(120)`. Spring configs: `smooth`, `snappy`, `bouncy`, `heavy`, `quick`, `gentle`. Easing: cubic, expo, back variants. Use `secondsToFrames()` / `framesToSeconds()` for conversion.

### Data Files

| File | Purpose |
|------|---------|
| `src/data/chapters.ts` | Chapter definitions: id, title, durationFrames, sections, keyFacts, visualCues |
| `src/data/colors.ts` | Per-chapter color themes (primary, secondary, background, accent) + shared text/overlay colors |
| `src/data/quotes.ts` | Quote data |
| `src/data/statistics.ts` | Statistical data for visualizations |
| `src/data/audio-timeline.ts` | AudioEvent[] — global audio timeline (narration, music, SFX, ambience) with absolute frame positions |
| `scripts/narration-script.ts` | NarrationEntry[] — id, scene, text, startFrame, durationFrames |

### Component Library (`src/components/`)

- **Layout:** FullScreen, Centered, PaddedContainer, SplitScreen
- **Text:** ChapterTitle (spring-animated), Quote, Subtitle, InfoLabel
- **Data viz:** AnimatedCounter, ComparisonCounter, BarChart, Timeline, StatCard, StatGrid
- **Media:** BackgroundVideo (loop, overlay, Ken Burns), BackgroundImage, StaticImage, PlaceholderImage
- **Audio:** AudioTimeline (global layer — renders all audio events at composition root, supports J-cuts/L-cuts), Narration (segment-based, reads from `public/audio/narration/{id}.mp3`), BackgroundMusic (inline usage)
- **Motion (`remotion-bits`):** StaggeredMotion (staggered enter/exit for child elements), AnimatedText (word/character/line split with stagger), TypeWriter (typing effect with error sim), GradientTransition (smooth gradient backgrounds), Particles/Spawner/Behavior (physics-based particle system). Presets in `src/lib/motion.ts`.
- **3D (`@remotion/three`):** ThreeScene (base wrapper with camera/lighting defaults), Globe (rotating wireframe sphere), FloatingParticles (ambient particle field), Bars3D (animated 3D bar chart)
- **Transitions (`@remotion/transitions`):** fade, slide (4 directions), wipe (8 directions), flip (4 directions + perspective), clockWipe (circular). Configured per chapter gap in `src/lib/transitions.ts`. Also: ChapterTransition (custom wipe), FadeTransition

### Asset Directories

```
public/
├── audio/narration/   # TTS narration segments
├── audio/sfx/         # Sound effects library (see SFX structure below)
├── audio/music/       # Background music
├── images/            # Photos (Pexels, Gemini)
└── video/             # Video clips (Pexels, YouTube, Veo)
```

### SFX Library (`public/audio/sfx/`)

Each sound effect has its own folder containing multiple MP3 choices and a `metadata.json` describing each file:

```
public/audio/sfx/
├── boom_deep/
│   ├── metadata.json            # { sfxName, category, files: [...] }
│   ├── boom_deep_12345.mp3      # Choice A (freesound ID)
│   └── boom_deep_67890.mp3      # Choice B
├── whoosh_fast/
│   ├── metadata.json
│   └── whoosh_fast_11111.mp3
└── ...
```

`metadata.json` fields per file: `file`, `freesoundId`, `freesoundName`, `description`, `duration`, `tags`, `rating`, `license`, `author`, `fileSizeKB`. Use this to pick the best variant for each scene.

`audioSrc()` in `audio-timeline.ts` resolves filenames via `staticFile()`: `audioSrc("boom_deep/boom_deep_12345.mp3", "sfx")` → `staticFile("audio/sfx/boom_deep/boom_deep_12345.mp3")`.

## YouTube Quality Standards

Distilled from editor.md's 10 pillars. Use as a checklist during Phase 4 (edit planning).

1. **Sound hierarchy** — Voice always audible over music/SFX. Music -12 to -18dB under voice. SFX -6 to -12dB under voice. Test on phone speakers.
2. **Music sync** — Change music when mood shifts. Sync reveals to beat drops. Use risers before key moments. Plan music in segments matching script structure.
3. **Retention pacing** — Cold-open montage in first 15-30s (fast cuts, SFX, music). Visual change every 3-5s in long-form. Pattern interrupt every 2-3 minutes. **Zero static frames** — something must always be moving (Ken Burns, particles, gradients, animations). Match edit intensity to content energy.
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
- [ ] Cold-open montage hooks within first 3 seconds (fast cuts, SFX, music)
- [ ] Visual changes every 3-5 seconds
- [ ] Zero static frames — something always moving (Ken Burns, particles, gradients, text animation)
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
