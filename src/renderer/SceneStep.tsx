import React from "react";
import { Step } from "remotion-bits";
import type { CompiledSegment, CompiledTimeline } from "../pipeline/types";
import { VisualLayer } from "./VisualLayer";
import { AudioLayer } from "./AudioLayer";
import { TextOverlayLayer } from "./TextOverlayLayer";
import { ColorGradeLayer } from "./ColorGradeLayer";
import { TransitionSfxLayer } from "./TransitionSfxLayer";

export interface SceneStepProps {
  segment: CompiledSegment;
  fps: number;
  timeline: CompiledTimeline;
}

export const SceneStep: React.FC<SceneStepProps> = ({
  segment,
  fps,
  timeline,
}) => {
  const totalSegmentFrames =
    segment.narration_duration_frames + segment.gap_duration_frames;

  return (
    <Step
      x={segment.camera.x}
      y={segment.camera.y}
      z={segment.camera.z}
      rotateX={segment.camera.rotateX}
      rotateY={segment.camera.rotateY}
      rotateZ={segment.camera.rotateZ}
      scale={segment.camera.scale}
      duration={totalSegmentFrames}
    >
      <VisualLayer
        events={segment.visual_events}
        fps={fps}
        segmentStartFrame={segment.narration_start_frame}
      />
      <ColorGradeLayer grade={segment.color_grade} />
      <TextOverlayLayer
        events={segment.text_events}
        fps={fps}
        segmentStartFrame={segment.narration_start_frame}
      />
      <AudioLayer segment={segment} />
      <TransitionSfxLayer
        segment={segment}
        transitionDuration={timeline.scene3d.transition_duration}
      />
    </Step>
  );
};
