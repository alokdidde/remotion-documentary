---
name: edit-plan
description: "Phase 4: Review concept and narration against YouTube quality pillars and produce edit notes"
---

# Edit Plan — Phase 4: YouTube Quality Review

Review the concept + narration against YouTube's 10 quality pillars and the storytelling guide's persuasion principles. Uses the framework defined in `editor.md` and `story-telling.md`.

## Input

- `concept.md` — The A/V script and visual plan
- `scripts/narration-script.ts` — The tagged narration performance script

## Output

`edit-notes.md` — Detailed review with specific improvements mapped to the 10 pillars.

## The 10 Quality Pillars

### 1. Sound Design
- Voice always audible over music/SFX
- Music -12 to -18 dB under voice
- SFX -6 to -12 dB under voice
- Test on phone speakers

### 2. Music Selection & Sync
- Music matches content energy and emotion
- Change music when mood/section shifts
- Sync reveals to beat drops
- Use risers before key moments

### 3. Pacing & Retention
- **Cold-open montage (15-30s):** Rapid-fire preview of the video's most intriguing moments. 8-12 fast cuts, high-energy music + SFX (whooshes, impacts, risers), 2-3 provocative text flashes, one killer hook line, smash to title card. This is the #1 retention tool.
- **Zero static frames:** Something must ALWAYS be moving — Ken Burns on images, particles in background, gradient shifts, text animating, counters ticking. If nothing moves, it's a bug.
- Visual change every 3-5 seconds (long-form)
- Pattern interrupt every 2-3 minutes
- Match edit intensity to content energy

### 4. Color & Contrast
- High contrast text on all backgrounds
- 2-3 color palette max
- Test readability at phone size
- Consistent theme throughout

### 5. Typography
- Clean, readable fonts (1-2 families)
- Spell-check all on-screen text
- Test at mobile player size

### 6. Text Placement & Visual Hierarchy
- Text follows subject gaze direction
- Consistent text position per section
- Avoid YouTube safe zone conflicts

### 7. YouTube Format Awareness
- End screen needs 20s runway
- Chapters with distinct visual feel
- Thumbnails: high contrast, max 3 elements

### 8. Animation Polish
- Always use easing curves (never linear)
- Smooth Ken Burns for images
- Spring animations for text entrances
- Use varied chapter transitions (wipe, slide, flip, fade) — don't repeat the same transition
- Consider 3D elements (ThreeScene + Globe, Bars3D, FloatingParticles) for visual impact
- **Prefer within-scene motion** over hard cuts: use StaggeredMotion + AnimatedText for sequential info reveals (elements enter/exit with stagger, screen stays alive without full cuts)
- Use motion presets from `src/lib/motion.ts`: `fadeUp`, `textFadeUp`, `titleReveal`, `statReveal` etc.
- GradientTransition for smooth background mood shifts within scenes

### 9. Content-Edit Energy Match
- Edit intensity mirrors content energy
- SFX matches mood (no comedy SFX in serious content)

### 10. Research & Accuracy
- All on-screen data/stats verified
- High-res stock imagery only
- No visible file names or watermarks

## Scoring Weights

| Category | Weight |
|----------|--------|
| Sound Design & Music | 30% |
| Pacing & Retention | 25% |
| Color & Typography | 15% |
| Animation Smoothness | 12% |
| Content-Edit Energy Match | 10% |
| Format Awareness & Accuracy | 8% |

## Storytelling Audit (from story-telling.md)

In addition to the 10 technical pillars, review the script against these persuasion principles:

- [ ] **Viewer defined** — Who is the audience? Is the script written for their worldview?
- [ ] **World building** — Are atomic units (common ground) established before complex claims?
- [ ] **Rooting** — Does every major claim have a concrete example (name, place, outcome)?
- [ ] **Frame shifts** — Do transitions between ideas follow validate → extend → pivot → root?
- [ ] **Cognitive hospitality** — Would a non-expert follow every transition? No assumed context?
- [ ] **Consistency** — Are visual palette, music, narration tone, and SFX all aligned within each chapter's emotional arc?
- [ ] **Depth** — At least 2 micro-detail moments per chapter (mechanism, texture, specific process)?
- [ ] **Single leverage point** — Are key arguments focused on one root assumption, not scattered across many surface points?
- [ ] **Anchoring** — Do title, thumbnail, and opening sentence lead with human benefit?

## Usage

Provide the concept and narration script, and the agent will review against all 10 pillars plus the storytelling audit, producing `edit-notes.md` with specific, actionable improvements. Reference `editor.md` for the technical guide and `story-telling.md` for persuasion principles.
