---
name: quality-check
description: "Phase 6: Run the pre-upload checklist against the rendered documentary output"
---

# Quality Check — Phase 6: Pre-Upload Checklist

Run the comprehensive pre-upload checklist against the rendered documentary output before publishing to YouTube.

## Pre-Upload Checklist

### Audio (The Dealbreaker)
- [ ] Voiceover clearly audible over music at ALL times (test on phone speakers)
- [ ] ALL sound effects at appropriate volume (not ear-piercing)
- [ ] Music matches mood of each section
- [ ] Music changes when topic/mood shifts
- [ ] No audio clipping or distortion

### Visuals (The First Impression)
- [ ] Strong contrast between text and background in EVERY frame
- [ ] ALL spellings correct (especially first frame and title card)
- [ ] Animations smooth with proper easing (never linear)
- [ ] Glow/bloom effects subtle, not overpowering
- [ ] Color theme consistent throughout
- [ ] No file names, watermarks, or asset labels visible

### Opening Montage (The #1 Retention Tool)
- [ ] Cold-open montage exists (15-30s before title card)
- [ ] 8-12 fast cuts previewing the video's most intriguing moments
- [ ] High-energy music with riser → beat drop
- [ ] SFX on every transition (whooshes, impacts, risers)
- [ ] 2-3 provocative text flashes (stats or quotes, large and bold)
- [ ] One killer hook narration line with `[declamatory]` tag
- [ ] Smash/flip to title card with brief silence
- [ ] Montage does NOT explain context — only sparks curiosity

### Constant Motion (Zero Static Frames)
- [ ] Every scene has at least one motion layer (Ken Burns, particles, gradient shift, parallax)
- [ ] No static text screens — all text animates in/out (StaggeredMotion / AnimatedText)
- [ ] Background video/images always have movement (zoom, pan, Ken Burns)
- [ ] Data visualizations animate (counters tick up, bars grow, charts draw)
- [ ] Transitions between scenes use varied @remotion/transitions (not just hard cuts)
- [ ] If nothing moves on screen at any point, it's a bug

### Pacing (The Retention Driver)
- [ ] Intro hooks within 3 seconds (no static frames or logos)
- [ ] Something visual changes every 3-5 seconds
- [ ] Editing doesn't become repetitive after the opening
- [ ] Pattern interrupts every 2-3 minutes
- [ ] Editing intensity matches content energy throughout
- [ ] Within-scene motion preferred over hard cuts (StaggeredMotion for sequential reveals)

### YouTube Platform (The Algorithm Check)
- [ ] End screen has 20 seconds of runway
- [ ] No critical text behind YouTube UI (progress bar, CC, cards, timestamp)
- [ ] Chapters/timestamps prepared
- [ ] Thumbnail: high contrast, readable at mobile size, max 3 visual elements

### Accuracy (The Credibility Shield)
- [ ] All graphics/diagrams factually correct
- [ ] All on-screen stats and data verified
- [ ] No copyrighted material without clearance
- [ ] B-roll credited where required

### Storytelling (The Persuasion Check — from story-telling.md)
- [ ] Viewer's world is addressed in the opening (not just the topic)
- [ ] Every major claim is rooted with a concrete example
- [ ] Frame shifts follow validate → extend → pivot → root (no brute-force contradictions)
- [ ] Consistent emotional world per chapter (visual + audio + tone aligned)
- [ ] At least 2 micro-detail moments per chapter (mechanism, texture, close-up)
- [ ] Cognitive hospitality — a non-expert could follow every transition

## How to Run

1. Preview the rendered output in Remotion Studio (`npm run dev`)
2. Walk through each checklist item systematically
3. Note timestamps where issues occur
4. Fix issues and re-render
5. Do a final pass on phone speakers for audio check

## Scoring (Optional)

Rate each category using the YouTube Scoring Rubric (out of 10):
- 1-2: Barely edited, would get 0-10% avg view duration
- 3-4: Fundamentally broken, viewers leave in 30 seconds
- 5-6: Decent foundation, ~30-40% retention
- 7-8: Good editing, ~40-60% retention
- 9-10: Professional quality, ~50-70%+ retention

## Usage

Run this skill after rendering the documentary (Phase 5). Walk through each section of the checklist against the rendered output. Reference `editor.md` for detailed explanations of each quality pillar.
