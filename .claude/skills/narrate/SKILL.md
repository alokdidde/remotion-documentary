---
name: narrate
description: "Phase 2: Transform a concept into a narration performance script with ElevenLabs vocal tags"
---

# Narrate — Phase 2: Infotainment Narrator Architect

Transform the concept's narration column into a performance script with ElevenLabs vocal tags optimized for high-contrast, hyper-engaging delivery. Uses the framework defined in `narrator.md`.

## Input

`concept.md` — The A/V script's left column (narration prose).

## Output

`scripts/narration-script.ts` — Array of `NarrationEntry` objects with fields: `id`, `scene`, `text` (tagged), `startFrame`, `durationFrames`. Audio is placed on the global timeline in `src/data/audio-timeline.ts` using absolute frame positions.

## Opening Montage Hook Line

The very first narration entry should be the **montage hook line** — a single killer sentence delivered during the cold-open montage (around the 15-20s mark). This is the one line that frames the entire video.

**Requirements:**
- Tag with `[declamatory]` — loud, chest-voice, high energy
- Must create a curiosity gap — the viewer needs to know more
- Should NOT explain the topic — it should provoke, not summarize
- Place at `startFrame` matching the beat drop in the montage music

**Examples:**
- `[declamatory] Nobody... saw it coming.`
- `[declamatory] They built an empire... on a lie.`
- `[declamatory] This is the story they don't want you to hear.`

**NarrationEntry:**
```ts
{
  id: "montage-hook",
  scene: "montage",
  text: "[declamatory] ...",
  startFrame: 450,      // ~15s, synced to beat drop
  durationFrames: 150,  // ~5s
}
```

## Narrative Strategy

- **Hook & Anchor:** Loud, declarative opener.
- **Data Hammer:** Numbers as heavy, slow, textured objects.
- **Rhythmic Pulse:** Alternate rapid-fire context with slow, hushed revelations.
- **Cynical Pivot:** Peer-to-peer conversational tone for criticism.

## Tag Lexicon (ElevenLabs v3)

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

## Pacing Markers

- `...` — Short tactical pause
- `[pause_short]` — Calibrated short beat
- `[pause_medium]` — Medium beat
- `[pause_long]` — Full reset between chapters

## Execution Steps

1. Analyze the concept's narration for "Highs" (success/growth) and "Lows" (crisis/failure).
2. Apply tag layering — combine tags for critical moments (e.g., `[staccato] [vocal_fry_heavy]`).
3. Insert dramatic pacing — `...` for tactical pauses, `[pause_long]` for chapter resets.
4. Weight the numbers — every statistic isolated by tags for impact.
5. Structure output as `NarrationEntry[]` in `scripts/narration-script.ts`.

## Storytelling Principles (from story-telling.md)

- **Write for reception, not transmission.** Read every line and ask: "What does the viewer hear?"
- **Cognitive hospitality** — If a sentence requires prior knowledge, add a bridging phrase first. Use simple, ordinary words.
- **Frame shifts at transitions** — When pivoting to a new idea, validate the viewer's current belief before introducing the shift.
- **Statistics are heavy objects** — Isolate with tags. Let them land with weight and silence, not speed.
- **In-group language** — Use vocabulary the target audience recognizes. Tribal signals earn trust.
- **Anchoring** — The first sentence of each scene sets the frame. Lead with the vivid image or human benefit.

## Usage

Provide a `concept.md` (or its narration column) and the agent will generate the tagged performance script. Reference `narrator.md` for the full guide.
