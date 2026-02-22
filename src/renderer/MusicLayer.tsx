import React from "react";
import { Audio, Sequence, staticFile, interpolate, useCurrentFrame } from "remotion";
import type { AudioMixConfig, CompiledMusicCue } from "../pipeline/types";

export interface MusicLayerProps {
  cues: CompiledMusicCue[];
  audioMix: AudioMixConfig;
}

export const MusicLayer: React.FC<MusicLayerProps> = ({ cues, audioMix }) => {
  return (
    <>
      {cues.map((cue, i) => (
        <Sequence
          key={i}
          from={cue.start_frame}
          durationInFrames={cue.duration_frames}
        >
          <MusicCueAudio cue={cue} baseVolume={audioMix.music.base_volume} />
        </Sequence>
      ))}
    </>
  );
};

const MusicCueAudio: React.FC<{
  cue: CompiledMusicCue;
  baseVolume: number;
}> = ({ cue, baseVolume }) => {
  const frame = useCurrentFrame();

  // Fade in/out envelope
  const fadeIn = cue.fade_in_frames > 0
    ? interpolate(frame, [0, cue.fade_in_frames], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 1;

  const fadeOut = cue.fade_out_frames > 0
    ? interpolate(
        frame,
        [cue.duration_frames - cue.fade_out_frames, cue.duration_frames],
        [1, 0],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
      )
    : 1;

  // Intensity modulation from keyframes
  let intensityMod = 1;
  if (cue.intensity_keyframes.length > 0) {
    const localKeyframes = cue.intensity_keyframes.map((kf) => ({
      frame: kf.frame - cue.start_frame,
      intensity: kf.intensity,
    }));

    if (localKeyframes.length >= 2) {
      const frames = localKeyframes.map((kf) => kf.frame);
      const values = localKeyframes.map((kf) => kf.intensity);
      intensityMod = interpolate(frame, frames, values, {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
    } else if (localKeyframes.length === 1) {
      intensityMod = localKeyframes[0].intensity;
    }
  }

  const volume = cue.volume * baseVolume * fadeIn * fadeOut * intensityMod;

  return (
    <Audio
      src={staticFile(cue.src)}
      volume={volume}
      startFrom={Math.round(cue.track_offset_seconds * 30)}
    />
  );
};
