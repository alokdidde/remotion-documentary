// Transition presets for documentary chapter transitions.
// Uses @remotion/transitions presentations: fade, slide, wipe, flip, clockWipe.

import { linearTiming, springTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { flip } from "@remotion/transitions/flip";
import { clockWipe } from "@remotion/transitions/clock-wipe";

// ─── Presentation Presets ────────────────────────────────────────────

export const presentations = {
  /** Simple crossfade — default, works everywhere */
  fade: () => fade(),

  /** Entering scene pushes out the exiting scene */
  slideLeft: () => slide({ direction: "from-left" }),
  slideRight: () => slide({ direction: "from-right" }),
  slideUp: () => slide({ direction: "from-bottom" }),
  slideDown: () => slide({ direction: "from-top" }),

  /** Entering scene wipes over the exiting scene */
  wipeRight: () => wipe({ direction: "from-left" }),
  wipeLeft: () => wipe({ direction: "from-right" }),
  wipeUp: () => wipe({ direction: "from-bottom" }),
  wipeDown: () => wipe({ direction: "from-top" }),
  wipeDiagonal: () => wipe({ direction: "from-bottom-left" }),

  /** 3D flip to reveal the next scene */
  flipLeft: () => flip({ direction: "from-left", perspective: 1200 }),
  flipRight: () => flip({ direction: "from-right", perspective: 1200 }),
  flipUp: () => flip({ direction: "from-bottom", perspective: 1200 }),
  flipDown: () => flip({ direction: "from-top", perspective: 1200 }),

  /** Circular clock-hand wipe (pass video dimensions) */
  clock: (width = 1920, height = 1080) => clockWipe({ width, height }),
} as const;

export type PresentationKey = keyof typeof presentations;

// ─── Timing Presets ─────────────────────────────────────────────────

export const timings = {
  /** Fast cut — 15 frames (0.5s) */
  fast: () => linearTiming({ durationInFrames: 15 }),
  /** Standard — 30 frames (1s) */
  standard: () => linearTiming({ durationInFrames: 30 }),
  /** Slow cinematic — 45 frames (1.5s) */
  slow: () => linearTiming({ durationInFrames: 45 }),
  /** Dramatic — 60 frames (2s) */
  dramatic: () => linearTiming({ durationInFrames: 60 }),
  /** Spring-based (organic feel) */
  spring: () => springTiming({ config: { damping: 200 } }),
  /** Bouncy spring */
  bouncy: () => springTiming({ config: { damping: 12, stiffness: 150, mass: 0.8 } }),
} as const;

export type TimingKey = keyof typeof timings;

// ─── Chapter Transition Config ──────────────────────────────────────

export interface ChapterTransitionConfig {
  presentation: PresentationKey;
  timing: TimingKey;
}

/**
 * Per-chapter-gap transition config.
 * Index 0 = transition between chapter 1→2, index 1 = between 2→3, etc.
 * Falls back to fade + standard if not specified.
 */
export const chapterTransitions: ChapterTransitionConfig[] = [
  { presentation: "wipeRight", timing: "standard" },
  { presentation: "fade", timing: "slow" },
];

/** Resolve a config entry into presentation + timing objects */
export function resolveTransition(config: ChapterTransitionConfig) {
  const presentationFn = presentations[config.presentation];
  const timingFn = timings[config.timing];
  return {
    // clockWipe needs width/height — the factory handles defaults
    presentation: presentationFn(),
    timing: timingFn(),
  };
}

/** Default fallback */
export const defaultTransition: ChapterTransitionConfig = {
  presentation: "fade",
  timing: "standard",
};
