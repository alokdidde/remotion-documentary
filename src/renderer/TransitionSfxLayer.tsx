import React from "react";
import { Audio, Sequence, staticFile, interpolate, useCurrentFrame } from "remotion";
import type { CompiledSegment } from "../pipeline/types";

export interface TransitionSfxLayerProps {
  segment: CompiledSegment;
  transitionDuration: number; // frames for camera sweep
}

export const TransitionSfxLayer: React.FC<TransitionSfxLayerProps> = ({
  segment,
  transitionDuration,
}) => {
  if (!segment.sfx_entry) return null;

  const fadeBleed = 5; // frames of audio bleed after transition
  const sfx = segment.sfx_entry;

  return (
    <TransitionAudio
      src={sfx.src}
      volume={sfx.volume}
      transitionDuration={transitionDuration}
      fadeBleed={fadeBleed}
    />
  );
};

const TransitionAudio: React.FC<{
  src: string;
  volume: number;
  transitionDuration: number;
  fadeBleed: number;
}> = ({ src, volume, transitionDuration, fadeBleed }) => {
  const frame = useCurrentFrame();

  // Volume curve: ramp up during transition, quick fade after
  const totalDuration = transitionDuration + fadeBleed;
  const volumeCurve = interpolate(
    frame,
    [0, transitionDuration * 0.3, transitionDuration, totalDuration],
    [0, volume, volume * 0.8, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <Sequence from={0} durationInFrames={totalDuration}>
      <Audio src={staticFile(src)} volume={volumeCurve} />
    </Sequence>
  );
};
