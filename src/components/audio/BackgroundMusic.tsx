// Background music component for ambient soundscape
import { Audio, staticFile, useCurrentFrame, interpolate } from "remotion";
import { useCallback, useEffect, useState } from "react";

interface BackgroundMusicProps {
  /** Music track filename (without path) */
  track: string;
  /** Volume level (0-1), default 0.08 for subtle background */
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
  volume = 0.08,
  fadeInFrames = 60,
  fadeOutFrames = 90,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const [exists, setExists] = useState(true);

  const checkFile = useCallback(async () => {
    try {
      const response = await fetch(staticFile(`audio/music/${track}`), { method: 'HEAD' });
      setExists(response.ok);
    } catch {
      setExists(false);
    }
  }, [track]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      checkFile();
    }
  }, [checkFile]);

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

  if (!exists) {
    return null;
  }

  return (
    <Audio
      src={staticFile(`audio/music/${track}`)}
      volume={currentVolume}
      loop
    />
  );
};

// Map your chapter music tracks here
export const chapterMusic: Record<string, string> = {
  chapter1: "chapter1-bg.mp3",
  chapter2: "chapter2-bg.mp3",
  chapter3: "chapter3-bg.mp3",
};
