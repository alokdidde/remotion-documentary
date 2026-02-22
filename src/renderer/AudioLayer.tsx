import React from "react";
import { Audio, Sequence, staticFile } from "remotion";
import type { CompiledSegment, CompiledSfxEvent } from "../pipeline/types";

export interface AudioLayerProps {
  segment: CompiledSegment;
}

export const AudioLayer: React.FC<AudioLayerProps> = ({ segment }) => {
  return (
    <>
      {/* Narration audio */}
      <Audio
        src={staticFile(segment.narration_src)}
        volume={1}
      />

      {/* SFX bed (sustained texture under narration) */}
      {segment.sfx_bed && (
        <SfxAudio
          sfx={segment.sfx_bed}
          segmentStartFrame={segment.narration_start_frame}
        />
      )}

      {/* Ambience layer */}
      {segment.ambience && (
        <Audio
          src={staticFile(segment.ambience.src)}
          volume={segment.ambience.volume}
          loop={segment.ambience.loop}
        />
      )}
    </>
  );
};

const SfxAudio: React.FC<{
  sfx: CompiledSfxEvent;
  segmentStartFrame: number;
}> = ({ sfx, segmentStartFrame }) => {
  const localFrom = sfx.start_frame - segmentStartFrame;

  return (
    <Sequence from={Math.max(0, localFrom)} durationInFrames={sfx.duration_frames}>
      <Audio
        src={staticFile(sfx.src)}
        volume={sfx.volume}
      />
    </Sequence>
  );
};
