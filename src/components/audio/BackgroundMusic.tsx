// Background music component for inline usage within a Sequence.
// For the primary workflow, use AudioTimeline at the composition root instead.
import { Audio, staticFile, useCurrentFrame, interpolate } from "remotion";

interface BackgroundMusicProps {
  /** Music track filename (without path) */
  track: string;
  /** Volume level (0-1), default 0.15 for subtle background */
  volume?: number;
  /** Fade in duration in frames */
  fadeInFrames?: number;
  /** Fade out duration in frames */
  fadeOutFrames?: number;
  /** Total duration of the sequence (for fade out calculation) */
  durationInFrames: number;
}

export const BackgroundMusic: React.FC<BackgroundMusicProps> = ({
  track,
  volume = 0.15,
  fadeInFrames = 60,
  fadeOutFrames = 90,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();

  const fadeInMultiplier = interpolate(
    frame,
    [0, fadeInFrames],
    [0, 1],
    { extrapolateRight: "clamp" }
  );

  const fadeOutMultiplier = interpolate(
    frame,
    [durationInFrames - fadeOutFrames, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp" }
  );

  const currentVolume = volume * fadeInMultiplier * fadeOutMultiplier;

  return (
    <Audio
      src={staticFile(`audio/music/${track}`)}
      volume={currentVolume}
      loop
    />
  );
};
