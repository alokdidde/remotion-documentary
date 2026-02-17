// Documentary motion presets using remotion-bits.
// These enable within-scene sequential animations — elements entering and
// exiting with stagger, without full screen changes.
//
// Key philosophy: items move in, deliver information, move out. The screen
// stays alive without needing a hard cut between every piece of content.

// ─── Preset Transitions ─────────────────────────────────────────────
// Use these as the `transition` prop on <StaggeredMotion> or <AnimatedText>.

/** Fade up — elements rise from below and fade in, staggered */
export const fadeUp = {
  y: [40, 0],
  opacity: [0, 1],
  duration: 20,
  easing: "easeOutCubic" as const,
};

/** Fade down — elements drop from above and fade in */
export const fadeDown = {
  y: [-40, 0],
  opacity: [0, 1],
  duration: 20,
  easing: "easeOutCubic" as const,
};

/** Slide in from left */
export const slideInLeft = {
  x: [-60, 0],
  opacity: [0, 1],
  duration: 24,
  easing: "easeOutCubic" as const,
};

/** Slide in from right */
export const slideInRight = {
  x: [60, 0],
  opacity: [0, 1],
  duration: 24,
  easing: "easeOutCubic" as const,
};

/** Scale up — elements grow from small to full size */
export const scaleUp = {
  scale: [0.7, 1],
  opacity: [0, 1],
  duration: 20,
  easing: "easeOutCubic" as const,
};

/** Pop in — bouncy scale entrance */
export const popIn = {
  scale: [0, 1.05, 1],
  opacity: [0, 1, 1],
  duration: 24,
  easing: "easeOutBack" as const,
};

/** Blur reveal — content sharpens from blurry */
export const blurReveal = {
  blur: [12, 0],
  opacity: [0, 1],
  duration: 24,
  easing: "easeOutCubic" as const,
};

/** Dramatic stat entrance — rise + scale + deblur for data viz */
export const statReveal = {
  y: [30, 0],
  scale: [0.8, 1],
  blur: [8, 0],
  opacity: [0, 1],
  duration: 30,
  easing: "easeOutCubic" as const,
};

// ─── Exit Presets ────────────────────────────────────────────────────

/** Fade out downward */
export const fadeOutDown = {
  y: [0, 40],
  opacity: [1, 0],
  duration: 15,
  easing: "easeInCubic" as const,
};

/** Fade out upward */
export const fadeOutUp = {
  y: [0, -40],
  opacity: [1, 0],
  duration: 15,
  easing: "easeInCubic" as const,
};

/** Shrink away */
export const scaleOut = {
  scale: [1, 0.8],
  opacity: [1, 0],
  duration: 15,
  easing: "easeInCubic" as const,
};

// ─── Text Animation Presets ──────────────────────────────────────────
// Use these as the `transition` prop on <AnimatedText>.

/** Words fade up one by one — the documentary standard */
export const textFadeUp = {
  split: "word" as const,
  y: [20, 0],
  opacity: [0, 1],
  stagger: 2,
  duration: 18,
  easing: "easeOutCubic" as const,
};

/** Characters reveal one by one */
export const textCharReveal = {
  split: "character" as const,
  y: [15, 0],
  opacity: [0, 1],
  blur: [4, 0],
  stagger: 1,
  duration: 12,
  easing: "easeOutCubic" as const,
};

/** Words slide in from left, staggered */
export const textSlideIn = {
  split: "word" as const,
  x: [-30, 0],
  opacity: [0, 1],
  stagger: 3,
  duration: 20,
  easing: "easeOutCubic" as const,
};

/** Title card — big dramatic word-by-word reveal */
export const titleReveal = {
  split: "word" as const,
  y: [50, 0],
  scale: [0.8, 1],
  opacity: [0, 1],
  stagger: 4,
  duration: 30,
  easing: "easeOutCubic" as const,
};

/** Stat number — single element, heavy rise */
export const numberReveal = {
  split: "none" as const,
  y: [60, 0],
  scale: [0.6, 1],
  blur: [10, 0],
  opacity: [0, 1],
  duration: 36,
  easing: "easeOutCubic" as const,
};

// ─── Stagger Presets ─────────────────────────────────────────────────
// Frame delays between children in <StaggeredMotion>.

export const stagger = {
  /** Tight — 2 frames between items */
  tight: 2,
  /** Normal — 4 frames between items */
  normal: 4,
  /** Relaxed — 8 frames between items */
  relaxed: 8,
  /** Dramatic — 12 frames between items */
  dramatic: 12,
} as const;

// ─── Gradient Presets ────────────────────────────────────────────────
// Use as the `gradient` prop on <GradientTransition>.

export const gradients = {
  /** Dark cinematic — for serious/tense scenes */
  darkCinematic: [
    "linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)",
    "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
  ],
  /** Warm hope — for resolution/positive scenes */
  warmHope: [
    "linear-gradient(135deg, #1a1a2e 0%, #2d1b69 50%, #11998e 100%)",
    "linear-gradient(135deg, #2d1b69 0%, #11998e 50%, #38ef7d 100%)",
  ],
  /** Cool mystery — for discovery/investigation scenes */
  coolMystery: [
    "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
    "linear-gradient(135deg, #302b63 0%, #24243e 50%, #0f0c29 100%)",
  ],
  /** Danger red — for conflict/crisis scenes */
  dangerRed: [
    "linear-gradient(135deg, #1a1a2e 0%, #3d0000 50%, #1a0000 100%)",
    "linear-gradient(135deg, #3d0000 0%, #8b0000 50%, #3d0000 100%)",
  ],
} as const;
