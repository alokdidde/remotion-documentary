// Hook for staggered entrance animations
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { springConfigs } from "../lib/timing";

interface StaggeredEntranceOptions {
  totalItems: number;
  staggerDelay?: number;
  startFrame?: number;
  config?: typeof springConfigs.smooth;
}

interface StaggeredItem {
  opacity: number;
  translateY: number;
  scale: number;
  isVisible: boolean;
}

export const useStaggeredEntrance = (options: StaggeredEntranceOptions): StaggeredItem[] => {
  const { totalItems, staggerDelay = 5, startFrame = 0, config = springConfigs.smooth } = options;

  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return Array.from({ length: totalItems }, (_, index) => {
    const itemDelay = startFrame + index * staggerDelay;
    const adjustedFrame = frame - itemDelay;

    const progress = spring({
      frame: adjustedFrame,
      fps,
      config,
    });

    const opacity = interpolate(progress, [0, 1], [0, 1]);
    const translateY = interpolate(progress, [0, 1], [30, 0]);
    const scale = interpolate(progress, [0, 1], [0.95, 1]);

    return {
      opacity,
      translateY,
      scale,
      isVisible: adjustedFrame >= 0,
    };
  });
};

// Hook for fade in/out based on frame range
export const useFadeInOut = (
  inDuration: number = 15,
  outDuration: number = 15,
  startFrame: number = 0,
  endFrame?: number
) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const actualEndFrame = endFrame ?? durationInFrames;
  const localFrame = frame - startFrame;
  const localDuration = actualEndFrame - startFrame;

  // Fade in
  const fadeIn = interpolate(localFrame, [0, inDuration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Fade out
  const fadeOut = interpolate(
    localFrame,
    [localDuration - outDuration, localDuration],
    [1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  return Math.min(fadeIn, fadeOut);
};

// Hook for counting animation
export const useCountAnimation = (
  targetValue: number,
  durationFrames: number = 60,
  startFrame: number = 0,
  easing?: (t: number) => number
) => {
  const frame = useCurrentFrame();
  const localFrame = frame - startFrame;

  if (localFrame < 0) return 0;

  const progress = Math.min(localFrame / durationFrames, 1);
  const easedProgress = easing ? easing(progress) : progress;

  return Math.round(easedProgress * targetValue);
};
