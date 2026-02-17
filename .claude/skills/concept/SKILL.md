---
name: concept
description: "Phase 1: Transform a topic into a structured documentary concept using the Pop Documentary Architect framework"
---

# Concept — Phase 1: Pop Documentary Architect

Transform a niche topic into a cinematic, high-retention documentary concept using the "Experience before Understanding" philosophy. Uses the framework defined in `architect.md` and the storytelling principles from `story-telling.md`.

## Output

`concept.md` — A complete documentary concept document.

## Process

### 1. The Promise
Define the **Title/Thumbnail** first. The script must fulfill the curiosity sparked by the thumbnail (the "Payoff") while broadening the viewer's interest into deeper topics.

### 2. Human Interest Core
Identify the human element — emotions, achievements, or problems that resonate universally. Documentaries must move beyond purely educational goals to focus on "The Human Condition."

### 3. Narrative Engineering (3-Act Arc as Frame Shift)
Structure acts as a progressive frame shift (from `story-telling.md`):
- **Act 1 (Setup — Validate):** Identify the "Hero" and the "Inciting Moment." Start inside the viewer's existing worldview. Establish atomic units (common ground the audience already agrees with). Use in-group language.
- **Act 2 (Conflict — Dissonance):** Compound the problems. Introduce cognitive dissonance — two things the viewer believes that actually conflict. Tension peaks at the pivot point where the old worldview breaks.
- **Act 3 (Resolution — New World):** Goal reached or lost; subject undergoes transformation. Resolve the dissonance. Root the new understanding with concrete examples. The viewer exits with a modified worldview.

Every major claim must be rooted with at least one concrete example (name, place, outcome).

### 4. Opening Montage (Cold Open — 15-30 seconds)

**Every documentary must open with a rapid-fire montage before the title card.** This is the single most important retention tool. The montage previews the video's most intriguing moments without revealing context.

**Structure:**
1. **Visual barrage (0-15s):** 8-12 fast cuts (0.5-1.5s each) showing the most dramatic visuals from later in the video — key B-roll, shocking stats, emotional moments, striking locations. Use fast transitions (wipe, slide, flip at 10-15 frame durations) between each.
2. **Audio layer:** High-energy music (riser → beat drop) + punchy SFX (whooshes on transitions, impacts on stats, tension risers). The sound sells the urgency.
3. **Text flashes:** 2-3 provocative stats or quotes flash on screen — large, bold, gone before fully absorbed. Example: "₹47,000 crore... vanished" or "Nobody saw it coming."
4. **Hook line (15-20s):** One killer narration line that frames the entire video. Delivered with `[declamatory]` tag.
5. **Smash to title card (20-25s):** Hard cut or flip transition to the documentary title. Brief silence. Then the story begins.

**The montage is NOT the introduction.** It's a trailer for your own video, played at the start of your video. The viewer should think: "I have NO idea what this is about but I NEED to find out."

### 5. Anchor-Bridge Hook Strategy (Post-Montage)
- **Visual Anchor:** After the title card, start with a compelling detail that triggers curiosity ("Look at this thing!").
- **Curiosity Gap:** Withhold context. Create mystery between what the viewer sees and understands.
- **Contextual Bridge:** Only after the audience is "hungry" for answers, provide the history/facts.

### 6. Two-Column A/V Script
Generate in granular two-column format:
- **Left Column (Audio):** Narration prose in 1-2 sentence rows. Alternate "Explainer" voice (clarity) and "Poetic" voice (empathy).
- **Right Column (Visuals):** Precise visual choreography. Tag as **Evidence** (proves facts) or **Soul Moments** (mood/vibe). Prefer sequential motion within scenes (elements entering/exiting with stagger) over hard cuts between static screens. Reference editing-cuts.md for cut types (J-cut, L-cut, cutaway, match cut, smash cut).

### 7. Art Ingredients
- **Sound Design:** Plan Foley and "Thematic Motifs" (recurring sounds reinforcing emotional beats).
- **Visual Bible:** Archival treatment, 3D style (low-poly/glow bloom), lighting (side-lighting for depth).

### 8. CTA Placement
- **Early (10% in):** Ultra-light promise tied to value.
- **Middle (Value Peak):** Provocative question for community discourse.
- **End (Resolution):** "Join the mission" + next video recommendation.

## Checklists

### Opening Montage
- [ ] 15-30 second cold open before title card
- [ ] 8-12 fast cuts from the most intriguing moments later in the video
- [ ] High-energy music with riser → beat drop
- [ ] SFX: whooshes on transitions, impacts on stats, tension risers
- [ ] 2-3 provocative text flashes (stats or quotes, large and bold)
- [ ] One killer hook narration line with `[declamatory]` tag
- [ ] Smash/flip to title card with brief silence

### Constant Motion
- [ ] Every scene has at least one motion layer (Ken Burns, particles, gradient shift, parallax)
- [ ] No static text screens — all text animates in/out with StaggeredMotion or AnimatedText
- [ ] Background video/images always have movement (zoom, pan, Ken Burns)
- [ ] Data visualizations animate (counters tick up, bars grow, charts draw)
- [ ] Transitions between scenes use varied @remotion/transitions (not just hard cuts)

### Storytelling (from story-telling.md)
- [ ] Viewer's world defined (who are they, what do they believe?)
- [ ] Opening uses Zoom In or Zoom Out motion
- [ ] Atomic units established before complex claims
- [ ] Every major claim has a concrete rooting example
- [ ] Frame shifts follow: validate → extend → pivot → root
- [ ] Single leverage point identified for key arguments
- [ ] In-group language used where appropriate
- [ ] Anchoring: title/thumbnail lead with human benefit, not technical description

## Usage

Provide a topic and the agent will generate a complete `concept.md` following this framework. Reference `architect.md` for the full guide and `story-telling.md` for the underlying persuasion principles.
