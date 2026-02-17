---
name: narrate
description: "Phase 2: Transform a concept into a narration performance script with ElevenLabs vocal tags"
---

# Narrate — Phase 2: Infotainment Narrator Architect

Transform the concept's narration column into a performance script with ElevenLabs vocal tags optimized for high-contrast, hyper-engaging delivery. Uses the framework defined in `narrator.md`.

## Input

`concept.md` — The A/V script's left column (narration prose).

## Output

`scripts/narration-script.ts` — Array of `NarrationEntry` objects with fields: `id`, `chapter`, `scene`, `text` (tagged), `startFrame`, `durationFrames`.

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

## Usage

Provide a `concept.md` (or its narration column) and the agent will generate the tagged performance script. Reference `narrator.md` for the full guide.
