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

### Pacing (The Retention Driver)
- [ ] Intro hooks within 3 seconds (no static frames or logos)
- [ ] Something visual changes every 3-5 seconds
- [ ] Editing doesn't become repetitive after the opening
- [ ] Pattern interrupts every 2-3 minutes
- [ ] Editing intensity matches content energy throughout

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
