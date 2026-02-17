---
name: music-design
description: "Phase 3: Plan background music — mood, tempo, instruments per chapter segment with prompts for ElevenLabs or Suno.ai"
---

# Music Design — Phase 3: Background Music Planning

Plan the background music layer for the documentary. Produces structured music prompts and `AudioEvent` entries for the global audio timeline.

## Input

- `concept.md` — The A/V script with emotional arc and visual choreography
- `scripts/narration-script.ts` — Narration segments with timing
- SFX plan (if available) — To avoid music/SFX conflicts

## Output

A music plan specifying segments, moods, and generation prompts. This feeds into:
- `scripts/generate-music.ts` — Fill in the `musicPrompts` array for ElevenLabs generation
- `src/data/audio-timeline.ts` — Add `AudioEvent` entries for each music segment
- Human workflow — Copy the Suno.ai prompts and generate manually, then drop files into `public/audio/music/`

## AudioEvent Integration

Music segments are placed on the global audio timeline as `AudioEvent` objects with absolute frame positions:

```ts
// In src/data/audio-timeline.ts
{
  id: "ch1-intro-mysterious",
  type: "music",
  src: audioSrc("ch1-intro-mysterious.mp3", "music"),
  startFrame: 0,
  durationFrames: 1350,    // 45 seconds
  volume: 0.15,            // default for music
  fadeInFrames: 30,         // default for music
  fadeOutFrames: 45,        // default for music
  loop: true,              // default for music
  label: "Ch1 Intro - Mysterious",
},
```

This replaces inline `<BackgroundMusic>` usage — all music lives on a single global layer rendered at the composition root, enabling J-cuts and L-cuts.

## Opening Montage Music

Every documentary starts with a high-energy cold-open montage (15-30s). This requires its own dedicated music segment — separate from the Chapter 1 intro music.

**Structure:**
1. **Riser phase (0-15s):** Building tension. Electronic/orchestral riser that intensifies with each fast cut. This is the "trailer energy" phase.
2. **Beat drop (15-20s):** Peaks at the hook narration line. Full percussion, bass, and energy. The viewer feels the impact.
3. **Hard cut to silence (20-25s):** Music stops dead on the smash cut to title card. 1-2 seconds of total silence. Then Chapter 1 music begins.

**Prompt example for montage music:**
```
High-energy cinematic trailer music. Starts with building electronic riser and tension percussion.
Dramatic beat drop at 15 seconds with heavy bass and orchestral hits. Abrupt ending.
No vocals. 25 seconds total. Suitable for fast-cut documentary montage opening.
```

**AudioEvent entry:**
```ts
{
  id: "montage-opener",
  type: "music",
  src: audioSrc("montage-opener.mp3", "music"),
  startFrame: 0,
  durationFrames: 750,    // 25 seconds at 30fps
  volume: 0.25,           // louder than normal — no narration competing
  fadeInFrames: 0,        // starts immediately
  fadeOutFrames: 3,       // near-instant cut
  loop: false,
  label: "Opening Montage - High Energy",
},
```

## Music Segment Structure

Each chapter typically needs 2-4 music segments matching emotional shifts:

```
Chapter 1: "The Discovery"
├── Segment A (0:00-0:45) — Mysterious, sparse, building curiosity
├── Segment B (0:45-1:30) — Tension rising, rhythmic pulse
└── Segment C (1:30-2:15) — Revelation, full orchestral, emotional peak
```

## Planning Rules

### Mood Matching (see also story-telling.md)
- Music must mirror the emotional arc of the narration
- Change music when the mood shifts (don't drone one track for 10+ minutes)
- Sync reveals/drops to beat drops where possible
- Use risers (building tension) before key moments
- Use music changes to signal frame shifts (old world ending, new world beginning)
- Consistency within each chapter's emotional world — same pairing of visual + music should recur

### Volume Hierarchy (from editor.md)
1. **Narration** — 0 dB (always loudest)
2. **Background Music** — -12 to -18 dB under narration
3. **SFX accents** — -6 to -12 dB
4. **Ambience** — -18 to -24 dB

### Duration Guidelines
- ElevenLabs: Max ~2 minutes per generation (loop if needed)
- Suno.ai: Up to ~4 minutes per generation
- Plan segments that can loop cleanly for longer sections

### SFX Coordination
- Music should duck during intense SFX passages
- Don't compete with ambience SFX — keep different frequency ranges
- Transition SFX (whooshes) can overlap music transitions

## Prompt Writing Guide

Good music prompts specify:
1. **Genre/style** — cinematic, ambient, electronic, orchestral, lo-fi
2. **Mood** — tense, hopeful, melancholic, triumphant, ominous
3. **Tempo** — slow (60-80 BPM), medium (80-120 BPM), fast (120+ BPM)
4. **Instruments** — piano, strings, synth pads, percussion, choir
5. **Energy arc** — builds gradually, steady, peaks then fades
6. **What to avoid** — vocals, lyrics, sudden changes (for background use)

### Example Prompts

**For a mystery/discovery opening:**
```
Instrumental cinematic ambient. Slow tempo, 70 BPM. Sparse piano notes over
deep synth pads. Subtle tension building. No vocals, no drums initially.
Mysterious and contemplative. Gradually introduces light percussion halfway through.
```

**For a conflict/tension peak:**
```
Dark cinematic orchestral, 100 BPM. Low strings tremolo, pulsing bass,
ticking percussion. Building urgency and dread. No vocals. Crescendo toward
the end with brass stabs. Suitable for documentary narration background.
```

**For a hopeful resolution:**
```
Uplifting cinematic instrumental, 90 BPM. Warm piano melody over lush strings.
Gentle, hopeful, emotionally resonant. Builds to a satisfying crescendo.
No vocals. Documentary background music style.
```

## Naming Convention

Files in `public/audio/music/`:
```
ch1-intro-mysterious.mp3      # Chapter 1, intro segment, mood tag
ch1-tension-building.mp3      # Chapter 1, tension segment
ch2-revelation-hopeful.mp3    # Chapter 2, revelation segment
outro-reflective.mp3          # Outro music
```

## Workflow

### Path A: ElevenLabs (automated)
1. Run `/music-design` to generate the music plan
2. Copy prompts into `scripts/generate-music.ts` `musicPrompts` array
3. Run `npx tsx scripts/generate-music.ts`
4. Files appear in `public/audio/music/`
5. Add corresponding `AudioEvent` entries to `src/data/audio-timeline.ts`

### Path B: Suno.ai (human-in-the-loop)
1. Run `/music-design` to generate the music plan
2. Hand the prompts to the human creator
3. Human generates tracks on Suno.ai using the prompts
4. Human downloads and places files in `public/audio/music/` using the naming convention
5. Add corresponding `AudioEvent` entries to `src/data/audio-timeline.ts`

## Usage

Provide the concept and narration script, and the agent will produce a complete music plan with:
- Segment breakdown per chapter (timing, mood, energy)
- Generation prompts (ElevenLabs and Suno.ai compatible)
- Transition notes (where to sync beats, where to crossfade)
- File naming for each segment
- `AudioEvent` entries ready to paste into the audio timeline
