---
name: sfx-design
description: "Phase 3: Plan sound effects layer using the 200+ SFX library with layering rules and volume hierarchy"
---

# SFX Design — Phase 3: Sound Effects Planning

Select and plan sound effects from the 200+ SFX library (14 categories) for each scene of the documentary. Uses the library defined in `sfx-designer.md`.

## Input

`concept.md` — The A/V script (both narration and visual columns).

## Output

SFX plan as `AudioEvent` objects on the global audio timeline (`src/data/audio-timeline.ts`), specifying which effects to use at each narrative beat with absolute frame positions.

## SFX Categories (14)

1. Transitions & Structural Cues
2. Impacts & Emphasis
3. Tension & Suspense
4. Nature & Environment
5. Urban & Industrial
6. Human & Social
7. Technology & Digital
8. War & Conflict
9. Science & Space
10. Historical & Period
11. Money & Economy
12. Narration & Information Cues
13. Sports & Competition
14. Food & Agriculture

## Layering Rules

- **Maximum 2 SFX simultaneously** (e.g., `drone_dark` + `ticking_clock`)
- **Never layer two impacts** — they compete and sound muddy
- **Ambience + Accent works best** (e.g., `rain_light` under narration + `thunder_crack` on key word)
- **SFX should never compete with background music** — duck music or pause SFX during intense musical passages

## Volume Hierarchy

1. **Narration** — always loudest (0 dB reference)
2. **Background Music** — -12 to -18 dB under narration
3. **SFX accents** — -6 to -12 dB (brief peaks allowed)
4. **Ambience** — -18 to -24 dB (constant background)

## Opening Montage SFX

The cold-open montage (15-30s before title card) is the most SFX-dense section of the video. Plan these separately from chapter SFX:

**Required layers:**
- **Transition SFX** — Whoosh on every cut (8-12 cuts = 8-12 whooshes). Vary between `whoosh_fast`, `whoosh_heavy`, `whoosh_soft` to avoid repetition.
- **Impact SFX** — `boom_deep` or `impact_heavy` on the 2-3 stat/quote text flashes. Sync exactly to the text appearance.
- **Tension riser** — `tension_riser` or `riser_electronic` building from the start, peaking at the hook line (15-20s mark).
- **Beat drop accent** — A single `boom_cinematic` or `impact_sub` synced to the music beat drop.
- **Title card** — `impact_heavy` + brief silence on the smash cut to title.

**Montage SFX rules:**
- SFX can be louder in the montage than in the main video (no narration to compete with yet)
- Layer up to 3 SFX briefly during the montage (exception to the normal 2-max rule)
- Every visual transition must have a corresponding audio transition — no silent cuts

## Timing Best Practices

- **Transitions:** Trigger 0.3-0.5s before the visual cut
- **Impacts:** Sync exactly with the key word or visual
- **Ambience:** Fade in 1-2s before scene fully establishes
- **Stingers/Tension:** Start 2-3s before the reveal, cut on impact

## Genre Quick-Reference

| Genre | Essential SFX |
|---|---|
| True Crime | `tension_riser`, `heartbeat_loop`, `siren_police`, `redacted_buzz`, `footsteps_slow` |
| Nature | `forest_ambience`, `ocean_waves`, `eagle_cry`, `whale_song`, `wind_gentle` |
| History | `vinyl_crackle`, `film_reel_click`, `cannon_fire`, `horse_gallop`, `bell_toll` |
| Tech/Science | `data_stream`, `computer_boot`, `glitch_digital`, `lab_ambience`, `rocket_launch` |
| Economy | `stock_ticker`, `cash_register`, `market_bell`, `vault_door`, `newspaper_rustle` |

## Usage

Provide a concept and narration script, and the agent will select appropriate SFX for each scene following the layering rules and volume hierarchy. Reference `sfx-designer.md` for the full 200+ SFX library.
