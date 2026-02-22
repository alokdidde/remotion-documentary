import React from "react";
import { AbsoluteFill } from "remotion";
import { Scene3D } from "remotion-bits";
import type { CompiledTimeline } from "../pipeline/types";
import { SceneStep } from "./SceneStep";
import { FullScreenStep } from "./FullScreenStep";
import { MusicLayer } from "./MusicLayer";

export interface DocumentaryCompositionProps {
  timeline: CompiledTimeline;
}

export const DocumentaryComposition: React.FC<DocumentaryCompositionProps> = ({
  timeline,
}) => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {/* Global music layer */}
      <MusicLayer cues={timeline.music_cues} audioMix={timeline.audio_mix} />

      <Scene3D
        perspective={timeline.scene3d.perspective}
        transitionDuration={timeline.scene3d.transition_duration}
        easing={timeline.scene3d.easing as any}
      >
        {timeline.segments.map((segment) => {
          // Check if any visual event uses fullscreen-zoom
          const hasFullscreenZoom = segment.visual_events.some(
            (ve) => ve.animation === "fullscreen-zoom"
          );

          if (hasFullscreenZoom) {
            return (
              <FullScreenStep
                key={segment.id}
                segment={segment}
                fps={timeline.fps}
                timeline={timeline}
              />
            );
          }

          return (
            <SceneStep
              key={segment.id}
              segment={segment}
              fps={timeline.fps}
              timeline={timeline}
            />
          );
        })}
      </Scene3D>
    </AbsoluteFill>
  );
};
