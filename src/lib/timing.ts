// Animation timing presets for Indian Railways documentary
import { spring, SpringConfig } from "remotion";

export const FPS = 30;

// Convert seconds to frames
export const secondsToFrames = (seconds: number): number => Math.round(seconds * FPS);

// Convert frames to seconds
export const framesToSeconds = (frames: number): number => frames / FPS;

// Standard durations in frames
export const durations = {
  // Quick transitions
  instant: 1,
  fast: secondsToFrames(0.2),
  quick: secondsToFrames(0.3),

  // Standard transitions
  short: secondsToFrames(0.5),
  medium: secondsToFrames(0.8),
  normal: secondsToFrames(1),

  // Longer animations
  long: secondsToFrames(1.5),
  extended: secondsToFrames(2),
  dramatic: secondsToFrames(3),

  // Hold times
  holdShort: secondsToFrames(1.5),
  holdMedium: secondsToFrames(3),
  holdLong: secondsToFrames(5),

  // Chapter transitions
  chapterTransition: secondsToFrames(1.5),
  titleCard: secondsToFrames(4),
} as const;

// Spring configurations
export const springConfigs = {
  // Smooth and natural
  smooth: {
    damping: 200,
    stiffness: 100,
    mass: 1,
  } as SpringConfig,

  // Snappy response
  snappy: {
    damping: 20,
    stiffness: 200,
    mass: 0.5,
  } as SpringConfig,

  // Bouncy effect
  bouncy: {
    damping: 12,
    stiffness: 150,
    mass: 0.8,
  } as SpringConfig,

  // Heavy/dramatic
  heavy: {
    damping: 30,
    stiffness: 80,
    mass: 1.5,
  } as SpringConfig,

  // Quick settle
  quick: {
    damping: 200,
    stiffness: 300,
    mass: 0.5,
  } as SpringConfig,

  // Gentle ease
  gentle: {
    damping: 200,
    stiffness: 50,
    mass: 1,
  } as SpringConfig,
} as const;

// Helper to create a spring animation
export const createSpring = (
  frame: number,
  fps: number,
  config: SpringConfig = springConfigs.smooth,
  options?: { delay?: number; durationInFrames?: number }
) => {
  const delay = options?.delay ?? 0;
  return spring({
    frame: frame - delay,
    fps,
    config,
    durationInFrames: options?.durationInFrames,
  });
};

// Easing functions for interpolate
export const easings = {
  // Standard easing
  easeIn: (t: number) => t * t,
  easeOut: (t: number) => 1 - (1 - t) * (1 - t),
  easeInOut: (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),

  // Cubic
  easeInCubic: (t: number) => t * t * t,
  easeOutCubic: (t: number) => 1 - Math.pow(1 - t, 3),
  easeInOutCubic: (t: number) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,

  // Expo
  easeInExpo: (t: number) => (t === 0 ? 0 : Math.pow(2, 10 * t - 10)),
  easeOutExpo: (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),

  // Back (overshoot)
  easeOutBack: (t: number) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
} as const;

// Stagger helper for sequenced animations
export const getStaggerDelay = (index: number, staggerAmount: number = 5): number => {
  return index * staggerAmount;
};

// Calculate frame ranges for sections
export const calculateSectionFrames = (
  sections: { durationFrames: number }[],
  startFrame: number = 0
): { start: number; end: number }[] => {
  let currentFrame = startFrame;
  return sections.map((section) => {
    const start = currentFrame;
    const end = currentFrame + section.durationFrames;
    currentFrame = end;
    return { start, end };
  });
};
